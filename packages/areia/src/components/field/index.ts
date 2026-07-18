import ilha, { html, raw } from "ilha";
import { Field as FieldPrimitive } from "@areia/slots";
import { cn } from "$lib/cn";
import { render } from "$lib/markup";
import { toAttrs } from "$lib/input";
import type { HTMLElementProps } from "$lib/types";
import { stampMorphPreserve } from "$lib/morph-preserve";

let fieldControlSeq = 0;

/** Stable unique id for pairing field labels with controls (SSR-safe). */
export function allocateFieldControlId(prefix = "areia-field"): string {
  fieldControlSeq += 1;
  return `${prefix}-${fieldControlSeq}`;
}

export type FieldInput = Omit<HTMLElementProps<HTMLDivElement>, "className" | "children"> &
  Record<string, unknown> & {
    label?: unknown;
    description?: unknown;
    error?: unknown;
    children?: unknown;
    name?: string;
    disabled?: boolean;
    invalid?: boolean;
    validate?: FieldPrimitive.FieldValidate;
    validationMode?: FieldPrimitive.FieldOptions["validationMode"];
    /** Associates the label with a control id (sets `<label for>`). */
    htmlFor?: string;
    /** Alias for `htmlFor`. */
    for?: string;
    class?: string;
    className?: string;
    labelClass?: string;
    descriptionClass?: string;
    errorClass?: string;
  };

export type FieldLabelInput = {
  label?: unknown;
  class?: string;
  className?: string;
  /** Control id this label activates. */
  htmlFor?: string;
  /** Alias for `htmlFor`. */
  for?: string;
};

export function FieldLabel(input: FieldLabelInput = {}) {
  const { label, class: className, className: aliasedClassName, htmlFor, for: forAttr } = input;
  const controlId = htmlFor ?? forAttr;
  return html`<label
    data-slot="field-label"
    class="${cn(
      "text-sm font-medium text-areia-default data-disabled:opacity-50",
      className,
      aliasedClassName,
    )}"
    ${raw(toAttrs({ for: controlId }))}
    >${render(label)}</label
  >`;
}

export function FieldDescription(
  input: { description?: unknown; class?: string; className?: string } = {},
) {
  const { description, class: className, className: aliasedClassName } = input;
  return html`<p
    data-slot="field-description"
    class="${cn("text-sm text-areia-subtle data-disabled:opacity-50", className, aliasedClassName)}"
  >
    ${render(description)}
  </p>`;
}

export function FieldError(input: { error?: unknown; class?: string; className?: string } = {}) {
  const { error, class: className, className: aliasedClassName } = input;
  return html`<div
    data-slot="field-error"
    class="${cn("text-sm text-areia-destructive-soft-foreground", className, aliasedClassName)}"
  >
    ${render(error)}
  </div>`;
}

export function FieldValidity(input: { class?: string; className?: string } = {}) {
  const { class: className, className: aliasedClassName } = input;
  return html`<output
    data-slot="field-validity"
    class="${cn("sr-only", className, aliasedClassName)}"
  ></output>`;
}

export function FieldItem(
  input: Omit<HTMLElementProps<HTMLDivElement>, "className"> & {
    children?: unknown;
    disabled?: boolean;
    class?: string;
    className?: string;
  } = {},
) {
  const { children, disabled, class: className, className: aliasedClassName, ...rest } = input;
  return html`<div
    data-slot="field-item"
    class="${cn("flex items-start gap-2 data-disabled:opacity-50", className, aliasedClassName)}"
    ${raw(toAttrs({ ...rest, "data-disabled": disabled }))}
  >
    ${render(children)}
  </div>`;
}

function renderField(input: FieldInput = {}) {
  const {
    label,
    description,
    error,
    children,
    name,
    disabled,
    invalid,
    validate: _validate,
    validationMode,
    htmlFor,
    for: forAttr,
    class: className,
    className: aliasedClassName,
    labelClass,
    descriptionClass,
    errorClass,
    ...rest
  } = input;
  const controlId = htmlFor ?? forAttr;

  return html`<div
    data-slot="field"
    class="${cn("flex flex-col gap-2 data-disabled:opacity-50", className, aliasedClassName)}"
    ${raw(
      toAttrs({
        ...rest,
        "data-name": name,
        "data-disabled": disabled,
        "data-invalid": invalid,
        "data-validation-mode": validationMode,
      }),
    )}
  >
    ${label != null ? FieldLabel({ label, class: labelClass, htmlFor: controlId }) : ""}
    ${render(children)}
    ${description != null ? FieldDescription({ description, class: descriptionClass }) : ""}
    ${error != null ? FieldError({ error, class: errorClass }) : FieldError()}
  </div>`;
}

export const FieldRoot = ilha
  .input<FieldInput>()
  .onMount(({ host, input }) => {
    const root = host.matches('[data-slot="field"]')
      ? host
      : host.querySelector('[data-slot="field"]');
    if (!root) return;

    stampMorphPreserve(root);
    const controller = FieldPrimitive.createField(root, {
      name: input.name,
      disabled: input.disabled,
      invalid: input.invalid,
      validate: input.validate,
      validationMode: input.validationMode,
    } satisfies FieldPrimitive.FieldOptions);

    return () => controller.destroy();
  })
  .render(({ input }) => renderField(input));

export const Field = Object.assign(FieldRoot, {
  Root: FieldRoot,
  Static: renderField,
  Label: FieldLabel,
  Description: FieldDescription,
  Error: FieldError,
  Validity: FieldValidity,
  Item: FieldItem,
});
