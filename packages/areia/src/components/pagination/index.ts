import { action, effect, ilha, html, raw } from "ilha";
import { Button, buttonVariants, type ButtonSize } from "$components/button";
import { Select } from "$components/select";
import { cn } from "$lib/cn";
import { render } from "$lib/markup";
import { toAttrs } from "$lib/input";
import type { HTMLElementProps } from "$lib/types";

const DEFAULT_PAGE_SIZE_OPTIONS = [25, 50, 100, 250] as const;

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

export interface PaginationLabels {
  /** Aria label for the navigation landmark. */
  navigation?: string;
  /** Aria label for the first page button. */
  firstPage?: string;
  /** Aria label for the previous page button. */
  previousPage?: string;
  /** Aria label for the next page button. */
  nextPage?: string;
  /** Aria label for the last page button. */
  lastPage?: string;
  /** Aria label for the page number input/select. */
  pageNumber?: string;
  /** Aria label for the page size select. */
  pageSize?: string;
}

const DEFAULT_LABELS: Required<PaginationLabels> = {
  navigation: "Pagination",
  firstPage: "First page",
  previousPage: "Previous page",
  nextPage: "Next page",
  lastPage: "Last page",
  pageNumber: "Page number",
  pageSize: "Page size",
};

export const PAGINATION_VARIANTS = {
  controls: {
    full: {
      classes: "",
      description: "Full controls with first, previous, page input, next, and last buttons",
    },
    simple: {
      classes: "",
      description: "Simple controls with only previous and next buttons",
    },
  },
} as const;

export const PAGINATION_DEFAULT_VARIANTS = {
  controls: "full",
} as const;

export type PaginationControlsVariant = keyof typeof PAGINATION_VARIANTS.controls;
export type PaginationPageSelector = "input" | "dropdown";

export interface PaginationVariantsProps {
  controls?: PaginationControlsVariant;
}

type VariantConfig = Record<string, { classes: string }>;
function resolveVariant<TVariants extends VariantConfig, TKey extends keyof TVariants>(
  variants: TVariants,
  value: TKey | undefined,
  fallback: TKey,
) {
  return variants[value ?? fallback] ?? variants[fallback];
}

export function paginationVariants({
  controls = PAGINATION_DEFAULT_VARIANTS.controls,
}: PaginationVariantsProps = {}) {
  return cn(
    "flex w-full items-center justify-between gap-2",
    resolveVariant(PAGINATION_VARIANTS.controls, controls, PAGINATION_DEFAULT_VARIANTS.controls)
      .classes,
  );
}

function labels(input?: PaginationLabels): Required<PaginationLabels> {
  return { ...DEFAULT_LABELS, ...input };
}

function maxPage(totalCount?: number, perPage?: number) {
  return Math.max(1, Math.ceil((totalCount ?? 1) / (perPage ?? 1)));
}

function pageRange(page = 1, perPage?: number, totalCount?: number) {
  if (!totalCount || totalCount <= 0) return "0-0";
  const size = perPage ?? 1;
  const lower = page * size - size + 1;
  const upper = Math.min(page * size, totalCount);
  return `${lower}-${upper}`;
}

function caretIcon(kind: "first" | "previous" | "next" | "last") {
  const paths = {
    first: html`<path d="m11 17-5-5 5-5"></path><path d="m18 17-5-5 5-5"></path>`,
    previous: html`<path d="m15 18-6-6 6-6"></path>`,
    next: html`<path d="m9 18 6-6-6-6"></path>`,
    last: html`<path d="m13 17 5-5-5-5"></path><path d="m6 17 5-5-5-5"></path>`,
  };

  return html`<svg
    aria-hidden="true"
    class="size-4"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    ${paths[kind]}
  </svg>`;
}

export type PaginationInfoInput = Omit<HTMLElementProps<HTMLDivElement>, "className" | "children"> &
  Record<string, unknown> & {
    page?: number;
    perPage?: number;
    totalCount?: number;
    children?: unknown;
    class?: string;
    className?: string;
  };

export function PaginationInfo(input: PaginationInfoInput = {}) {
  const {
    children,
    class: className,
    className: aliasedClassName,
    page = 1,
    perPage,
    totalCount,
    ...props
  } = input;
  const content =
    children ??
    (totalCount && totalCount > 0
      ? html`Showing <span class="tabular-nums">${pageRange(page, perPage, totalCount)}</span> of
          <span class="tabular-nums">${totalCount}</span>`
      : "");

  return html`<div
    data-slot="pagination-info"
    class="${cn("text-sm text-areia-subtle", className, aliasedClassName)}"
    ${raw(toAttrs(props))}
  >
    ${content}
  </div>`;
}

export type PaginationSeparatorInput = Omit<HTMLElementProps<HTMLDivElement>, "className"> &
  Record<string, unknown> & {
    class?: string;
    className?: string;
  };

export function PaginationSeparator(input: PaginationSeparatorInput = {}) {
  const { class: className, className: aliasedClassName, ...props } = input;
  return html`<div
    data-slot="pagination-separator"
    class="${cn("mx-2 h-6 border-l border-areia-divider", className, aliasedClassName)}"
    ${raw(toAttrs(props))}
  ></div>`;
}

