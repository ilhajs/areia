import ilha, { html, raw } from "ilha";
import { HoverCard as HoverCardPrimitive } from "@areia/slots";

const hoverCardControllers = new WeakMap<Element, HoverCardPrimitive.HoverCardController>();
import {
  boundElement,
  createOpenBindSync,
  openBindDefault,
  queueHoverCardOpenBindForAutoMount,
  splitBindProps,
  subscribeBindProps,
  takeHoverCardOpenBindQueue,
  type IlhaBindProps,
} from "$lib/binds";
import { cn } from "$lib/cn";
import { hasSlot, normalizeStaticChildSlots, render, withSlot } from "$lib/markup";
import { toAttrs } from "$lib/input";
import type { HTMLElementProps } from "$lib/types";
import { stampMorphPreserve } from "$lib/morph-preserve";

/** HoverCard side variant definitions mapping positions to their Tailwind classes. */
export const HOVERCARD_VARIANTS = {
  side: {
    top: {
      classes: "",
      description: "HoverCard appears above the trigger",
    },
    bottom: {
      classes: "",
      description: "HoverCard appears below the trigger",
    },
    left: {
      classes: "",
      description: "HoverCard appears to the left of the trigger",
    },
    right: {
      classes: "",
      description: "HoverCard appears to the right of the trigger",
    },
  },
} as const;

export const HOVERCARD_DEFAULT_VARIANTS = {
  side: "bottom",
} as const;

export type HoverCardSide = keyof typeof HOVERCARD_VARIANTS.side;
export type HoverCardAlign = "start" | "center" | "end";

export interface HoverCardVariantsProps {
  /** Preferred side of the trigger to render the hover-card. */
  side?: HoverCardSide;
}

type VariantConfig = Record<string, { classes: string }>;

function resolveVariant<TVariants extends VariantConfig, TKey extends keyof TVariants>(
  variants: TVariants,
  value: TKey | undefined,
  fallback: TKey,
) {
  return variants[value ?? fallback] ?? variants[fallback];
}

export function hoverCardVariants({
  side = HOVERCARD_DEFAULT_VARIANTS.side,
}: HoverCardVariantsProps = {}) {
  return cn(
    "relative flex origin-[var(--transform-origin)] flex-col rounded-lg bg-areia-background text-sm text-areia-default",
    "shadow-lg outline outline-1 outline-areia-divider",
    "transition-[transform,scale,opacity] duration-150",
    "data-starting-style:scale-90 data-starting-style:opacity-0",
    "data-ending-style:scale-90 data-ending-style:opacity-0",
    "data-instant:duration-0",
    resolveVariant(HOVERCARD_VARIANTS.side, side, HOVERCARD_DEFAULT_VARIANTS.side).classes,
  );
}

function dataAttrs(
  input: Pick<
    HoverCardInput,
    | "align"
    | "alignOffset"
    | "avoidCollisions"
    | "closeDelay"
    | "collisionPadding"
    | "delay"
    | "portal"
    | "side"
    | "sideOffset"
    | "skipDelayDuration"
    | "closeOnClickOutside"
    | "closeOnEscape"
  >,
) {
  return toAttrs({
    "data-align": input.align,
    "data-align-offset": input.alignOffset,
    "data-avoid-collisions": input.avoidCollisions,
    "data-close-delay": input.closeDelay,
    "data-collision-padding": input.collisionPadding,
    "data-delay": input.delay,
    "data-portal": input.portal,
    "data-side": input.side,
    "data-side-offset": input.sideOffset,
    "data-skip-delay-duration": input.skipDelayDuration,
    "data-close-on-click-outside": input.closeOnClickOutside,
    "data-close-on-escape": input.closeOnEscape,
  });
}

export type HoverCardTriggerInput = Omit<HTMLElementProps<HTMLElement>, "className" | "children"> &
  Record<string, unknown> & {
    /** Trigger content. */
    children?: unknown;
    /** Trigger tag name. Defaults to `span` so button-like children are not nested in another button. */
    as?: "button" | "span" | "div" | "a";
    /** Additional CSS classes applied to the trigger. */
    class?: string;
    className?: string;
  };

