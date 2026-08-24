import { ilha, html, raw } from "ilha";
import { Resizable as ResizablePrimitive } from "@areia/slots";
import { cn } from "$lib/cn";
import { decodeMarkupEntities, render } from "$lib/markup";
import { toAttrs } from "$lib/input";
import {
  mergeMorphPreserve,
  MORPH_CONTROLLER_STYLE,
  stampMorphPreserve,
} from "$lib/morph-preserve";
import type { HTMLElementProps } from "$lib/types";

export type ResizableInput = Omit<HTMLElementProps<HTMLDivElement>, "className" | "children"> &
  Pick<ResizablePrimitive.ResizableOptions, "direction" | "keyboardResizeBy" | "onLayoutChange"> &
  Record<string, unknown> & {
    children?: unknown;
    class?: string;
    className?: string;
  };

export type ResizablePanelInput = Omit<HTMLElementProps<HTMLDivElement>, "className" | "children"> &
  Pick<
    ResizablePrimitive.PaneConstraints,
    "defaultSize" | "minSize" | "maxSize" | "collapsedSize" | "collapsible"
  > &
  Record<string, unknown> & {
    children?: unknown;
    class?: string;
    className?: string;
  };

export type ResizableHandleInput = Omit<
  HTMLElementProps<HTMLDivElement>,
  "className" | "children"
> &
  Record<string, unknown> & {
    withHandle?: boolean;
    children?: unknown;
    class?: string;
    className?: string;
  };

const RESIZABLE_PART = "__areiaResizablePart";
const ILHA_RENDER_PART = Symbol.for("ilha.renderPart");

/** Inline styles owned by the slots controller after mount. */
type ResizablePart =
  | { [RESIZABLE_PART]: "panel"; input: ResizablePanelInput }
  | { [RESIZABLE_PART]: "handle"; input: ResizableHandleInput };

function partToMarkup(part: ResizablePart): string {
  const rendered = renderResizablePart(part);
  if (rendered && typeof rendered === "object" && rendered !== null && "value" in rendered) {
    return String(rendered.value);
  }
  return String(rendered ?? "");
}

function createResizablePart<T extends ResizablePart[typeof RESIZABLE_PART]>(
  type: T,
  input: T extends "panel" ? ResizablePanelInput : ResizableHandleInput,
): ResizablePart {
  const part = { [RESIZABLE_PART]: type, [ILHA_RENDER_PART]: true, input } as ResizablePart;
  Object.defineProperty(part, "toString", {
    value: () => partToMarkup(part),
    enumerable: false,
  });
  return part;
}

function isResizablePart(value: unknown): value is ResizablePart {
  if (typeof value !== "object" || value === null) return false;
  const type = (value as Record<string, unknown>)[RESIZABLE_PART];
  return type === "panel" || type === "handle";
}

function renderResizablePart(part: ResizablePart): unknown {
  return part[RESIZABLE_PART] === "panel"
    ? renderResizablePanel(part.input)
    : renderResizableHandle(part.input);
}

function renderChildren(value: unknown): unknown {
  if (value === null || value === undefined || value === false) return "";
  if (Array.isArray(value)) return value.map(renderChildren);
  if (isResizablePart(value)) return renderResizablePart(value);
  if (typeof value === "object" && "value" in value && typeof value.value === "string") {
    const markup = decodeMarkupEntities(value.value);
    if (
      markup.includes('data-slot="resizable-panel"') ||
      markup.includes('data-slot="resizable-handle"')
    ) {
      return raw(markup);
    }
    return render(markup);
  }
  if (typeof value === "string") return render(value);
  return value;
}

/**
 * When only some panels declare `defaultSize`, fill the rest with the remaining
 * percentage so SSR/template flex-grow matches the controller's layout math
 * (avoids flex-grow:20 vs flex-grow:1 looking like ~95/5 before hydrate).
 */
function normalizeResizableChildren(children: unknown): unknown {
  const items = Array.isArray(children)
    ? [...children]
    : children == null || children === false
      ? []
      : [children];
  if (items.length === 0) return children;

  const panelIdx: number[] = [];
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (isResizablePart(item) && item[RESIZABLE_PART] === "panel") panelIdx.push(i);
  }
  if (panelIdx.length === 0) return children;

  let assigned = 0;
  let withSize = 0;
  const explicit: (number | undefined)[] = panelIdx.map((idx) => {
    const part = items[idx] as ResizablePart & { input: ResizablePanelInput };
    const d = part.input.defaultSize;
    if (typeof d === "number" && Number.isFinite(d)) {
      withSize += 1;
      assigned += d;
      return d;
    }
    return undefined;
  });

  const missing = panelIdx.length - withSize;
  if (missing === 0) return children;

  if (withSize > 0 && typeof process !== "undefined" && process.env?.NODE_ENV !== "production") {
    console.warn(
      "[areia:Resizable] Some panels omit defaultSize while others set it. " +
        "defaultSize is a percentage of the group (sum ≈ 100). " +
        "Missing siblings will share the remaining space in markup; prefer explicit sizes on every panel.",
    );
  }

  const remaining = Math.max(0, 100 - assigned);
  const each = remaining / missing;

  for (let j = 0; j < panelIdx.length; j++) {
    if (explicit[j] != null) continue;
    const idx = panelIdx[j]!;
    const part = items[idx] as ResizablePart & { input: ResizablePanelInput };
    items[idx] = createResizablePart("panel", { ...part.input, defaultSize: each });
  }

  return items;
}