export type PaginationPageSizeInput = Omit<
  HTMLElementProps<HTMLDivElement>,
  "className" | "children"
> &
  Record<string, unknown> & {
    value: number;
    options?: number[];
    label?: unknown;
    labels?: PaginationLabels;
    name?: string;
    class?: string;
    className?: string;
  };

export function PaginationPageSize(input: PaginationPageSizeInput) {
  const {
    class: className,
    className: aliasedClassName,
    label = "Per page:",
    labels: labelsProp,
    name,
    options = [...DEFAULT_PAGE_SIZE_OPTIONS],
    value,
    ...props
  } = input;
  const resolvedLabels = labels(labelsProp);

  return html`<div
    data-slot="pagination-page-size"
    class="${cn("flex items-center gap-2", className, aliasedClassName)}"
    ${raw(toAttrs(props))}
  >
    ${label ? html`<span class="text-sm text-areia-subtle">${label}</span>` : ""}
    ${Select({
      "aria-label": resolvedLabels.pageSize,
      name,
      value: String(value),
      class: "w-auto",
      "data-pagination-page-size": "",
      items: options.map((size) => ({ value: String(size), label: size })),
    })}
  </div>`;
}

export type PaginationControlsInput = Omit<
  HTMLElementProps<HTMLDivElement>,
  "className" | "children"
> &
  PaginationVariantsProps &
  Record<string, unknown> & {
    page?: number;
    perPage?: number;
    totalCount?: number;
    pageSelector?: PaginationPageSelector;
    labels?: PaginationLabels;
    buttonSize?: ButtonSize;
    class?: string;
    className?: string;
  };

function controlButton(
  kind: "first" | "previous" | "next" | "last",
  page: number,
  disabled: boolean,
  label: string,
  size: ButtonSize,
) {
  return Button({
    "aria-label": label,
    class: cn(
      buttonVariants({ size, shape: "square", variant: "secondary" }),
      "rounded-none first:rounded-l-md last:rounded-r-md",
    ),
    disabled,
    icon: caretIcon(kind),
    shape: "square",
    size,
    type: "button",
    "data-pagination-action": kind,
    "data-pagination-page": page,
  });
}

export function PaginationControls(input: PaginationControlsInput = {}) {
  const {
    buttonSize = "base",
    class: className,
    className: aliasedClassName,
    controls = PAGINATION_DEFAULT_VARIANTS.controls,
    labels: labelsProp,
    page = 1,
    pageSelector = "input",
    perPage,
    totalCount,
    ...props
  } = input;
  const resolvedLabels = labels(labelsProp);
  const max = maxPage(totalCount, perPage);
  const current = clamp(page, 1, max);
  const previous = Math.max(current - 1, 1);
  const next = Math.min(current + 1, max);

  return html`<div
    data-slot="pagination-controls"
    class="${cn("flex grow flex-col items-end", className, aliasedClassName)}"
    ${raw(toAttrs(props))}
  >
    <nav aria-label="${resolvedLabels.navigation}">
      <div class="inline-flex items-stretch rounded-md shadow-xs">
        ${controls === "full"
          ? controlButton("first", 1, current <= 1, resolvedLabels.firstPage, buttonSize)
          : ""}
        ${controlButton(
          "previous",
          previous,
          current <= 1,
          resolvedLabels.previousPage,
          buttonSize,
        )}
        ${controls === "full"
          ? pageSelector === "dropdown"
            ? Select({
                "aria-label": resolvedLabels.pageNumber,
                value: String(current),
                class: "w-18 rounded-none ring-areia-divider",
                "data-pagination-page-select": "",
                items: Array.from({ length: max }, (_, index) => ({
                  value: String(index + 1),
                  label: index + 1,
                })),
              })
            : html`<input
                aria-label="${resolvedLabels.pageNumber}"
                class="h-9 w-12.5 border-0 bg-areia-control-background text-center text-base text-areia-default ring ring-areia-divider outline-none focus:ring-areia-ring/50 focus:ring-[1.5px]"
                value="${current}"
                inputmode="numeric"
                autocomplete="off"
                data-1p-ignore
                data-lpignore="true"
                data-form-type="other"
                data-pagination-page-input
              />`
          : ""}
        ${controlButton("next", next, current >= max, resolvedLabels.nextPage, buttonSize)}
        ${controls === "full"
          ? controlButton("last", max, current >= max, resolvedLabels.lastPage, buttonSize)
          : ""}
      </div>
    </nav>
  </div>`;
}

export type PaginationInput = Omit<HTMLElementProps<HTMLDivElement>, "className" | "children"> &
  PaginationVariantsProps &
  Record<string, unknown> & {
    /** Current page number, 1-indexed. */
    page?: number;
    /** Callback fired when page changes in island mode. */
    setPage?: (page: number) => void;
    /** Alias for `setPage`. */
    onPageChange?: (page: number) => void;
    /** Current page size. */
    perPage?: number;
    /** Callback fired when page size changes in island mode. */
    onPageSizeChange?: (size: number) => void;
    /** Total number of rows/items. */
    totalCount?: number;
    /** Compound children. When omitted, a default info + controls layout is rendered. */
    children?: unknown;
    labels?: PaginationLabels;
    pageSelector?: PaginationPageSelector;
    class?: string;
    className?: string;
  };

