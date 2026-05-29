import { html, raw } from "ilha";
import { cn } from "$lib/cn";
import { toAttrs } from "$lib/input";
import type { HTMLElementProps } from "$lib/types";
import { Label } from "$components/label";

/** Radio variant definitions mapping variant names to their Tailwind classes. */
export const RADIO_VARIANTS = {
  variant: {
    default: {
      classes: "ring-areia-divider",
      description: "Default radio appearance",
    },
    error: {
      classes: "ring-areia-destructive",
      description: "Error state for validation failures",
    },
  },
  appearance: {
    default: {
      classes: "",
      description: "Standard inline radio item",
    },
    card: {
      classes:
        "rounded-lg border border-areia-border bg-areia-control-background p-3 transition-colors hover:bg-areia-control-hover [&:has(input:checked)]:border-areia-control-active [&:has(input:checked)]:bg-areia-control-hover",
      description: "Choice card appearance with border, padding, and highlighted selection state",
    },
  },
} as const;

export const RADIO_DEFAULT_VARIANTS = {
  variant: "default",
  appearance: "default",
} as const;

export type RadioVariant = keyof typeof RADIO_VARIANTS.variant;
export type RadioAppearance = keyof typeof RADIO_VARIANTS.appearance;
export type RadioControlPosition = "start" | "end";

export interface RadioVariantsProps {
  /**
   * Visual variant.
   * - `"default"` — Standard radio appearance
   * - `"error"` — Error state for validation failures
   * @default "default"
   */
  variant?: RadioVariant;
  /**
   * Visual appearance.
   * - `"default"` — Standard inline radio item
   * - `"card"` — Choice card with border, padding, and highlighted selection state
   * @default "default"
   */
  appearance?: RadioAppearance;
}

type VariantConfig = Record<string, { classes: string }>;
type Renderable = unknown;

function render(value: Renderable): unknown {
  if (value === null || value === undefined || value === false) return "";
  if (Array.isArray(value)) return value.map(render);
  if (typeof value === "object" && "value" in value && typeof value.value === "string") {
    return raw(value.value);
  }
  return value;
}

function resolveVariant<TVariants extends VariantConfig, TKey extends keyof TVariants>(
  variants: TVariants,
  value: TKey | undefined,
  fallback: TKey,
) {
  return variants[value ?? fallback] ?? variants[fallback];
}

export function radioVariants({
  variant = RADIO_DEFAULT_VARIANTS.variant,
  appearance = RADIO_DEFAULT_VARIANTS.appearance,
}: RadioVariantsProps = {}) {
  return cn(
    resolveVariant(RADIO_VARIANTS.variant, variant, RADIO_DEFAULT_VARIANTS.variant).classes,
    resolveVariant(RADIO_VARIANTS.appearance, appearance, RADIO_DEFAULT_VARIANTS.appearance)
      .classes,
  );
}

export type RadioItemInput = Omit<HTMLElementProps<HTMLInputElement>, "className" | "type"> &
  RadioVariantsProps &
  Record<string, unknown> & {
    /** Label content displayed next to radio. */
    label: unknown;
    /** Description text displayed below the label when using card appearance. */
    description?: unknown;
    /** Value of the radio. */
    value: string;
    /** Whether the radio is disabled. */
    disabled?: boolean;
    /** Position of radio control relative to label. */
    controlPosition?: RadioControlPosition;
    /** Form submission name. Usually inherited from Radio.Group via explicit prop in examples. */
    name?: string;
    /** Additional CSS classes for the label wrapper. */
    class?: string;
    className?: string;
  };

type RadioControlInput = Omit<
  RadioItemInput,
  | "label"
  | "description"
  | "appearance"
  | "controlPosition"
  | "class"
  | "className"
  | "variant"
  | "disabled"
  | "checked"
> & {
  checked?: boolean;
  disabled?: boolean;
  variant?: RadioVariant;
};

function radioControl({
  checked,
  disabled,
  variant = RADIO_DEFAULT_VARIANTS.variant,
  ...rest
}: RadioControlInput) {
  return html`<span
    class="relative mt-0.5 inline-flex size-4 shrink-0 items-center justify-center [&:has(input:checked)>input]:bg-areia-foreground [&:has(input:checked)>input]:ring-areia-foreground [&:has(input:checked)>span]:flex"
  >
    <input
      type="radio"
      class="${cn(
        "peer size-4 appearance-none rounded-full border-0 bg-areia-control-background ring focus:outline-none after:absolute after:-inset-x-3 after:-inset-y-2",
        radioVariants({ variant }),
        !disabled &&
          "cursor-pointer hover:ring-areia-control-border focus:ring-areia-ring focus:ring-2 focus-visible:ring-2 focus-visible:ring-areia-ring focus-visible:outline-offset-3",
        disabled && "cursor-not-allowed opacity-50",
      )}"
      ${raw(toAttrs({ ...rest, checked: Boolean(checked), disabled }))}
    />
    <span class="pointer-events-none absolute inset-0 hidden items-center justify-center">
      <span class="size-2 rounded-full bg-areia-control-background"></span>
    </span>
  </span>`;
}

