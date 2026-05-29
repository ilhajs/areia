import ilha, { html, raw } from "ilha";
import { Resizable as ResizablePrimitive } from "@areia/slots";
import { cn } from "$lib/cn";
import { toAttrs } from "$lib/input";
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
const RESIZABLE_PART_TOKEN = "__AREIA_RESIZABLE_PART_";
let resizablePartId = 0;

const resizableParts = new Map<string, ResizablePart>();

type ResizablePart =
  | { [RESIZABLE_PART]: "panel"; id: string; input: ResizablePanelInput; toString: () => string }
  | { [RESIZABLE_PART]: "handle"; id: string; input: ResizableHandleInput; toString: () => string };

function createResizablePart<T extends ResizablePart[typeof RESIZABLE_PART]>(
  type: T,
  input: T extends "panel" ? ResizablePanelInput : ResizableHandleInput,
): ResizablePart {
  const id = `${resizablePartId++}`;
  const part = {
    [RESIZABLE_PART]: type,
    id,
    input,
    toString: () => `${RESIZABLE_PART_TOKEN}${id}__`,
  } as ResizablePart;
  resizableParts.set(id, part);
  return part;
}

function isResizablePart(value: unknown): value is ResizablePart {
  return typeof value === "object" && value !== null && RESIZABLE_PART in value;
}

function renderResizablePart(part: ResizablePart): unknown {
  return part[RESIZABLE_PART] === "panel"
    ? renderResizablePanel(part.input)
    : renderResizableHandle(part.input);
}

function renderPartTokens(value: string) {
  const pattern = new RegExp(`${RESIZABLE_PART_TOKEN}(\\d+)__`, "g");
  return raw(
    value.replace(pattern, (_match, id: string) => {
      const part = resizableParts.get(id);
      if (!part) return "";
      const rendered = renderResizablePart(part);
      return typeof rendered === "object" && rendered !== null && "value" in rendered
        ? String(rendered.value)
        : String(rendered);
    }),
  );
}

function renderChildren(value: unknown): unknown {
  if (value === null || value === undefined || value === false) return "";
  if (Array.isArray(value)) return value.map(renderChildren);
  if (isResizablePart(value)) return renderResizablePart(value);
  if (typeof value === "object" && "value" in value && typeof value.value === "string") {
    return renderPartTokens(value.value);
  }
  if (typeof value === "string") return renderPartTokens(value);
  return value;
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
  const panelStyle = [
    "flex-basis:0",
    "flex-shrink:1",
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
    style="${panelStyle}"
    ${raw(toAttrs(rest))}
  >
    ${renderChildren(children)}
  </div>`;
}

function renderResizableHandle(input: ResizableHandleInput = {}) {
  const { withHandle, children, class: className, className: aliasedClassName, ...rest } = input;

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

  return html`<div
    data-slot="resizable"
    class="${cn(
      "group/resizable flex h-full w-full overflow-hidden data-[direction=vertical]:flex-col",
      className,
      aliasedClassName,
    )}"
    ${raw(
      toAttrs({
        "data-direction": direction,
        "data-keyboard-resize-by": keyboardResizeBy,
        ...rest,
      }),
    )}
  >
    ${renderChildren(children)}
  </div>`;
}

function mountResizableRoot(root: HTMLElement, options: ResizablePrimitive.ResizableOptions = {}) {
  const controller = ResizablePrimitive.createResizable(root, options);
  const nestedControllers = Array.from(
    root.querySelectorAll<HTMLElement>('[data-slot="resizable"]'),
  )
    .filter((nestedRoot) => nestedRoot !== root)
    .map((nestedRoot) => ResizablePrimitive.createResizable(nestedRoot));

  return () => {
    nestedControllers.forEach((nestedController) => nestedController.destroy());
    controller.destroy();
  };
}

export const ResizablePanelGroupRoot = ilha
  .input<ResizableInput>()
  .onMount(({ host, input }) => {
    const root = host.matches('[data-slot="resizable"]')
      ? (host as HTMLElement)
      : host.querySelector<HTMLElement>('[data-slot="resizable"]');
    if (!root) return;

    return mountResizableRoot(root, {
      direction: input.direction,
      keyboardResizeBy: input.keyboardResizeBy,
      onLayoutChange: input.onLayoutChange,
    } satisfies ResizablePrimitive.ResizableOptions);
  })
  .render(({ input }) => renderResizable(input));

function autoMountResizable(root: ParentNode = document) {
  root.querySelectorAll<HTMLElement>('[data-slot="resizable"]').forEach((resizableRoot) => {
    if (resizableRoot.dataset.areiaResizableMounted === "true") return;
    resizableRoot.dataset.areiaResizableMounted = "true";
    mountResizableRoot(resizableRoot);
  });
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

export const Resizable = Object.assign(renderResizable, ResizablePanelGroupRoot, {
  Root: ResizablePanelGroupRoot,
  Static: renderResizable,
  Panel: ResizablePanel,
  Handle: ResizableHandle,
});

export const ResizablePanelGroup = Resizable;
