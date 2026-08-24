import { ilha, html, raw } from "ilha";
import { ChevronDown } from "lucide";
import { Accordion as AccordionPrimitive, Collapsible as CollapsiblePrimitive } from "@areia/slots";
import {
  boundElement,
  createBindBridge,
  disposeBindBridge,
  getBindBridge,
  openBindDefault,
  openBindSource,
  splitBindProps,
  type IlhaBindProps,
} from "$lib/binds";
import { cn } from "$lib/cn";
import { render, renderStringForSlots } from "$lib/markup";
import { toAttrs } from "$lib/input";
import type { HTMLElementProps } from "$lib/types";
import { Icon } from "$components/icon";
import { MORPH_CONTROLLER_STYLE, stampMorphPreserve } from "$lib/morph-preserve";

export const COLLAPSIBLE_VARIANTS = {} as const;
export const COLLAPSIBLE_DEFAULT_VARIANTS = {} as const;

export interface CollapsibleVariantsProps {}

export function collapsibleVariants(_props: CollapsibleVariantsProps = {}) {
  return cn();
}

const defaultChevron = Icon({
  icon: ChevronDown,
  class: "size-4 shrink-0 transition-transform duration-200 group-data-[panel-open]:rotate-180",
});

export type CollapsibleTriggerInput = Omit<
  HTMLElementProps<HTMLButtonElement>,
  "className" | "children"
> &
  Record<string, unknown> & {
    children?: unknown;
    label?: unknown;
    icon?: unknown;
    disabled?: boolean;
    class?: string;
    className?: string;
  };

export type CollapsiblePanelInput = Omit<
  HTMLElementProps<HTMLDivElement>,
  "className" | "children"
> &
  Record<string, unknown> & {
    children?: unknown;
    class?: string;
    className?: string;
  };

export type CollapsibleRootInput = Omit<
  HTMLElementProps<HTMLDivElement>,
  "className" | "children"
> &
  CollapsibleVariantsProps &
  IlhaBindProps &
  Record<string, unknown> & {
    children?: unknown;
    open?: boolean;
    defaultOpen?: boolean;
    hiddenUntilFound?: boolean;
    class?: string;
    className?: string;
    onOpenChange?: (open: boolean) => void;
  };

export type CollapsibleItem = {
  value: string;
  label?: unknown;
  trigger?: unknown;
  children?: unknown;
  content?: unknown;
  disabled?: boolean;
  class?: string;
  className?: string;
  triggerClass?: string;
  triggerClassName?: string;
  panelClass?: string;
  panelClassName?: string;
};

export type CollapsibleAccordionInput = Omit<
  HTMLElementProps<HTMLDivElement>,
  "className" | "children"
> &
  CollapsibleVariantsProps &
  Record<string, unknown> & {
    items?: CollapsibleItem[];
    children?: unknown;
    accordion?: boolean;
    multiple?: boolean;
    value?: string | string[];
    defaultValue?: string | string[];
    disabled?: boolean;
    orientation?: AccordionPrimitive.AccordionOptions["orientation"];
    loopFocus?: boolean;
    hiddenUntilFound?: boolean;
    class?: string;
    className?: string;
    itemClass?: string;
    itemClassName?: string;
    triggerClass?: string;
    triggerClassName?: string;
    panelClass?: string;
    panelClassName?: string;
    onValueChange?: (value: string[]) => void;
  };

export type CollapsibleInput = CollapsibleRootInput &
  CollapsibleAccordionInput & {
    trigger?: unknown;
    panel?: unknown;
  };

export type CollapsibleAccordionItemInput = Omit<
  HTMLElementProps<HTMLDivElement>,
  "className" | "children"
> &
  Record<string, unknown> & {
    value: string;
    children?: unknown;
    disabled?: boolean;
    class?: string;
    className?: string;
  };

export function CollapsibleTrigger(input: CollapsibleTriggerInput = {}) {
  const {
    children,
    label,
    icon,
    disabled,
    class: className,
    className: aliasedClassName,
    ...rest
  } = input;

  return html`<button
    type="button"
    data-slot="collapsible-trigger"
    class="${cn("group cursor-pointer", className, aliasedClassName)}"
    ${raw(toAttrs({ ...rest, "data-disabled": disabled, disabled }))}
  >
    ${render(children ?? label)}${icon != null ? icon : ""}
  </button>`;
}

