import { boundVoidElement } from "$lib/binds";
import type { IlhaBindProps } from "$lib/binds";
import { cn } from "$lib/cn";
import { splitBindProps } from "$lib/binds";
import { toAttrs } from "$lib/input";
import type { HTMLElementProps } from "$lib/types";
import { allocateFieldControlId, Field } from "$components/field";

/** Input size and variant definitions mapping names to their Tailwind classes. */
export const INPUT_VARIANTS = {
  size: {
    xs: {
      classes: "h-5 gap-1 rounded-sm px-1.5 text-xs",
      description: "Extra small input for compact UIs",
    },
    sm: {
      classes: "h-6.5 gap-1 rounded-md px-2 text-xs",
      description: "Small input for secondary fields",
    },
    base: {
      classes: "h-9 gap-1.5 rounded-lg px-3 text-base",
      description: "Default input size",
    },
    lg: {
      classes: "h-10 gap-2 rounded-lg px-4 text-base",
      description: "Large input for prominent fields",
    },
  },
  variant: {
    default: {
      classes: "focus:ring-areia-ring/50 focus:ring-[1.5px]",
      description: "Default input appearance",
    },
    error: {
      classes: "!ring-areia-destructive focus:ring-areia-destructive/50 focus:ring-[1.5px]",
      description: "Error state for validation failures",
    },
  },
} as const;

export const INPUT_DEFAULT_VARIANTS = {
  size: "base",
  variant: "default",
} as const;

export const INPUT_STYLING = {
  dimensions: {
    xs: { height: 20, paddingX: 6, fontSize: 12, borderRadius: 2, width: 160 },
    sm: { height: 26, paddingX: 8, fontSize: 12, borderRadius: 6, width: 200 },
    base: { height: 36, paddingX: 12, fontSize: 14, borderRadius: 8, width: 280 },
    lg: { height: 40, paddingX: 16, fontSize: 16, borderRadius: 8, width: 320 },
  },
  baseTokens: {
    background: "areia-control-background",
    text: "areia-text-default",
    placeholder: "areia-text-placeholder",
    ring: "areia-divider",
  },
  stateTokens: {
    focus: { ring: "areia-ring" },
    error: { ring: "areia-destructive" },
    disabled: { opacity: 0.5, text: "areia-text-disabled" },
  },
} as const;

export type InputSize = keyof typeof INPUT_VARIANTS.size;
export type InputVariant = keyof typeof INPUT_VARIANTS.variant;

export interface InputVariantsProps {
  /**
   * Input size.
   * - `"xs"` — Extra small for compact UIs
   * - `"sm"` — Small for secondary fields
   * - `"base"` — Default size
   * - `"lg"` — Large for prominent fields
   * @default "base"
   */
  size?: InputSize;
  /**
   * Visual variant.
   * - `"default"` — Standard input
   * - `"error"` — Error state for validation failures
   * @default "default"
   */
  variant?: InputVariant;
  parentFocusIndicator?: boolean;
  focusIndicator?: boolean;
}

type VariantConfig = Record<string, { classes: string }>;

function resolveVariant<TVariants extends VariantConfig, TKey extends keyof TVariants>(
  variants: TVariants,
  value: TKey | undefined,
  fallback: TKey,
) {
  return variants[value ?? fallback] ?? variants[fallback];
}

export function inputVariants({
  variant = INPUT_DEFAULT_VARIANTS.variant,
  size = INPUT_DEFAULT_VARIANTS.size,
  parentFocusIndicator = false,
  focusIndicator = false,
}: InputVariantsProps = {}) {
  return cn(
    "border-0 bg-areia-control-background text-areia-default ring ring-areia-divider outline-none focus:outline-none",
    "placeholder:text-areia-placeholder disabled:cursor-not-allowed disabled:text-areia-disabled disabled:opacity-50",
    resolveVariant(INPUT_VARIANTS.size, size, INPUT_DEFAULT_VARIANTS.size).classes,
    resolveVariant(INPUT_VARIANTS.variant, variant, INPUT_DEFAULT_VARIANTS.variant).classes,
    parentFocusIndicator &&
      (variant === "error"
        ? "focus-within:ring-areia-destructive/50 focus-within:ring-[1.5px]"
        : "focus-within:ring-areia-ring/50 focus-within:ring-[1.5px]"),
    focusIndicator &&
      (variant === "error"
        ? "focus:ring-areia-destructive/50 focus:ring-[1.5px]"
        : "focus:ring-areia-ring/50 focus:ring-[1.5px]"),
  );
}

