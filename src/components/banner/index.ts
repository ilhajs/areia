import { html, raw } from "ilha";
import { cn } from "$lib/cn";
import { toAttrs } from "$lib/input";
import type { HTMLElementProps } from "$lib/types";

/** Base styles applied to all banner variants. */
export const BANNER_BASE_STYLES =
  "flex w-full items-start gap-3 rounded-lg border px-4 py-3 text-base";

/** Banner variant definitions mapping variant names to their Tailwind classes and descriptions. */
export const BANNER_VARIANTS = {
  variant: {
    default: {
      classes: "bg-areia-info-soft/30 border-areia-info/50 text-areia-info-soft-foreground",
      iconClasses: "text-areia-info-soft-foreground",
      description: "Informational banner for general messages",
    },
    alert: {
      classes:
        "bg-areia-warning-soft/15 border-areia-warning/50 text-areia-warning-soft-foreground",
      iconClasses: "text-areia-warning-soft-foreground",
      description: "Warning banner for cautionary messages",
    },
    error: {
      classes:
        "bg-areia-destructive-soft/15 border-areia-destructive/50 text-areia-destructive-soft-foreground",
      iconClasses: "text-areia-destructive-soft-foreground",
      description: "Error banner for critical issues",
    },
  },
} as const;

export const BANNER_DEFAULT_VARIANTS = {
  variant: "default",
} as const;

export type BannerVariant = keyof typeof BANNER_VARIANTS.variant;

export interface BannerVariantsProps {
  /**
   * Visual style of the banner.
   * - `"default"` — Informational banner for general messages
   * - `"alert"` — Warning banner for cautionary messages
   * - `"error"` — Error banner for critical issues
   * @default "default"
   */
  variant?: BannerVariant;
}

type VariantConfig = Record<string, { classes: string; iconClasses?: string }>;

function resolveVariant<TVariants extends VariantConfig, TKey extends keyof TVariants>(
  variants: TVariants,
  value: TKey | undefined,
  fallback: TKey,
) {
  return variants[value ?? fallback] ?? variants[fallback];
}

export function bannerVariants({
  variant = BANNER_DEFAULT_VARIANTS.variant,
}: BannerVariantsProps = {}) {
  return cn(
    BANNER_BASE_STYLES,
    resolveVariant(BANNER_VARIANTS.variant, variant, BANNER_DEFAULT_VARIANTS.variant).classes,
  );
}

export type BannerInput = Omit<HTMLElementProps<HTMLDivElement>, "className" | "title"> &
  BannerVariantsProps &
  Record<string, unknown> & {
    /** Icon markup rendered before the banner content. */
    icon?: unknown;
    /** Primary heading text for the banner. */
    title?: unknown;
    /** Secondary description displayed below the title. */
    description?: unknown;
    /** Action slot rendered at the trailing end of structured banners. */
    action?: unknown;
    /** Simple banner content used when `title` and `description` are not provided. */
    text?: unknown;
    /** Additional CSS classes merged with the generated variant classes. */
    class?: string;
    className?: string;
  };

/** Full-width message bar for informational, warning, or error notices. */
export function Banner(input: BannerInput = {}) {
  const {
    icon,
    title,
    description,
    action,
    text,
    variant = BANNER_DEFAULT_VARIANTS.variant,
    class: className,
    className: aliasedClassName,
    ...rest
  } = input;

  const variantConfig = resolveVariant(
    BANNER_VARIANTS.variant,
    variant,
    BANNER_DEFAULT_VARIANTS.variant,
  );
  const classes = cn(bannerVariants({ variant }), className, aliasedClassName);
  const hasStructuredContent = title != null || description != null;

  if (hasStructuredContent) {
    return html`<div class="${classes}" ${raw(toAttrs(rest))}>
      ${icon != null
        ? html`<span
            class="${cn("shrink-0 flex items-center h-[1.375em]", variantConfig.iconClasses)}"
            >${icon}</span
          >`
        : ""}
      <div class="flex min-w-0 flex-1 items-center justify-between gap-3">
        <div class="flex flex-col gap-0.5">
          ${title != null ? html`<p class="font-medium leading-snug">${title}</p>` : ""}
          ${description != null
            ? html`<div class="text-sm leading-snug"><p>${description}</p></div>`
            : ""}
        </div>
        ${action != null ? html`<div class="flex shrink-0 items-center gap-2">${action}</div>` : ""}
      </div>
    </div>`;
  }

  return html`<div class="${classes}" ${raw(toAttrs(rest))}>
    ${icon != null
      ? html`<span class="${cn("shrink-0", variantConfig.iconClasses)}">${icon}</span>`
      : ""}
    ${text != null ? html`<p>${text}</p>` : ""}
  </div>`;
}
