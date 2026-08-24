import { ilha, html, raw } from "ilha";
import { Slider as SliderPrimitive } from "@areia/slots";
import { cn } from "$lib/cn";
import { toAttrs } from "$lib/input";
import type { HTMLElementProps } from "$lib/types";
import { MORPH_CONTROLLER_STYLE, stampMorphPreserve } from "$lib/morph-preserve";

export type SliderValue = number | [number, number];

export type SliderInput = Omit<HTMLElementProps<HTMLDivElement>, "className" | "children"> &
  Record<string, unknown> & {
    value?: SliderValue;
    defaultValue?: SliderValue;
    min?: number;
    max?: number;
    step?: number;
    orientation?: "horizontal" | "vertical";
    disabled?: boolean;
    thumbAlignment?: "center" | "edge" | "edge-client-only";
    class?: string;
    className?: string;
    controlClass?: string;
    trackClass?: string;
    rangeClass?: string;
    thumbClass?: string;
    onValueChange?: (value: SliderValue) => void;
    onValueCommit?: (value: SliderValue) => void;
  };

export type SliderTrackInput = Omit<HTMLElementProps<HTMLDivElement>, "className" | "children"> & {
  children?: unknown;
  class?: string;
  className?: string;
};

export type SliderRangeInput = Omit<HTMLElementProps<HTMLDivElement>, "className" | "children"> & {
  class?: string;
  className?: string;
};

export type SliderThumbInput = Omit<HTMLElementProps<HTMLDivElement>, "className" | "children"> & {
  class?: string;
  className?: string;
};

function thumbCount(value?: SliderValue): number {
  if (value !== undefined && Array.isArray(value)) return 2;
  return 1;
}

function defaultValueStr(value?: SliderValue): string | undefined {
  if (value === undefined) return undefined;
  if (Array.isArray(value)) return value.join(",");
  return String(value);
}

function sliderDataAttrs(
  input: Pick<
    SliderInput,
    | "defaultValue"
    | "min"
    | "max"
    | "step"
    | "orientation"
    | "disabled"
    | "thumbAlignment"
    | "value"
  >,
) {
  const resolved = input.defaultValue ?? input.value;
  return toAttrs({
    "data-default-value": defaultValueStr(resolved),
    "data-min": input.min,
    "data-max": input.max,
    "data-step": input.step,
    "data-orientation": input.orientation,
    "data-thumb-alignment": input.thumbAlignment ?? "edge",
    "data-disabled": input.disabled ? "true" : undefined,
  });
}

export function SliderTrack(input: SliderTrackInput = {}) {
  const { children, class: className, className: aliasedClassName, ...rest } = input;

  return html`<div
    data-slot="slider-track"
    class="${cn(
      "relative grow overflow-hidden rounded-full bg-areia-surface-muted",
      className,
      aliasedClassName,
    )}"
    ${raw(toAttrs(rest))}
  >
    ${children ?? SliderRange()}
  </div>`;
}

export function SliderRange(input: SliderRangeInput = {}) {
  const { class: className, className: aliasedClassName } = input;

  return html`<div
    data-slot="slider-range"
    class="${cn("h-full bg-areia-primary", className, aliasedClassName)}"
  ></div>`;
}

export function SliderThumb(input: SliderThumbInput = {}) {
  const { class: className, className: aliasedClassName } = input;

  return html`<div
    data-slot="slider-thumb"
    class="${cn(
      "block shrink-0 select-none rounded-full border border-areia-primary bg-areia-background shadow-sm",
      "size-4",
      "transition-[color,box-shadow]",
      "hover:ring-4 focus-visible:ring-4 focus-visible:outline-hidden",
      "ring-areia-ring/50",
      "disabled:pointer-events-none disabled:opacity-50",
      className,
      aliasedClassName,
    )}"
  ></div>`;
}

function renderThumbs(input: SliderInput) {
  const count = thumbCount(input.defaultValue ?? input.value);
  const thumbClass = input.thumbClass;

  return Array.from({ length: count }, () => SliderThumb({ class: thumbClass }));
}

function renderSlider(input: SliderInput = {}) {
  const {
    value,
    defaultValue,
    min,
    max,
    step,
    orientation = "horizontal",
    disabled,
    thumbAlignment,
    class: className,
    className: aliasedClassName,
    controlClass,
    trackClass,
    rangeClass,
    thumbClass,
    onValueChange: _onValueChange,
    onValueCommit: _onValueCommit,
    ...rest
  } = input;

  const isVertical = orientation === "vertical";
  const trackDim = isVertical ? "h-full w-1.5" : "h-1.5 w-full";
  const wrapperClass = isVertical
    ? "h-full w-auto min-h-40 flex-col items-center"
    : "w-full items-center";

  return html`<div
    data-slot="slider"
    class="${cn(isVertical ? "h-full" : "min-w-64", className, aliasedClassName)}"
    ${raw(
      sliderDataAttrs({
        defaultValue: defaultValue ?? value,
        min,
        max,
        step,
        orientation,
        disabled,
        thumbAlignment,
      }),
    )}
    ${raw(toAttrs(rest))}
  >
    <div
      class="${cn(
        "relative flex touch-none select-none",
        wrapperClass,
        disabled && "opacity-50",
        controlClass,
      )}"
    >
      ${SliderTrack({
        class: cn(trackDim, trackClass),
        children: SliderRange({ class: rangeClass }),
      })}
      ${renderThumbs(input)}
    </div>
  </div>`;
}

export const SliderRoot = ilha
  .input<SliderInput>()
  .onMount(({ host, input }) => {
    const root = host.matches('[data-slot="slider"]')
      ? host
      : host.querySelector('[data-slot="slider"]');
    if (!root) return;

    stampMorphPreserve(root, MORPH_CONTROLLER_STYLE);
    const controller = SliderPrimitive.createSlider(root, {
      defaultValue: input.value ?? input.defaultValue,
      min: input.min,
      max: input.max,
      step: input.step,
      orientation: input.orientation,
      disabled: input.disabled,
      thumbAlignment: input.thumbAlignment,
      onValueChange: input.onValueChange,
      onValueCommit: input.onValueCommit,
    } satisfies SliderPrimitive.SliderOptions);

    return () => controller.destroy();
  })
  .render(({ input }) => renderSlider(input));

export const Slider = Object.assign(SliderRoot, {
  Root: SliderRoot,
  Static: renderSlider,
  Track: SliderTrack,
  Range: SliderRange,
  Thumb: SliderThumb,
});
