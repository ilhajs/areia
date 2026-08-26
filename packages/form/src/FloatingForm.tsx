import { effect, ilha, untrack } from "ilha";
import { setupDrag } from "./drag.ts";
import { renderForm } from "./Form.tsx";
import { createFormState } from "./state.ts";
import type { StandardSchemaV1 } from "@standard-schema/spec";
import type { UIOverrides } from "./types.ts";

export type FloatingFormProps<T extends Record<string, unknown>> = Record<string, unknown> & {
  schema: StandardSchemaV1<unknown, T>;
  /** Initial values. Omit to derive them from schema defaults (`.default()`). */
  defaultValues?: T;
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
  /** Initial values. Omit to derive them from schema defaults (`.default()`). */
  defaultValues?: T;
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
  options: FloatingFormOptions<T> = {},
) {
  // Schema and state live in closure — never serialized through props.
  const formState = createFormState(schema, options.defaultValues);
  const title = options.title || "Controls";
  const width = typeof options.width === "number" ? `${options.width}px` : options.width || "320px";

  return ilha(() => {
    effect.once(({ host, signal }: { host: Element; signal: AbortSignal }) => {
      const headerEl = host.querySelector(
        '[data-slot="floating-form-header"]',
      ) as HTMLElement | null;
      let cleanupDrag: (() => void) | undefined;

      if (headerEl) {
        cleanupDrag = setupDrag(headerEl, host as HTMLElement, options.position);
      }

      host.addEventListener(
        "submit",
        async (event) => {
          const target = event.target as Element | null;
          if (target?.tagName !== "FORM") return;
          event.preventDefault();
          if (await formState.validate()) {
            options.onSubmit?.(formState.values());
          }
        },
        { signal },
      );
      host.addEventListener(
        "click",
        (event) => {
          const target = event.target as Element | null;
          if (target?.closest("[data-action=close]")) options.onClose?.();
        },
        { signal },
      );

      return () => {
        cleanupDrag?.();
      };
    });

    effect(() => {
      const values = formState.values();
      if (!formState.isDirty()) return;
      options.onChange?.(values);
    });

    return (() => {
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

          <details class="group" open={!options.collapsed}>
            <summary class="flex w-full cursor-pointer items-center justify-between px-4 py-2 text-left text-sm font-medium text-areia-default select-none hover:text-areia-strong [&::-webkit-details-marker]:hidden">
              Settings
              <svg
                aria-hidden="true"
                class="size-3 transition-transform group-open:rotate-180"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="m6 9 6 6 6-6"></path>
              </svg>
            </summary>
            <div class="max-h-[calc(100vh-100px)] overflow-y-auto px-4 pb-4">
              {renderForm({
                schema,
                uiOverrides: options.uiOverrides,
                state: formState,
              })}
            </div>
          </details>
        </div>
      ));
    })();
  });
}

/**
 * `FloatingForm` — factory alias for `createFloatingFormIsland`.
 */
export const FloatingForm = createFloatingFormIsland;