function panelDataAttrs(
  input: Pick<
    ResizablePanelInput,
    "defaultSize" | "minSize" | "maxSize" | "collapsedSize" | "collapsible"
  >,
) {
  return toAttrs({
    "data-default-size": input.defaultSize,
    "data-min-size": input.minSize,
    "data-max-size": input.maxSize,
    "data-collapsed-size": input.collapsedSize,
    "data-collapsible": input.collapsible ?? undefined,
  });
}

function renderResizablePanel(input: ResizablePanelInput = {}) {
  const {
    children,
    defaultSize,
    minSize,
    maxSize,
    collapsedSize,
    collapsible,
    class: className,
    className: aliasedClassName,
    style,
    ...rest
  } = input;
  const userPreserve = rest["data-morph-preserve"];
  delete rest["data-morph-preserve"];

  const panelStyle = [
    "flex-basis:0",
    "flex-shrink:1",
    // Prefer % defaultSize so template flex-grow matches controller layout.
    // When omitted on a lone panel, grow 1 (fill). Group normalize fills siblings.
    `flex-grow:${defaultSize ?? 1}`,
    "overflow:hidden",
    style,
  ]
    .filter(Boolean)
    .join(";");

  return html`<div
    data-slot="resizable-panel"
    class="${cn("min-w-0", className, aliasedClassName)}"
    ${raw(panelDataAttrs({ defaultSize, minSize, maxSize, collapsedSize, collapsible }))}
    data-morph-preserve="${mergeMorphPreserve(userPreserve, MORPH_CONTROLLER_STYLE)}"
    style="${panelStyle}"
    ${raw(toAttrs(rest))}
  >
    ${renderChildren(children)}
  </div>`;
}

function renderResizableHandle(input: ResizableHandleInput = {}) {
  const { withHandle, children, class: className, className: aliasedClassName, ...rest } = input;
  const userPreserve = rest["data-morph-preserve"];
  delete rest["data-morph-preserve"];

  return html`<div
    data-slot="resizable-handle"
    class="${cn(
      "relative flex w-px cursor-col-resize items-center justify-center bg-areia-border",
      "after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2",
      "focus-visible:ring-1 focus-visible:ring-areia-ring focus-visible:outline-hidden",
      "data-[direction=vertical]:h-px data-[direction=vertical]:w-full data-[direction=vertical]:cursor-row-resize data-[direction=vertical]:after:inset-x-0 data-[direction=vertical]:after:top-1/2 data-[direction=vertical]:after:left-auto data-[direction=vertical]:after:h-1 data-[direction=vertical]:after:w-full data-[direction=vertical]:after:-translate-y-1/2 data-[direction=vertical]:after:translate-x-0",
      "group-data-[direction=vertical]/resizable:h-px group-data-[direction=vertical]/resizable:w-full group-data-[direction=vertical]/resizable:cursor-row-resize group-data-[direction=vertical]/resizable:after:inset-x-0 group-data-[direction=vertical]/resizable:after:top-1/2 group-data-[direction=vertical]/resizable:after:left-auto group-data-[direction=vertical]/resizable:after:h-1 group-data-[direction=vertical]/resizable:after:w-full group-data-[direction=vertical]/resizable:after:-translate-y-1/2 group-data-[direction=vertical]/resizable:after:translate-x-0",
      "[&[data-direction=vertical]>div]:h-1 [&[data-direction=vertical]>div]:w-6",
      "group-data-[direction=vertical]/resizable:[&>div]:h-1 group-data-[direction=vertical]/resizable:[&>div]:w-6",
      className,
      aliasedClassName,
    )}"
    data-morph-preserve="${mergeMorphPreserve(userPreserve, MORPH_CONTROLLER_STYLE)}"
    ${raw(toAttrs(rest))}
  >
    ${withHandle ? html`<div class="z-10 h-6 w-1 shrink-0 rounded-lg bg-areia-border"></div>` : ""}
    ${renderChildren(children)}
  </div>`;
}

export function ResizablePanel(input: ResizablePanelInput = {}) {
  return createResizablePart("panel", input);
}

export function ResizableHandle(input: ResizableHandleInput = {}) {
  return createResizablePart("handle", input);
}

