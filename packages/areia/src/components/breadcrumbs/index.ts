import { html, raw } from "ilha";
import { cn } from "$lib/cn";

/** Breadcrumbs size variant definitions. */
export const BREADCRUMBS_VARIANTS = {
  size: {
    sm: {
      classes: "text-sm h-10 gap-0.5",
      description: "Compact breadcrumbs for dense UIs",
    },
    base: {
      classes: "text-base h-12 gap-1",
      description: "Default breadcrumbs size",
    },
  },
} as const;

export const BREADCRUMBS_DEFAULT_VARIANTS = {
  size: "base",
} as const;

export type BreadcrumbsSize = keyof typeof BREADCRUMBS_VARIANTS.size;

export interface BreadcrumbsVariantsProps {
  /**
   * Size of the breadcrumbs.
   * - `"sm"` — Compact breadcrumbs for dense UIs
   * - `"base"` — Default breadcrumbs size
   * @default "base"
   */
  size?: BreadcrumbsSize;
}

type VariantConfig = Record<string, { classes: string }>;

function resolveVariant<TVariants extends VariantConfig, TKey extends keyof TVariants>(
  variants: TVariants,
  value: TKey | undefined,
  fallback: TKey,
) {
  return variants[value ?? fallback] ?? variants[fallback];
}

