import { html, raw } from "ilha";
import { Checkbox } from "$components/checkbox";
import { cn } from "$lib/cn";
import { toAttrs } from "$lib/input";
import type { HTMLElementProps } from "$lib/types";

/** Table layout and row variant definitions mapping names to their Tailwind classes. */
export const TABLE_VARIANTS = {
  layout: {
    auto: {
      classes: "",
      description: "Auto table layout - columns resize based on content",
    },
    fixed: {
      classes: "table-fixed",
      description: "Fixed table layout - columns have equal width, controlled via colgroup",
    },
  },
  variant: {
    default: {
      classes: "",
      description: "Default row variant",
    },
    selected: {
      classes: "bg-areia-control-hover",
      description: "Selected row variant",
    },
  },
  sticky: {
    left: {
      classes: "sticky left-0",
      description: "Pin column to the left edge of the scroll container",
    },
    right: {
      classes: "sticky right-0",
      description: "Pin column to the right edge of the scroll container",
    },
  },
} as const;

export const TABLE_DEFAULT_VARIANTS = {
  layout: "auto",
  variant: "default",
} as const;

export type TableStickyColumn = keyof typeof TABLE_VARIANTS.sticky;
export type TableRowVariant = keyof typeof TABLE_VARIANTS.variant;
export type TableLayout = keyof typeof TABLE_VARIANTS.layout;