export function CollapsiblePanel(input: CollapsiblePanelInput = {}) {
  const { children, class: className, className: aliasedClassName, ...rest } = input;

  return html`<div
    data-slot="collapsible-content"
    class="${cn(
      "overflow-hidden transition-[height] duration-200 ease-out data-[state=closed]:h-0 data-[state=open]:h-[var(--collapsible-panel-height)]",
      className,
      aliasedClassName,
    )}"
    ${raw(toAttrs(rest))}
  >
    ${render(children)}
  </div>`;
}

export function CollapsibleDefaultTrigger(input: CollapsibleTriggerInput = {}) {
  const {
    children,
    label,
    icon = defaultChevron,
    class: className,
    className: aliasedClassName,
    ...rest
  } = input;

  return CollapsibleTrigger({
    ...rest,
    icon,
    children: html`<span class="min-w-0 flex-1">${render(children ?? label)}</span>`,
    class: cn(
      "flex w-full items-center gap-2 bg-transparent py-2 text-left text-sm font-medium text-areia-default select-none hover:text-areia-strong",
      className,
      aliasedClassName,
    ),
  });
}

export function CollapsibleDefaultPanel(input: CollapsiblePanelInput = {}) {
  const { children, class: className, className: aliasedClassName, ...rest } = input;

  return CollapsiblePanel({
    ...rest,
    children: html`<div
      class="${cn(
        "my-2 space-y-4 border-l-2 border-areia-border pl-4",
        className,
        aliasedClassName,
      )}"
    >
      ${render(children)}
    </div>`,
  });
}

export function CollapsibleRoot(input: CollapsibleRootInput = {}) {
  const { binds, attrs: props } = splitBindProps(input);
  const {
    children,
    open: _open,
    defaultOpen,
    hiddenUntilFound,
    onOpenChange: _onOpenChange,
    class: className,
    className: aliasedClassName,
    ...rest
  } = props as CollapsibleRootInput;

  const openSuffix = ` data-slot="collapsible" class="${cn(
    collapsibleVariants(),
    className,
    aliasedClassName,
  )}"${toAttrs({
    ...rest,
    "data-default-open": defaultOpen,
    "data-hidden-until-found": hiddenUntilFound,
  })}`;

  return boundElement("div", binds, openSuffix, render(children));
}

export function CollapsibleAccordionItem(input: CollapsibleAccordionItemInput) {
  const {
    value,
    children,
    disabled,
    class: className,
    className: aliasedClassName,
    ...rest
  } = input;

  return html`<div
    data-slot="accordion-item"
    class="${cn("border-b border-areia-border last:border-b-0", className, aliasedClassName)}"
    ${raw(toAttrs({ ...rest, "data-value": value, "data-disabled": disabled }))}
  >
    ${render(children)}
  </div>`;
}

export function CollapsibleAccordionTrigger(input: CollapsibleTriggerInput = {}) {
  const trigger = CollapsibleDefaultTrigger(input);
  return html`${raw(
    renderStringForSlots(trigger).replaceAll(
      'data-slot="collapsible-trigger"',
      'data-slot="accordion-trigger"',
    ),
  )}`;
}

export function CollapsibleAccordionPanel(input: CollapsiblePanelInput = {}) {
  const { children, class: className, className: aliasedClassName, ...rest } = input;

  return html`<div
    data-slot="accordion-content"
    class="${cn(
      "overflow-hidden transition-[height] duration-200 ease-out data-[state=closed]:h-0 data-[state=open]:h-[var(--accordion-panel-height)]",
      className,
      aliasedClassName,
    )}"
    ${raw(toAttrs(rest))}
  >
    ${render(children)}
  </div>`;
}

export function CollapsibleAccordion(input: CollapsibleAccordionInput = {}) {
  const {
    items = [],
    children,
    accordion: _accordion,
    multiple,
    value,
    defaultValue,
    disabled,
    orientation,
    loopFocus,
    hiddenUntilFound,
    class: className,
    className: aliasedClassName,
    itemClass,
    itemClassName,
    triggerClass,
    triggerClassName,
    panelClass,
    panelClassName,
    onValueChange: _onValueChange,
    ...rest
  } = input;

  const resolvedDefaultValue = defaultValue ?? value;
  const renderedItems =
    children ??
    items.map((item) =>
      CollapsibleAccordionItem({
        value: item.value,
        disabled: item.disabled,
        class: cn(itemClass, itemClassName, item.class, item.className),
        children: [
          CollapsibleAccordionTrigger({
            children: item.trigger ?? item.label ?? item.value,
            class: cn(triggerClass, triggerClassName, item.triggerClass, item.triggerClassName),
          }),
          CollapsibleAccordionPanel({
            class: cn(panelClass, panelClassName, item.panelClass, item.panelClassName),
            children: html`<div class="pb-3 text-sm text-areia-subtle">
              ${render(item.content ?? item.children)}
            </div>`,
          }),
        ],
      }),
    );

  return html`<div
    data-slot="accordion"
    class="${cn("w-full", className, aliasedClassName)}"
    ${raw(
      toAttrs({
        ...rest,
        "data-multiple": multiple,
        "data-default-value": Array.isArray(resolvedDefaultValue)
          ? JSON.stringify(resolvedDefaultValue)
          : resolvedDefaultValue,
        "data-disabled": disabled,
        "data-orientation": orientation,
        "data-loop-focus": loopFocus,
        "data-hidden-until-found": hiddenUntilFound,
      }),
    )}
  >
    ${render(renderedItems)}
  </div>`;
}