function renderPagination(input: PaginationInput = {}) {
  const {
    children,
    class: className,
    className: aliasedClassName,
    controls = PAGINATION_DEFAULT_VARIANTS.controls,
    labels: labelsProp,
    page = 1,
    pageSelector,
    perPage,
    totalCount,
    setPage: _setPage,
    onPageChange: _onPageChange,
    onPageSizeChange: _onPageSizeChange,
    ...props
  } = input;
  const content = children ?? [
    html`<div aria-live="polite" aria-atomic="true" class="grow">
      ${PaginationInfo({ page, perPage, totalCount })}
    </div>`,
    PaginationControls({ controls, labels: labelsProp, page, pageSelector, perPage, totalCount }),
  ];

  return html`<div
    data-slot="pagination"
    data-page="${page}"
    data-per-page="${perPage ?? ""}"
    data-total-count="${totalCount ?? ""}"
    class="${cn("flex w-full items-center gap-2", className, aliasedClassName)}"
    ${raw(toAttrs(props))}
  >
    ${render(content)}
  </div>`;
}

function emitPageChange(root: Element, page: number) {
  root.dispatchEvent(
    new CustomEvent("pagination:page-change", { bubbles: true, detail: { page } }),
  );
}

function emitPageSizeChange(root: Element, pageSize: number) {
  root.dispatchEvent(
    new CustomEvent("pagination:page-size-change", { bubbles: true, detail: { pageSize } }),
  );
}

function resolvePaginationRoot(host: Element): HTMLElement | null {
  return host.matches('[data-slot="pagination"]')
    ? (host as HTMLElement)
    : host.querySelector<HTMLElement>('[data-slot="pagination"]');
}

export const PaginationRoot = ilha((input: PaginationInput) => {
  let host: Element;

  const pageChange = action((page: number) => {
    const root = resolvePaginationRoot(host);
    const max = maxPage(input.totalCount, input.perPage);
    const next = clamp(page, 1, max);
    input.setPage?.(next);
    input.onPageChange?.(next);
    if (root) emitPageChange(root, next);
  });
  const pageSizeChange = action((size: number) => {
    const root = resolvePaginationRoot(host);
    input.onPageSizeChange?.(size);
    if (root) emitPageSizeChange(root, size);
  });

  effect.once(({ host: __host }) => {
    host = __host;
    const el = __host as HTMLElement;

    const handleActionClick = (event: MouseEvent) => {
      const root = resolvePaginationRoot(el);
      const button = (event.target as HTMLElement | null)?.closest?.<HTMLElement>(
        "[data-pagination-action]",
      );
      if (!root || !button || !root.contains(button) || button.hasAttribute("disabled")) return;
      const page = Number(button.dataset["paginationPage"]);
      if (Number.isFinite(page)) pageChange(page);
    };
    const handleFocusOut = (event: FocusEvent) => {
      const target = event.target;
      if (target instanceof HTMLInputElement && target.hasAttribute("data-pagination-page-input")) {
        pageChange(Number(target.value));
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target;
      if (
        event.key === "Enter" &&
        target instanceof HTMLInputElement &&
        target.hasAttribute("data-pagination-page-input")
      ) {
        pageChange(Number(target.value));
      }
    };
    const handleSelectChange = (event: Event) => {
      const target = event.target;
      if (
        target instanceof HTMLSelectElement &&
        target.hasAttribute("data-pagination-page-select")
      ) {
        pageChange(Number(target.value));
      }
    };
    const handlePageSizeChange = (event: Event) => {
      const target = event.target;
      if (target instanceof HTMLSelectElement && target.hasAttribute("data-pagination-page-size")) {
        pageSizeChange(Number(target.value));
      }
    };

    el.addEventListener("click", handleActionClick);
    el.addEventListener("focusout", handleFocusOut);
    el.addEventListener("keydown", handleKeyDown);
    el.addEventListener("change", handleSelectChange);
    el.addEventListener("change", handlePageSizeChange);
    return () => {
      el.removeEventListener("click", handleActionClick);
      el.removeEventListener("focusout", handleFocusOut);
      el.removeEventListener("keydown", handleKeyDown);
      el.removeEventListener("change", handleSelectChange);
      el.removeEventListener("change", handlePageSizeChange);
    };
  });

  return renderPagination(input);
});

function PaginationBase(input: PaginationInput = {}) {
  return renderPagination(input);
}

export const Pagination = Object.assign(PaginationRoot, {
  Root: PaginationRoot,
  Static: PaginationBase,
  Info: PaginationInfo,
  PageSize: PaginationPageSize,
  Controls: PaginationControls,
  Separator: PaginationSeparator,
});
