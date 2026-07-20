import ilha, { html, raw } from "ilha";
import { ContextMenu as ContextMenuPrimitive } from "@areia/slots";

const contextMenuControllers = new WeakMap<Element, ContextMenuPrimitive.ContextMenuController>();
import {
  boundElement,
  createOpenBindSync,
  queueContextMenuOpenBindForAutoMount,
  splitBindProps,
  subscribeBindProps,
  takeContextMenuOpenBindQueue,
  type IlhaBindProps,
} from "$lib/binds";
import { cn } from "$lib/cn";
import { hasSlot, render } from "$lib/markup";
import { toAttrs } from "$lib/input";
import type { HTMLElementProps } from "$lib/types";
import { MORPH_CONTROLLER_STYLE, stampMorphPreserve } from "$lib/morph-preserve";

export type ContextMenuInput = Omit<HTMLElementProps<HTMLDivElement>, "className" | "children"> &
  IlhaBindProps &
  Record<string, unknown> & {
    trigger?: unknown;
    children?: unknown;
    disabled?: boolean;
    closeOnSelect?: boolean;
    class?: string;
    className?: string;
    triggerClass?: string;
    triggerClassName?: string;
    contentClass?: string;
    contentClassName?: string;
    onOpenChange?: (open: boolean) => void;
    onSelect?: (value: string) => void;
    onPortalMounted?: (container: HTMLElement) => void;
  };

export type ContextMenuItemInput = Omit<
  HTMLElementProps<HTMLButtonElement>,
  "className" | "children"
> &
  Record<string, unknown> & {
    value?: string;
    label?: unknown;
    children?: unknown;
    disabled?: boolean;
    checked?: boolean;
    class?: string;
    className?: string;
  };

export function ContextMenuTrigger(
  input: { children?: unknown; class?: string; className?: string } = {},
) {
  const { children, class: className, className: aliasedClassName } = input;
  return html`<div
    data-slot="context-menu-trigger"
    class="${cn("contents", className, aliasedClassName)}"
  >
    ${render(children)}
  </div>`;
}

export function ContextMenuContent(
  input: { children?: unknown; class?: string; className?: string } = {},
) {
  const { children, class: className, className: aliasedClassName } = input;
  return html`<div
    data-slot="context-menu-content"
    hidden
    class="${cn(
      "z-50 min-w-40 rounded-lg bg-areia-background p-1 text-base shadow-lg ring ring-areia-border outline-none",
      className,
      aliasedClassName,
    )}"
  >
    ${render(children)}
  </div>`;
}

function menuItemSlot(type?: "checkbox" | "radio") {
  if (type === "checkbox") return "context-menu-checkbox-item";
  if (type === "radio") return "context-menu-radio-item";
  return "context-menu-item";
}

function renderItem(input: ContextMenuItemInput = {}, type?: "checkbox" | "radio") {
  const {
    value,
    label,
    children,
    disabled,
    checked,
    class: className,
    className: aliasedClassName,
    ...rest
  } = input;
  return html`<button
    type="button"
    data-slot="${menuItemSlot(type)}"
    class="${cn(
      "flex w-full items-center rounded-md px-2 py-1.5 text-left text-base text-areia-default outline-none data-highlighted:bg-areia-control-hover data-disabled:pointer-events-none data-disabled:opacity-50",
      className,
      aliasedClassName,
    )}"
    ${raw(
      toAttrs({
        ...rest,
        "data-value": value,
        "data-disabled": disabled,
        "data-checked": checked,
        "aria-checked": checked,
      }),
    )}
  >
    ${render(children ?? label ?? value)}
  </button>`;
}

export function ContextMenuItem(input: ContextMenuItemInput = {}) {
  return renderItem(input);
}

export function ContextMenuCheckboxItem(input: ContextMenuItemInput = {}) {
  return renderItem(input, "checkbox");
}

export function ContextMenuRadioItem(input: ContextMenuItemInput = {}) {
  return renderItem(input, "radio");
}

function renderContextMenu(input: ContextMenuInput = {}, autoBind = false) {
  const { binds, attrs: props } = splitBindProps(input);
  const {
    trigger,
    children,
    disabled,
    closeOnSelect,
    class: className,
    className: aliasedClassName,
    triggerClass,
    triggerClassName,
    contentClass,
    contentClassName,
    onOpenChange: _onOpenChange,
    onSelect: _onSelect,
    ...rest
  } = props as ContextMenuInput;

  if (autoBind && binds["bind:open"] != null) {
    queueContextMenuOpenBindForAutoMount(
      binds["bind:open"] as import("ilha").SignalAccessor<boolean>,
    );
  }

  const composedChildren = render(children);
  const hasComposedContent = hasSlot(children, "context-menu-content");

  const inner = html`${hasComposedContent
    ? composedChildren
    : html`${ContextMenuTrigger({ children: trigger, class: cn(triggerClass, triggerClassName) })}
      ${ContextMenuContent({ children, class: cn(contentClass, contentClassName) })}`}`;

  const openSuffix = ` data-slot="context-menu" class="${cn("contents", className, aliasedClassName)}"${toAttrs(
    {
      "data-areia-context-menu": autoBind ? "" : undefined,
      ...rest,
      "data-disabled": disabled,
      "data-close-on-select": closeOnSelect,
    },
  )}`;

  return boundElement("div", binds, openSuffix, inner);
}

