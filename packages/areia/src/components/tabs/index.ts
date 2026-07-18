import ilha, { html, raw } from "ilha";
import { Tabs as TabsPrimitive } from "@areia/slots";
import {
  boundElement,
  createGroupBindSync,
  groupBindDefault,
  queueTabsGroupBindForAutoMount,
  splitBindProps,
  subscribeBindProps,
  takeTabsGroupBindQueue,
  type GroupBindAccessor,
  type IlhaBindProps,
} from "$lib/binds";
import { cn } from "$lib/cn";
import { hasRenderableContent, render } from "$lib/markup";
import { toAttrs } from "$lib/input";
import type { HTMLElementProps } from "$lib/types";
import { stampMorphPreserve } from "$lib/morph-preserve";

export const TABS_VARIANTS = {
  variant: {
    segmented: {
      classes: "",
      description: "Pill-shaped indicator on a filled track",
    },
    underline: {
      classes: "",
      description: "Underline indicator below tab text",
    },
  },
  size: {
    sm: {
      classes: "",
      description: "Compact tabs",
    },
    base: {
      classes: "",
      description: "Default tabs",
    },
  },
} as const;

export const TABS_DEFAULT_VARIANTS = {
  variant: "segmented",
  size: "base",
} as const;

export const TABS_STYLING = {
  container: {
    height: 34,
    borderRadius: 8,
    background: "areia-surface-muted",
    padding: 1,
  },
  tab: {
    paddingX: 10,
    verticalMargin: 1,
    fontSize: 16,
    fontWeight: 500,
    borderRadius: 8,
    activeColor: "areia-default",
    inactiveColor: "areia-subtle",
  },
  indicator: {
    background: "areia-background",
    ring: "areia-border",
    borderRadius: 6,
    shadow: "shadow-sm",
  },
} as const;

export type TabsVariant = keyof typeof TABS_VARIANTS.variant;
export type TabsSize = keyof typeof TABS_VARIANTS.size;

export interface TabsVariantsProps {
  variant?: TabsVariant;
  size?: TabsSize;
}

export type TabsItem = Omit<
  HTMLElementProps<HTMLButtonElement>,
  "className" | "children" | "value"
> &
  Record<string, unknown> & {
    value: string;
    label?: unknown;
    children?: unknown;
    content?: unknown;
    active?: boolean;
    disabled?: boolean;
    class?: string;
    className?: string;
    contentClass?: string;
    contentClassName?: string;
  };

export type TabsInput = Omit<HTMLElementProps<HTMLDivElement>, "className" | "children"> &
  TabsVariantsProps &
  IlhaBindProps &
  Record<string, unknown> & {
    tabs?: TabsItem[];
    /** Composed tab markup. Use `Tabs.List`, `Tabs.Trigger`, and `Tabs.Content` for composition-first usage. */
    children?: unknown;
    value?: string;
    selectedValue?: string;
    defaultValue?: string;
    activationMode?: TabsPrimitive.TabsOptions["activationMode"];
    activateOnFocus?: boolean;
    class?: string;
    className?: string;
    listClass?: string;
    listClassName?: string;
    contentClass?: string;
    contentClassName?: string;
    indicatorClass?: string;
    indicatorClassName?: string;
    onValueChange?: (value: string) => void;
  };

export type TabsTriggerInput = TabsItem & TabsVariantsProps;

export type TabsListInput = Omit<HTMLElementProps<HTMLDivElement>, "className" | "children"> &
  Record<string, unknown> & {
    children?: unknown;
    variant?: TabsVariant;
    size?: TabsSize;
    class?: string;
    className?: string;
    indicatorClass?: string;
    indicatorClassName?: string;
    overflowing?: boolean;
  };

export type TabsIndicatorInput = Omit<HTMLElementProps<HTMLDivElement>, "className" | "children"> &
  Record<string, unknown> & {
    variant?: TabsVariant;
    size?: TabsSize;
    class?: string;
    className?: string;
  };

