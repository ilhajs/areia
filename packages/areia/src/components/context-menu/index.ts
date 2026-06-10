import ilha, { html, raw } from "ilha";
import { ContextMenu as ContextMenuPrimitive } from "@areia/slots";

const contextMenuControllers = new WeakMap<Element, ContextMenuPrimitive.ContextMenuController>();
import { createOpenBindSync, subscribeBindProps, type IlhaBindProps } from "$lib/binds";
import { cn } from "$lib/cn";
import { hasSlot, render } from "$lib/markup";
import { toAttrs } from "$lib/input";
import type { HTMLElementProps } from "$lib/types";

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

function renderContextMenu(input: ContextMenuInput = {}) {
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
  } = input;

  const composedChildren = render(children);
  const hasComposedContent = hasSlot(children, "context-menu-content");

  return html`<div
    data-slot="context-menu"
    class="${cn("contents", className, aliasedClassName)}"
    ${raw(toAttrs({ ...rest, "data-disabled": disabled, "data-close-on-select": closeOnSelect }))}
  >
    ${hasComposedContent
      ? composedChildren
      : html`${ContextMenuTrigger({ children: trigger, class: cn(triggerClass, triggerClassName) })}
        ${ContextMenuContent({ children, class: cn(contentClass, contentClassName) })}`}
  </div>`;
}

export const ContextMenuRoot = ilha
  .input<ContextMenuInput>()
  .onMount(({ host, input }) => {
    const root = host.matches('[data-slot="context-menu"]')
      ? host
      : host.querySelector('[data-slot="context-menu"]');
    if (!root) return;

    let bindSync: ReturnType<typeof createOpenBindSync> = null;

    const controller = ContextMenuPrimitive.createContextMenu(root, {
      disabled: input.disabled,
      closeOnSelect: input.closeOnSelect,
      onOpenChange: (open) => {
        bindSync?.onUserChange(open);
        input.onOpenChange?.(open);
      },
      onSelect: input.onSelect,
    } satisfies ContextMenuPrimitive.ContextMenuOptions);

    bindSync = createOpenBindSync(input, controller);
    bindSync?.applyFromSignal();
    contextMenuControllers.set(root, controller);

    return () => {
      contextMenuControllers.delete(root);
      controller.destroy();
    };
  })
  .effect(({ host, input }) => {
    subscribeBindProps(input);
    const root = host.matches('[data-slot="context-menu"]')
      ? host
      : host.querySelector('[data-slot="context-menu"]');
    if (!root) return;

    createOpenBindSync(
      input,
      contextMenuControllers.get(root) ?? ContextMenuPrimitive.createContextMenu(root),
    )?.applyFromSignal();
  })
  .render(({ input }) => renderContextMenu(input));

export const ContextMenu = Object.assign(ContextMenuRoot, {
  Root: ContextMenuRoot,
  Static: renderContextMenu,
  Trigger: ContextMenuTrigger,
  Content: ContextMenuContent,
  Item: ContextMenuItem,
  CheckboxItem: ContextMenuCheckboxItem,
  RadioItem: ContextMenuRadioItem,
});
