import { html, raw } from "ilha";
import { cn } from "$lib/cn";
import { toAttrs } from "$lib/input";
import type { HTMLElementProps } from "$lib/types";
import { Tooltip } from "$components/tooltip";

/** Button variant definitions mapping shape, size, and variant names to their Tailwind classes. */
export const BUTTON_VARIANTS = {
  shape: {
    base: {
      classes: "",
      description: "Default rectangular button shape",
    },
    square: {
      classes: "items-center justify-center p-0",
      description: "Square button for icon-only actions",
    },
    circle: {
      classes: "items-center justify-center p-0 rounded-full",
      description: "Circular button for icon-only actions",
    },
  },
  size: {
    xs: {
      classes: "h-5 gap-1 rounded-sm px-1.5 text-xs",
      description: "Extra small button for compact UIs",
    },
    sm: {
      classes: "h-6.5 gap-1 rounded-md px-2 text-xs",
      description: "Small button for secondary actions",
    },
    base: {
      classes: "h-9 gap-1.5 rounded-lg px-3 text-base",
      description: "Default button size",
    },
    lg: {
      classes: "h-10 gap-2 rounded-lg px-4 text-base",
      description: "Large button for primary CTAs",
    },
  },
  compactSize: {
    xs: { classes: "size-3.5" },
    sm: { classes: "size-6.5" },
    base: { classes: "size-9" },
    lg: { classes: "size-10" },
  },
  variant: {
    primary: {
      classes:
        "bg-areia-primary !text-areia-primary-foreground hover:bg-areia-primary/90 disabled:bg-areia-primary/50",
      description: "High-emphasis button for primary actions",
    },
    secondary: {
      classes:
        "bg-areia-control-background !text-areia-control-foreground ring not-disabled:hover:bg-areia-control-hover disabled:bg-areia-control-disabled disabled:!text-areia-control-disabled-foreground ring-areia-control-border data-[state=open]:bg-areia-control-background",
      description: "Default button style for most actions",
    },
    ghost: {
      classes: "text-areia-default hover:bg-areia-control-hover shadow-none bg-inherit",
      description: "Minimal button with no background",
    },
    destructive: {
      classes:
        "bg-areia-destructive !text-areia-destructive-foreground hover:bg-areia-destructive/70",
      description: "Danger button for destructive actions like delete",
    },
    "secondary-destructive": {
      classes:
        "bg-areia-control-background !text-areia-destructive-soft-foreground ring not-disabled:hover:bg-areia-control-hover disabled:bg-areia-control-disabled disabled:!text-areia-control-disabled-foreground ring-areia-control-border data-[state=open]:bg-areia-control-background",
      description: "Secondary button with destructive text for less prominent dangerous actions",
    },
    outline: {
      classes: "bg-transparent text-areia-default ring ring-areia-border",
      description: "Bordered button with transparent background",
    },
  },
} as const;

export const BUTTON_DEFAULT_VARIANTS = {
  shape: "base",
  size: "base",
  variant: "secondary",
} as const;

export type ButtonShape = keyof typeof BUTTON_VARIANTS.shape;
export type ButtonSize = keyof typeof BUTTON_VARIANTS.size;
export type ButtonVariant = keyof typeof BUTTON_VARIANTS.variant;

export interface ButtonVariantsProps {
  shape?: ButtonShape;
  size?: ButtonSize;
  variant?: ButtonVariant;
}

type VariantConfig = Record<string, { classes: string }>;

function resolveVariant<TVariants extends VariantConfig, TKey extends keyof TVariants>(
  variants: TVariants,
  value: TKey | undefined,
  fallback: TKey,
) {
  return variants[value ?? fallback] ?? variants[fallback];
}

export function buttonVariants({
  variant = BUTTON_DEFAULT_VARIANTS.variant,
  size = BUTTON_DEFAULT_VARIANTS.size,
  shape = BUTTON_DEFAULT_VARIANTS.shape,
}: ButtonVariantsProps = {}) {
  const isCompactShape = shape === "square" || shape === "circle";

  return cn(
    "group flex w-max shrink-0 items-center font-medium select-none",
    "border-0 shadow-xs",
    "focus:outline-none focus:ring-areia-ring/50 focus-visible:ring-2 focus-visible:ring-areia-ring",
    "cursor-pointer",
    "disabled:cursor-not-allowed disabled:text-areia-disabled",
    resolveVariant(BUTTON_VARIANTS.variant, variant, BUTTON_DEFAULT_VARIANTS.variant).classes,
    resolveVariant(BUTTON_VARIANTS.size, size, BUTTON_DEFAULT_VARIANTS.size).classes,
    resolveVariant(BUTTON_VARIANTS.shape, shape, BUTTON_DEFAULT_VARIANTS.shape).classes,
    isCompactShape &&
      resolveVariant(BUTTON_VARIANTS.compactSize, size, BUTTON_DEFAULT_VARIANTS.size).classes,
  );
}