export type TabsScrollFadeInput = Omit<HTMLElementProps<HTMLDivElement>, "className" | "children"> &
  Record<string, unknown> & {
    side: "left" | "right";
    class?: string;
    className?: string;
  };

export type TabsContentInput = Omit<HTMLElementProps<HTMLDivElement>, "className" | "children"> &
  Record<string, unknown> & {
    value: string;
    children?: unknown;
    active?: boolean;
    class?: string;
    className?: string;
  };

type VariantConfig = Record<string, { classes: string }>;

function resolveVariant<TVariants extends VariantConfig, TKey extends keyof TVariants>(
  variants: TVariants,
  value: TKey | undefined,
  fallback: TKey,
) {
  return variants[value ?? fallback] ?? variants[fallback];
}

export function tabsVariants({
  variant = TABS_DEFAULT_VARIANTS.variant,
  size = TABS_DEFAULT_VARIANTS.size,
}: TabsVariantsProps = {}) {
  resolveVariant(TABS_VARIANTS.variant, variant, TABS_DEFAULT_VARIANTS.variant);
  resolveVariant(TABS_VARIANTS.size, size, TABS_DEFAULT_VARIANTS.size);

  return cn("relative isolate min-w-0 font-medium");
}

function tabsListClasses({
  variant = TABS_DEFAULT_VARIANTS.variant,
  size = TABS_DEFAULT_VARIANTS.size,
  overflowing,
}: TabsVariantsProps & { overflowing?: boolean }) {
  const isSegmented = variant === "segmented";
  const isUnderline = variant === "underline";
  const isSm = size === "sm";

  return cn(
    "relative flex min-w-0 shrink items-stretch",
    isSegmented &&
      "areia-tabs-list overflow-x-auto rounded-lg bg-areia-surface-muted px-0.5 ring ring-areia-border/70 [--scroll-fade-width:3rem] [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
    isSegmented && (isSm ? "h-6.5 rounded-md" : "h-9"),
    isUnderline && "gap-4 border-b border-areia-border pb-2",
    isUnderline && (isSm ? "h-6.5" : "h-7.5"),
    overflowing && "cursor-grab active:cursor-grabbing",
  );
}

function tabsTriggerClasses({
  variant = TABS_DEFAULT_VARIANTS.variant,
  size = TABS_DEFAULT_VARIANTS.size,
  overflowing,
}: TabsVariantsProps & { overflowing?: boolean }) {
  const isSegmented = variant === "segmented";
  const isUnderline = variant === "underline";
  const isSm = size === "sm";

  return cn(
    "relative z-2 flex items-center rounded bg-transparent whitespace-nowrap",
    "focus:outline-none focus:ring-areia-ring/50 focus-visible:ring-2 focus-visible:ring-areia-ring",
    "disabled:pointer-events-none disabled:opacity-50",
    overflowing ? "cursor-grab active:cursor-grabbing" : "cursor-pointer",
    isSm ? "text-xs" : "text-base",
    isSegmented &&
      "my-0.5 rounded-md text-areia-subtle hover:text-areia-default data-[state=active]:text-areia-default focus-visible:ring-inset",
    isSegmented && (isSm ? "px-2" : "px-2.5"),
    isUnderline &&
      "text-areia-subtle hover:bg-areia-control-hover hover:text-areia-default data-[state=active]:font-medium data-[state=active]:text-areia-default data-[state=active]:hover:bg-areia-control-hover",
    isUnderline && (isSm ? "px-1.5 py-2.5" : "px-2 py-3"),
  );
}

function tabsIndicatorClasses({
  variant = TABS_DEFAULT_VARIANTS.variant,
  size = TABS_DEFAULT_VARIANTS.size,
}: TabsVariantsProps = {}) {
  const isSegmented = variant === "segmented";
  const isUnderline = variant === "underline";
  const isSm = size === "sm";

  return cn(
    "absolute left-0 z-1",
    "w-[var(--active-tab-width)] translate-x-[var(--active-tab-left)] transition-all duration-200",
    isSegmented &&
      cn(
        "top-[var(--active-tab-top)] h-[var(--active-tab-height)] bg-areia-background shadow-sm ring ring-areia-border",
        isSm ? "rounded" : "rounded-md",
      ),
    isUnderline && "bottom-0 h-0.5 bg-areia-primary",
  );
}

