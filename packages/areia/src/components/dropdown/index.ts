import ilha, { html, raw } from "ilha";
import { Check } from "lucide";
import { DropdownMenu as DropdownMenuPrimitive } from "@areia/slots";

const dropdownControllers = new WeakMap<Element, DropdownMenuPrimitive.DropdownMenuController>();
import {
  boundElement,
  createOpenBindSync,
  openBindDefault,
  queueDropdownOpenBindForAutoMount,
  splitBindProps,
  subscribeBindProps,
  takeDropdownOpenBindQueue,
  type IlhaBindProps,
} from "$lib/binds";
import { Icon } from "$components/icon";
import { cn } from "$lib/cn";
import { hasSlot, render } from "$lib/markup";
import { toAttrs } from "$lib/input";
import type { HTMLElementProps } from "$lib/types";
import { MORPH_CONTROLLER_STYLE, stampMorphPreserve } from "$lib/morph-preserve";

export const DROPDOWN_VARIANTS = {
  variant: {
    default: {
      item: "text-areia-default data-highlighted:bg-areia-control-hover",
    },
    danger: {
      item: "text-areia-danger data-highlighted:bg-areia-danger/10 data-highlighted:text-areia-danger",
    },
  },
} as const;

export type DropdownVariant = keyof typeof DROPDOWN_VARIANTS.variant;

export interface DropdownVariantsProps {
  variant?: DropdownVariant;
}

export function dropdownVariants({ variant = "default" }: DropdownVariantsProps = {}) {
  return DROPDOWN_VARIANTS.variant[variant];
}

export type DropdownSide = DropdownMenuPrimitive.Side;
export type DropdownAlign = DropdownMenuPrimitive.Align;

export type DropdownInput = Omit<HTMLElementProps<HTMLDivElement>, "className" | "children"> &
  DropdownVariantsProps &
  Pick<
    DropdownMenuPrimitive.DropdownMenuOptions,
    | "defaultOpen"
    | "defaultValue"
    | "defaultValues"
    | "closeOnClickOutside"
    | "closeOnEscape"
    | "closeOnSelect"
    | "side"
    | "align"
    | "sideOffset"
    | "alignOffset"
    | "avoidCollisions"
    | "collisionPadding"
    | "lockScroll"
    | "highlightItemOnHover"
    | "onOpenChange"
    | "onSelect"
    | "onValueChange"
    | "onValuesChange"
  > &
  IlhaBindProps &
  Record<string, unknown> & {
    trigger?: unknown;
    children?: unknown;
    items?: DropdownItemInput[];
    class?: string;
    className?: string;
    triggerClass?: string;
    triggerClassName?: string;
    contentClass?: string;
    contentClassName?: string;
    onPortalMounted?: (container: HTMLElement) => void;
  };

export type DropdownTriggerInput = Omit<HTMLElementProps<HTMLElement>, "className" | "children"> &
  Record<string, unknown> & {
    children?: unknown;
    class?: string;
    className?: string;
    as?: "button" | "span" | "div";
  };

export type DropdownContentInput = Omit<
  HTMLElementProps<HTMLDivElement>,
  "className" | "children"
> & {
  children?: unknown;
  class?: string;
  className?: string;
};

export type DropdownGroupInput = Omit<
  HTMLElementProps<HTMLDivElement>,
  "className" | "children"
> & {
  children?: unknown;
  class?: string;
  className?: string;
};

export type DropdownLabelInput = Omit<
  HTMLElementProps<HTMLDivElement>,
  "className" | "children"
> & {
  children?: unknown;
  inset?: boolean;
  class?: string;
  className?: string;
};

export type DropdownSeparatorInput = Omit<HTMLElementProps<HTMLDivElement>, "className"> & {
  class?: string;
  className?: string;
};

export type DropdownShortcutInput = Omit<
  HTMLElementProps<HTMLSpanElement>,
  "className" | "children"
> & {
  children?: unknown;
  class?: string;
  className?: string;
};

export type DropdownItemKind = "item" | "checkbox" | "radio" | "label" | "separator";

