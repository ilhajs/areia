import { html, raw } from "ilha";
import { cn } from "$lib/cn";
import { toAttrs } from "$lib/input";
import type { HTMLElementProps } from "$lib/types";

/** Base styles applied to all badge variants. */
export const BADGE_BASE_STYLES =
  "inline-flex w-fit flex-none shrink-0 items-center justify-self-start rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap";

/** Badge variant definitions mapping variant names to their Tailwind classes and descriptions. */
export const BADGE_VARIANTS = {
  variant: {
    primary: {
      classes: "bg-areia-primary text-areia-primary-foreground",
      description: "Primary badge",
    },
    secondary: {
      classes: "bg-areia-surface-muted text-areia-surface-muted-foreground",
      description: "Secondary badge",
    },
    error: {
      classes: "bg-areia-destructive-soft/60 text-areia-destructive-soft-foreground",
      description: "Error badge",
    },
    warning: {
      classes: "bg-areia-warning-soft/70 text-areia-warning-soft-foreground",
      description: "Warning badge",
    },
    success: {
      classes: "bg-areia-success-soft/70 text-areia-success-soft-foreground",
      description: "Success badge",
    },
    destructive: {
      classes: "bg-areia-destructive text-areia-destructive-foreground",
      description: "Deprecated. Use red instead.",
    },
    info: {
      classes: "bg-areia-info-soft/70 text-areia-info-soft-foreground",
      description: "Info badge",
    },
    beta: {
      classes: "border border-dashed border-areia-primary bg-transparent text-areia-primary",
      description: "Indicates beta or experimental features",
    },
    outline: {
      classes: "border border-areia-border bg-transparent text-areia-default",
      description: "Bordered badge with transparent background",
    },
    red: {
      classes: "bg-areia-destructive text-areia-destructive-foreground",
      description: "Red badge",
    },
    green: {
      classes: "bg-areia-success text-areia-success-foreground",
      description: "Green badge",
    },
    neutral: {
      classes: "bg-areia-badge-neutral text-areia-badge-neutral-foreground",
      description: "Neutral badge",
    },
    orange: {
      classes: "bg-areia-accent text-areia-accent-foreground",
      description: "Orange badge",
    },
    purple: {
      classes: "bg-areia-badge-purple text-areia-badge-purple-foreground",
      description: "Purple badge",
    },
    teal: {
      classes: "bg-areia-badge-teal text-areia-badge-teal-foreground",
      description: "Teal badge",
    },
    "teal-subtle": {
      classes: "bg-areia-badge-teal-soft text-areia-badge-teal-soft-foreground",
      description: "Subtle teal badge",
    },
    blue: {
      classes: "bg-areia-info text-areia-info-foreground",
      description: "Blue badge",
    },
  },
} as const;

export const BADGE_DEFAULT_VARIANTS = {
  variant: "primary",
} as const;

export type BadgeVariant = keyof typeof BADGE_VARIANTS.variant;

export interface BadgeVariantsProps {
  variant?: BadgeVariant;
}

type VariantConfig = Record<string, { classes: string }>;

function resolveVariant<TVariants extends VariantConfig, TKey extends keyof TVariants>(
  variants: TVariants,
  value: TKey | undefined,
  fallback: TKey,
) {
  return variants[value ?? fallback] ?? variants[fallback];
}

export function badgeVariants({
  variant = BADGE_DEFAULT_VARIANTS.variant,
}: BadgeVariantsProps = {}) {
  return cn(
    BADGE_BASE_STYLES,
    resolveVariant(BADGE_VARIANTS.variant, variant, BADGE_DEFAULT_VARIANTS.variant).classes,
  );
}

export type BadgeInput = Omit<HTMLElementProps<HTMLSpanElement>, "className" | "children"> &
  BadgeVariantsProps &
  Record<string, unknown> & {
    /** Content rendered inside the badge. */
    children?: unknown;
    /** Additional CSS classes merged with the generated variant classes. */
    class?: string;
    className?: string;
  };

/** Small status label for categorizing or highlighting content. */
export function Badge(input: BadgeInput = {}) {
  const {
    children,
    class: className,
    className: aliasedClassName,
    variant = BADGE_DEFAULT_VARIANTS.variant,
    ...rest
  } = input;

  return html`<span
    class="${cn(badgeVariants({ variant }), className, aliasedClassName)}"
    ${raw(toAttrs(rest))}
    >${children}</span
  >`;
}
