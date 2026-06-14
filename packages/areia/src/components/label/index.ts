import { html, raw } from "ilha";
import { Info } from "lucide";
import { cn } from "$lib/cn";
import { render } from "$lib/markup";
import { toAttrs } from "$lib/input";
import type { HTMLElementProps } from "$lib/types";
import { Button } from "$components/button";
import { Icon } from "$components/icon";

/** Label variant definitions (currently empty, reserved for future additions). */
export const LABEL_VARIANTS = {} as const;

export const LABEL_DEFAULT_VARIANTS = {} as const;

export interface LabelVariantsProps {}

export function labelVariants(_props: LabelVariantsProps = {}) {
  return cn("m-0 text-base font-medium text-areia-default");
}

export function labelContentVariants() {
  return cn("inline-flex items-center gap-1");
}

export type LabelInput = Omit<HTMLElementProps<HTMLLabelElement>, "className" | "children"> &
  LabelVariantsProps &
  Record<string, unknown> & {
    /** Label content. */
    children?: unknown;
    /** Label content. Used when `children` is not provided. */
    label?: unknown;
    /** When `true`, shows gray `(optional)` text after the label. */
    showOptional?: boolean;
    /** Tooltip content displayed next to the label via an info icon. */
    tooltip?: unknown;
    /** Additional CSS classes merged with the generated classes. */
    class?: string;
    className?: string;
    /** The id of the form element this label is associated with. */
    htmlFor?: string;
    /** Alias for `htmlFor`. */
    for?: string;
    /**
     * When true, only renders the inline content without the outer `label` element.
     * Useful when composed inside another label element that already provides text styling.
     * @default false
     */
    asContent?: boolean;
  };

function tooltipIndicator(content: unknown) {
  return html`<span class="group/label-tooltip relative inline-flex">
    ${Button({
      variant: "ghost",
      size: "xs",
      shape: "square",
      icon: Icon({ icon: Info, class: "size-4" }),
      "aria-label": "More information",
    })}
    <span
      role="tooltip"
      class="pointer-events-none invisible absolute bottom-full left-1/2 z-(--areia-z-tooltip) mb-2 w-max max-w-xs -translate-x-1/2 rounded-md bg-areia-background px-2.5 py-1.5 text-xs font-normal text-areia-default opacity-0 shadow-lg outline outline-1 outline-areia-divider transition-opacity group-hover/label-tooltip:visible group-hover/label-tooltip:opacity-100 group-focus-within/label-tooltip:visible group-focus-within/label-tooltip:opacity-100"
      >${render(content)}</span
    >
  </span>`;
}

function labelText({ children, label, showOptional = false }: LabelInput) {
  return html`${render(children ?? label)}${showOptional
    ? html`<span class="font-normal text-areia-subtle">(optional)</span>`
    : ""}`;
}

function labelContent(input: LabelInput) {
  return html`${labelText(input)}${input.tooltip ? tooltipIndicator(input.tooltip) : ""}`;
}

/** Form label with optional indicator and tooltip support. */
export function Label(input: LabelInput = {}) {
  const {
    asContent = false,
    class: className,
    className: aliasedClassName,
    children: _children,
    label: _label,
    showOptional: _showOptional,
    tooltip,
    htmlFor,
    for: forAttr,
    ...props
  } = input;
  const content = labelContent(input);

  if (asContent) {
    return html`<span
      class="${cn(labelContentVariants(), className, aliasedClassName)}"
      ${raw(toAttrs(props))}
    >
      ${content}
    </span>`;
  }

  const label = html`<label
    class="${cn(labelVariants(), labelContentVariants(), className, aliasedClassName)}"
    ${raw(toAttrs({ ...props, for: htmlFor ?? forAttr }))}
  >
    ${labelText(input)}
  </label>`;

  if (!tooltip) return label;

  return html`<span class="${labelContentVariants()}">
    ${label}${tooltipIndicator(tooltip)}
  </span>`;
}