export interface TableVariantsProps {
  /** Table layout algorithm. */
  layout?: TableLayout;
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

function stickyColumnClasses(side: TableStickyColumn, element: "head" | "cell") {
  const base = resolveVariant(TABLE_VARIANTS.sticky, side, "left").classes;
  const z = element === "head" ? "z-2" : "z-1";
  const fadePosition = side === "right" ? "before:-left-6" : "before:-right-6";
  const fadeBase = "before:pointer-events-none before:absolute before:inset-y-0 before:w-6";

  if (element === "cell") {
    const fade =
      side === "right"
        ? "before:bg-gradient-to-r before:from-transparent before:to-areia-background"
        : "before:bg-gradient-to-l before:from-transparent before:to-areia-background";
    return cn(base, z, "bg-areia-background", fadeBase, fadePosition, fade);
  }

  const bg = "bg-areia-background group-data-[compact]/header:bg-areia-surface-muted";
  const fade =
    side === "right"
      ? "before:bg-gradient-to-r before:from-transparent before:to-areia-background group-data-[compact]/header:before:to-areia-surface-muted"
      : "before:bg-gradient-to-l before:from-transparent before:to-areia-background group-data-[compact]/header:before:to-areia-surface-muted";

  return cn(base, z, bg, fadeBase, fadePosition, fade);
}

export function tableVariants({ layout = TABLE_DEFAULT_VARIANTS.layout }: TableVariantsProps = {}) {
  return cn(
    "isolate w-full text-left text-base text-areia-default",
    resolveVariant(TABLE_VARIANTS.layout, layout, TABLE_DEFAULT_VARIANTS.layout).classes,
    "[&_td]:border-b [&_td]:border-areia-divider [&_td]:p-3 [&_tr:last-child_td]:border-b-0",
    "[&_th]:border-b [&_th]:border-areia-divider [&_th]:bg-areia-background [&_th]:p-3 [&_th]:text-base [&_th]:font-semibold",
  );
}

export type TableInput = Omit<HTMLElementProps<HTMLTableElement>, "className" | "children"> &
  TableVariantsProps &
  Record<string, unknown> & {
    /** Table sections and rows. */
    children?: unknown;
    /** Additional CSS classes applied to the table. */
    class?: string;
    className?: string;
  };

function TableRoot(input: TableInput = {}) {
  const {
    children,
    class: className,
    className: aliasedClassName,
    layout = TABLE_DEFAULT_VARIANTS.layout,
    ...props
  } = input;

  return html`<table
    class="${cn(tableVariants({ layout }), className, aliasedClassName)}"
    ${raw(toAttrs(props))}
  >
    ${raw(render(children))}
  </table>`;
}

export type TableHeaderInput = Omit<
  HTMLElementProps<HTMLTableSectionElement>,
  "className" | "children"
> &
  Record<string, unknown> & {
    children?: unknown;
    /** Compact headers use a muted background and smaller text. */
    variant?: "default" | "compact";
    /** Make header cells stick to the top of the scroll container. */
    sticky?: boolean;
    class?: string;
    className?: string;
  };

export function TableHeader(input: TableHeaderInput = {}) {
  const {
    children,
    class: className,
    className: aliasedClassName,
    sticky,
    variant = "default",
    ...props
  } = input;
  const isCompact = variant === "compact";

  return html`<thead
    class="${cn(
      "group/header",
      isCompact && "text-xs text-areia-strong [&_th]:bg-areia-surface-muted [&_th]:py-2",
      sticky && "[&_th]:sticky [&_th]:top-0 [&_th]:z-1",
      className,
      aliasedClassName,
    )}"
    ${raw(toAttrs({ ...props, "data-compact": isCompact || undefined }))}
  >
    ${raw(render(children))}
  </thead>`;
}

export type TableHeadInput = Omit<
  HTMLElementProps<HTMLTableCellElement>,
  "className" | "children"
> &
  Record<string, unknown> & {
    children?: unknown;
    /** Pin this header cell to the left or right edge of the scroll container. */
    sticky?: TableStickyColumn;
    class?: string;
    className?: string;
  };

export function TableHead(input: TableHeadInput = {}) {
  const { children, class: className, className: aliasedClassName, sticky, ...props } = input;

  return html`<th
    class="${cn(
      "group relative",
      sticky && stickyColumnClasses(sticky, "head"),
      className,
      aliasedClassName,
    )}"
    ${raw(toAttrs(props))}
  >
    ${children}
  </th>`;
}

export type TableRowInput = Omit<HTMLElementProps<HTMLTableRowElement>, "className" | "children"> &
  Record<string, unknown> & {
    children?: unknown;
    variant?: TableRowVariant;
    class?: string;
    className?: string;
  };

export function TableRow(input: TableRowInput = {}) {
  const {
    children,
    class: className,
    className: aliasedClassName,
    variant = TABLE_DEFAULT_VARIANTS.variant,
    ...props
  } = input;

  return html`<tr
    class="${cn(
      resolveVariant(TABLE_VARIANTS.variant, variant, TABLE_DEFAULT_VARIANTS.variant).classes,
      className,
      aliasedClassName,
    )}"
    ${raw(toAttrs(props))}
  >
    ${raw(render(children))}
  </tr>`;
}

export type TableBodyInput = Omit<
  HTMLElementProps<HTMLTableSectionElement>,
  "className" | "children"
> &
  Record<string, unknown> & {
    children?: unknown;
    class?: string;
    className?: string;
  };

export function TableBody(input: TableBodyInput = {}) {
  const { children, class: className, className: aliasedClassName, ...props } = input;

  return html`<tbody class="${cn(className, aliasedClassName)}" ${raw(toAttrs(props))}>
    ${raw(render(children))}
  </tbody>`;
}

export type TableCellInput = Omit<
  HTMLElementProps<HTMLTableCellElement>,
  "className" | "children"
> &
  Record<string, unknown> & {
    children?: unknown;
    /** Pin this body cell to the left or right edge of the scroll container. */
    sticky?: TableStickyColumn;
    class?: string;
    className?: string;
  };

export function TableCell(input: TableCellInput = {}) {
  const { children, class: className, className: aliasedClassName, sticky, ...props } = input;

  return html`<td
    class="${cn(sticky && stickyColumnClasses(sticky, "cell"), className, aliasedClassName)}"
    ${raw(toAttrs(props))}
  >
    ${children}
  </td>`;
}

export type TableFooterInput = Omit<
  HTMLElementProps<HTMLTableSectionElement>,
  "className" | "children"
> &
  Record<string, unknown> & {
    children?: unknown;
    class?: string;
    className?: string;
  };

export function TableFooter(input: TableFooterInput = {}) {
  const { children, class: className, className: aliasedClassName, ...props } = input;

  return html`<tfoot class="${cn(className, aliasedClassName)}" ${raw(toAttrs(props))}>
    ${raw(render(children))}
  </tfoot>`;
}

export type TableResizeHandleInput = Omit<
  HTMLElementProps<HTMLButtonElement>,
  "className" | "children" | "type"
> &
  Record<string, unknown> & {
    /** Minimum column width in pixels while dragging. */
    minWidth?: number;
    class?: string;
    className?: string;
  };

const resizeHandlePointerDown = `
  const handle = event.currentTarget;
  const cell = handle.closest('th,td');
  if (!cell) return;
  event.preventDefault();
  event.stopPropagation();
  const startX = event.clientX;
  const startWidth = cell.getBoundingClientRect().width;
  const minWidth = Number(handle.dataset.minWidth || 40);
  const onMove = (moveEvent) => {
    const width = Math.max(minWidth, startWidth + moveEvent.clientX - startX);
    cell.style.width = width + 'px';
    cell.style.minWidth = width + 'px';
  };
  const onUp = () => {
    document.removeEventListener('pointermove', onMove);
    document.removeEventListener('pointerup', onUp);
    handle.releasePointerCapture?.(event.pointerId);
  };
  handle.setPointerCapture?.(event.pointerId);
  document.addEventListener('pointermove', onMove);
  document.addEventListener('pointerup', onUp, { once: true });
`
  .replace(/\s+/g, " ")
  .trim();

export function TableResizeHandle(input: TableResizeHandleInput = {}) {
  const { class: className, className: aliasedClassName, minWidth = 40, ...props } = input;

  return html`<button
    type="button"
    aria-label="Resize column"
    onpointerdown="${resizeHandlePointerDown}"
    data-min-width="${minWidth}"
    class="${cn(
      "invisible absolute top-0 right-0 m-0 flex h-full w-2.5 cursor-col-resize touch-none items-center justify-center border-0 bg-areia-background p-0 select-none group-hover:visible focus-visible:ring-2 focus-visible:ring-areia-ring",
      className,
      aliasedClassName,
    )}"
    ${raw(toAttrs(props))}
  >
    <span class="h-5 w-0.5 rounded bg-areia-divider"></span>
  </button>`;
}

export type TableCheckCellInput = Omit<TableCellInput, "children"> & {
  checked?: boolean;
  indeterminate?: boolean;
  label?: string;
  disabled?: boolean;
  name?: string;
  value?: string;
};

export function TableCheckCell(input: TableCheckCellInput = {}) {
  const {
    checked,
    disabled,
    indeterminate,
    label,
    name,
    value,
    class: className,
    className: aliasedClassName,
    ...props
  } = input;

  return TableCell({
    ...props,
    class: cn("w-10 leading-none", String(className ?? ""), String(aliasedClassName ?? "")),
    children: Checkbox({
      checked,
      disabled,
      indeterminate,
      name,
      value,
      "aria-label": label ?? "Select row",
      class: "relative before:absolute before:-inset-3 before:content-['']",
    }),
  });
}

export type TableCheckHeadInput = Omit<TableHeadInput, "children"> & {
  checked?: boolean;
  indeterminate?: boolean;
  label?: string;
  disabled?: boolean;
  name?: string;
  value?: string;
};

export function TableCheckHead(input: TableCheckHeadInput = {}) {
  const {
    checked,
    disabled,
    indeterminate,
    label,
    name,
    value,
    class: className,
    className: aliasedClassName,
    ...props
  } = input;

  return TableHead({
    ...props,
    class: cn("w-10 leading-none", String(className ?? ""), String(aliasedClassName ?? "")),
    children: Checkbox({
      checked,
      disabled,
      indeterminate,
      name,
      value,
      "aria-label": label ?? "Select all rows",
      class: "relative before:absolute before:-inset-3 before:content-['']",
    }),
  });
}

export const Table = Object.assign(TableRoot, {
  Header: TableHeader,
  Head: TableHead,
  Row: TableRow,
  Body: TableBody,
  Cell: TableCell,
  CheckCell: TableCheckCell,
  CheckHead: TableCheckHead,
  Footer: TableFooter,
  ResizeHandle: TableResizeHandle,
});