export function TabsTrigger(input: TabsTriggerInput) {
  const {
    value,
    label,
    children,
    content: _content,
    contentClass: _contentClass,
    contentClassName: _contentClassName,
    active,
    disabled,
    class: className,
    className: aliasedClassName,
    variant = TABS_DEFAULT_VARIANTS.variant,
    size = TABS_DEFAULT_VARIANTS.size,
    ...rest
  } = input;

  return html`<button
    type="button"
    data-slot="tabs-trigger"
    class="${cn(tabsTriggerClasses({ variant, size }), className, aliasedClassName)}"
    ${raw(
      toAttrs({
        ...rest,
        "data-value": value,
        "data-disabled": disabled,
        "data-state": active === undefined ? undefined : active ? "active" : "inactive",
        "aria-selected": active,
        tabindex: active ? 0 : active === false ? -1 : undefined,
        disabled,
      }),
    )}
  >
    ${children ?? label ?? value}
  </button>`;
}

export function TabsIndicator(input: TabsIndicatorInput = {}) {
  const {
    variant = TABS_DEFAULT_VARIANTS.variant,
    size = TABS_DEFAULT_VARIANTS.size,
    class: className,
    className: aliasedClassName,
    ...rest
  } = input;

  return html`<div
    data-slot="tabs-indicator"
    class="${cn(tabsIndicatorClasses({ variant, size }), className, aliasedClassName)}"
    ${raw(toAttrs(rest))}
  ></div>`;
}

export function TabsScrollFade(input: TabsScrollFadeInput) {
  const { side, class: className, className: aliasedClassName, ...rest } = input;

  return html`<div
    aria-hidden="true"
    data-slot="tabs-scroll-fade"
    data-side="${side}"
    hidden
    class="${cn(
      "pointer-events-none sticky inset-y-0 z-3 w-[var(--scroll-fade-width)] flex-none self-stretch opacity-0 transition-opacity duration-150",
      side === "left" &&
        "-left-0.5 -mr-[var(--scroll-fade-width)] bg-gradient-to-r from-areia-surface-muted to-transparent",
      side === "right" &&
        "-right-0.5 -ml-[var(--scroll-fade-width)] bg-gradient-to-l from-areia-surface-muted to-transparent",
      className,
      aliasedClassName,
    )}"
    ${raw(toAttrs(rest))}
  ></div>`;
}

export function TabsList(input: TabsListInput = {}) {
  const {
    children,
    variant = TABS_DEFAULT_VARIANTS.variant,
    size = TABS_DEFAULT_VARIANTS.size,
    class: className,
    className: aliasedClassName,
    indicatorClass,
    indicatorClassName,
    overflowing,
    ...rest
  } = input;

  return html`<div
    data-slot="tabs-list"
    class="${cn(tabsListClasses({ variant, size, overflowing }), className, aliasedClassName)}"
    ${raw(toAttrs(rest))}
  >
    ${variant === "segmented" ? TabsScrollFade({ side: "left" }) : ""} ${children}
    ${TabsIndicator({ variant, size, class: cn(indicatorClass, indicatorClassName) })}
    ${variant === "segmented" ? TabsScrollFade({ side: "right" }) : ""}
  </div>`;
}

export function TabsContent(input: TabsContentInput) {
  const { value, children, active, class: className, className: aliasedClassName, ...rest } = input;

  return html`<div
    data-slot="tabs-content"
    data-value="${value}"
    class="${cn("mt-4 outline-none", className, aliasedClassName)}"
    ${raw(
      toAttrs({
        ...rest,
        "data-state": active === undefined ? undefined : active ? "active" : "inactive",
        hidden: active === false,
      }),
    )}
  >
    ${children}
  </div>`;
}

