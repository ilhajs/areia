import { html, raw } from "ilha";
import { cn, safeRandomId } from "$lib/cn";
import { toAttrs } from "$lib/input";
import type { HTMLElementProps } from "$lib/types";
import { Label } from "$components/label";

/** Checkbox variant definitions mapping variant names to their Tailwind classes. */
export const CHECKBOX_VARIANTS = {
  variant: {
    default: {
      classes: "ring-areia-control-border",
      description: "Default checkbox appearance",
    },
    error: {
      classes: "ring-areia-destructive",
      description: "Error state for validation failures",
    },
  },
} as const;

export const CHECKBOX_DEFAULT_VARIANTS = {
  variant: "default",
} as const;

export type CheckboxVariant = keyof typeof CHECKBOX_VARIANTS.variant;

export interface CheckboxVariantsProps {
  /**
   * Visual variant.
   * - `"default"` — Standard checkbox appearance
   * - `"error"` — Error state for validation failures
   * @default "default"
   */
  variant?: CheckboxVariant;
}

type VariantConfig = Record<string, { classes: string }>;
type Renderable = unknown;

function render(value: Renderable): string {
  if (value === null || value === undefined || value === false) return "";
  if (Array.isArray(value)) return value.map(render).join("");
  if (typeof value === "object" && "value" in value && typeof value.value === "string") {
    return value.value;
  }
  return String(value);
}

function resolveVariant<TVariants extends VariantConfig, TKey extends keyof TVariants>(
  variants: TVariants,
  value: TKey | undefined,
  fallback: TKey,
) {
  return variants[value ?? fallback] ?? variants[fallback];
}

export function checkboxVariants({
  variant = CHECKBOX_DEFAULT_VARIANTS.variant,
}: CheckboxVariantsProps = {}) {
  return cn(
    resolveVariant(CHECKBOX_VARIANTS.variant, variant, CHECKBOX_DEFAULT_VARIANTS.variant).classes,
  );
}

function checkIcon() {
  return html`<svg
    aria-hidden="true"
    class="size-3"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="3"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <path d="M20 6 9 17l-5-5"></path>
  </svg>`;
}

function minusIcon() {
  return html`<svg
    aria-hidden="true"
    class="size-3"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="3"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <path d="M5 12h14"></path>
  </svg>`;
}

type InputProps = Omit<HTMLElementProps<HTMLInputElement>, "className" | "type">;

export type CheckboxInput = InputProps &
  CheckboxVariantsProps &
  Record<string, unknown> & {
    /** Label content for the checkbox. */
    label?: unknown;
    /** Tooltip text rendered as a native title on the label text. */
    labelTooltip?: string;
    /** When true, checkbox appears before label. When false, label appears before checkbox. */
    controlFirst?: boolean;
    /** Whether the checkbox is checked. */
    checked?: boolean;
    /** Whether the checkbox is in an indeterminate visual state. */
    indeterminate?: boolean;
    /** Additional CSS classes applied to the checkbox control. */
    class?: string;
    className?: string;
  };

function checkboxControl(input: CheckboxInput) {
  const {
    class: className,
    className: aliasedClassName,
    checked,
    disabled,
    indeterminate,
    variant = CHECKBOX_DEFAULT_VARIANTS.variant,
    ...rest
  } = input;

  return html`<span
    class="relative inline-flex size-4 shrink-0 items-center justify-center [&:has(input:checked)>input]:bg-areia-foreground [&:has(input:checked)>input]:ring-areia-foreground [&:has(input:checked)>span]:flex [&:has(input[data-indeterminate])>input]:bg-areia-foreground [&:has(input[data-indeterminate])>input]:ring-areia-foreground [&:has(input[data-indeterminate])>span]:flex"
  >
    <input
      type="checkbox"
      class="${cn(
        "peer size-4 appearance-none rounded-sm border-0 bg-areia-control-background ring focus:outline-none after:absolute after:-inset-x-3 after:-inset-y-2",
        checkboxVariants({ variant }),
        !disabled &&
          "cursor-pointer hover:ring-areia-control-border focus:ring-areia-ring focus:ring-2 focus-visible:ring-2 focus-visible:ring-areia-ring",
        disabled && "cursor-not-allowed opacity-50",
        className,
        aliasedClassName,
      )}"
      ${raw(
        toAttrs({
          ...rest,
          checked: Boolean(checked),
          disabled,
          "aria-checked": indeterminate ? "mixed" : checked ? "true" : undefined,
          "data-indeterminate": indeterminate || undefined,
        }),
      )}
    />
    <span
      class="pointer-events-none absolute inset-0 hidden items-center justify-center text-areia-inverse"
    >
      ${indeterminate ? minusIcon() : checkIcon()}
    </span>
  </span>`;
}

