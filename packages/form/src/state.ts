import { computed, signal, untrack, type SignalAccessor } from "ilha";
import type { StandardSchemaV1 } from "@standard-schema/spec";
import type { FormStateResult } from "./types.ts";

function getAtPath(obj: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((cur, key) => {
    if (cur == null) return undefined;
    return (cur as Record<string, unknown>)[key];
  }, obj);
}

/** Structured clone with JSON round-trip fallback for plain data objects. */
function deepClone<V>(value: V): V {
  if (typeof structuredClone === "function") return structuredClone(value);
  return JSON.parse(JSON.stringify(value));
}

/** Shallow-compare two plain objects (one level). */
function shallowEqual(a: Record<string, unknown>, b: Record<string, unknown>): boolean {
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;
  for (const key of keysA) {
    if (!Object.is(a[key], b[key])) return false;
  }
  return true;
}

export function createFormState<T extends Record<string, unknown>>(
  schema: StandardSchemaV1<unknown, T>,
  defaultValues: T,
): FormStateResult<T> {
  // Deep-clone defaults so nested objects are never shared by reference.
  const frozen = deepClone(defaultValues);

  // Built on ilha's own `signal`/`computed` (not raw alien-signals) so `values`
  // and every `field(path)` slice are real ilha signal accessors — usable
  // directly as `bind:value` / `bind:checked` targets in JSX.
  const values = signal<T>(deepClone(frozen));
  const errorsSignal = signal<Record<string, string>>({});

  // Dirty is computed by comparing current values to the frozen defaults.
  // This works regardless of whether the write comes from `setValue()` or a
  // direct `bind:value` write through a `field()` select accessor.
  const isDirty = computed(
    () => !shallowEqual(values() as Record<string, unknown>, frozen as Record<string, unknown>),
  );

  const isValid = computed(() => Object.keys(errorsSignal()).length === 0);

  // Cache + untrack: `values.select()` reads `values()` while building the
  // accessor. Doing that inside Form render would remorph the whole form on
  // every keystroke/selection — and remorph Combobox while its list is
  // portaled, duplicating items and breaking filter after clear.
  const fieldCache = new Map<string, SignalAccessor<any>>();
  const field = (path: string): SignalAccessor<any> => {
    let accessor = fieldCache.get(path);
    if (!accessor) {
      accessor = untrack(() => values.select((current) => getAtPath(current, path)));
      fieldCache.set(path, accessor);
    }
    return accessor;
  };

  const setValue = (path: string, value: unknown) => {
    field(path)(value);
  };

  const validate = async (): Promise<boolean> => {
    const result = await schema["~standard"].validate(values());
    if (result.issues) {
      const newErrors: Record<string, string> = {};
      for (const issue of result.issues) {
        const path =
          issue.path?.map((p) => (typeof p === "object" ? p.key : p)).join(".") || "_root";
        newErrors[path] = issue.message;
      }
      errorsSignal(newErrors);
      return false;
    }
    errorsSignal({});
    return true;
  };

  const reset = () => {
    values(() => deepClone(frozen));
    errorsSignal({});
  };

  return {
    values,
    isDirty,
    isValid,
    errors: errorsSignal,
    setValue,
    validate,
    reset,
    field,
  };
}
