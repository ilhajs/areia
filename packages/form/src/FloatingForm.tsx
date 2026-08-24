import { ilha, untrack } from "ilha";
import { setupDrag } from "./drag.ts";
import { renderForm } from "./Form.tsx";
import { createFormState } from "./state.ts";
import type { StandardSchemaV1 } from "@standard-schema/spec";
import type { UIOverrides } from "./types.ts";
import { Collapsible } from "areia";

export type FloatingFormProps<T extends Record<string, unknown>> = Record<string, unknown> & {
  schema: StandardSchemaV1<unknown, T>;
  defaultValues: T;
  uiOverrides?: UIOverrides;
  title?: string;
  position?: { x: number; y: number };
  collapsed?: boolean;
  onClose?: () => void;
  width?: string | number;
  onSubmit?: (values: T) => void;
  onChange?: (values: T) => void;
};

/**
 * Creates a `FloatingForm` island with the schema captured in closure.
 * This avoids the schema being serialized through `data-ilha-props` (which
 * would make it `undefined` on the client).
 *
 * @example
 * ```tsx
 * const Controls = createFloatingFormIsland(schema, defaultValues, {
 *   title: "Scene Controls",
 *   onChange: (values) => updateScene(values),
 * });
 * // Render as <Controls /> inside an ilha island
 * ```
 */
export interface FloatingFormOptions<T extends Record<string, unknown>> {
  uiOverrides?: UIOverrides;
  title?: string;
  position?: { x: number; y: number };
  collapsed?: boolean;
  onClose?: () => void;
  width?: string | number;
  onSubmit?: (values: T) => void;
  onChange?: (values: T) => void;
}

export function createFloatingFormIsland<T extends Record<string, unknown>>(
  schema: StandardSchemaV1<unknown, T>,
  defaultValues: T,
  options: FloatingFormOptions<T> = {},
) {
  // Schema and state live in closure — never serialized through props.
  const formState = createFormState(schema, defaultValues);
  const title = options.title || "Controls";
  const width = typeof options.width === "number" ? `${options.width}px` : options.width || "320px";

  return ilha
    .input<Record<string, unknown>>()
    .onMount(({ host }) => {
      const header = host.querySelector('[data-slot="floating-form-header"]') as HTMLElement;
      let cleanupDrag: (() => void) | undefined;

      if (header) {
        cleanupDrag = setupDrag(header, host as HTMLElement, options.position);
      }

      return () => {
        cleanupDrag?.();
      };
    })
    .effect(() => {
      const values = formState.values();
      if (!formState.isDirty()) return;
      options.onChange?.(values);
    })
    .on("form@submit", async ({ event }) => {
      event.preventDefault();
      if (await formState.validate()) {
        options.onSubmit?.(formState.values());
      }
    })
    .on("[data-action=close]@click", () => options.onClose?.())
    .render(() => {
      // Same discipline as Form: remorph on validation errors only. Nested Combobox
      // islands portal their lists — remorphing on every values() write duplicates them.
      formState.errors();
      return untrack(() => (
        <div
          class="absolute z-[100] flex flex-col bg-areia-surface rounded-lg shadow-xl ring-1 ring-areia-divider font-sans"
          style={{ width }}
        >
          <div
            data-slot="floating-form-header"
            class="flex items-center justify-between px-3 py-2 border-b border-areia-divider cursor-move bg-areia-surface-muted rounded-t-lg select-none touch-none"
          >
            <span class="text-sm font-semibold">{title}</span>
            {options.onClose && (
              <button
                type="button"
                data-action="close"
                class="text-areia-subtle hover:text-areia-strong"
              >
                ✕
              </button>
            )}
          </div>

          <div class="max-h-[calc(100vh-100px)] overflow-y-auto p-4">
            <Collapsible.Root defaultOpen={!options.collapsed}>
              <Collapsible.DefaultTrigger label="Settings" />
              <Collapsible.DefaultPanel>
                {renderForm({
                  schema,
                  defaultValues,
                  uiOverrides: options.uiOverrides,
                  state: formState,
                })}
              </Collapsible.DefaultPanel>
            </Collapsible.Root>
          </div>
        </div>
      ));
    });
}

/**
 * `FloatingForm` — factory alias for `createFloatingFormIsland`.
 */
export const FloatingForm = createFloatingFormIsland;