/** Individual radio item intended for use inside a radio group. */
export function RadioItem(input: RadioItemInput) {
  const {
    label,
    description,
    disabled,
    variant = RADIO_DEFAULT_VARIANTS.variant,
    appearance = RADIO_DEFAULT_VARIANTS.appearance,
    controlPosition,
    class: className,
    className: aliasedClassName,
    ...rest
  } = input;
  const isCard = appearance === "card";
  const effectiveControlPosition = controlPosition ?? (isCard ? "end" : "start");
  const controlAtStart = effectiveControlPosition === "start";
  const control = radioControl({ ...rest, disabled, variant });

  if (isCard) {
    return html`<label
      class="${cn(
        "m-0 group relative flex items-start gap-3",
        radioVariants({ variant, appearance }),
        controlAtStart && "flex-row-reverse",
        variant === "error" &&
          "border-areia-destructive [&:has(input:checked)]:border-areia-destructive [&:has(input:checked)]:bg-areia-control-background",
        disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
        className,
        aliasedClassName,
      )}"
    >
      <div class="flex min-w-0 flex-1 flex-col gap-0.5">
        ${Label({ asContent: true, label, class: "text-base font-medium text-areia-default" })}
        ${description != null
          ? html`<span class="text-sm text-areia-subtle">${description}</span>`
          : ""}
      </div>
      ${control}
    </label>`;
  }

  return html`<label
    class="${cn(
      "m-0 group relative inline-flex items-center gap-2 text-areia-default",
      effectiveControlPosition === "end" && "flex-row-reverse justify-end",
      disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
      className,
      aliasedClassName,
    )}"
  >
    ${control} ${Label({ asContent: true, label, class: "text-base text-areia-default" })}
  </label>`;
}

export interface RadioLegendInput {
  /** Legend content. */
  label: unknown;
  /** Additional CSS classes. */
  class?: string;
  className?: string;
}

/** Styled legend for radio groups. */
export function RadioLegend({
  label,
  class: className,
  className: aliasedClassName,
}: RadioLegendInput) {
  return html`<legend
    class="${cn("mb-2 text-base font-medium text-areia-default", className, aliasedClassName)}"
  >
    ${label}
  </legend>`;
}

export type RadioGroupInput = Omit<
  HTMLElementProps<HTMLFieldSetElement>,
  "children" | "className"
> &
  Record<string, unknown> & {
    /** Legend text for the group. */
    legend?: unknown;
    /** Radio item markup. Prefer passing children as the second `Radio.Group` argument. */
    children?: unknown;
    /** Layout direction of the radio items. */
    orientation?: "vertical" | "horizontal";
    /** Visual appearance applied to examples/items when passed manually. */
    appearance?: RadioAppearance;
    /** Error message for the group. */
    error?: unknown;
    /** Helper text for the group. */
    description?: unknown;
    /** Whether all radios in the group are disabled. */
    disabled?: boolean;
    /** Value of the initially checked radio. */
    defaultValue?: string;
    /** Value of the checked radio. */
    value?: string;
    /** Position of radio control relative to label. */
    controlPosition?: RadioControlPosition;
    /** Form submission name for the radio group. */
    name?: string;
    /** Additional CSS classes. */
    class?: string;
    className?: string;
  };

type RadioGroupChild = unknown;

/** Fieldset wrapper for related radio controls. */
export function RadioGroup(children: RadioGroupChild[]): ReturnType<typeof html>;
export function RadioGroup(
  input?: RadioGroupInput,
  children?: RadioGroupChild[],
): ReturnType<typeof html>;
export function RadioGroup(
  inputOrChildren: RadioGroupInput | RadioGroupChild[] = {},
  children?: RadioGroupChild[],
) {
  const input = Array.isArray(inputOrChildren) ? {} : inputOrChildren;
  const {
    legend,
    children: inputChildren,
    orientation = "vertical",
    appearance = RADIO_DEFAULT_VARIANTS.appearance,
    error,
    description,
    disabled,
    defaultValue,
    value,
    name,
    controlPosition,
    class: className,
    className: aliasedClassName,
    ...rest
  } = input;
  const childInput = Array.isArray(inputOrChildren) ? inputOrChildren : (children ?? inputChildren);
  const content = Array.isArray(childInput)
    ? childInput.map((child) => {
        if (typeof child === "function") {
          return child({ name, controlPosition, appearance, disabled, defaultValue, value });
        }
        return child;
      })
    : childInput;

  return html`<fieldset
    class="${cn("flex flex-col gap-4", className, aliasedClassName)}"
    ${raw(toAttrs({ ...rest, disabled }))}
  >
    ${legend != null ? RadioLegend({ label: legend }) : ""}
    <div
      class="${cn(
        orientation === "vertical"
          ? cn("flex flex-col", appearance === "card" ? "gap-3" : "gap-2")
          : appearance === "card"
            ? "grid grid-cols-2 gap-3"
            : "flex flex-row flex-wrap gap-2",
      )}"
    >
      ${render(content)}
    </div>
    ${error != null
      ? html`<p class="text-sm text-areia-destructive-soft-foreground">${error}</p>`
      : ""}
    ${description != null ? html`<p class="text-sm text-areia-subtle">${description}</p>` : ""}
  </fieldset>`;
}

export const Radio = Object.assign(RadioGroup, {
  Item: RadioItem,
  Group: RadioGroup,
  Legend: RadioLegend,
});