function renderTabs(input: TabsInput = {}, autoBind = false) {
  const { binds, attrs: props } = splitBindProps(input);
  const {
    tabs = [],
    children,
    value,
    selectedValue,
    defaultValue: defaultValueProp,
    activationMode: _activationMode,
    activateOnFocus: _activateOnFocus,
    class: className,
    className: aliasedClassName,
    listClass,
    listClassName,
    contentClass,
    contentClassName,
    indicatorClass,
    indicatorClassName,
    onValueChange: _onValueChange,
    variant = TABS_DEFAULT_VARIANTS.variant,
    size = TABS_DEFAULT_VARIANTS.size,
    ...rest
  } = props as TabsInput;

  const composedChildren = render(children);
  const hasComposedChildren = hasRenderableContent(children);
  if (tabs.length === 0 && !hasComposedChildren) return "";

  const boundValue = groupBindDefault(input, value ?? selectedValue ?? defaultValueProp);
  const selected =
    (typeof boundValue === "string" ? boundValue : undefined) ??
    (Array.isArray(boundValue) ? boundValue[0] : undefined) ??
    tabs[0]?.value;
  const listChildren = tabs.map((tab) =>
    TabsTrigger({
      ...tab,
      variant,
      size,
      active: tab.value === selected,
    }),
  );
  const contentPanels = tabs
    .filter((tab) => tab.content != null)
    .map((tab) =>
      TabsContent({
        value: tab.value,
        active: tab.value === selected,
        class: cn(contentClass, contentClassName, tab.contentClass, tab.contentClassName),
        children: tab.content,
      }),
    );

  // Segmented track lives inside TabsList — do not paint a root-level track here
  // (it centers on the whole tabs root and leaves a gap above content panels).
  const inner = html`${hasComposedChildren
    ? composedChildren
    : html`${TabsList({
        children: listChildren,
        variant,
        size,
        class: cn(listClass, listClassName),
        indicatorClass: cn(indicatorClass, indicatorClassName),
      })}
      ${contentPanels}`}`;

  const openSuffix = ` data-slot="tabs" data-tabs-variant="${variant}" data-tabs-size="${size}" class="${cn(
    tabsVariants({ variant, size }),
    className,
    aliasedClassName,
  )}"${toAttrs({
    ...rest,
    "data-default-value": selected,
    "data-areia-tabs": autoBind ? "" : undefined,
  })}`;

  if (autoBind && binds["bind:group"] != null) {
    queueTabsGroupBindForAutoMount(binds["bind:group"] as GroupBindAccessor, "single");
  }

  return boundElement("div", binds, openSuffix, inner);
}

