import { html, raw } from "ilha";
import { cn } from "$lib/cn";
import { toAttrs } from "$lib/input";
import type { HTMLElementProps } from "$lib/types";
import { INPUT_VARIANTS, type InputSize } from "$components/input";
import { Field } from "$components/field";

/** Select variant definitions. */
export const SELECT_VARIANTS = {
  size: INPUT_VARIANTS.size,
  variant: {
    default: {
      classes: "focus:ring-areia-ring/50 focus:ring-[1.5px]",
      description: "Default select appearance",
    },
    error: {
      classes: "!ring-areia-destructive focus:ring-areia-destructive/50 focus:ring-[1.5px]",
      description: "Error state for validation failures",
    },
    ghost: {
      classes: "bg-transparent ring-transparent shadow-none focus:bg-areia-control-background",
      description: "Minimal select appearance",
    },
  },
} as const;

export const SELECT_DEFAULT_VARIANTS = {
  size: "base",
  variant: "default",
} as const;

export const SELECT_STYLING = {
  trigger: {
    height: 36,
    paddingX: 12,
    borderRadius: 8,
    background: "areia-control-background",
    text: "areia-text-default",
    ring: "areia-divider",
    fontSize: 14,
    fontWeight: 400,
  },
  stateTokens: {
    focus: { ring: "areia-ring" },
    error: { ring: "areia-destructive" },
    disabled: { opacity: 0.5 },
  },
} as const;

export type SelectSize = keyof typeof SELECT_VARIANTS.size;
export type SelectVariant = keyof typeof SELECT_VARIANTS.variant;