function resizableOptions(input: ResizableInput = {}): ResizablePrimitive.ResizableOptions {
  return {
    direction: input.direction,
    keyboardResizeBy: input.keyboardResizeBy,
    onLayoutChange: input.onLayoutChange,
  } satisfies ResizablePrimitive.ResizableOptions;
}

function collectResizableRoots(scope: ParentNode): HTMLElement[] {
  const roots = new Set<HTMLElement>();
  if (scope instanceof HTMLElement) {
    if (scope.matches('[data-slot="resizable"]')) roots.add(scope);
    const ancestor = scope.closest('[data-slot="resizable"]');
    if (ancestor instanceof HTMLElement) roots.add(ancestor);
  }
  scope.querySelectorAll?.('[data-slot="resizable"]').forEach((node) => {
    if (node instanceof HTMLElement) roots.add(node);
  });
  return [...roots];
}

function stampResizableMorph(root: Element): void {
  stampMorphPreserve(root, MORPH_CONTROLLER_STYLE);
}

function repairResizableLayout(controller: ResizablePrimitive.ResizableController): void {
  // setLayout with the current layout re-writes flex styles without emitting change
  // when percentages are unchanged (see slots commitLayout).
  controller.setLayout(controller.layout);
}

function connectResizableTree(
  host: ParentNode,
  input: ResizableInput = {},
): (() => void) | undefined {
  const options = resizableOptions(input);
  const ownedControllers: ResizablePrimitive.ResizableController[] = [];

  for (const root of collectResizableRoots(host)) {
    if (root.querySelectorAll('[data-slot="resizable-panel"]').length === 0) continue;
    // Unrelated DOM patches inside a resizable tree (e.g. a filtered table re-rendering)
    // trigger this via the MutationObserver below. Reconnecting would destroy the live
    // controller and recompute layout from `defaultSize`, discarding the user's drag —
    // skip roots that already have a bound controller instead, but re-stamp morph
    // preserve and re-apply layout in case a parent morph clobbered inline styles.
    if (ResizablePrimitive.hasBinding(root)) {
      const existing = ResizablePrimitive.getBinding(root);
      if (existing) {
        stampResizableMorph(root);
        repairResizableLayout(existing);
      }
      continue;
    }
    try {
      const controller = ResizablePrimitive.reconnectResizable(root, options);
      stampResizableMorph(root);
      ownedControllers.push(controller);
    } catch {
      // Ignore groups that are mid-render without a complete panel/handle structure.
    }
  }

  if (ownedControllers.length === 0) return undefined;
  return () => ownedControllers.forEach((controller) => controller.destroy());
}

function scheduleConnectResizableTree(host: ParentNode, input: ResizableInput = {}): () => void {
  let cancelled = false;
  let cleanup: (() => void) | undefined;

  queueMicrotask(() => {
    if (cancelled || (host instanceof Node && !host.isConnected)) return;
    cleanup = connectResizableTree(host, input);
  });

  return () => {
    if (cancelled) return;
    cancelled = true;
    cleanup?.();
  };
}

function renderResizable(input: ResizableInput = {}) {
  const {
    direction,
    keyboardResizeBy,
    class: className,
    className: aliasedClassName,
    children,
    onLayoutChange: _onLayoutChange,
    ...rest
  } = input;
  const userPreserve = rest["data-morph-preserve"];
  delete rest["data-morph-preserve"];

  return html`<div
    data-slot="resizable"
    class="${cn(
      "group/resizable flex h-full w-full overflow-hidden data-[direction=vertical]:flex-col",
      className,
      aliasedClassName,
    )}"
    data-morph-preserve="${mergeMorphPreserve(userPreserve, MORPH_CONTROLLER_STYLE)}"
    ${raw(
      toAttrs({
        "data-direction": direction,
        "data-keyboard-resize-by": keyboardResizeBy,
        ...rest,
      }),
    )}
  >
    ${renderChildren(normalizeResizableChildren(children))}
  </div>`;
}

export const ResizablePanelGroupRoot = ilha
  .input<ResizableInput>()
  .onMount(({ host, input }) => scheduleConnectResizableTree(host, input))
  .effect(({ host, input }) => scheduleConnectResizableTree(host, input))
  .render(({ input }) => renderResizable(input));

function autoMountResizable(scope: ParentNode = document) {
  scheduleConnectResizableTree(scope);
}

if (typeof document !== "undefined") {
  queueMicrotask(() => autoMountResizable());
  document.addEventListener("DOMContentLoaded", () => autoMountResizable(), { once: true });
  new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      mutation.addedNodes.forEach((node) => {
        if (node instanceof Element) {
          autoMountResizable(node);
        }
      });
    }
  }).observe(document.documentElement, { childList: true, subtree: true });
}

export const Resizable = Object.assign(renderResizable, {
  Root: ResizablePanelGroupRoot,
  Static: renderResizable,
  Panel: ResizablePanel,
  Handle: ResizableHandle,
});

export const ResizablePanelGroup = Resizable;
