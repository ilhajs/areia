import { html, raw } from "ilha";
import { cn } from "$lib/cn";
import { toAttrs } from "$lib/input";
import type { HTMLElementProps } from "$lib/types";

/** Textarea size and variant definitions mapping names to their Tailwind classes. */
export const TEXTAREA_VARIANTS = {
  size: {
    xs: {
      classes: "text-xs rounded-sm px-1.5 py-1",
      description: "Extra small textarea for compact UIs",
    },
    sm: {
      classes: "text-xs rounded-md px-2 py-1.5",
      description: "Small textarea for secondary fields",
    },
    base: {
      classes: "text-base rounded-lg px-3 py-2",
      description: "Default textarea size",
    },
    lg: {
      classes: "text-base rounded-lg px-4 py-2.5",
      description: "Large textarea for prominent fields",
    },
  },
  variant: {
    default: {
      classes: "focus:ring-areia-ring/50 focus:ring-[1.5px]",
      description: "Default textarea appearance",
    },
    error: {
      classes: "!ring-areia-destructive focus:ring-areia-destructive/50 focus:ring-[1.5px]",
      description: "Error state for validation failures",
    },
  },
} as const;

export const TEXTAREA_DEFAULT_VARIANTS = {
  size: "base",
  variant: "default",
} as const;

export type TextareaSize = keyof typeof TEXTAREA_VARIANTS.size;
export type TextareaVariant = keyof typeof TEXTAREA_VARIANTS.variant;

export interface TextareaVariantsProps {
  /**
   * Textarea size.
   * - `"xs"` — Extra small for compact UIs
   * - `"sm"` — Small for secondary fields
   * - `"base"` — Default size
   * - `"lg"` — Large for prominent fields
   * @default "base"
   */
  size?: TextareaSize;
  /**
   * Visual variant.
   * - `"default"` — Standard textarea
   * - `"error"` — Error state for validation failures
   * @default "default"
   */
  variant?: TextareaVariant;
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

export function textareaVariants({
  variant = TEXTAREA_DEFAULT_VARIANTS.variant,
  size = TEXTAREA_DEFAULT_VARIANTS.size,
  focusIndicator = false,
}: TextareaVariantsProps = {}) {
  return cn(
    "w-full border-0 bg-areia-control-background text-areia-default ring ring-areia-divider outline-none focus:outline-none",
    "resize-vertical",
    "placeholder:text-areia-placeholder disabled:cursor-not-allowed disabled:text-areia-disabled disabled:opacity-50",
    resolveVariant(TEXTAREA_VARIANTS.size, size, TEXTAREA_DEFAULT_VARIANTS.size).classes,
    resolveVariant(TEXTAREA_VARIANTS.variant, variant, TEXTAREA_DEFAULT_VARIANTS.variant).classes,
    focusIndicator &&
      (variant === "error"
        ? "focus:ring-areia-destructive/50 focus:ring-[1.5px]"
        : "focus:ring-areia-ring/50 focus:ring-[1.5px]"),
  );
}

type NativeTextareaProps = Omit<HTMLElementProps<HTMLTextAreaElement>, "className" | "size">;

export type TextareaError = unknown | { message: unknown; match?: unknown };

export type TextareaInput = NativeTextareaProps &
  Pick<TextareaVariantsProps, "size" | "variant"> &
  Record<string, unknown> & {
    /** Label content for the textarea. Enables the field wrapper. */
    label?: unknown;
    /** Tooltip text rendered as a native title on the label text. */
    labelTooltip?: string;
    /** Helper text displayed below the textarea. */
    description?: unknown;
    /** Error message. When truthy, error styling is automatically applied. */
    error?: TextareaError;
    /** Number of visible text rows. @default 3 */
    rows?: number;
    /** Additional CSS classes applied to the textarea. */
    class?: string;
    className?: string;
  };

function normalizeError(error: TextareaError): unknown {
  if (error && typeof error === "object" && "message" in error) {
    return error.message;
  }
  return error;
}

function fieldId(id: unknown, suffix: string) {
  return typeof id === "string" && id.length > 0 ? `${id}-${suffix}` : undefined;
}

function renderTextarea(input: TextareaInput) {
  const {
    class: className,
    className: aliasedClassName,
    error,
    label: _label,
    labelTooltip: _labelTooltip,
    description: _description,
    size = TEXTAREA_DEFAULT_VARIANTS.size,
    variant: variantProp,
    rows = 3,
    value,
    defaultValue,
    children,
    ...restProps
  } = input;

  const variant = variantProp ?? (error ? "error" : TEXTAREA_DEFAULT_VARIANTS.variant);
  const descriptionId = fieldId(restProps.id, "description");
  const errorId = fieldId(restProps.id, "error");

  // <textarea> uses text content for its initial value, not a `value`
  // attribute. Resolve the initial content from value > defaultValue >
  // children.
  const initialValue = value ?? defaultValue ?? children ?? "";

  return html`<textarea
    class="${cn(
      textareaVariants({ size, variant, focusIndicator: true }),
      className,
      aliasedClassName,
    )}"
    rows="${rows}"
    ${raw(
      toAttrs({
        ...restProps,
        "aria-invalid": error ? "true" : restProps["aria-invalid"],
        "aria-describedby": cn(
          typeof restProps["aria-describedby"] === "string"
            ? restProps["aria-describedby"]
            : undefined,
          input.description ? descriptionId : undefined,
          error ? errorId : undefined,
        ),
      }),
    )}
  >
${initialValue}</textarea
  >`;
}

/** Multi-line text input with optional label, description, and error messaging. */
export function Textarea(input: TextareaInput = {}) {
  const { label, labelTooltip, description, error, required, id } = input;
  const normalizedError = normalizeError(error);
  const descriptionId = fieldId(id, "description");
  const errorId = fieldId(id, "error");
  const control = renderTextarea(input);

  if (label == null && description == null && normalizedError == null) return control;

  return html`<div class="flex w-full flex-col gap-1.5">
    ${label != null
      ? html`<label
          class="text-base font-medium text-areia-default"
          ${raw(toAttrs({ for: id, title: labelTooltip }))}
        >
          ${label}${required === false ? html`<span class="text-areia-muted"> optional</span>` : ""}
        </label>`
      : ""}
    ${control}
    ${normalizedError != null
      ? html`<p id="${errorId}" class="text-sm text-areia-destructive-soft-foreground">
          ${normalizedError}
        </p>`
      : description != null
        ? html`<p id="${descriptionId}" class="text-sm text-areia-subtle">${description}</p>`
        : ""}
  </div>`;
}