type NativeInputProps = Omit<HTMLElementProps<HTMLInputElement>, "className" | "size">;

export type InputError = unknown | { message: unknown; match?: unknown };

export type InputInput = NativeInputProps &
  Pick<InputVariantsProps, "size" | "variant"> &
  IlhaBindProps &
  Record<string, unknown> & {
    /** Label content for the input. Enables the field wrapper. */
    label?: unknown;
    /** Tooltip text rendered as a native title on the label text. */
    labelTooltip?: string;
    /** Helper text displayed below the input. */
    description?: unknown;
    /** Error message. When truthy, error styling is automatically applied. */
    error?: InputError;
    /** Suppress browser extension password manager overlays on non-credential inputs. */
    passwordManagerIgnore?: boolean;
    /** Additional CSS classes applied to the input. */
    class?: string;
    className?: string;
  };

function normalizeError(error: InputError): unknown {
  if (error && typeof error === "object" && "message" in error) {
    return error.message;
  }
  return error;
}

type InputControlAttrs = NativeInputProps &
  Pick<InputVariantsProps, "size" | "variant"> & {
    description?: unknown;
    error?: InputError;
    label?: unknown;
    labelTooltip?: string;
    passwordManagerIgnore?: boolean;
    class?: string;
    className?: string;
  };

function renderInput(input: InputInput) {
  const { binds, attrs } = splitBindProps(input);
  const inputProps = attrs as InputControlAttrs;
  const {
    class: className,
    className: aliasedClassName,
    error,
    label: _label,
    labelTooltip: _labelTooltip,
    description: _description,
    passwordManagerIgnore,
    size = INPUT_DEFAULT_VARIANTS.size,
    variant: variantProp,
    ...restProps
  } = inputProps;
  const variant = variantProp ?? (error ? "error" : INPUT_DEFAULT_VARIANTS.variant);
  const passthrough = restProps as Record<string, unknown>;
  return boundVoidElement(
    "input",
    binds,
    ` class="${cn(
      inputVariants({ size, variant, focusIndicator: true }),
      passwordManagerIgnore && "keeper-ignore",
      className,
      aliasedClassName,
    )}"${toAttrs({
      ...passthrough,
      "aria-invalid": error ? "true" : passthrough["aria-invalid"],
      "aria-describedby":
        typeof passthrough["aria-describedby"] === "string"
          ? passthrough["aria-describedby"]
          : undefined,
      ...(passwordManagerIgnore
        ? {
            "data-1p-ignore": "true",
            "data-bwignore": "true",
            "data-form-type": "other",
            "data-lpignore": "true",
          }
        : {}),
    })} />`,
  );
}

/** Text input with optional label, description, and error messaging. */
function InputBase(input: InputInput = {}) {
  const { label, labelTooltip: _labelTooltip, description, error, ...controlInput } = input;
  const normalizedError = normalizeError(error);
  const needsField = label != null || description != null || normalizedError != null;
  const controlId =
    typeof controlInput.id === "string" && controlInput.id
      ? controlInput.id
      : needsField
        ? allocateFieldControlId("areia-input")
        : undefined;
  const control = renderInput({
    ...controlInput,
    ...(controlId ? { id: controlId } : {}),
    error,
    "data-slot": controlInput["data-slot"] ?? "field-control",
  } as InputInput);

  if (!needsField) return renderInput(input);

  return Field.Static({
    label,
    description,
    error: normalizedError,
    invalid: normalizedError != null,
    htmlFor: controlId,
    children: control,
  });
}

export const Input = Object.assign(InputBase, {
  Static: renderInput,
});
