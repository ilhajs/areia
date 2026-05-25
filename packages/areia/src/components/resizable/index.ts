import ilha, { html, raw } from "ilha";
import {
  createResizable,
  type ResizableOptions,
  type PaneConstraints,
} from "../../../../slots/src/resizable";
import { cn } from "$lib/cn";
import { toAttrs } from "$lib/input";
import type { HTMLElementProps } from "$lib/types";

type Renderable = unknown;

function getIslandCall(value: unknown):
  | {
      island?: { toString?: (props?: unknown) => string };
      props?: unknown;
    }
  | undefined {
  if (value === null || (typeof value !== "object" && typeof value !== "function"))
    return undefined;
  const symbols = Object.getOwnPropertySymbols(value);
  if (!symbols.some((symbol) => symbol.description === "ilha.islandCall")) return undefined;
  return typeof value === "function"
    ? ((value as () => unknown)() as ReturnType<typeof getIslandCall>)
    : value;
}

function render(value: Renderable): string {
  if (value === null || value === undefined || value === false) return "";
  if (Array.isArray(value)) return value.map(render).join("");
  const islandCall = getIslandCall(value);
  if (islandCall?.island?.toString) return islandCall.island.toString(islandCall.props);
  if (typeof value === "object" && "value" in value && typeof value.value === "string") {
    return value.value;
  }
  return String(value);
}

export type ResizableInput = Omit<HTMLElementProps<HTMLDivElement>, "className" | "children"> &
  Pick<ResizableOptions, "direction" | "keyboardResizeBy" | "onLayoutChange"> &
  Record<string, unknown> & {
    children?: unknown;
    class?: string;
    className?: string;
  };

export type ResizablePanelInput = Omit<HTMLElementProps<HTMLDivElement>, "className" | "children"> &
  Pick<PaneConstraints, "defaultSize" | "minSize" | "maxSize" | "collapsedSize" | "collapsible"> &
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

export function ResizablePanel(input: ResizablePanelInput = {}) {
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
    ${raw(render(children))}
  </div>`;
}

export function ResizableHandle(input: ResizableHandleInput = {}) {
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
    ${raw(render(children))}
  </div>`;
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
    ${raw(render(children))}
  </div>`;
}

export const ResizablePanelGroupRoot = ilha
  .input<ResizableInput>()
  .onMount(({ host, input }) => {
    const root = host.matches('[data-slot="resizable"]')
      ? host
      : host.querySelector('[data-slot="resizable"]');
    if (!root) return;

    const controller = createResizable(root, {
      direction: input.direction,
      keyboardResizeBy: input.keyboardResizeBy,
      onLayoutChange: input.onLayoutChange,
    } satisfies ResizableOptions);
    const nestedControllers = Array.from(
      root.querySelectorAll<HTMLElement>('[data-slot="resizable"]'),
    )
      .filter((nestedRoot) => nestedRoot !== root)
      .map((nestedRoot) => createResizable(nestedRoot));

    return () => {
      nestedControllers.forEach((nestedController) => nestedController.destroy());
      controller.destroy();
    };
  })
  .render(({ input }) => renderResizable(input));

export const Resizable = Object.assign(ResizablePanelGroupRoot, {
  Root: ResizablePanelGroupRoot,
  Static: renderResizable,
  Panel: ResizablePanel,
  Handle: ResizableHandle,
});

export const ResizablePanelGroup = Resizable;
