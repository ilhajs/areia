import { html, raw } from "ilha";
import { cn } from "$lib/cn";
import { render } from "$lib/markup";
import { toAttrs } from "$lib/input";
import type { HTMLElementProps } from "$lib/types";

/** Visual indicator for links that open in a new tab/window. */
export type LinkExternalIconInput = Record<string, unknown> & {
  /** Additional CSS classes applied to the icon. */
  class?: string;
  className?: string;
};

export function LinkExternalIcon(input: LinkExternalIconInput = {}) {
  const { class: className, className: aliasedClassName, ...props } = input;

  return html`<svg
    width="1em"
    height="1em"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
    class="${cn("link-external-icon", className, aliasedClassName)}"
    ${raw(toAttrs(props))}
  >
    <path
      d="M9 4H8.8C7.11984 4 6.27976 4 5.63803 4.32698C5.07354 4.6146 4.6146 5.07354 4.32698 5.63803C4 6.27976 4 7.11984 4 8.8V15.2C4 16.8802 4 17.7202 4.32698 18.362C4.6146 18.9265 5.07354 19.3854 5.63803 19.673C6.27976 20 7.11984 20 8.8 20H15.2C16.8802 20 17.7202 20 18.362 19.673C18.9265 19.3854 19.3854 18.9265 19.673 18.362C20 17.7202 20 16.8802 20 15.2V15"
    ></path>
    <path d="M14 4H20M20 4V10M20 4L11 13"></path>
  </svg>`;
}

/** Link variant definitions mapping variant names to their Tailwind classes. */
export const LINK_VARIANTS = {
  variant: {
    inline: {
      classes:
        "text-areia-primary underline underline-offset-[0.15em] decoration-[0.0625em] transition-colors hover:text-areia-primary/70",
      description: "Inline text link that flows with content",
    },
    current: {
      classes:
        "text-current underline underline-offset-[0.15em] decoration-[0.0625em] transition-colors hover:opacity-70",
      description: "Link that inherits color from parent text",
    },
    plain: {
      classes: "text-areia-primary transition-colors hover:text-areia-primary/70",
      description: "Link without underline decoration",
    },
  },
} as const;

export const LINK_DEFAULT_VARIANTS = {
  variant: "inline",
} as const;

export type LinkVariant = keyof typeof LINK_VARIANTS.variant;

export interface LinkVariantsProps {
  /**
   * Visual style of the link.
   * - `"inline"` — Inline text link that flows with content
   * - `"current"` — Link that inherits color from parent text
   * - `"plain"` — Link without underline decoration
   * @default "inline"
   */
  variant?: LinkVariant;
}

type VariantConfig = Record<string, { classes: string }>;

function resolveVariant<TVariants extends VariantConfig, TKey extends keyof TVariants>(
  variants: TVariants,
  value: TKey | undefined,
  fallback: TKey,
) {
  return variants[value ?? fallback] ?? variants[fallback];
}

export function linkVariants({ variant = LINK_DEFAULT_VARIANTS.variant }: LinkVariantsProps = {}) {
  return cn(resolveVariant(LINK_VARIANTS.variant, variant, LINK_DEFAULT_VARIANTS.variant).classes);
}

export type LinkInput = Omit<HTMLElementProps<HTMLAnchorElement>, "className" | "children"> &
  LinkVariantsProps &
  Record<string, unknown> & {
    /** Link content. */
    children?: unknown;
    /** Label rendered inside the link. Used when `children` is not provided. */
    label?: unknown;
    /** Additional CSS classes merged with the generated variant classes. */
    class?: string;
    className?: string;
    /** Opens the link in a new tab with safe `rel` defaults. */
    external?: boolean;
  };

/** Consistent inline text link. */
function LinkBase(input: LinkInput = {}) {
  const {
    children,
    label,
    class: className,
    className: aliasedClassName,
    external,
    variant = LINK_DEFAULT_VARIANTS.variant,
    ...rest
  } = input;

  return html`<a
    class="${cn(
      linkVariants({ variant }),
      "group/link inline-flex items-center gap-[0.1875em]",
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
    ${render(children ?? label)}
  </a>`;
}

export const Link = Object.assign(LinkBase, {
  ExternalIcon: LinkExternalIcon,
});