const loaderSize = (size: ButtonSize) => (size === "lg" ? 16 : 14);

function loaderIcon(size: ButtonSize) {
  const pixels = loaderSize(size);
  return html`<svg
    aria-hidden="true"
    class="animate-spin"
    width="${pixels}"
    height="${pixels}"
    viewBox="0 0 24 24"
    fill="none"
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

export type ButtonInput = Omit<HTMLElementProps<HTMLButtonElement>, "className"> &
  ButtonVariantsProps &
  Record<string, unknown> & {
    /** Label rendered inside the button. */
    label?: unknown;
    /** Additional CSS classes merged with the generated variant classes. */
    class?: string;
    className?: string;
    /** Icon markup rendered before children. */
    icon?: unknown;
    /** Shows a loading spinner and disables interaction. */
    loading?: boolean;
  };

export function Button(input: ButtonInput = {}) {
  const {
    label,
    class: className,
    className: aliasedClassName,
    disabled,
    icon,
    loading,
    shape = "base",
    size = "base",
    title,
    type,
    variant = "secondary",
    ...rest
  } = input;

  const classes = cn(
    buttonVariants({ variant, size, shape }),
    disabled && "cursor-not-allowed opacity-50",
    className,
    aliasedClassName,
  );

  const button = html`<button
    type="${type ?? "button"}"
    class="${classes}"
    ${raw(toAttrs({ ...rest, disabled: Boolean(loading || disabled) }))}
  >
    ${loading ? loaderIcon(size) : icon}
    ${label != null ? html`<span class="contents">${label}</span>` : ""}
  </button>`;

  if (title == null || title === "") return button;

  return Tooltip({
    content: title,
    children: button,
    triggerClass: "contents",
    contentClass: "font-sans text-xs",
  });
}

export type LinkButtonInput = Omit<HTMLElementProps<HTMLAnchorElement>, "className"> &
  ButtonVariantsProps &
  Record<string, unknown> & {
    label?: unknown;
    class?: string;
    className?: string;
    external?: boolean;
    icon?: unknown;
  };

export function LinkButton(input: LinkButtonInput = {}) {
  const {
    label,
    class: className,
    className: aliasedClassName,
    external,
    icon,
    shape = "base",
    size = "base",
    variant = "ghost",
    ...rest
  } = input;

  return html`<a
    class="${cn(
      buttonVariants({ variant, size, shape }),
      "flex items-center no-underline!",
      className,
      aliasedClassName,
    )}"
    ${raw(
      toAttrs({
        ...rest,
        target: external ? "_blank" : rest.target,
        rel: external ? "noopener noreferrer" : rest.rel,
      }),
    )}
  >
    ${icon}${label}
  </a>`;
}

function refreshIcon(size: ButtonSize = "base", loading?: boolean) {
  return html`<svg
    aria-hidden="true"
    class="${cn(
      loading && "animate-refresh",
      (size === "base" || !size) && "size-4.5",
      size === "sm" && "size-4",
      size === "lg" && "size-5",
    )}"
    viewBox="0 0 256 256"
    fill="currentColor"
  >
    <path
      d="M197.67 186.37a8 8 0 0 1 0 11.29C196.58 198.73 170.82 224 128 224c-37.39 0-69.53-22.83-82.39-56H24a8 8 0 0 1-6.74-12.32l32-48A8 8 0 0 1 62.74 107.68l32 48A8 8 0 0 1 88 168H63.31c11.19 24.36 36.47 40 64.69 40 36.13 0 58.14-21.46 58.36-21.68a8 8 0 0 1 11.31.05ZM232 88h-21.61C197.53 54.83 165.39 32 128 32c-42.82 0-68.58 25.27-69.66 26.34a8 8 0 0 0 11.3 11.34C69.86 69.46 91.87 48 128 48c28.22 0 53.5 15.64 64.69 40H168a8 8 0 0 0-6.74 12.32l32 48A8 8 0 0 0 206.74 148.32l32-48A8 8 0 0 0 232 88Z"
    ></path>
  </svg>`;
}

export function RefreshButton(input: ButtonInput = {}) {
  const { loading, size = "base", ...rest } = input;
  const ariaLabel = rest["aria-label"] ?? "Refresh";

  return html`${Button({
    ...rest,
    "aria-label": ariaLabel,
    shape: "square",
    loading,
    size,
    icon: refreshIcon(size, loading),
  })}`;
}