export type DropdownItemInput = DropdownVariantsProps &
  Record<string, unknown> & {
    type?: DropdownItemKind;
    value?: string;
    label?: unknown;
    children?: unknown;
    icon?: unknown;
    shortcut?: unknown;
    disabled?: boolean;
    checked?: boolean;
    selected?: boolean;
    inset?: boolean;
    href?: string;
    external?: boolean;
    class?: string;
    className?: string;
  };

const checkIcon = Icon({ icon: Check, class: "size-3.5" });

function itemSlot(type?: DropdownItemKind) {
  if (type === "checkbox") return "dropdown-menu-checkbox-item";
  if (type === "radio") return "dropdown-menu-radio-item";
  return "dropdown-menu-item";
}

function renderIndicator({ checked, selected }: Pick<DropdownItemInput, "checked" | "selected">) {
  return html`<span
    aria-hidden="true"
    class="${cn(
      "absolute left-2 flex size-4 items-center justify-center opacity-0 group-data-[checked]:opacity-100",
      (checked || selected) && "opacity-100",
    )}"
  >
    ${checkIcon}
  </span>`;
}

export function DropdownTrigger(input: DropdownTriggerInput = {}) {
  const {
    as = "span",
    children,
    class: className,
    className: aliasedClassName,
    type,
    ...props
  } = input;
  const tag = as;

  return html`<${raw(tag)}
    data-slot="dropdown-menu-trigger"
    class="${cn(
      "inline-flex cursor-pointer items-center justify-center whitespace-nowrap rounded-md text-base font-medium outline-none ring-offset-areia-background transition-colors focus-visible:ring-2 focus-visible:ring-areia-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
      tag === "button" && "m-0 h-auto min-h-0 border-0 shadow-none",
      className,
      aliasedClassName,
    )}"
    ${raw(
      toAttrs({
        ...props,
        tabindex:
          tag === "span" || tag === "div"
            ? (props.tabIndex ?? 0)
            : props.tabIndex !== undefined
              ? props.tabIndex
              : undefined,
        type: tag === "button" ? (type ?? "button") : type,
      }),
    )}
  >${render(children)}</${raw(tag)}>`;
}

export function DropdownContent(input: DropdownContentInput = {}) {
  const { children, class: className, className: aliasedClassName, ...rest } = input;

  return html`<div
    data-slot="dropdown-menu-content"
    hidden
    class="${cn(
      "z-50 min-w-36 rounded-lg bg-areia-background p-1.5 text-base text-areia-default shadow-lg ring ring-areia-border outline-none data-open:animate-in data-closed:animate-out data-closed:fade-out-0 data-open:fade-in-0 data-closed:zoom-out-95 data-open:zoom-in-95",
      className,
      aliasedClassName,
    )}"
    ${raw(toAttrs(rest))}
  >
    ${render(children)}
  </div>`;
}

export function DropdownGroup(input: DropdownGroupInput = {}) {
  const { children, class: className, className: aliasedClassName, ...rest } = input;

  return html`<div
    data-slot="dropdown-menu-group"
    class="${cn("py-1", className, aliasedClassName)}"
    ${raw(toAttrs(rest))}
  >
    ${render(children)}
  </div>`;
}

export function DropdownLabel(input: DropdownLabelInput = {}) {
  const { children, inset, class: className, className: aliasedClassName, ...rest } = input;

  return html`<div
    data-slot="dropdown-menu-label"
    class="${cn(
      "px-2 py-1.5 text-base font-medium text-areia-default",
      inset && "pl-8",
      className,
      aliasedClassName,
    )}"
    ${raw(toAttrs(rest))}
  >
    ${render(children)}
  </div>`;
}

export function DropdownSeparator(input: DropdownSeparatorInput = {}) {
  const { class: className, className: aliasedClassName, ...rest } = input;

  return html`<div
    data-slot="dropdown-menu-separator"
    class="${cn("-mx-1 my-1 h-px bg-areia-border", className, aliasedClassName)}"
    ${raw(toAttrs(rest))}
  ></div>`;
}

