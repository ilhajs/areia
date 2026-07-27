import ilha, { untrack } from "ilha";
import { resolveFieldType, humanize } from "./infer.ts";
import { createFormState } from "./state.ts";
import type { StandardSchemaV1 } from "@standard-schema/spec";
import type { FormStateResult, UIOverrides } from "./types.ts";
import { TextField } from "./fields/TextField.tsx";
import { NumberField } from "./fields/NumberField.tsx";
import { BooleanField } from "./fields/BooleanField.tsx";
import { SelectField } from "./fields/SelectField.tsx";
import { ColorField } from "./fields/ColorField.tsx";
import { Button } from "areia";

export type FormProps<T extends Record<string, unknown>> = Record<string, unknown> & {
  schema: StandardSchemaV1<unknown, T>;
  defaultValues: T;
  uiOverrides?: UIOverrides;
  state?: FormStateResult<T>;
  onChange?: (values: T) => void;
  onSubmit?: (values: T, event: Event) => void;
  validateOn?: "submit" | "change" | "blur";
  submitLabel?: string;
};

export function renderForm(input: FormProps<any>) {
  const state = input.state ?? createFormState(input.schema, input.defaultValues);

  const renderField = (path: string, value: unknown, schemaPart: any) => {
    const { type, props: overrideProps } = resolveFieldType(
      path,
      value,
      schemaPart,
      input.uiOverrides,
    );
    const label = overrideProps.label || humanize(path.split(".").pop() || "");
    const error = state.errors()[path];

    // `bind` is a live accessor into `state.values` for this field path — wired
    // straight to `bind:value` / `bind:checked` in each field, so typing needs
    // no `.on()` plumbing and errors re-render reactively off `state.errors()`.
    const commonProps = {
      path,
      label,
      bind: state.field(path),
      error,
      ...overrideProps,
    };

    return (
      <div data-field-path={path}>
        {(() => {
          switch (type) {
            case "text":
              return <TextField {...commonProps} />;
            case "number":
              return <NumberField {...commonProps} />;
            case "boolean":
              return <BooleanField {...commonProps} />;
            case "select":
              return <SelectField {...commonProps} />;
            case "color":
              return <ColorField {...commonProps} />;
            default:
              return null;
          }
        })()}
      </div>
    );
  };

  return (
    <form class="space-y-4">
      {Object.entries(input.defaultValues).map(([key, value]) => {
        return renderField(key, value, (input.schema as any)?.shape?.[key]);
      })}
      <Button type="submit">{input.submitLabel || "Submit"}</Button>
    </form>
  );
}

/**
 * Creates an ilha island with the schema captured in the module closure —
 * so it's never serialized through data-ilha-props. Use this when you need
 * an interactive `Form` inside a docs preview or any ilha island context.
 *
 * @example
 * ```tsx
 * const MyForm = createFormIsland(schema, defaultValues, {
 *   onSubmit: (values) => console.log(values),
 * });
 * // Then render <MyForm /> in your island's render fn
 * ```
 */
export function createFormIsland<T extends Record<string, unknown>>(
  schema: StandardSchemaV1<unknown, T>,
  defaultValues: T,
  options: {
    uiOverrides?: UIOverrides;
    submitLabel?: string;
    validateOn?: "submit" | "change" | "blur";
    onSubmit?: (values: T, event: Event) => void;
    onChange?: (values: T) => void;
  } = {},
) {
  // The schema lives here in closure — never touches props serialization.
  const formState = createFormState(schema, defaultValues);

  return ilha
    .input<Record<string, unknown>>()
    .effect(() => {
      const values = formState.values();
      if (!formState.isDirty()) return;
      options.onChange?.(values);
      if (options.validateOn === "change") void formState.validate();
    })
    .on("input,select,textarea@blur:capture", () => {
      if (options.validateOn === "blur") void formState.validate();
    })
    .on("form@submit", async ({ event }) => {
      event.preventDefault();
      if (await formState.validate()) {
        options.onSubmit?.(formState.values(), event);
      }
    })
    .render(() => {
      // Remorph only when validation errors change. Nested Combobox islands portal
      // their lists — remorphing on every `values()` write recreates items in the
      // empty host slot and duplicates them after restore.
      formState.errors();
      return untrack(() =>
        renderForm({
          schema,
          defaultValues,
          uiOverrides: options.uiOverrides,
          state: formState,
          submitLabel: options.submitLabel,
        }),
      );
    });
}

/**
 * `Form` — factory alias for `createFormIsland`. Use `renderForm()` for
 * the static (SSR-safe, no-island) render path.
 */
export const Form = createFormIsland;
