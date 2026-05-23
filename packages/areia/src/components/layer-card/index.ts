import { html, raw } from "ilha";
import { cn } from "$lib/cn";
import { toAttrs } from "$lib/input";
import type { HTMLElementProps } from "$lib/types";

export const LAYER_CARD_SURFACE_CLASSES =
  "overflow-hidden rounded-lg bg-areia-background shadow-xs ring ring-areia-foreground/10";
export const LAYER_CARD_LAYERED_ROOT_CLASSES =
  "flex w-full flex-col overflow-hidden rounded-lg bg-areia-surface-muted text-base ring ring-areia-foreground/10";
export const LAYER_CARD_SECONDARY_CLASSES =
  "-my-2 flex items-center gap-2 bg-areia-surface-muted p-4 text-base font-medium text-areia-subtle";
export const LAYER_CARD_PRIMARY_CLASSES =
  "relative flex flex-col gap-2 overflow-hidden rounded-lg bg-areia-background p-4 pr-3 text-inherit no-underline ring ring-areia-foreground/10";

/** LayerCard variant definitions (currently empty, reserved for future additions). */
export const LAYER_CARD_VARIANTS = {} as const;

export const LAYER_CARD_DEFAULT_VARIANTS = {} as const;

export interface LayerCardVariantsProps {}

export function layerCardVariants(_props: LayerCardVariantsProps = {}) {
  return cn(LAYER_CARD_SURFACE_CLASSES);
}

type Renderable = unknown;

function render(value: Renderable): string {
  if (value === null || value === undefined || value === false) return "";
  if (Array.isArray(value)) return value.map(render).join("");
  if (typeof value === "object" && "value" in value && typeof value.value === "string") {
    return value.value;
  }
  return String(value);
}

function containsLayerCardSection(value: Renderable): boolean {
  const markup = render(value);
  return (
    markup.includes('data-slot="layer-card-primary"') ||
    markup.includes('data-slot="layer-card-secondary"')
  );
}

export type LayerCardInput = Omit<HTMLElementProps<HTMLDivElement>, "className" | "children"> &
  LayerCardVariantsProps &
  Record<string, unknown> & {
    /** Card content. */
    children?: unknown;
    /** Additional CSS classes merged with generated classes. */
    class?: string;
    className?: string;
  };

export type LayerCardSectionInput = Omit<
  HTMLElementProps<HTMLDivElement>,
  "className" | "children"
> &
  Record<string, unknown> & {
    /** Section content. */
    children?: unknown;
    /** Additional CSS classes merged with generated classes. */
    class?: string;
    className?: string;
  };

export function LayerCardPrimary(input: LayerCardSectionInput = {}) {
  const { children, class: className, className: aliasedClassName, ...props } = input;

  return html`<div
    data-slot="layer-card-primary"
    class="${cn(LAYER_CARD_PRIMARY_CLASSES, className, aliasedClassName)}"
    ${raw(toAttrs(props))}
  >
    ${raw(render(children))}
  </div>`;
}

export function LayerCardSecondary(input: LayerCardSectionInput = {}) {
  const { children, class: className, className: aliasedClassName, ...props } = input;

  return html`<div
    data-slot="layer-card-secondary"
    class="${cn(LAYER_CARD_SECONDARY_CLASSES, className, aliasedClassName)}"
    ${raw(toAttrs(props))}
  >
    ${raw(render(children))}
  </div>`;
}

function LayerCardBase(input: LayerCardInput = {}) {
  const { children, class: className, className: aliasedClassName, ...props } = input;
  const hasStructuredLayers = containsLayerCardSection(children);

  return html`<div
    data-slot="layer-card"
    class="${cn(
      hasStructuredLayers ? LAYER_CARD_LAYERED_ROOT_CLASSES : layerCardVariants(),
      className,
      aliasedClassName,
    )}"
    ${raw(toAttrs(props))}
  >
    ${raw(render(children))}
  </div>`;
}

export const LayerCard = Object.assign(LayerCardBase, {
  Primary: LayerCardPrimary,
  Secondary: LayerCardSecondary,
});