export function breadcrumbsVariants({
  size = BREADCRUMBS_DEFAULT_VARIANTS.size,
}: BreadcrumbsVariantsProps = {}) {
  return cn(
    "group mr-4 flex min-w-0 grow items-center overflow-hidden whitespace-nowrap",
    resolveVariant(BREADCRUMBS_VARIANTS.size, size, BREADCRUMBS_DEFAULT_VARIANTS.size).classes,
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

type Renderable = unknown;

function render(value: Renderable): string {
  if (value === null || value === undefined || value === false) return "";
  if (Array.isArray(value)) return value.map(render).join("");
  if (typeof value === "object" && "value" in value && typeof value.value === "string") {
    return value.value;
  }
  return String(value);
}

function escapeAttr(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

/** Chevron separator rendered between breadcrumb items. */
export function BreadcrumbsSeparator() {
  return raw(`<span
    class="flex shrink-0 items-center text-areia-muted"
    aria-hidden="true"
  >
    <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
      <path
        stroke="currentColor"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="1.5"
        d="M10.75 8.75L14.25 12L10.75 15.25"
      />
    </svg>
  </span>`);
}

/** Ellipsis indicator shown on mobile when intermediate items are collapsed. */
export function BreadcrumbsMobileEllipsis() {
  return raw(
    `<span class="flex shrink-0 items-center text-areia-muted" aria-hidden="true">...</span>`,
  );
}

/** A breadcrumb link item. */
export interface BreadcrumbsLinkInput {
  /** Link target URL. */
  href: string;
  /** Content rendered inside the link. */
  children?: unknown;
  /** Icon rendered before the content. Use the `Icon` component or raw SVG markup. */
  icon?: unknown;
  /** Additional CSS classes. */
  class?: string;
  className?: string;
}

export function BreadcrumbsLink(input: BreadcrumbsLinkInput) {
  const { href, children, icon, class: className, className: aliasedClassName } = input;

  return html`<a
    href="${href}"
    class="${cn(
      "flex min-w-0 max-w-full items-center gap-1 text-areia-subtle no-underline",
      className,
      aliasedClassName,
    )}"
  >
    ${icon != null ? html`<span class="flex shrink-0 items-center">${icon}</span>` : ""}
    <span class="truncate">${children}</span>
  </a>`;
}

/** The current page in the breadcrumb trail. */
export interface BreadcrumbsCurrentInput {
  /** Content for the current page. */
  children?: unknown;
  /** Icon rendered before the content. */
  icon?: unknown;
  /** When true, shows a loading skeleton instead of the content. */
  loading?: boolean;
  /** Additional CSS classes. */
  class?: string;
  className?: string;
}

export function BreadcrumbsCurrent(input: BreadcrumbsCurrentInput = {}) {
  const { children, icon, loading, class: className, className: aliasedClassName } = input;

  if (loading) {
    return html`<div
      class="${cn("flex w-[125px] min-w-0 items-center gap-1", className, aliasedClassName)}"
    >
      ${icon != null ? html`<span class="flex shrink-0 items-center">${icon}</span>` : ""}
      <span class="h-4 w-full animate-pulse rounded bg-areia-surface-muted"></span>
    </div>`;
  }

  return html`<div
    class="${cn(
      "flex min-w-0 max-w-full items-center gap-1 font-medium",
      className,
      aliasedClassName,
    )}"
    aria-current="page"
  >
    ${icon != null ? html`<span class="flex shrink-0 items-center">${icon}</span>` : ""}
    <span class="truncate">${children}</span>
  </div>`;
}

/** Clipboard copy button that appears on hover. */
export interface BreadcrumbsClipboardInput {
  /** The text to copy to the clipboard. */
  text: string;
  /** Additional CSS classes. */
  class?: string;
  className?: string;
}

export function BreadcrumbsClipboard(input: BreadcrumbsClipboardInput) {
  const { text, class: className, className: aliasedClassName } = input;
  const escaped = escapeAttr(text);

  return raw(`<button
    type="button"
    class="${cn(
      "opacity-0 transition-opacity group-hover:opacity-100",
      "inline-flex shrink-0 items-center justify-center",
      "size-6.5 rounded-md hover:bg-areia-control-hover",
      "cursor-pointer",
      className,
      aliasedClassName,
    )}"
    onclick="var c=this.querySelector('.bc-copy-icon'),k=this.querySelector('.bc-check-icon');navigator.clipboard.writeText(this.getAttribute('data-copy-text')).then(function(){c.style.display='none';k.style.display='flex';setTimeout(function(){c.style.display='flex';k.style.display='none'},2000)}).catch(function(){})"
    data-copy-text="${escaped}"
    title="Copy link"
    aria-label="Copy link"
  >
    <span class="bc-copy-icon flex items-center">
      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
      </svg>
    </span>
    <span class="bc-check-icon flex items-center text-areia-success" style="display:none">
      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>
    </span>
  </button>`);
}

// ---------------------------------------------------------------------------
// Breadcrumb item descriptor
// ---------------------------------------------------------------------------

export interface BreadcrumbItem {
  /** Link target URL. Omit for the current (last) item. */
  href?: string;
  /** Display content for the breadcrumb item. */
  children: unknown;
  /** Icon rendered before the content. */
  icon?: unknown;
}

// ---------------------------------------------------------------------------
// Trail builders
// ---------------------------------------------------------------------------

function buildFullTrail(items: BreadcrumbItem[], loading?: boolean): unknown[] {
  const trail: unknown[] = [];
  const len = items.length;

  for (let i = 0; i < len; i++) {
    if (i > 0) trail.push(BreadcrumbsSeparator());

    const item = items[i];
    const isLast = i === len - 1;

    if (isLast) {
      trail.push(
        BreadcrumbsCurrent({
          children: item.children,
          icon: item.icon,
          loading,
        }),
      );
    } else {
      trail.push(
        BreadcrumbsLink({
          href: item.href ?? "#",
          children: item.children,
          icon: item.icon,
        }),
      );
    }
  }

  return trail;
}

function buildMobileTrail(items: BreadcrumbItem[], loading?: boolean): unknown[] {
  if (items.length <= 2) return buildFullTrail(items, loading);

  const parent = items[items.length - 2];
  const current = items[items.length - 1];

  return [
    BreadcrumbsMobileEllipsis(),
    BreadcrumbsSeparator(),
    BreadcrumbsLink({
      href: parent.href ?? "#",
      children: parent.children,
      icon: parent.icon,
    }),
    BreadcrumbsSeparator(),
    BreadcrumbsCurrent({
      children: current.children,
      icon: current.icon,
      loading,
    }),
  ];
}

// ---------------------------------------------------------------------------
// Breadcrumbs (main component)
// ---------------------------------------------------------------------------

export interface BreadcrumbsInput extends BreadcrumbsVariantsProps {
  /**
   * Breadcrumb trail items. The last item is treated as the current page
   * and rendered without a link.
   *
   * @example
   * ```ts
   * Breadcrumbs({
   *   items: [
   *     { href: "/", children: "Home" },
   *     { href: "/docs", children: "Docs" },
   *     { children: "Current Page" },
   *   ],
   * })
   * ```
   */
  items: BreadcrumbItem[];
  /**
   * When true, the current page label is replaced with a loading skeleton.
   * @default false
   */
  loading?: boolean;
  /**
   * When provided, a copy-to-clipboard button appears on hover that copies
   * this URL.
   */
  copyUrl?: string;
  /** Additional CSS classes merged via `cn()`. */
  class?: string;
  className?: string;
}

/**
 * Navigation breadcrumb trail showing the current page's location in a
 * hierarchy.
 *
 * On mobile, intermediate items are collapsed to an ellipsis when there are
 * more than two items.
 *
 * @example
 * ```ts
 * Breadcrumbs({
 *   items: [
 *     { href: "/", children: "Home" },
 *     { href: "/docs", children: "Docs", icon: Icon({ icon: FileText }) },
 *     { children: "Current Page" },
 *   ],
 *   size: "base",
 *   copyUrl: "https://example.com/docs/current-page",
 * })
 * ```
 */
export function Breadcrumbs(input: BreadcrumbsInput) {
  const {
    items,
    size = BREADCRUMBS_DEFAULT_VARIANTS.size,
    loading,
    copyUrl,
    class: className,
    className: aliasedClassName,
  } = input;

  const fullTrail = buildFullTrail(items, loading);
  const mobileTrail = buildMobileTrail(items, loading);

  return html`<nav
    class="${cn(breadcrumbsVariants({ size }), className, aliasedClassName)}"
    aria-label="breadcrumb"
  >
    <div class="contents sm:hidden">${raw(render(mobileTrail))}</div>
    <div class="hidden sm:contents">${raw(render(fullTrail))}</div>
    ${copyUrl != null ? BreadcrumbsClipboard({ text: copyUrl }) : ""}
  </nav>`;
}

// ---------------------------------------------------------------------------
// Compound component export
// ---------------------------------------------------------------------------

export const BreadcrumbsRoot = Object.assign(Breadcrumbs, {
  Link: BreadcrumbsLink,
  Current: BreadcrumbsCurrent,
  Separator: BreadcrumbsSeparator,
  Clipboard: BreadcrumbsClipboard,
  MobileEllipsis: BreadcrumbsMobileEllipsis,
});