function enhanceOverflow(root: Element) {
  const list = root.querySelector<HTMLElement>('[data-slot="tabs-list"]');
  if (!list) return () => {};

  let pointerId: number | null = null;
  let startX = 0;
  let scrollLeft = 0;
  let dragging = false;
  let shouldSuppressClick = false;
  const leftFade = list.querySelector<HTMLElement>(
    '[data-slot="tabs-scroll-fade"][data-side="left"]',
  );
  const rightFade = list.querySelector<HTMLElement>(
    '[data-slot="tabs-scroll-fade"][data-side="right"]',
  );

  const setFadeVisibility = (fade: HTMLElement | null, visible: boolean) => {
    if (!fade) return;
    fade.hidden = !visible;
    fade.classList.toggle("opacity-100", visible);
    fade.classList.toggle("opacity-0", !visible);
  };

  const setOverflow = () => {
    const overflowing = list.scrollWidth > list.clientWidth;
    const maxScrollLeft = list.scrollWidth - list.clientWidth;
    const scrollLeft = Math.max(0, Math.min(list.scrollLeft, maxScrollLeft));
    list.toggleAttribute("data-overflowing", overflowing);
    list.classList.toggle("cursor-grab", overflowing);
    list.classList.toggle("active:cursor-grabbing", overflowing);
    for (const trigger of list.querySelectorAll<HTMLElement>('[data-slot="tabs-trigger"]')) {
      trigger.classList.toggle("cursor-grab", overflowing);
      trigger.classList.toggle("active:cursor-grabbing", overflowing);
    }
    setFadeVisibility(leftFade, overflowing && scrollLeft > 1);
    setFadeVisibility(rightFade, overflowing && scrollLeft < maxScrollLeft - 1);
  };

  const onPointerDown = (event: PointerEvent) => {
    if (!list.hasAttribute("data-overflowing")) return;
    if (event.pointerType !== "mouse" || event.button !== 0) return;

    pointerId = event.pointerId;
    startX = event.clientX;
    scrollLeft = list.scrollLeft;
    dragging = false;
    shouldSuppressClick = false;
  };

  const onPointerMove = (event: PointerEvent) => {
    if (pointerId !== event.pointerId) return;

    const movementX = event.clientX - startX;
    if (!dragging) {
      if (Math.abs(movementX) <= 3) return;
      dragging = true;
      shouldSuppressClick = true;
      list.setPointerCapture(event.pointerId);
    }

    event.preventDefault();
    list.scrollLeft = scrollLeft - movementX;
  };

  const resetPointer = (event: PointerEvent) => {
    if (pointerId !== event.pointerId) return;
    pointerId = null;
    dragging = false;
    if (list.hasPointerCapture(event.pointerId)) {
      list.releasePointerCapture(event.pointerId);
    }
    if (shouldSuppressClick) {
      window.setTimeout(() => {
        shouldSuppressClick = false;
      }, 0);
    }
  };

  const onClick = (event: MouseEvent) => {
    if (!shouldSuppressClick) return;
    event.preventDefault();
    event.stopPropagation();
    shouldSuppressClick = false;
  };

  const observer = new ResizeObserver(setOverflow);
  observer.observe(list);
  setOverflow();

  list.addEventListener("pointerdown", onPointerDown, { capture: true });
  list.addEventListener("pointermove", onPointerMove, { capture: true });
  list.addEventListener("pointerup", resetPointer, { capture: true });
  list.addEventListener("pointercancel", resetPointer, { capture: true });
  list.addEventListener("click", onClick, { capture: true });
  list.addEventListener("scroll", setOverflow, { passive: true });

  return () => {
    observer.disconnect();
    list.removeEventListener("pointerdown", onPointerDown, { capture: true });
    list.removeEventListener("pointermove", onPointerMove, { capture: true });
    list.removeEventListener("pointerup", resetPointer, { capture: true });
    list.removeEventListener("pointercancel", resetPointer, { capture: true });
    list.removeEventListener("click", onClick, { capture: true });
    list.removeEventListener("scroll", setOverflow);
  };
}

type TabsBindRuntime = {
  controller: TabsPrimitive.TabsController;
  groupSync: ReturnType<typeof createGroupBindSync>;
};

const tabsBindRuntimeByHost = new WeakMap<Element, TabsBindRuntime>();

function resolveTabsRoot(host: Element): HTMLElement | null {
  const root = host.matches('[data-slot="tabs"]') ? host : host.querySelector('[data-slot="tabs"]');
  return root as HTMLElement | null;
}

export const TabsRoot = ilha
  .input<TabsInput>()
  .onMount(({ host, input }) => {
    const root = resolveTabsRoot(host);
    if (!root) return;

    let groupSync: ReturnType<typeof createGroupBindSync> = null;
    const initialValue =
      groupBindDefault(input, input.value ?? input.selectedValue ?? input.defaultValue) ??
      undefined;
    const defaultValue =
      typeof initialValue === "string"
        ? initialValue
        : Array.isArray(initialValue)
          ? initialValue[0]
          : undefined;

    stampMorphPreserve(root);
    const controller = TabsPrimitive.createTabs(root, {
      defaultValue,
      activationMode: input.activationMode ?? (input.activateOnFocus ? "auto" : "manual"),
      onValueChange: (value) => {
        groupSync?.onUserChange(value);
        input.onValueChange?.(value);
      },
    });
    const cleanupOverflow = enhanceOverflow(root);

    groupSync = createGroupBindSync(
      input,
      {
        getValue: () => controller.value,
        setValue: (value) => {
          if (typeof value === "string") controller.select(value);
          else if (Array.isArray(value) && value[0]) controller.select(value[0]);
        },
      },
      "single",
    );
    groupSync?.applyFromSignal();
    tabsBindRuntimeByHost.set(host, { controller, groupSync });

    return () => {
      tabsBindRuntimeByHost.delete(host);
      cleanupOverflow();
      controller.destroy();
    };
  })
  .effect(({ host, input }) => {
    subscribeBindProps(input);
    const runtime = tabsBindRuntimeByHost.get(host);
    if (!runtime) return;
    runtime.groupSync?.applyFromSignal();
  })
  .render(({ input }) => renderTabs(input));