type ContextMenuBindRuntime = {
  controller: ContextMenuPrimitive.ContextMenuController;
  bindSync: ReturnType<typeof createOpenBindSync>;
};

const contextMenuBindRuntimeByHost = new WeakMap<Element, ContextMenuBindRuntime>();

export const ContextMenuRoot = ilha
  .input<ContextMenuInput>()
  .onMount(({ host, input }) => {
    const root = host.matches('[data-slot="context-menu"]')
      ? host
      : host.querySelector('[data-slot="context-menu"]');
    if (!root) return;

    let bindSync: ReturnType<typeof createOpenBindSync> = null;

    stampMorphPreserve(root, MORPH_CONTROLLER_STYLE);
    const controller = ContextMenuPrimitive.createContextMenu(root, {
      disabled: input.disabled,
      closeOnSelect: input.closeOnSelect,
      onOpenChange: (open) => {
        bindSync?.onUserChange(open);
        input.onOpenChange?.(open);
      },
      onSelect: input.onSelect,
      onPortalMounted: input.onPortalMounted,
    } satisfies ContextMenuPrimitive.ContextMenuOptions);

    bindSync = createOpenBindSync(input, controller);
    bindSync?.applyFromSignal();
    contextMenuControllers.set(root, controller);
    contextMenuBindRuntimeByHost.set(host, { controller, bindSync });

    return () => {
      contextMenuBindRuntimeByHost.delete(host);
      contextMenuControllers.delete(root);
      controller.destroy();
    };
  })
  .effect(({ host, input }) => {
    subscribeBindProps(input);
    const runtime = contextMenuBindRuntimeByHost.get(host);
    if (!runtime) return;
    runtime.bindSync?.applyFromSignal();
  })
  .render(({ input }) => renderContextMenu(input));

const contextMenuAutoBindScheduled = new WeakSet<Document>();

type ContextMenuAutoRuntime = {
  controller: ContextMenuPrimitive.ContextMenuController;
  bindSync: ReturnType<typeof createOpenBindSync>;
};

const contextMenuAutoRuntimeByRoot = new WeakMap<Element, ContextMenuAutoRuntime>();

function scheduleContextMenuAutoBind(doc: Document | undefined = globalThis.document) {
  if (!doc || contextMenuAutoBindScheduled.has(doc)) return;
  contextMenuAutoBindScheduled.add(doc);
  queueMicrotask(() => {
    contextMenuAutoBindScheduled.delete(doc);
    const queued = takeContextMenuOpenBindQueue(doc);
    let queueIndex = 0;

    for (const root of doc.querySelectorAll<HTMLElement>(
      '[data-areia-context-menu][data-slot="context-menu"]',
    )) {
      const trigger = root.querySelector('[data-slot="context-menu-trigger"]');
      const content = root.querySelector('[data-slot="context-menu-content"]');
      if (!trigger || !content) continue;

      const existing = contextMenuAutoRuntimeByRoot.get(root);
      if (existing) {
        existing.bindSync?.applyFromSignal();
        continue;
      }

      const entry = queued[queueIndex++];
      let bindSync: ReturnType<typeof createOpenBindSync> = null;

      stampMorphPreserve(root, MORPH_CONTROLLER_STYLE);
      const controller = ContextMenuPrimitive.createContextMenu(root, {
        onOpenChange: (open) => bindSync?.onUserChange(open),
      });

      if (entry) {
        bindSync = createOpenBindSync({ "bind:open": entry.bindOpen }, controller);
        bindSync?.applyFromSignal();
      }

      contextMenuControllers.set(root, controller);
      contextMenuAutoRuntimeByRoot.set(root, { controller, bindSync });
    }
  });
}

function needsContextMenuIsland(input: ContextMenuInput) {
  const { binds } = splitBindProps(input);
  return (
    input.onOpenChange != null ||
    input.onSelect != null ||
    input.onPortalMounted != null ||
    binds["bind:open"] != null
  );
}

function ContextMenuComponent(input: ContextMenuInput = {}) {
  if (needsContextMenuIsland(input)) return ContextMenuRoot(input);
  scheduleContextMenuAutoBind();
  return renderContextMenu(input, true);
}

export const ContextMenu = Object.assign(ContextMenuComponent, {
  Root: ContextMenuRoot,
  Static: renderContextMenu,
  Trigger: ContextMenuTrigger,
  Content: ContextMenuContent,
  Item: ContextMenuItem,
  CheckboxItem: ContextMenuCheckboxItem,
  RadioItem: ContextMenuRadioItem,
});