/** Single checkbox with an optional built-in label wrapper. */
function CheckboxBase(input: CheckboxInput = {}) {
  const { label, labelTooltip, controlFirst = true, required, disabled, ...rest } = input;
  const controlId = typeof rest.id === "string" ? rest.id : safeRandomId();
  const control = checkboxControl({ ...rest, id: controlId, disabled, required });

  if (label == null) return control;

  return html`<span
    class="${cn(
      "inline-flex items-center gap-2 text-base text-areia-default",
      controlFirst ? "flex-row" : "flex-row-reverse justify-end",
      disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
    )}"
  >
    ${control}
    ${Label({
      for: controlId,
      label,
      showOptional: required === false,
      tooltip: labelTooltip,
      class: disabled ? "cursor-not-allowed" : "cursor-pointer",
    })}
  </span>`;
}

export type CheckboxItemInput = CheckboxInput & {
  /** Value of the checkbox when used in a group. */
  value?: string;
};

/** Individual checkbox item intended for use inside a checkbox group. */
export function CheckboxItem(input: CheckboxItemInput = {}) {
  return Checkbox(input);
}

export interface CheckboxLegendInput {
  label: unknown;
  class?: string;
  className?: string;
}

/** Styled legend for checkbox groups. */
export function CheckboxLegend({
  label,
  class: className,
  className: aliasedClassName,
}: CheckboxLegendInput) {
  return html`<legend
    class="${cn("text-base font-medium text-areia-default", className, aliasedClassName)}"
  >
    ${label}
  </legend>`;
}

export type CheckboxGroupInput = Omit<
  HTMLElementProps<HTMLFieldSetElement>,
  "children" | "className"
> &
  Record<string, unknown> & {
    /** Legend text for the group. */
    legend?: unknown;
    /** Checkbox item markup. Prefer passing children as the second `Checkbox.Group` argument. */
    children?: unknown;
    /** Error message for the group. */
    error?: unknown;
    /** Helper text for the group. */
    description?: unknown;
    /** Whether all checkboxes in the group are disabled. */
    disabled?: boolean;
    /** Additional CSS classes. */
    class?: string;
    className?: string;
  };

type CheckboxGroupChild = unknown;

/** Fieldset wrapper for related checkbox controls. */
export function CheckboxGroup(children: CheckboxGroupChild[]): ReturnType<typeof html>;
export function CheckboxGroup(
  input?: CheckboxGroupInput,
  children?: CheckboxGroupChild[],
): ReturnType<typeof html>;
export function CheckboxGroup(
  inputOrChildren: CheckboxGroupInput | CheckboxGroupChild[] = {},
  children?: CheckboxGroupChild[],
) {
  const input = Array.isArray(inputOrChildren) ? {} : inputOrChildren;
  const {
    legend,
    children: inputChildren,
    error,
    description,
    disabled,
    class: className,
    className: aliasedClassName,
    ...rest
  } = input;
  const content = Array.isArray(inputOrChildren) ? inputOrChildren : (children ?? inputChildren);

  return html`<fieldset
    class="${cn("flex flex-col gap-4", className, aliasedClassName)}"
    ${raw(toAttrs({ ...rest, disabled }))}
  >
    ${legend != null ? CheckboxLegend({ label: legend }) : ""}
    <div class="flex flex-col gap-2">${raw(render(content))}</div>
    ${error != null
      ? html`<p class="text-sm text-areia-destructive-soft-foreground">${error}</p>`
      : ""}
    ${description != null ? html`<p class="text-sm text-areia-subtle">${description}</p>` : ""}
  </fieldset>`;
}

export const Checkbox = Object.assign(CheckboxBase, {
  Item: CheckboxItem,
  Group: CheckboxGroup,
  Legend: CheckboxLegend,
});