const tabsAutoBindScheduled = new WeakSet<Document>();

type TabsAutoRuntime = {
  controller: TabsPrimitive.TabsController;
  groupSync: ReturnType<typeof createGroupBindSync>;
};

const tabsAutoRuntimeByRoot = new WeakMap<Element, TabsAutoRuntime>();

function scheduleTabsAutoBind(doc: Document | undefined = globalThis.document) {
  if (!doc || tabsAutoBindScheduled.has(doc)) return;
  tabsAutoBindScheduled.add(doc);
  queueMicrotask(() => {
    tabsAutoBindScheduled.delete(doc);
    const queued = takeTabsGroupBindQueue(doc);
    let queueIndex = 0;

    for (const root of doc.querySelectorAll<HTMLElement>('[data-areia-tabs][data-slot="tabs"]')) {
      const existing = tabsAutoRuntimeByRoot.get(root);
      if (existing) {
        existing.groupSync?.applyFromSignal();
        continue;
      }

      const entry = queued[queueIndex++];
      const bindInput = entry ? { "bind:group": entry.bindGroup } : {};
      let groupSync: ReturnType<typeof createGroupBindSync> = null;

      stampMorphPreserve(root);
      const controller = TabsPrimitive.createTabs(root, {
        onValueChange: (value) => {
          groupSync?.onUserChange(value);
        },
      });

      if (entry) {
        groupSync = createGroupBindSync(
          bindInput,
          {
            getValue: () => controller.value,
            setValue: (value) => {
              if (typeof value === "string") controller.select(value);
              else if (Array.isArray(value) && value[0]) controller.select(value[0]);
            },
          },
          entry.mode,
        );
        groupSync?.applyFromSignal();
      }

      tabsAutoRuntimeByRoot.set(root, { controller, groupSync });
    }
  });
}

function needsTabsIsland(input: TabsInput) {
  const { binds } = splitBindProps(input);
  return input.onValueChange != null || binds["bind:group"] != null;
}

function TabsComponent(input: TabsInput = {}) {
  if (needsTabsIsland(input)) return TabsRoot(input);
  scheduleTabsAutoBind();
  return renderTabs(input, true);
}

export const Tabs = Object.assign(TabsComponent, {
  Root: TabsRoot,
  Static: renderTabs,
  List: TabsList,
  Trigger: TabsTrigger,
  Content: TabsContent,
  Indicator: TabsIndicator,
  ScrollFade: TabsScrollFade,
});

export const TabBarRoot = TabsRoot;
export const TabBar = Tabs;
export const TabBarList = TabsList;
export const TabBarTrigger = TabsTrigger;
export const TabBarContent = TabsContent;
export const TabBarIndicator = TabsIndicator;
export const TabBarScrollFade = TabsScrollFade;
export const tabBarVariants = tabsVariants;

export type TabBarVariant = TabsVariant;
export type TabBarSize = TabsSize;
export type TabBarVariantsProps = TabsVariantsProps;
export type TabBarItem = TabsItem;
export type TabBarInput = TabsInput;
export type TabBarTriggerInput = TabsTriggerInput;
export type TabBarListInput = TabsListInput;
export type TabBarContentInput = TabsContentInput;
export type TabBarIndicatorInput = TabsIndicatorInput;
export type TabBarScrollFadeInput = TabsScrollFadeInput;
