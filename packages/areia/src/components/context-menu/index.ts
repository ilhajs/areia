import ilha, { html, raw } from "ilha";
import { createContextMenu, type ContextMenuOptions } from "../../../../slots/src/context-menu";
import { cn } from "$lib/cn";
import { toAttrs } from "$lib/input";
import type { HTMLElementProps } from "$lib/types";

function render(value: unknown): string {
  if (value === null || value === undefined || value === false) return "";
  if (Array.isArray(value)) return value.map(render).join("");
  if (typeof value === "string") return value;
  if (typeof value === "object" && "value" in value && typeof value.value === "string")
    return value.value;
  return String(value);
}

function hasSlot(value: unknown, slot: string) {
  return new RegExp(`\\sdata-slot=["']${slot}["']`).test(render(value));
}

export type ContextMenuInput = Omit<HTMLElementProps<HTMLDivElement>, "className" | "children"> &
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
    ${raw(render(children))}
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
    ${raw(render(children))}
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
    ${raw(render(children ?? label ?? value))}
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
      ? raw(composedChildren)
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

    const controller = createContextMenu(root, {
      disabled: input.disabled,
      closeOnSelect: input.closeOnSelect,
      onOpenChange: input.onOpenChange,
      onSelect: input.onSelect,
    } satisfies ContextMenuOptions);

    return () => controller.destroy();
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
