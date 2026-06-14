import ilha, { html, raw } from "ilha";
import { Popover as PopoverPrimitive } from "@areia/slots";
import {
  createOpenBindSync,
  openBindDefault,
  subscribeBindProps,
  type IlhaBindProps,
} from "$lib/binds";
import { cn } from "$lib/cn";
import { hasSlot, normalizeStaticChildSlots, render, withSlot } from "$lib/markup";
import { renderOverlayClose } from "$lib/overlay-close";
import { toAttrs } from "$lib/input";
import type { HTMLElementProps } from "$lib/types";

/** Popover side variant definitions mapping positions to their Tailwind classes. */
export const POPOVER_VARIANTS = {
  side: {
    top: { classes: "", description: "Popover appears above the trigger" },
    bottom: { classes: "", description: "Popover appears below the trigger" },
    left: { classes: "", description: "Popover appears to the left of the trigger" },
    right: { classes: "", description: "Popover appears to the right of the trigger" },
  },
} as const;

export const POPOVER_DEFAULT_VARIANTS = {
  side: "bottom",
} as const;

export type PopoverSide = keyof typeof POPOVER_VARIANTS.side;
export type PopoverAlign = "start" | "center" | "end";

export interface PopoverVariantsProps {
  /** Which side of the trigger the popover appears on. */
  side?: PopoverSide;
}

type VariantConfig = Record<string, { classes: string }>;

function resolveVariant<TVariants extends VariantConfig, TKey extends keyof TVariants>(
  variants: TVariants,
  value: TKey | undefined,
  fallback: TKey,
) {
  return variants[value ?? fallback] ?? variants[fallback];
}

export function popoverVariants({
  side = POPOVER_DEFAULT_VARIANTS.side,
}: PopoverVariantsProps = {}) {
  return cn(
    "relative flex origin-[var(--transform-origin)] flex-col rounded-lg bg-areia-background px-4 py-3 text-sm text-areia-default",
    "shadow-lg outline outline-1 outline-areia-divider",
    "transition-[transform,scale,opacity] duration-150",
    "data-starting-style:scale-90 data-starting-style:opacity-0",
    "data-ending-style:scale-90 data-ending-style:opacity-0",
    "data-instant:duration-0",
    resolveVariant(POPOVER_VARIANTS.side, side, POPOVER_DEFAULT_VARIANTS.side).classes,
  );
}

function dataAttrs(
  input: Pick<
    PopoverInput,
    | "align"
    | "alignOffset"
    | "avoidCollisions"
    | "closeOnClickOutside"
    | "closeOnEscape"
    | "collisionPadding"
    | "defaultOpen"
    | "portal"
    | "side"
    | "sideOffset"
  >,
) {
  return toAttrs({
    "data-align": input.align,
    "data-align-offset": input.alignOffset,
    "data-avoid-collisions": input.avoidCollisions,
    "data-close-on-click-outside": input.closeOnClickOutside,
    "data-close-on-escape": input.closeOnEscape,
    "data-collision-padding": input.collisionPadding,
    "data-default-open": input.defaultOpen,
    "data-portal": input.portal,
    "data-side": input.side,
    "data-side-offset": input.sideOffset,
  });
}

export type PopoverArrowInput = Omit<HTMLElementProps<HTMLDivElement>, "className" | "children"> &
  Record<string, unknown> & {
    /** Current side. Synced at runtime by Popover.Root when collision handling flips placement. */
    side?: PopoverSide;
    class?: string;
    className?: string;
  };

export function PopoverArrow(input: PopoverArrowInput = {}) {
  const {
    class: className,
    className: aliasedClassName,
    side = POPOVER_DEFAULT_VARIANTS.side,
    ...props
  } = input;

  return html`<div
    data-slot="popover-arrow"
    data-side="${side}"
    class="${cn(
      "pointer-events-none absolute z-10 size-2.5 rotate-45 bg-areia-background shadow-[inherit]",
      "data-[side=bottom]:top-px data-[side=bottom]:left-1/2 data-[side=bottom]:-translate-x-1/2 data-[side=bottom]:-translate-y-1/2 data-[side=bottom]:border-t data-[side=bottom]:border-l data-[side=bottom]:border-areia-divider",
      "data-[side=top]:bottom-px data-[side=top]:left-1/2 data-[side=top]:-translate-x-1/2 data-[side=top]:translate-y-1/2 data-[side=top]:border-r data-[side=top]:border-b data-[side=top]:border-areia-divider",
      "data-[side=left]:top-1/2 data-[side=left]:right-px data-[side=left]:-translate-y-1/2 data-[side=left]:translate-x-1/2 data-[side=left]:border-t data-[side=left]:border-r data-[side=left]:border-areia-divider",
      "data-[side=right]:top-1/2 data-[side=right]:left-px data-[side=right]:-translate-x-1/2 data-[side=right]:-translate-y-1/2 data-[side=right]:border-b data-[side=right]:border-l data-[side=right]:border-areia-divider",
      className,
      aliasedClassName,
    )}"
    ${raw(toAttrs(props))}
  ></div>`;
}