export function DropdownShortcut(input: DropdownShortcutInput = {}) {
  const { children, class: className, className: aliasedClassName, ...rest } = input;

  return html`<span
    data-slot="dropdown-menu-shortcut"
    class="${cn(
      "ml-auto pl-6 text-xs tracking-normal text-areia-subtle",
      className,
      aliasedClassName,
    )}"
    ${raw(toAttrs(rest))}
  >
    ${render(children)}
  </span>`;
}

function renderItem(input: DropdownItemInput = {}, type: DropdownItemKind = "item") {
  const {
    value,
    label,
    children,
    icon,
    shortcut,
    disabled,
    checked,
    selected,
    inset,
    href,
    external,
    variant = "default",
    class: className,
    className: aliasedClassName,
    ...rest
  } = input;

  if (type === "separator") {
    return DropdownSeparator({ class: className, className: aliasedClassName });
  }

  if (type === "label") {
    return DropdownLabel({
      children: children ?? label ?? value,
      inset,
      class: className,
      className: aliasedClassName,
    });
  }

  const slot = itemSlot(type);
  const itemClass = cn(
    "group relative flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-left text-base outline-none transition-colors data-disabled:pointer-events-none data-disabled:opacity-50",
    (type === "checkbox" || type === "radio" || inset) && "pl-8",
    dropdownVariants({ variant }).item,
    className,
    aliasedClassName,
  );
  const content = children ?? label ?? value;
  const selectionItem = type === "checkbox" || type === "radio";
  const attrs = {
    ...rest,
    "data-slot": slot,
    "data-value": value,
    "data-disabled": disabled,
    "data-default-checked": checked ?? selected,
    "data-checked": checked ?? selected,
    "aria-checked": selectionItem && (checked || selected) ? "true" : undefined,
    href,
    target: external ? "_blank" : undefined,
    rel: external ? "noreferrer" : undefined,
  };

  if (href) {
    return html`<a class="${itemClass}" ${raw(toAttrs(attrs))}>
      ${selectionItem ? renderIndicator({ checked, selected }) : ""}
      ${icon != null
        ? html`<span class="flex size-4 shrink-0 items-center justify-center">${icon}</span>`
        : ""}
      <span class="min-w-0 flex-1">${content}</span>
      ${shortcut != null ? DropdownShortcut({ children: shortcut }) : ""}
    </a>`;
  }

  return html`<button type="button" class="${itemClass}" ${raw(toAttrs(attrs))}>
    ${selectionItem ? renderIndicator({ checked, selected }) : ""}
    ${icon != null
      ? html`<span class="flex size-4 shrink-0 items-center justify-center">${icon}</span>`
      : ""}
    <span class="min-w-0 flex-1">${content}</span>
    ${shortcut != null ? DropdownShortcut({ children: shortcut }) : ""}
  </button>`;
}

export function DropdownItem(input: DropdownItemInput = {}) {
  return renderItem(input, input.type ?? "item");
}

export function DropdownLinkItem(input: DropdownItemInput = {}) {
  return renderItem(input);
}

export function DropdownCheckboxItem(input: DropdownItemInput = {}) {
  return renderItem(input, "checkbox");
}

export function DropdownRadioItem(input: DropdownItemInput = {}) {
  return renderItem(input, "radio");
}

function renderItems(items: DropdownItemInput[] | undefined) {
  return items?.map((item) => DropdownItem(item)) ?? "";
}

