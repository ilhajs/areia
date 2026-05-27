import { html, raw } from "ilha";
import { cn } from "$lib/cn";
import { toAttrs } from "$lib/input";

export const SPINNER_VARIANTS = {
  size: {
    sm: { classes: "size-3.5", pixels: 14 },
    base: { classes: "size-3.5", pixels: 14 },
    lg: { classes: "size-4", pixels: 16 },
  },
} as const;

export const SPINNER_DEFAULT_VARIANTS = {
  size: "base",
} as const;

export type SpinnerSize = keyof typeof SPINNER_VARIANTS.size;

export interface SpinnerVariantsProps {
  /** Spinner size. */
  size?: SpinnerSize;
}

export type SpinnerInput = SpinnerVariantsProps &
  Record<string, unknown> & {
    class?: string;
    className?: string;
  };

export function spinnerVariants({
  size = SPINNER_DEFAULT_VARIANTS.size,
}: SpinnerVariantsProps = {}) {
  return cn("animate-spin", SPINNER_VARIANTS.size[size]?.classes);
}

export function Spinner(input: SpinnerInput = {}) {
  const {
    class: className,
    className: aliasedClassName,
    size = SPINNER_DEFAULT_VARIANTS.size,
    ...rest
  } = input;
  const pixels = SPINNER_VARIANTS.size[size]?.pixels ?? SPINNER_VARIANTS.size.base.pixels;

  return html`<svg
    aria-hidden="true"
    data-slot="spinner"
    class="${cn(spinnerVariants({ size }), className, aliasedClassName)}"
    width="${pixels}"
    height="${pixels}"
    viewBox="0 0 24 24"
    fill="none"
    ${raw(toAttrs(rest))}
  >
    <circle
      class="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      stroke-width="4"
    ></circle>
    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4z"></path>
  </svg>`;
}