export function HoverCardTrigger(input: HoverCardTriggerInput = {}) {
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
    data-slot="hover-card-trigger"
    class="${cn(
      "inline-flex cursor-default items-center bg-transparent p-0 leading-0",
      tag === "button" && "m-0 h-auto min-h-0 border-0 shadow-none",
      className,
      aliasedClassName,
    )}"
    ${raw(
      toAttrs({
        ...props,
        tabindex:
          tag === "span" || tag === "div"
            ? (props.tabindex ?? props.tabIndex ?? 0)
            : props.tabindex,
        type: tag === "button" ? (type ?? "button") : type,
      }),
    )}
  >${render(children)}</${raw(tag)}>`;
}

export type HoverCardContentInput = Omit<
  HTMLElementProps<HTMLDivElement>,
  "className" | "children"
> &
  HoverCardVariantsProps &
  Pick<
    HoverCardInput,
    "align" | "alignOffset" | "avoidCollisions" | "collisionPadding" | "portal" | "sideOffset"
  > &
  Record<string, unknown> & {
    children?: unknown;
    class?: string;
    className?: string;
  };

export function HoverCardContent(input: HoverCardContentInput = {}) {
  const {
    align,
    alignOffset,
    avoidCollisions,
    children,
    class: className,
    className: aliasedClassName,
    collisionPadding,
    portal,
    side = HOVERCARD_DEFAULT_VARIANTS.side,
    sideOffset = 4,
    ...props
  } = input;

  return html`<div
    data-slot="hover-card-content"
    hidden
    class="${cn(hoverCardVariants({ side }), "w-64 p-4", className, aliasedClassName)}"
    ${raw(
      dataAttrs({
        align,
        alignOffset,
        avoidCollisions,
        collisionPadding,
        portal,
        side,
        sideOffset,
      }),
    )}
    ${raw(toAttrs(props))}
  >
    ${render(children)}
  </div>`;
}

export type HoverCardTitleInput = Omit<
  HTMLElementProps<HTMLHeadingElement>,
  "className" | "children"
> &
  Record<string, unknown> & {
    children?: unknown;
    class?: string;
    className?: string;
  };

export function HoverCardTitle(input: HoverCardTitleInput = {}) {
  const { children, class: className, className: aliasedClassName, ...props } = input;

  return html`<h3
    class="${cn("m-0 text-base leading-6 font-medium", className, aliasedClassName)}"
    ${raw(toAttrs(props))}
  >
    ${children}
  </h3>`;
}

export type HoverCardDescriptionInput = Omit<
  HTMLElementProps<HTMLParagraphElement>,
  "className" | "children"
> &
  Record<string, unknown> & {
    children?: unknown;
    class?: string;
    className?: string;
  };

export function HoverCardDescription(input: HoverCardDescriptionInput = {}) {
  const { children, class: className, className: aliasedClassName, ...props } = input;

  return html`<p
    class="${cn("m-0 text-base leading-6 text-areia-subtle", className, aliasedClassName)}"
    ${raw(toAttrs(props))}
  >
    ${children}
  </p>`;
}

export type HoverCardInput = Omit<HTMLElementProps<HTMLDivElement>, "className" | "children"> &
  HoverCardPrimitive.HoverCardOptions &
  HoverCardVariantsProps &
  IlhaBindProps &
  Record<string, unknown> & {
    /** HoverCard panel content. */
    content?: unknown;
    /** Trigger content. */
    children?: unknown;
    /** Custom trigger markup. Overrides generated trigger. */
    trigger?: unknown;
    /** Trigger tag name used when generated trigger is needed. */
    triggerAs?: HoverCardTriggerInput["as"];
    /** Additional CSS classes applied to the hover-card root. */
    class?: string;
    className?: string;
    /** Additional CSS classes applied to the popup content. */
    contentClass?: string;
    contentClassName?: string;
    /** Additional CSS classes applied to the default trigger. */
    triggerClass?: string;
    triggerClassName?: string;
  };

function renderHoverCard(input: HoverCardInput = {}, autoBind = false) {
  const { binds, attrs: props } = splitBindProps(input);
  const {
    align,
    alignOffset,
    avoidCollisions,
    children,
    class: className,
    className: aliasedClassName,
    closeDelay,
    closeOnClickOutside,
    closeOnEscape,
    collisionPadding,
    content,
    contentClass,
    contentClassName,
    defaultOpen: defaultOpenProp,
    delay,
    onOpenChange: _onOpenChange,
    portal,
    side = HOVERCARD_DEFAULT_VARIANTS.side,
    sideOffset = 4,
    skipDelayDuration,
    trigger,
    triggerAs,
    triggerClass,
    triggerClassName,
    ...rootProps
  } = props as HoverCardInput;
  const defaultOpen = openBindDefault(input, defaultOpenProp);

  if (autoBind && binds["bind:open"] != null) {
    queueHoverCardOpenBindForAutoMount(
      binds["bind:open"] as import("ilha").SignalAccessor<boolean>,
    );
  }

  const composedChildren = render(children);
  const hasComposedContent = hasSlot(children, "hover-card-content");
  const hasComposedTrigger = hasSlot(children, "hover-card-trigger");
  const generatedTrigger = hasComposedTrigger
    ? undefined
    : (withSlot(trigger, "hover-card-trigger", triggerClass, triggerClassName) ??
      (trigger != null ? render(trigger) : undefined) ??
      withSlot(children, "hover-card-trigger", triggerClass, triggerClassName) ??
      HoverCardTrigger({
        as: triggerAs,
        class: triggerClass,
        className: triggerClassName,
        children,
      }));

  const inner = html`${hasComposedContent ? composedChildren : generatedTrigger}
  ${hasComposedContent
    ? ""
    : HoverCardContent({
        align,
        alignOffset,
        avoidCollisions,
        class: contentClass,
        className: contentClassName,
        collisionPadding,
        children: content,
        portal,
        side,
        sideOffset,
      })}`;

  const openSuffix = ` data-slot="hover-card" class="${cn("inline-flex", className, aliasedClassName)}"${toAttrs(
    {
      "data-areia-hover-card": autoBind ? "" : undefined,
      "data-default-open": defaultOpen,
    },
  )}${dataAttrs({
    align,
    alignOffset,
    avoidCollisions,
    closeDelay,
    closeOnClickOutside,
    closeOnEscape,
    collisionPadding,
    delay,
    portal,
    side,
    sideOffset,
    skipDelayDuration,
  })}${toAttrs(rootProps)}`;

  return boundElement("div", binds, openSuffix, inner);
}

type HoverCardBindRuntime = {
  controller: HoverCardPrimitive.HoverCardController;
  bindSync: ReturnType<typeof createOpenBindSync>;
};

const hoverCardBindRuntimeByHost = new WeakMap<Element, HoverCardBindRuntime>();

const HoverCardRootIsland = ilha
  .input<HoverCardInput>()
  .onMount(({ host, input }) => {
    const root = host.matches('[data-slot="hover-card"]')
      ? host
      : host.querySelector('[data-slot="hover-card"]');
    if (!root) return;

    let bindSync: ReturnType<typeof createOpenBindSync> = null;

    stampMorphPreserve(root);
    const controller = HoverCardPrimitive.createHoverCard(root, {
      align: input.align,
      alignOffset: input.alignOffset,
      avoidCollisions: input.avoidCollisions,
      closeDelay: input.closeDelay,
      closeOnClickOutside: input.closeOnClickOutside,
      closeOnEscape: input.closeOnEscape,
      collisionPadding: input.collisionPadding,
      defaultOpen: openBindDefault(input, input.defaultOpen),
      delay: input.delay,
      onOpenChange: (open) => {
        bindSync?.onUserChange(open);
        input.onOpenChange?.(open);
      },
      portal: input.portal,
      side: input.side,
      sideOffset: input.sideOffset,
      skipDelayDuration: input.skipDelayDuration,
      onPortalMounted: input.onPortalMounted,
    });

    bindSync = createOpenBindSync(input, controller);
    bindSync?.applyFromSignal();
    hoverCardControllers.set(root, controller);
    hoverCardBindRuntimeByHost.set(host, { controller, bindSync });

    return () => {
      hoverCardBindRuntimeByHost.delete(host);
      hoverCardControllers.delete(root);
      controller.destroy();
    };
  })
  .effect(({ host, input }) => {
    subscribeBindProps(input);
    const runtime = hoverCardBindRuntimeByHost.get(host);
    if (!runtime) return;
    runtime.bindSync?.applyFromSignal();
  })
  .render(({ input }) => renderHoverCard(input));

const hoverCardAutoBindScheduled = new WeakSet<Document>();

type HoverCardAutoRuntime = {
  controller: HoverCardPrimitive.HoverCardController;
  bindSync: ReturnType<typeof createOpenBindSync>;
};

const hoverCardAutoRuntimeByRoot = new WeakMap<Element, HoverCardAutoRuntime>();

function scheduleHoverCardAutoBind(doc: Document | undefined = globalThis.document) {
  if (!doc || hoverCardAutoBindScheduled.has(doc)) return;
  hoverCardAutoBindScheduled.add(doc);
  queueMicrotask(() => {
    hoverCardAutoBindScheduled.delete(doc);
    const queued = takeHoverCardOpenBindQueue(doc);
    let queueIndex = 0;

    for (const root of doc.querySelectorAll<HTMLElement>(
      '[data-areia-hover-card][data-slot="hover-card"]',
    )) {
      const trigger = root.querySelector('[data-slot="hover-card-trigger"]');
      const content = root.querySelector('[data-slot="hover-card-content"]');
      if (!trigger || !content) continue;

      const existing = hoverCardAutoRuntimeByRoot.get(root);
      if (existing) {
        existing.bindSync?.applyFromSignal();
        continue;
      }

      const entry = queued[queueIndex++];
      let bindSync: ReturnType<typeof createOpenBindSync> = null;

      stampMorphPreserve(root);
      const controller = HoverCardPrimitive.createHoverCard(root, {
        onOpenChange: (open) => bindSync?.onUserChange(open),
      });

      if (entry) {
        bindSync = createOpenBindSync({ "bind:open": entry.bindOpen }, controller);
        bindSync?.applyFromSignal();
      }

      hoverCardControllers.set(root, controller);
      hoverCardAutoRuntimeByRoot.set(root, { controller, bindSync });
    }
  });
}

function needsHoverCardIsland(input: HoverCardInput) {
  const { binds } = splitBindProps(input);
  return input.onOpenChange != null || input.onPortalMounted != null || binds["bind:open"] != null;
}

function HoverCardComponent(input: HoverCardInput = {}) {
  if (needsHoverCardIsland(input)) return HoverCardRootIsland(input);
  scheduleHoverCardAutoBind();
  return renderHoverCard(
    normalizeStaticChildSlots(input, ["content", "trigger", "children"]),
    true,
  );
}

export function HoverCardRoot(input: HoverCardInput = {}) {
  return HoverCardRootIsland(input);
}

function HoverCardBase(input: HoverCardInput = {}) {
  return renderHoverCard(normalizeStaticChildSlots(input, ["content", "trigger", "children"]));
}

export const HoverCard = Object.assign(HoverCardComponent, {
  Root: HoverCardRoot,
  Static: HoverCardBase,
  Trigger: HoverCardTrigger,
  Content: HoverCardContent,
  Title: HoverCardTitle,
  Description: HoverCardDescription,
});