function renderDropdown(input: DropdownInput = {}, autoBind = false) {
  const { binds, attrs: props } = splitBindProps(input);
  const {
    trigger,
    children,
    items,
    class: className,
    className: aliasedClassName,
    triggerClass,
    triggerClassName,
    contentClass,
    contentClassName,
    defaultOpen: defaultOpenProp,
    defaultValue,
    defaultValues,
    closeOnClickOutside,
    closeOnEscape,
    closeOnSelect,
    side,
    align,
    sideOffset,
    alignOffset,
    avoidCollisions,
    collisionPadding,
    lockScroll,
    highlightItemOnHover,
    onOpenChange: _onOpenChange,
    onSelect: _onSelect,
    onValueChange: _onValueChange,
    onValuesChange: _onValuesChange,
    variant: _variant,
    ...rest
  } = props as DropdownInput;
  const defaultOpen = openBindDefault(input, defaultOpenProp);

  if (autoBind && binds["bind:open"] != null) {
    queueDropdownOpenBindForAutoMount(binds["bind:open"] as import("ilha").SignalAccessor<boolean>);
  }

  const composedChildren = render(children);
  const hasComposedContent = hasSlot(children, "dropdown-menu-content");

  const inner = html`${hasComposedContent
    ? composedChildren
    : html`${DropdownTrigger({ children: trigger, class: cn(triggerClass, triggerClassName) })}
      ${DropdownContent({
        children: children ?? renderItems(items),
        class: cn(contentClass, contentClassName),
      })}`}`;

  const openSuffix = ` data-slot="dropdown-menu" class="${cn("contents", className, aliasedClassName)}"${toAttrs(
    {
      "data-areia-dropdown": autoBind ? "" : undefined,
      ...rest,
      "data-default-open": defaultOpen,
      "data-default-value": defaultValue,
      "data-default-values": defaultValues ? JSON.stringify(defaultValues) : undefined,
      "data-close-on-click-outside": closeOnClickOutside,
      "data-close-on-escape": closeOnEscape,
      "data-close-on-select": closeOnSelect,
      "data-side": side,
      "data-align": align,
      "data-side-offset": sideOffset,
      "data-align-offset": alignOffset,
      "data-avoid-collisions": avoidCollisions,
      "data-collision-padding": collisionPadding,
      "data-lock-scroll": lockScroll,
      "data-highlight-item-on-hover": highlightItemOnHover,
    },
  )}`;

  return boundElement("div", binds, openSuffix, inner);
}

type DropdownBindRuntime = {
  controller: DropdownMenuPrimitive.DropdownMenuController;
  bindSync: ReturnType<typeof createOpenBindSync>;
};

const dropdownBindRuntimeByHost = new WeakMap<Element, DropdownBindRuntime>();

export const DropdownRoot = ilha
  .input<DropdownInput>()
  .onMount(({ host, input }) => {
    const root = host.matches('[data-slot="dropdown-menu"]')
      ? host
      : host.querySelector('[data-slot="dropdown-menu"]');
    if (!root) return;

    let bindSync: ReturnType<typeof createOpenBindSync> = null;

    stampMorphPreserve(root, MORPH_CONTROLLER_STYLE);
    const controller = DropdownMenuPrimitive.createDropdownMenu(root, {
      defaultOpen: openBindDefault(input, input.defaultOpen),
      defaultValue: input.defaultValue,
      defaultValues: input.defaultValues,
      onOpenChange: (open) => {
        bindSync?.onUserChange(open);
        input.onOpenChange?.(open);
      },
      onSelect: input.onSelect,
      onValueChange: input.onValueChange,
      onValuesChange: input.onValuesChange,
      closeOnClickOutside: input.closeOnClickOutside,
      closeOnEscape: input.closeOnEscape,
      closeOnSelect: input.closeOnSelect,
      side: input.side,
      align: input.align,
      sideOffset: input.sideOffset,
      alignOffset: input.alignOffset,
      avoidCollisions: input.avoidCollisions,
      collisionPadding: input.collisionPadding,
      lockScroll: input.lockScroll,
      highlightItemOnHover: input.highlightItemOnHover,
      onPortalMounted:
        input.onPortalMounted as DropdownMenuPrimitive.DropdownMenuOptions["onPortalMounted"],
    } satisfies DropdownMenuPrimitive.DropdownMenuOptions);

    bindSync = createOpenBindSync(input, controller);
    bindSync?.applyFromSignal();
    dropdownControllers.set(root, controller);
    dropdownBindRuntimeByHost.set(host, { controller, bindSync });

    return () => {
      dropdownBindRuntimeByHost.delete(host);
      dropdownControllers.delete(root);
      controller.destroy();
    };
  })
  .effect(({ host, input }) => {
    subscribeBindProps(input);
    const runtime = dropdownBindRuntimeByHost.get(host);
    if (!runtime) return;
    runtime.bindSync?.applyFromSignal();
  })
  .render(({ input }) => renderDropdown(input));

