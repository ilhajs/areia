import ilha, { html, raw } from "ilha";
import { Progress as ProgressPrimitive } from "@areia/slots";
import { cn } from "$lib/cn";
import { toAttrs } from "$lib/input";
import type { HTMLElementProps } from "$lib/types";
import { stampMorphPreserve } from "$lib/morph-preserve";

export type ProgressInput = Omit<HTMLElementProps<HTMLDivElement>, "className" | "children"> &
  Record<string, unknown> & {
    value?: number | null;
    min?: number;
    max?: number;
    label?: unknown;
    showValue?: boolean;
    class?: string;
    className?: string;
    trackClass?: string;
    indicatorClass?: string;
    valueClass?: string;
    onValueChange?: (value: number | null) => void;
  };

function progressAttrs(input: Pick<ProgressInput, "value" | "min" | "max">) {
  return toAttrs({
    "data-value": input.value,
    "data-min": input.min,
    "data-max": input.max,
  });
}

export function ProgressLabel(input: { label?: unknown; class?: string; className?: string } = {}) {
  const { label, class: className, className: aliasedClassName } = input;
  return html`<span
    data-slot="progress-label"
    class="${cn("text-sm font-medium text-areia-default", className, aliasedClassName)}"
    >${label ?? "Progress"}</span
  >`;
}

export function ProgressValue(input: { class?: string; className?: string } = {}) {
  const { class: className, className: aliasedClassName } = input;
  return html`<span
    data-slot="progress-value"
    class="${cn("text-sm tabular-nums text-areia-subtle", className, aliasedClassName)}"
  ></span>`;
}

export function ProgressTrack(
  input: { children?: unknown; class?: string; className?: string } = {},
) {
  const { children, class: className, className: aliasedClassName } = input;
  return html`<div
    data-slot="progress-track"
    class="${cn(
      "h-2 w-full overflow-hidden rounded-full bg-areia-control-background",
      className,
      aliasedClassName,
    )}"
  >
    ${children ?? ProgressIndicator()}
  </div>`;
}

export function ProgressIndicator(input: { class?: string; className?: string } = {}) {
  const { class: className, className: aliasedClassName } = input;
  return html`<div
    data-slot="progress-indicator"
    class="${cn(
      "h-full rounded-full bg-areia-primary transition-[width] duration-200 ease-out data-indeterminate:w-full data-indeterminate:animate-pulse",
      className,
      aliasedClassName,
    )}"
  ></div>`;
}

function renderProgress(input: ProgressInput = {}) {
  const {
    value,
    min,
    max,
    label,
    showValue = true,
    class: className,
    className: aliasedClassName,
    trackClass,
    indicatorClass,
    valueClass,
    onValueChange: _onValueChange,
    ...rest
  } = input;

  return html`<div
    data-slot="progress"
    class="${cn("flex w-full flex-col gap-2", className, aliasedClassName)}"
    ${raw(progressAttrs({ value, min, max }))}
    ${raw(toAttrs(rest))}
  >
    ${label != null || showValue
      ? html`<div class="flex items-center justify-between gap-3">
          ${label != null ? ProgressLabel({ label }) : ""}
          ${showValue ? ProgressValue({ class: valueClass }) : ""}
        </div>`
      : ""}
    ${ProgressTrack({ class: trackClass, children: ProgressIndicator({ class: indicatorClass }) })}
  </div>`;
}

export const ProgressRoot = ilha
  .input<ProgressInput>()
  .onMount(({ host, input }) => {
    const root = host.matches('[data-slot="progress"]')
      ? host
      : host.querySelector('[data-slot="progress"]');
    if (!root) return;

    stampMorphPreserve(root);
    const controller = ProgressPrimitive.createProgress(root, {
      value: input.value,
      min: input.min,
      max: input.max,
      onValueChange: input.onValueChange,
    } satisfies ProgressPrimitive.ProgressOptions);

    return () => controller.destroy();
  })
  .render(({ input }) => renderProgress(input));

export const Progress = Object.assign(ProgressRoot, {
  Root: ProgressRoot,
  Static: renderProgress,
  Label: ProgressLabel,
  Track: ProgressTrack,
  Indicator: ProgressIndicator,
  Value: ProgressValue,
});
