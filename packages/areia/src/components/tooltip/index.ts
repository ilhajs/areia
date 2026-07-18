import ilha, { html, raw } from "ilha";
import { Tooltip as TooltipPrimitive } from "@areia/slots";
import { cn } from "$lib/cn";
import { hasSlot, normalizeStaticChildSlots, render, withSlot } from "$lib/markup";
import { toAttrs } from "$lib/input";
import type { HTMLElementProps } from "$lib/types";
import { stampMorphPreserve } from "$lib/morph-preserve";

/** Tooltip side variant definitions mapping positions to their Tailwind classes. */
export const TOOLTIP_VARIANTS = {
  side: {
    top: {
      classes: "",
      description: "Tooltip appears above the trigger",
    },
    bottom: {
      classes: "",
      description: "Tooltip appears below the trigger",
    },
    left: {
      classes: "",
      description: "Tooltip appears to the left of the trigger",
    },
    right: {
      classes: "",
      description: "Tooltip appears to the right of the trigger",
    },
    "inline-start": {
      classes: "",
      description: "Tooltip appears at the inline start side of the trigger",
    },
    "inline-end": {
      classes: "",
      description: "Tooltip appears at the inline end side of the trigger",
    },
  },
} as const;

export const TOOLTIP_DEFAULT_VARIANTS = {
  side: "top",
} as const;

export type TooltipSide = keyof typeof TOOLTIP_VARIANTS.side;
export type TooltipAlign = "start" | "center" | "end";

export interface TooltipVariantsProps {
  /** Preferred side of the trigger to render the tooltip. */
  side?: TooltipSide;
}

type VariantConfig = Record<string, { classes: string }>;

function resolveVariant<TVariants extends VariantConfig, TKey extends keyof TVariants>(
  variants: TVariants,
  value: TKey | undefined,
  fallback: TKey,
) {
  return variants[value ?? fallback] ?? variants[fallback];
}

export function tooltipVariants({
  side = TOOLTIP_DEFAULT_VARIANTS.side,
}: TooltipVariantsProps = {}) {
  return cn(
    "flex origin-[var(--transform-origin)] flex-col rounded-md bg-areia-background px-2.5 py-1.5 text-sm text-areia-default",
    "shadow-lg outline outline-1 outline-areia-divider",
    "transition-[transform,scale,opacity] duration-150",
    "data-starting-style:scale-90 data-starting-style:opacity-0",
    "data-ending-style:scale-90 data-ending-style:opacity-0",
    "data-instant:duration-0",
    resolveVariant(TOOLTIP_VARIANTS.side, side, TOOLTIP_DEFAULT_VARIANTS.side).classes,
  );
}

function dataAttrs(
  input: Pick<
    TooltipInput,
    | "align"
    | "alignOffset"
    | "avoidCollisions"
    | "collisionPadding"
    | "delay"
    | "portal"
    | "side"
    | "sideOffset"
    | "skipDelayDuration"
  >,
) {
  return toAttrs({
    "data-align": input.align,
    "data-align-offset": input.alignOffset,
    "data-avoid-collisions": input.avoidCollisions,
    "data-collision-padding": input.collisionPadding,
    "data-delay": input.delay,
    "data-portal": input.portal,
    "data-side": input.side,
    "data-side-offset": input.sideOffset,
    "data-skip-delay-duration": input.skipDelayDuration,
  });
}

function arrowSvg() {
  return html`<svg width="20" height="10" viewBox="0 0 20 10" fill="none">
    <path
      d="M9.66437 2.60207L4.80758 6.97318C4.07308 7.63423 3.11989 8 2.13172 8H0V10H20V8H18.5349C17.5468 8 16.5936 7.63423 15.8591 6.97318L11.0023 2.60207C10.622 2.2598 10.0447 2.25979 9.66437 2.60207Z"
      class="fill-areia-background"
    ></path>
    <path
      d="M8.99542 1.85876C9.75604 1.17425 10.9106 1.17422 11.6713 1.85878L16.5281 6.22989C17.0789 6.72568 17.7938 7.00001 18.5349 7.00001L15.89 7L11.0023 2.60207C10.622 2.2598 10.0447 2.2598 9.66436 2.60207L4.77734 7L2.13171 7.00001C2.87284 7.00001 3.58774 6.72568 4.13861 6.22989L8.99542 1.85876Z"
      class="fill-areia-divider"
    ></path>
  </svg>`;
}

export type TooltipContentInput = Omit<HTMLElementProps<HTMLDivElement>, "className" | "children"> &
  TooltipVariantsProps &
  Pick<
    TooltipInput,
    "align" | "alignOffset" | "avoidCollisions" | "collisionPadding" | "portal" | "sideOffset"
  > &
  Record<string, unknown> & {
    /** Tooltip popup content. */
    children?: unknown;
    /** Whether to render the decorative arrow. */
    arrow?: boolean;
    /** Additional CSS classes applied to the content. */
    class?: string;
    className?: string;
  };

export function TooltipContent(input: TooltipContentInput = {}) {
  const {
    arrow = true,
    children,
    class: className,
    className: aliasedClassName,
    side = TOOLTIP_DEFAULT_VARIANTS.side,
    ...props
  } = input;

  return html`<div
    data-slot="tooltip-content"
    hidden
    class="${cn(tooltipVariants({ side }), className, aliasedClassName)}"
    ${raw(dataAttrs({ ...props, side }))}
    ${raw(toAttrs(props))}
  >
    ${arrow ? TooltipArrow() : ""} ${render(children)}
  </div>`;
}