const dropdownAutoBindScheduled = new WeakSet<Document>();

type DropdownAutoRuntime = {
  controller: DropdownMenuPrimitive.DropdownMenuController;
  bindSync: ReturnType<typeof createOpenBindSync>;
};

const dropdownAutoRuntimeByRoot = new WeakMap<Element, DropdownAutoRuntime>();

function scheduleDropdownAutoBind(doc: Document | undefined = globalThis.document) {
  if (!doc || dropdownAutoBindScheduled.has(doc)) return;
  dropdownAutoBindScheduled.add(doc);
  queueMicrotask(() => {
    dropdownAutoBindScheduled.delete(doc);
    const queued = takeDropdownOpenBindQueue(doc);
    let queueIndex = 0;

    for (const root of doc.querySelectorAll<HTMLElement>(
      '[data-areia-dropdown][data-slot="dropdown-menu"]',
    )) {
      const trigger = root.querySelector('[data-slot="dropdown-menu-trigger"]');
      const content = root.querySelector('[data-slot="dropdown-menu-content"]');
      if (!trigger || !content) continue;

      const existing = dropdownAutoRuntimeByRoot.get(root);
      if (existing) {
        existing.bindSync?.applyFromSignal();
        continue;
      }

      const entry = queued[queueIndex++];
      let bindSync: ReturnType<typeof createOpenBindSync> = null;

      stampMorphPreserve(root, MORPH_CONTROLLER_STYLE);
      const controller = DropdownMenuPrimitive.createDropdownMenu(root, {
        onOpenChange: (open) => bindSync?.onUserChange(open),
      });

      if (entry) {
        bindSync = createOpenBindSync({ "bind:open": entry.bindOpen }, controller);
        bindSync?.applyFromSignal();
      }

      dropdownControllers.set(root, controller);
      dropdownAutoRuntimeByRoot.set(root, { controller, bindSync });
    }
  });
}

function needsDropdownIsland(input: DropdownInput) {
  const { binds } = splitBindProps(input);
  return (
    input.onOpenChange != null ||
    input.onSelect != null ||
    input.onValueChange != null ||
    input.onValuesChange != null ||
    input.onPortalMounted != null ||
    binds["bind:open"] != null
  );
}

function DropdownComponent(input: DropdownInput = {}) {
  if (needsDropdownIsland(input)) return DropdownRoot(input);
  scheduleDropdownAutoBind();
  return renderDropdown(input, true);
}

export const Dropdown = Object.assign(DropdownComponent, {
  Root: DropdownRoot,
  Static: renderDropdown,
  Trigger: DropdownTrigger,
  Content: DropdownContent,
  Item: DropdownItem,
  LinkItem: DropdownLinkItem,
  CheckboxItem: DropdownCheckboxItem,
  RadioItem: DropdownRadioItem,
  Label: DropdownLabel,
  Separator: DropdownSeparator,
  Shortcut: DropdownShortcut,
  Group: DropdownGroup,
});

export const DropdownMenu = Dropdown;
export const DropdownMenuRoot = DropdownRoot;
export const DropdownMenuTrigger = DropdownTrigger;
export const DropdownMenuContent = DropdownContent;
export const DropdownMenuItem = DropdownItem;
export const DropdownMenuLinkItem = DropdownLinkItem;
export const DropdownMenuCheckboxItem = DropdownCheckboxItem;
export const DropdownMenuRadioItem = DropdownRadioItem;
export const DropdownMenuLabel = DropdownLabel;
export const DropdownMenuSeparator = DropdownSeparator;
export const DropdownMenuShortcut = DropdownShortcut;
export const DropdownMenuGroup = DropdownGroup;