export interface SelectVariantsProps {
  /**
   * Size of the select. Matches Input component sizes.
   * - `"xs"` — Extra small for compact UIs
   * - `"sm"` — Small for secondary fields
   * - `"base"` — Default size
   * - `"lg"` — Large for prominent fields
   * @default "base"
   */
  size?: SelectSize;
  /**
   * Visual variant.
   * - `"default"` — Standard select
   * - `"error"` — Error state for validation failures
   * - `"ghost"` — Minimal select appearance
   * @default "default"
   */
  variant?: SelectVariant;
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

export function selectVariants({
  size = SELECT_DEFAULT_VARIANTS.size,
  variant = SELECT_DEFAULT_VARIANTS.variant,
}: SelectVariantsProps = {}) {
  return cn(
    "w-full appearance-none border-0 bg-areia-control-background text-areia-default ring ring-areia-divider outline-none focus:outline-none",
    "placeholder:text-areia-placeholder disabled:cursor-not-allowed disabled:text-areia-disabled disabled:opacity-50",
    "bg-no-repeat whitespace-nowrap overflow-hidden text-ellipsis",
    "[background-image:linear-gradient(45deg,transparent_50%,currentColor_50%),linear-gradient(135deg,currentColor_50%,transparent_50%)]",
    "[background-position:calc(100%-20px)_calc(1px+50%),calc(100%-16.1px)_calc(1px+50%)]",
    "[background-size:4px_4px,4px_4px]",
    "[padding-inline-end:1.75rem]",
    "multiple:h-auto multiple:overflow-auto multiple:bg-none multiple:py-3 multiple:pe-3",
    resolveVariant(SELECT_VARIANTS.size, size, SELECT_DEFAULT_VARIANTS.size as InputSize).classes,
    resolveVariant(SELECT_VARIANTS.variant, variant, SELECT_DEFAULT_VARIANTS.variant).classes,
  );
}

export interface SelectItemDescriptor {
  /** Display label for the option. */
  label: unknown;
  /** When true, the option cannot be selected. */
  disabled?: boolean;
}

export type SelectItemValue = unknown | SelectItemDescriptor;

function isItemDescriptor(value: SelectItemValue): value is SelectItemDescriptor {
  if (value === null || value === undefined) return false;
  if (typeof value !== "object" || Array.isArray(value)) return false;
  if ("value" in value && typeof value.value === "string") return false;
  return "label" in value && value.label !== undefined;
}

export type SelectOptionInput = Omit<HTMLElementProps<HTMLOptionElement>, "className" | "label"> &
  Record<string, unknown> & {
    /** The option content. */
    label?: unknown;
    /** The value associated with this option. */
    value?: unknown;
    /** Additional CSS classes. */
    class?: string;
    className?: string;
  };

export function SelectOption(input: SelectOptionInput = {}) {
  const { label, class: className, className: aliasedClassName, ...rest } = input;

  return html`<option
    class="${cn("rounded-md px-3 py-1.5", className, aliasedClassName)}"
    ${raw(toAttrs(rest))}
  >
    ${label}
  </option>`;
}

export interface SelectGroupInput {
  /** Visible optgroup label. */
  label: string;
  /** Option markup. Prefer passing options as the second `Select.Group` argument. */
  children?: unknown;
  disabled?: boolean;
  class?: string;
  className?: string;
}

type SelectGroupChild = unknown;

export function SelectGroup(children: SelectGroupChild[]): ReturnType<typeof html>;
export function SelectGroup(
  input: SelectGroupInput,
  children?: SelectGroupChild[],
): ReturnType<typeof html>;
export function SelectGroup(
  inputOrChildren: SelectGroupInput | SelectGroupChild[],
  children?: SelectGroupChild[],
) {
  const input = Array.isArray(inputOrChildren) ? { label: "" } : inputOrChildren;
  const {
    label,
    children: inputChildren,
    disabled,
    class: className,
    className: aliasedClassName,
  } = input;
  const content = Array.isArray(inputOrChildren) ? inputOrChildren : (children ?? inputChildren);

  return html`<optgroup
    label="${label}"
    class="${cn(className, aliasedClassName)}"
    ${raw(toAttrs({ disabled }))}
  >
    ${raw(render(content))}
  </optgroup>`;
}

export function SelectSeparator() {
  return html`<option disabled>──────────</option>`;
}

export type SelectItems =
  | Record<string, SelectItemValue>
  | ReadonlyArray<{ label: unknown; value: unknown; disabled?: boolean }>;

function renderOptionsFromItems(items: SelectItems) {
  if (Array.isArray(items)) {
    return items.map((item) => SelectOption(item));
  }

  return Object.entries(items)
    .filter(([, item]) => item !== null && item !== undefined)
    .map(([value, item]) => {
      const descriptor = isItemDescriptor(item) ? item : undefined;
      return SelectOption({
        value,
        label: descriptor ? descriptor.label : item,
        disabled: descriptor?.disabled,
      });
    });
}

type NativeSelectProps = Omit<
  HTMLElementProps<HTMLSelectElement>,
  "children" | "className" | "size"
>;

export type SelectError = unknown | { message: unknown; match?: unknown };

export type SelectInput = NativeSelectProps &
  SelectVariantsProps &
  Record<string, unknown> & {
    /** Label content for the select. Enables the field wrapper. */
    label?: unknown;
    /** Tooltip text rendered as a native title on the label text. */
    labelTooltip?: string;
    /** Placeholder option shown before selectable items. */
    placeholder?: string;
    /** Select options. Accepts object maps or arrays. */
    items?: SelectItems;
    /** Explicit option markup. Prefer the second `Select` argument for options. */
    children?: unknown;
    /** Helper text displayed below the select. */
    description?: unknown;
    /** Error message. When truthy, error styling is automatically applied. */
    error?: SelectError;
    /** Additional CSS classes applied to the select. */
    class?: string;
    className?: string;
  };

function normalizeError(error: SelectError): unknown {
  if (error && typeof error === "object" && "message" in error) {
    return error.message;
  }
  return error;
}

function renderSelect(input: SelectInput, children?: unknown[]) {
  const {
    class: className,
    className: aliasedClassName,
    children: inputChildren,
    description: _description,
    error,
    items,
    label: _label,
    labelTooltip: _labelTooltip,
    placeholder,
    required: _required,
    size = SELECT_DEFAULT_VARIANTS.size,
    variant: variantProp,
    ...selectProps
  } = input;
  const variant = variantProp ?? (error ? "error" : SELECT_DEFAULT_VARIANTS.variant);
  const options = children ?? (items ? renderOptionsFromItems(items) : inputChildren);

  return html`<select
    class="${cn(selectVariants({ size, variant }), className, aliasedClassName)}"
    ${raw(
      toAttrs({
        ...selectProps,
        "aria-invalid": error ? "true" : selectProps["aria-invalid"],
        "aria-describedby":
          typeof selectProps["aria-describedby"] === "string"
            ? selectProps["aria-describedby"]
            : undefined,
      }),
    )}
  >
    ${placeholder != null
      ? SelectOption({
          value: "",
          label: placeholder,
          disabled: Boolean(selectProps.required),
          selected: selectProps.value == null,
        })
      : ""}
    ${raw(render(options))}
  </select>`;
}

/** Native select with optional label, description, and error messaging. */
function SelectBase(children: unknown[]): ReturnType<typeof html>;
function SelectBase(input?: SelectInput, children?: unknown[]): ReturnType<typeof html>;
function SelectBase(inputOrChildren: SelectInput | unknown[] = {}, children?: unknown[]) {
  const input = Array.isArray(inputOrChildren) ? {} : inputOrChildren;
  const optionChildren = Array.isArray(inputOrChildren) ? inputOrChildren : children;
  const { label, labelTooltip: _labelTooltip, description, error } = input;
  const normalizedError = normalizeError(error);
  const control = renderSelect(input, optionChildren);

  if (label == null && description == null && normalizedError == null) return control;

  return Field.Static({
    label,
    description,
    error: normalizedError,
    invalid: normalizedError != null,
    children: control,
  });
}

export const Select = Object.assign(SelectBase, {
  Root: SelectBase,
  Static: SelectBase,
  Option: SelectOption,
  Group: SelectGroup,
  Separator: SelectSeparator,
});

export const SelectRoot = Select;