export type TooltipArrowInput = Omit<HTMLElementProps<HTMLDivElement>, "className" | "children"> &
  Record<string, unknown> & {
    children?: unknown;
    class?: string;
    className?: string;
  };

export function TooltipArrow(input: TooltipArrowInput = {}) {
  const { children = arrowSvg(), class: className, className: aliasedClassName, ...props } = input;

  return html`<div
    data-slot="tooltip-arrow"
    class="${cn(
      "flex",
      "data-[side=bottom]:-top-2",
      "data-[side=left]:-right-3.25 data-[side=left]:rotate-90",
      "data-[side=right]:-left-3.25 data-[side=right]:-rotate-90",
      "data-[side=top]:-bottom-2 data-[side=top]:rotate-180",
      "data-[side=inline-start]:-right-3.25 data-[side=inline-start]:rotate-90",
      "data-[side=inline-end]:-left-3.25 data-[side=inline-end]:-rotate-90",
      className,
      aliasedClassName,
    )}"
    ${raw(toAttrs(props))}
  >
    ${render(children)}
  </div>`;
}

export type TooltipTriggerInput = Omit<HTMLElementProps<HTMLElement>, "className" | "children"> &
  Record<string, unknown> & {
    /** Trigger content. */
    children?: unknown;
    /** Trigger tag name. Defaults to `span` so button-like children are not nested in another button. */
    as?: "button" | "span" | "div" | "a";
    /** Additional CSS classes applied to the trigger. */
    class?: string;
    className?: string;
  };

export function TooltipTrigger(input: TooltipTriggerInput = {}) {
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
    data-slot="tooltip-trigger"
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

export type TooltipInput = Omit<HTMLElementProps<HTMLDivElement>, "className" | "children"> &
  TooltipPrimitive.TooltipOptions &
  TooltipVariantsProps &
  Record<string, unknown> & {
    /** Content to display inside the tooltip popup. */
    content: unknown;
    /** Trigger content. */
    children?: unknown;
    /** Trigger markup. Overrides the default button-like trigger. */
    trigger?: unknown;
    /** Trigger tag name used when `trigger` is not provided. */
    triggerAs?: TooltipTriggerInput["as"];
    /** Whether to render the decorative arrow. */
    arrow?: boolean;
    /** Additional CSS classes applied to the tooltip root. */
    class?: string;
    className?: string;
    /** Additional CSS classes applied to the popup content. */
    contentClass?: string;
    contentClassName?: string;
    /** Additional CSS classes applied to the default trigger. */
    triggerClass?: string;
    triggerClassName?: string;
  };

function renderTooltip(input: TooltipInput) {
  const {
    align,
    alignOffset,
    arrow,
    avoidCollisions,
    children,
    class: className,
    className: aliasedClassName,
    collisionPadding,
    content,
    contentClass,
    contentClassName,
    delay,
    onOpenChange: _onOpenChange,
    portal,
    side = TOOLTIP_DEFAULT_VARIANTS.side,
    sideOffset,
    skipDelayDuration,
    trigger,
    triggerAs,
    triggerClass,
    triggerClassName,
    ...rootProps
  } = input;

  const composedChildren = render(children);
  const hasComposedContent = hasSlot(children, "tooltip-content");
  const hasComposedTrigger = hasSlot(children, "tooltip-trigger");
  const generatedTrigger = hasComposedTrigger
    ? undefined
    : (withSlot(trigger, "tooltip-trigger", triggerClass, triggerClassName) ??
      (trigger != null ? render(trigger) : undefined) ??
      withSlot(children, "tooltip-trigger", triggerClass, triggerClassName) ??
      TooltipTrigger({
        as: triggerAs,
        class: triggerClass,
        className: triggerClassName,
        children,
      }));

  return html`<div
    data-slot="tooltip"
    class="${cn("inline-flex", className, aliasedClassName)}"
    ${raw(
      dataAttrs({
        align,
        alignOffset,
        avoidCollisions,
        collisionPadding,
        delay,
        portal,
        side,
        sideOffset,
        skipDelayDuration,
      }),
    )}
    ${raw(toAttrs(rootProps))}
  >
    ${hasComposedContent ? composedChildren : generatedTrigger}
    ${hasComposedContent
      ? ""
      : TooltipContent({
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

export const TooltipRoot = ilha
  .input<TooltipInput>()
  .onMount(({ host, input }) => {
    const root = host.matches('[data-slot="tooltip"]')
      ? host
      : host.querySelector('[data-slot="tooltip"]');
    if (!root) return;

    stampMorphPreserve(root);
    const controller = TooltipPrimitive.createTooltip(root, {
      align: input.align,
      alignOffset: input.alignOffset,
      avoidCollisions: input.avoidCollisions,
      collisionPadding: input.collisionPadding,
      delay: input.delay,
      onOpenChange: input.onOpenChange,
      portal: input.portal,
      side: input.side,
      sideOffset: input.sideOffset,
      skipDelayDuration: input.skipDelayDuration,
      onPortalMounted: input.onPortalMounted,
    });

    return () => controller.destroy();
  })
  .render(({ input }) => renderTooltip(input));

function TooltipBase(input: TooltipInput) {
  return renderTooltip(normalizeStaticChildSlots(input, ["content", "trigger", "children"]));
}

export const Tooltip = Object.assign(TooltipRoot, {
  Root: TooltipRoot,
  Static: TooltipBase,
  Trigger: TooltipTrigger,
  Content: TooltipContent,
  Arrow: TooltipArrow,
});