export type PopoverTriggerInput = Omit<HTMLElementProps<HTMLElement>, "className" | "children"> &
  Record<string, unknown> & {
    children?: unknown;
    /** Trigger tag name. Defaults to `span` so button-like children are not nested. */
    as?: "button" | "span" | "div" | "a";
    class?: string;
    className?: string;
  };

export function PopoverTrigger(input: PopoverTriggerInput = {}) {
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
    data-slot="popover-trigger"
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

export type PopoverContentInput = Omit<HTMLElementProps<HTMLDivElement>, "className" | "children"> &
  PopoverVariantsProps &
  Pick<
    PopoverInput,
    "align" | "alignOffset" | "avoidCollisions" | "collisionPadding" | "portal" | "sideOffset"
  > &
  Record<string, unknown> & {
    children?: unknown;
    /** Whether to render the decorative arrow. */
    arrow?: boolean;
    class?: string;
    className?: string;
  };

export function PopoverContent(input: PopoverContentInput = {}) {
  const {
    align,
    alignOffset,
    arrow = true,
    avoidCollisions,
    children,
    class: className,
    className: aliasedClassName,
    collisionPadding,
    portal,
    side = POPOVER_DEFAULT_VARIANTS.side,
    sideOffset = 8,
    ...props
  } = input;

  return html`<div
    data-slot="popover-content"
    hidden
    class="${cn(popoverVariants({ side }), className, aliasedClassName)}"
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
    ${arrow ? PopoverArrow({ side }) : ""} ${render(children)}
  </div>`;
}

export type PopoverTitleInput = Omit<
  HTMLElementProps<HTMLHeadingElement>,
  "className" | "children"
> &
  Record<string, unknown> & {
    children?: unknown;
    class?: string;
    className?: string;
  };

export function PopoverTitle(input: PopoverTitleInput = {}) {
  const { children, class: className, className: aliasedClassName, ...props } = input;

  return html`<h3
    class="${cn("m-0 text-base leading-6 font-medium", className, aliasedClassName)}"
    ${raw(toAttrs(props))}
  >
    ${children}
  </h3>`;
}

export type PopoverDescriptionInput = Omit<
  HTMLElementProps<HTMLParagraphElement>,
  "className" | "children"
> &
  Record<string, unknown> & {
    children?: unknown;
    class?: string;
    className?: string;
  };

export function PopoverDescription(input: PopoverDescriptionInput = {}) {
  const { children, class: className, className: aliasedClassName, ...props } = input;

  return html`<p
    class="${cn("m-0 text-base leading-6 text-areia-subtle", className, aliasedClassName)}"
    ${raw(toAttrs(props))}
  >
    ${children}
  </p>`;
}

export type PopoverCloseInput = Omit<
  HTMLElementProps<HTMLButtonElement>,
  "className" | "children"
> &
  Record<string, unknown> & {
    children?: unknown;
    as?: "button" | "span" | "div" | "a";
    class?: string;
    className?: string;
  };

export function PopoverClose(input: PopoverCloseInput = {}) {
  const {
    as = "button",
    children = "Close",
    class: className,
    className: aliasedClassName,
    type,
    ...props
  } = input;

  return renderOverlayClose({
    slot: "popover-close",
    as,
    children,
    class: className,
    className: aliasedClassName,
    type,
    props,
  });
}

export type PopoverInput = Omit<HTMLElementProps<HTMLDivElement>, "className" | "children"> &
  PopoverPrimitive.PopoverOptions &
  PopoverVariantsProps &
  IlhaBindProps &
  Record<string, unknown> & {
    /** Popover panel content. */
    content?: unknown;
    /** Trigger content. */
    children?: unknown;
    /** Custom trigger markup. Overrides generated trigger. */
    trigger?: unknown;
    /** Trigger tag name used when generated trigger is needed. */
    triggerAs?: PopoverTriggerInput["as"];
    /** Whether to render the decorative arrow. */
    arrow?: boolean;
    class?: string;
    className?: string;
    contentClass?: string;
    contentClassName?: string;
    triggerClass?: string;
    triggerClassName?: string;
  };

function renderPopover(input: PopoverInput = {}, autoBind = false) {
  const {
    align,
    alignOffset,
    arrow,
    avoidCollisions,
    children,
    class: className,
    className: aliasedClassName,
    closeOnClickOutside,
    closeOnEscape,
    collisionPadding,
    content,
    contentClass,
    contentClassName,
    defaultOpen: defaultOpenProp,
    onOpenChange: _onOpenChange,
    portal,
    position: _position,
    side = POPOVER_DEFAULT_VARIANTS.side,
    sideOffset = 8,
    trigger,
    triggerAs,
    triggerClass,
    triggerClassName,
    ...rootProps
  } = input;
  const defaultOpen = openBindDefault(input, defaultOpenProp);

  const composedChildren = render(children);
  const hasComposedContent = hasSlot(children, "popover-content");
  const hasComposedTrigger = hasSlot(children, "popover-trigger");
  const generatedTrigger = hasComposedTrigger
    ? undefined
    : (withSlot(trigger, "popover-trigger", triggerClass, triggerClassName) ??
      (trigger != null ? render(trigger) : undefined) ??
      withSlot(children, "popover-trigger", triggerClass, triggerClassName) ??
      PopoverTrigger({
        as: triggerAs,
        class: triggerClass,
        className: triggerClassName,
        children,
      }));

  return html`<div
    data-slot="popover"
    class="${cn("inline-flex", className, aliasedClassName)}"
    ${raw(toAttrs({ "data-areia-popover": autoBind }))}
    ${raw(
      dataAttrs({
        align,
        alignOffset,
        avoidCollisions,
        closeOnClickOutside,
        closeOnEscape,
        collisionPadding,
        defaultOpen,
        portal,
        side,
        sideOffset,
      }),
    )}
    ${raw(toAttrs(rootProps))}
  >
    ${hasComposedContent ? composedChildren : generatedTrigger}
    ${hasComposedContent
      ? ""
      : PopoverContent({
          align,
          alignOffset,
          arrow,
          avoidCollisions,
          class: contentClass,
          className: contentClassName,
          collisionPadding,
          children: content,
          portal,
          side,
          sideOffset,
        })}
  </div>`;
}

const autoBoundPopovers = new WeakMap<Element, PopoverPrimitive.PopoverController>();
const autoBindDocuments = new WeakSet<Document>();

function syncPopoverArrowSide(root: Element): void {
  const content = root.querySelector<HTMLElement>('[data-slot="popover-content"]');
  const arrow = root.querySelector<HTMLElement>('[data-slot="popover-arrow"]');
  const side = content?.getAttribute("data-side");
  if (arrow && side) arrow.setAttribute("data-side", side);
}

export function bindPopoverRoot(root: Element) {
  const existing = autoBoundPopovers.get(root);
  if (existing) return existing;

  const controller = PopoverPrimitive.createPopover(root);
  syncPopoverArrowSide(root);
  autoBoundPopovers.set(root, controller);
  return controller;
}

function rootFromPopoverEventTarget(target: Element | null) {
  const localRoot = target?.closest?.('[data-areia-popover][data-slot="popover"]');
  if (localRoot) return localRoot;

  const content = target?.closest?.('[data-slot="popover-content"]');
  const contentId = content?.getAttribute("id");
  if (!content || !contentId) return null;
  return (
    content.ownerDocument.querySelector(
      `[data-areia-popover][data-slot="popover"] [data-slot="popover-trigger"][aria-controls="${contentId}"]`,
    ) ??
    content.ownerDocument.querySelector(
      `[data-areia-popover][data-slot="popover"] [data-slot="popover-close"][aria-controls="${contentId}"]`,
    )
  )?.closest('[data-areia-popover][data-slot="popover"]');
}

function ensurePopoverAutoBind(doc: Document | undefined = globalThis.document) {
  if (!doc || autoBindDocuments.has(doc)) return;
  autoBindDocuments.add(doc);

  doc.addEventListener(
    "click",
    (event) => {
      const target = event.target instanceof Element ? event.target : null;
      const root = rootFromPopoverEventTarget(target);
      if (!root) return;

      const trigger = target?.closest?.('[data-slot="popover-trigger"]');
      const close = target?.closest?.('[data-slot="popover-close"]');
      if (!trigger && !close) return;

      const wasBound = autoBoundPopovers.has(root);
      const controller = bindPopoverRoot(root);
      if (wasBound) return;

      event.preventDefault();
      event.stopImmediatePropagation();
      if (trigger) controller.toggle();
      else controller.close();

      syncPopoverArrowSide(root);
    },
    true,
  );
}

const PopoverRootIsland = ilha
  .input<PopoverInput>()
  .onMount(({ host, input }) => {
    const root = host.matches('[data-slot="popover"]')
      ? host
      : host.querySelector('[data-slot="popover"]');
    if (!root) return;

    const syncArrowSide = () => {
      const content = root.querySelector<HTMLElement>('[data-slot="popover-content"]');
      const arrow = root.querySelector<HTMLElement>('[data-slot="popover-arrow"]');
      const side = content?.getAttribute("data-side");
      if (arrow && side) arrow.setAttribute("data-side", side);
    };

    let bindSync: ReturnType<typeof createOpenBindSync> = null;

    const controller = PopoverPrimitive.createPopover(root, {
      align: input.align,
      alignOffset: input.alignOffset,
      avoidCollisions: input.avoidCollisions,
      closeOnClickOutside: input.closeOnClickOutside,
      closeOnEscape: input.closeOnEscape,
      collisionPadding: input.collisionPadding,
      defaultOpen: openBindDefault(input, input.defaultOpen),
      onOpenChange: (open) => {
        bindSync?.onUserChange(open);
        input.onOpenChange?.(open);
      },
      portal: input.portal,
      side: input.side,
      sideOffset: input.sideOffset,
      onPortalMounted: input.onPortalMounted,
    });

    bindSync = createOpenBindSync(input, controller);
    bindSync?.applyFromSignal();

    syncArrowSide();
    const content = root.querySelector<HTMLElement>('[data-slot="popover-content"]');
    const observer = content ? new MutationObserver(syncArrowSide) : undefined;
    observer?.observe(content!, { attributes: true, attributeFilter: ["data-side"] });

    return () => {
      observer?.disconnect();
      controller.destroy();
    };
  })
  .effect(({ host, input }) => {
    subscribeBindProps(input);
    const root = host.matches('[data-slot="popover"]')
      ? host
      : host.querySelector('[data-slot="popover"]');
    if (!root) return;

    const controller = autoBoundPopovers.get(root) ?? PopoverPrimitive.createPopover(root);
    createOpenBindSync(input, controller)?.applyFromSignal();
  })
  .on("[data-slot='popover-content']@animationend", ({ host }) => {
    const root = host.matches('[data-slot="popover"]')
      ? host
      : host.querySelector('[data-slot="popover"]');
    if (root) syncPopoverArrowSide(root);
  })
  .on("[data-slot='popover-content']@transitionend", ({ host }) => {
    const root = host.matches('[data-slot="popover"]')
      ? host
      : host.querySelector('[data-slot="popover"]');
    if (root) syncPopoverArrowSide(root);
  })
  .render(({ input }) => renderPopover(input));

const autoBindScheduled = new WeakSet<Document>();

function schedulePopoverAutoBind(doc: Document | undefined = globalThis.document) {
  if (!doc || autoBindScheduled.has(doc)) return;
  autoBindScheduled.add(doc);
  queueMicrotask(() => {
    autoBindScheduled.delete(doc);
    for (const root of doc.querySelectorAll('[data-areia-popover][data-slot="popover"]')) {
      bindPopoverRoot(root);
    }
  });
}

function needsPopoverIsland(input: PopoverInput) {
  return input.onOpenChange != null || input["bind:open"] != null;
}

export function PopoverRoot(input: PopoverInput = {}) {
  if (needsPopoverIsland(input)) return PopoverRootIsland(input);

  const normalized = normalizeStaticChildSlots(input, ["content", "trigger", "children"]);
  ensurePopoverAutoBind();
  schedulePopoverAutoBind();
  return renderPopover(normalized, true);
}

function PopoverBase(input: PopoverInput = {}) {
  return renderPopover(normalizeStaticChildSlots(input, ["content", "trigger", "children"]));
}

export const Popover = Object.assign(PopoverRoot, {
  Root: PopoverRoot,
  Static: PopoverBase,
  Trigger: PopoverTrigger,
  Content: PopoverContent,
  Title: PopoverTitle,
  Description: PopoverDescription,
  Close: PopoverClose,
  Arrow: PopoverArrow,
});