function renderCollapsible(input: CollapsibleInput = {}) {
  const {
    trigger,
    panel,
    children,
    items,
    accordion,
    multiple,
    value,
    defaultValue,
    defaultOpen,
    hiddenUntilFound,
    class: className,
    className: aliasedClassName,
    onOpenChange: _onOpenChange,
    onValueChange: _onValueChange,
    ...rest
  } = input;

  if (accordion || items?.length) {
    return CollapsibleAccordion({
      ...rest,
      items,
      multiple,
      value,
      defaultValue,
      hiddenUntilFound,
      onValueChange: _onValueChange,
      class: cn(className, aliasedClassName),
    });
  }

  return CollapsibleRoot({
    ...rest,
    defaultOpen: openBindDefault(
      input,
      defaultOpen ?? (typeof input.open === "boolean" ? input.open : undefined),
    ),
    hiddenUntilFound,
    class: cn(className, aliasedClassName),
    children: children ?? [
      CollapsibleDefaultTrigger({ children: trigger ?? "Toggle" }),
      CollapsibleDefaultPanel({ children: panel }),
    ],
  });
}

export const CollapsibleRootIsland = ilha
  .input<CollapsibleInput>()
  .action("openChange", (open: boolean, { host }) => {
    getBindBridge(host, "open")?.onUserChange(open);
  })
  .onMount(({ host, input, action }) => {
    const accordionRoot = host.matches('[data-slot="accordion"]')
      ? host
      : host.querySelector('[data-slot="accordion"]');

    if (accordionRoot) {
      stampMorphPreserve(accordionRoot, MORPH_CONTROLLER_STYLE);
      const controller = AccordionPrimitive.createAccordion(accordionRoot, {
        multiple: input.multiple,
        defaultValue: input.defaultValue ?? input.value,
        disabled: input.disabled,
        orientation: input.orientation,
        loopFocus: input.loopFocus,
        hiddenUntilFound: input.hiddenUntilFound,
        onValueChange: input.onValueChange,
      });

      return () => controller.destroy();
    }

    const root = host.matches('[data-slot="collapsible"]')
      ? host
      : host.querySelector('[data-slot="collapsible"]');
    if (!root) return;

    disposeBindBridge(host, "open");

    stampMorphPreserve(root, MORPH_CONTROLLER_STYLE);
    const controller = CollapsiblePrimitive.createCollapsible(root, {
      defaultOpen: openBindDefault(input, input.defaultOpen ?? input.open),
      hiddenUntilFound: input.hiddenUntilFound,
      onOpenChange: (open) => action.openChange(open),
    } satisfies CollapsiblePrimitive.CollapsibleOptions);

    createBindBridge(
      host,
      "open",
      openBindSource(input, controller, {
        onUserChange: (open) => input.onOpenChange?.(open),
        destroy: () => controller.destroy(),
      }),
    );

    return () => disposeBindBridge(host);
  })
  .effect(({ host }) => {
    getBindBridge(host, "open")?.applyFromSignal();
  })
  .render(({ input }) => renderCollapsible(input));

export const Collapsible = Object.assign(CollapsibleRootIsland, {
  Root: CollapsibleRootIsland,
  RootIsland: CollapsibleRootIsland,
  Static: renderCollapsible,
  Trigger: CollapsibleTrigger,
  Panel: CollapsiblePanel,
  DefaultTrigger: CollapsibleDefaultTrigger,
  DefaultPanel: CollapsibleDefaultPanel,
  Accordion: CollapsibleAccordion,
  AccordionItem: CollapsibleAccordionItem,
  AccordionTrigger: CollapsibleAccordionTrigger,
  AccordionPanel: CollapsibleAccordionPanel,
});
