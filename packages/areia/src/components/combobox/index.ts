import { ilha, html, untrack, raw, action, state, effect, type SignalAccessor } from "ilha";
import { Combobox as ComboboxPrimitive } from "@areia/slots";
import {
  applyThisBind,
  boundElement,
  boundVoidElement,
  createBindBridge,
  disposeBindBridge,
  getBindBridge,
  groupBindDefault,
  groupBindSource,
  openBindDefault,
  openBindSource,
  splitBindProps,
  type IlhaBindProps,
} from "$lib/binds";
import { cn } from "$lib/cn";
import { render } from "$lib/markup";
import { toAttrs } from "$lib/input";
import type { HTMLElementProps } from "$lib/types";
import { badgeVariants } from "$components/badge";
import { INPUT_VARIANTS, inputVariants } from "$components/input";
import { Field } from "$components/field";
import { MORPH_CONTROLLER_STYLE, stampMorphPreserve } from "$lib/morph-preserve";

/** Combobox variant definitions. */
export const COMBOBOX_VARIANTS = {
  size: INPUT_VARIANTS.size,
  inputSide: {
    right: {
      classes: "",
      description: "Input positioned inline to the right of chips",
    },
    top: {
      classes: "",
      description: "Input positioned above chips",
    },
  },
} as const;

export const COMBOBOX_DEFAULT_VARIANTS = {
  size: "base",
  inputSide: "right",
} as const;

export type ComboboxSize = keyof typeof COMBOBOX_VARIANTS.size;
export type ComboboxInputSide = keyof typeof COMBOBOX_VARIANTS.inputSide;

export interface ComboboxVariantsProps {
  /** Size of the combobox trigger. Matches Input component sizes. */
  size?: ComboboxSize;
  /** Position of the text input relative to chips in multi-select-like chip layouts. */
  inputSide?: ComboboxInputSide;
}

type VariantConfig = Record<string, { classes: string }>;

function resolveVariant<TVariants extends VariantConfig, TKey extends keyof TVariants>(
  variants: TVariants,
  value: TKey | undefined,
  fallback: TKey,
) {
  return variants[value ?? fallback] ?? variants[fallback];
}

export function comboboxVariants({
  inputSide = COMBOBOX_DEFAULT_VARIANTS.inputSide,
}: ComboboxVariantsProps = {}) {
  return cn(
    resolveVariant(COMBOBOX_VARIANTS.inputSide, inputSide, COMBOBOX_DEFAULT_VARIANTS.inputSide)
      .classes,
  );
}

export type ComboboxItemDescriptor = {
  /** Display label for the option. */
  label: unknown;
  /** Submitted/selected string value. The final combobox value should come from one of these values. */
  value: string;
  /** When true, the option cannot be selected. */
  disabled?: boolean;
};

/** Options available for selection. Use Autocomplete instead when arbitrary free text is valid. */
export type ComboboxItems =
  | Record<string, unknown | { label: unknown; disabled?: boolean }>
  | ComboboxItemDescriptor[];

export type ComboboxError = unknown | { message: unknown; match?: unknown };

type ComboboxBaseInput = Omit<HTMLElementProps<HTMLDivElement>, "className" | "children"> &
  ComboboxVariantsProps &
  Omit<
    ComboboxPrimitive.ComboboxOptions,
    "disabled" | "required" | "placeholder" | "multiple" | "defaultValue" | "onValueChange"
  > &
  Omit<IlhaBindProps, "bind:value"> &
  Record<string, unknown> & {
    /** Label content for the combobox. Enables the field wrapper. */
    label?: unknown;
    /** Tooltip text rendered as a native title on the label text. */
    labelTooltip?: string;
    /** Constrained options. The selected value should come from this list. */
    items?: ComboboxItems;
    /** Explicit list/content markup. Prefer the second `Combobox` argument for custom markup. */
    children?: unknown;
    /** Helper text displayed below the combobox. */
    description?: unknown;
    /** Error message. When truthy, error styling is automatically applied. */
    error?: ComboboxError;
    /** Placeholder text for the search input or trigger value. */
    placeholder?: string;
    /** Disable interaction. */
    disabled?: boolean;
    /** Form validation required. */
    required?: boolean;
    /**
     * Called when the search/filter text changes. This is not necessarily the selected value.
     * Use `onValueChange` for committed option selection.
     */
    onInputValueChange?: ComboboxPrimitive.ComboboxOptions["onInputValueChange"];
    /** Called when the options popup opens or closes. */
    onOpenChange?: ComboboxPrimitive.ComboboxOptions["onOpenChange"];
    /** Additional CSS classes applied to the combobox root. */
    class?: string;
    className?: string;
  };

export type ComboboxSingleInput = ComboboxBaseInput & {
  /** Single selection mode (default). */
  multiple?: false;
  /** Initial selected value. */
  defaultValue?: string;
  /** Called when the committed option value changes. */
  onValueChange?: (value: string | null) => void;
  /** Bind the committed selection. Alias for `bind:group`. */
  "bind:value"?: SignalAccessor<string> | SignalAccessor<string | null>;
};

export type ComboboxMultipleInput = ComboboxBaseInput & {
  /** Allow selecting multiple values. Selected options render as removable chips. */
  multiple: true;
  /** Initial selected values. */
  defaultValue?: string[];
  /** Called when the committed selection changes. */
  onValueChange?: (value: string[]) => void;
  /** Bind the committed selection. Alias for `bind:group`. */
  "bind:value"?: SignalAccessor<string[]>;
};

/**
 * Searchable constrained selector.
 *
 * Combobox combines a text input, a popup, and a dropdown trigger for choosing
 * from predefined options. Use Autocomplete when the user's typed text is the
 * submitted value and suggestions are merely hints.
 */
export type ComboboxInput = ComboboxSingleInput | ComboboxMultipleInput;

function normalizeError(error: ComboboxError): unknown {
  if (error && typeof error === "object" && "message" in error) {
    return error.message;
  }
  return error;
}

const caretIcon = (size: number) => html`<svg
  aria-hidden="true"
  class="fill-current"
  width="${size}"
  height="${size}"
  viewBox="0 0 256 256"
  fill="currentColor"
>
  <path
    d="M213.66 101.66l-80 80a8 8 0 0 1-11.32 0l-80-80A8 8 0 0 1 53.66 90.34L128 164.69l74.34-74.35a8 8 0 0 1 11.32 11.32Z"
  ></path>
</svg>`;

const checkIcon = () => html`<svg
  aria-hidden="true"
  class="size-4 fill-current"
  viewBox="0 0 256 256"
  fill="currentColor"
>
  <path
    d="M229.66 77.66l-128 128a8 8 0 0 1-11.32 0l-56-56a8 8 0 0 1 11.32-11.32L96 188.69 218.34 66.34a8 8 0 0 1 11.32 11.32Z"
  ></path>
</svg>`;

const xIcon = (size: number) => html`<svg
  aria-hidden="true"
  width="${size}"
  height="${size}"
  viewBox="0 0 256 256"
  fill="currentColor"
>
  <path
    d="M205.66 194.34a8 8 0 0 1-11.32 11.32L128 139.31l-66.34 66.35a8 8 0 0 1-11.32-11.32L116.69 128 50.34 61.66a8 8 0 0 1 11.32-11.32L128 116.69l66.34-66.35a8 8 0 0 1 11.32 11.32L139.31 128Z"
  ></path>
</svg>`;

const triggerInputIconStyles: Record<
  ComboboxSize,
  { padding: string; iconSize: number; clearRight: string; caretRight: string }
> = {
  xs: { padding: "pr-7", iconSize: 12, clearRight: "right-5", caretRight: "right-1" },
  sm: { padding: "pr-9", iconSize: 14, clearRight: "right-6", caretRight: "right-1.5" },
  base: { padding: "pr-12", iconSize: 16, clearRight: "right-8", caretRight: "right-2" },
  lg: { padding: "pr-14", iconSize: 18, clearRight: "right-9", caretRight: "right-3" },
};

const triggerValueIconStyles: Record<
  ComboboxSize,
  { padding: string; iconSize: number; iconRight: string }
> = {
  xs: { padding: "pr-5", iconSize: 12, iconRight: "right-1" },
  sm: { padding: "pr-6", iconSize: 14, iconRight: "right-1.5" },
  base: { padding: "pr-8", iconSize: 16, iconRight: "right-2" },
  lg: { padding: "pr-10", iconSize: 18, iconRight: "right-3" },
};

function inputDataAttrs(
  input: Pick<
    ComboboxInput,
    | "autoHighlight"
    | "defaultOpen"
    | "defaultValue"
    | "disabled"
    | "multiple"
    | "name"
    | "openOnFocus"
    | "placeholder"
    | "required"
  >,
) {
  return toAttrs({
    "data-auto-highlight": input.autoHighlight,
    "data-default-open": input.defaultOpen,
    "data-default-value": Array.isArray(input.defaultValue)
      ? JSON.stringify(input.defaultValue)
      : input.defaultValue,
    "data-disabled": input.disabled,
    "data-multiple": input.multiple,
    "data-name": input.name,
    "data-open-on-focus": input.openOnFocus,
    "data-placeholder": input.placeholder,
    "data-required": input.required,
  });
}

function placementDataAttrs(
  input: Pick<
    ComboboxInput,
    "align" | "alignOffset" | "avoidCollisions" | "collisionPadding" | "side" | "sideOffset"
  >,
) {
  return toAttrs({
    "data-align": input.align,
    "data-align-offset": input.alignOffset,
    "data-avoid-collisions": input.avoidCollisions,
    "data-collision-padding": input.collisionPadding,
    "data-side": input.side,
    "data-side-offset": input.sideOffset,
  });
}

export type ComboboxSearchTriggerInput = Omit<
  HTMLElementProps<HTMLInputElement>,
  "className" | "size"
> &
  Record<string, unknown> & {
    clearLabel?: string;
    showOptionsLabel?: string;
    /** Render selected values as removable Badge chips inside the input (multiple mode). */
    multiple?: boolean;
    size?: ComboboxSize;
    variant?: "default" | "error";
    class?: string;
    className?: string;
  };

/** @deprecated Use `ComboboxSearchTriggerInput` instead. */
export type ComboboxTriggerInputInput = ComboboxSearchTriggerInput;

const multipleWrapperStyles: Record<ComboboxSize, string> = {
  xs: "min-h-5 py-0.5",
  sm: "min-h-6.5 py-0.5",
  base: "min-h-9 py-1",
  lg: "min-h-10 py-1.5",
};

export function ComboboxTriggerInput(input: ComboboxSearchTriggerInput = {}) {
  const { binds, attrs: props } = splitBindProps(input);
  const {
    clearLabel = "Clear selection",
    showOptionsLabel = "Show options",
    multiple,
    size = COMBOBOX_DEFAULT_VARIANTS.size,
    variant = "default",
    class: className,
    className: aliasedClassName,
    ...rest
  } = props as ComboboxSearchTriggerInput;
  const iconStyles = triggerInputIconStyles[size];

  const control = multiple
    ? html`<div
          class="${cn(
            inputVariants({ size, variant }),
            "flex h-auto w-full flex-wrap items-center",
            variant === "error"
              ? "focus-within:ring-[1.5px] focus-within:ring-areia-destructive/50"
              : "focus-within:ring-[1.5px] focus-within:ring-areia-ring/50",
            multipleWrapperStyles[size],
            iconStyles.padding,
          )}"
        >
          <div data-slot="combobox-chips" class="contents"></div>
          ${boundVoidElement(
            "input",
            binds,
            ` data-slot="combobox-input" class="min-w-16 flex-1 border-0 bg-transparent p-0 outline-none focus:ring-0 disabled:cursor-not-allowed"${toAttrs(
              rest,
            )} />`,
          )}
        </div>
        <template data-slot="combobox-chip-template">
          <span class="${cn(badgeVariants({ variant: "secondary" }), "gap-1 pr-0.75")}">
            <span data-slot="combobox-chip-label"></span>
            <button
              type="button"
              data-slot="combobox-chip-remove"
              class="flex cursor-pointer rounded-full border-0 bg-transparent p-0.5 hover:bg-areia-control-hover data-disabled:pointer-events-none"
            >
              ${xIcon(10)}
            </button>
          </span>
        </template>`
    : boundVoidElement(
        "input",
        binds,
        ` data-slot="combobox-input" class="${cn(
          inputVariants({ size, variant }),
          "w-full disabled:cursor-not-allowed",
          iconStyles.padding,
        )}"${toAttrs(rest)} />`,
      );

  return html`<div
    class="${cn(
      "relative inline-block w-full max-w-xs has-disabled:cursor-not-allowed has-disabled:opacity-50",
      className,
      aliasedClassName,
    )}"
  >
    ${control}
    <button
      type="button"
      data-slot="combobox-clear"
      aria-label="${clearLabel}"
      class="${cn(
        "absolute top-1/2 hidden -translate-y-1/2 cursor-pointer border-0 bg-transparent p-0 in-data-value:flex data-disabled:pointer-events-none data-disabled:opacity-0",
        iconStyles.clearRight,
      )}"
    >
      ${xIcon(iconStyles.iconSize)}
    </button>
    <button
      type="button"
      data-slot="combobox-trigger"
      aria-label="${showOptionsLabel}"
      class="${cn(
        "absolute top-1/2 m-0 flex -translate-y-1/2 cursor-pointer items-center justify-center border-0 bg-transparent p-0 text-areia-subtle",
        iconStyles.caretRight,
      )}"
    >
      ${caretIcon(iconStyles.iconSize)}
    </button>
  </div>`;
}

export type ComboboxTriggerValueInput = Omit<
  HTMLElementProps<HTMLButtonElement>,
  "className" | "children"
> &
  Record<string, unknown> & {
    placeholder?: unknown;
    size?: ComboboxSize;
    variant?: "default" | "error";
    class?: string;
    className?: string;
  };

export function ComboboxTriggerValue(input: ComboboxTriggerValueInput = {}) {
  const {
    placeholder,
    size = COMBOBOX_DEFAULT_VARIANTS.size,
    variant = "default",
    class: className,
    className: aliasedClassName,
    ...props
  } = input;
  const iconStyles = triggerValueIconStyles[size];

  return html`<button
    type="button"
    data-slot="combobox-trigger"
    class="${cn(
      inputVariants({ size, variant }),
      "relative flex w-full items-center text-left data-disabled:cursor-not-allowed data-disabled:opacity-50 data-placeholder:text-areia-placeholder",
      iconStyles.padding,
      className,
      aliasedClassName,
    )}"
    ${raw(toAttrs(props))}
  >
    <span data-slot="combobox-value">${placeholder}</span>
    <span
      class="${cn(
        "absolute top-1/2 flex -translate-y-1/2 items-center text-areia-subtle",
        iconStyles.iconRight,
      )}"
      >${caretIcon(iconStyles.iconSize)}</span
    >
  </button>`;
}

export type ComboboxContentInput = Omit<
  HTMLElementProps<HTMLDivElement>,
  "className" | "children"
> &
  Pick<
    ComboboxInput,
    "align" | "alignOffset" | "avoidCollisions" | "collisionPadding" | "side" | "sideOffset"
  > &
  Record<string, unknown> & {
    children?: unknown;
    class?: string;
    className?: string;
  };

export function ComboboxContent(input: ComboboxContentInput = {}) {
  const { children, class: className, className: aliasedClassName, ...props } = input;

  return html`<div
    data-slot="combobox-content"
    hidden
    class="${cn(
      "z-50 flex max-h-[min(var(--available-height),24rem)] min-w-(--anchor-width) flex-col rounded-lg bg-areia-background py-1.5 text-areia-default shadow-lg ring ring-areia-divider",
      className,
      aliasedClassName,
    )}"
    ${raw(placementDataAttrs(props))}
    ${raw(toAttrs(props))}
  >
    ${render(children)}
  </div>`;
}

export type ComboboxListInput = Omit<HTMLElementProps<HTMLDivElement>, "className" | "children"> &
  Record<string, unknown> & { children?: unknown; class?: string; className?: string };

export function ComboboxList(input: ComboboxListInput = {}) {
  const { children, class: className, className: aliasedClassName, ...props } = input;
  return html`<div
    data-slot="combobox-list"
    class="${cn(
      "min-h-0 flex-1 overflow-y-auto overscroll-contain scroll-pb-2 scroll-pt-2",
      className,
      aliasedClassName,
    )}"
    ${raw(toAttrs(props))}
  >
    ${render(children)}
  </div>`;
}

export type ComboboxItemInput = Omit<HTMLElementProps<HTMLDivElement>, "className" | "children"> &
  Record<string, unknown> & {
    children?: unknown;
    label?: string;
    value: string;
    class?: string;
    className?: string;
  };

export function ComboboxItem(input: ComboboxItemInput) {
  const {
    children,
    class: className,
    className: aliasedClassName,
    disabled,
    label,
    value,
    ...props
  } = input;
  return html`<div
    data-slot="combobox-item"
    data-value="${value}"
    class="${cn(
      "group mx-1.5 grid cursor-pointer grid-cols-[1fr_16px] gap-2 rounded px-2 py-1.5 text-base data-disabled:cursor-not-allowed data-disabled:text-areia-subtle data-disabled:opacity-60 data-highlighted:bg-areia-control-hover data-disabled:data-highlighted:bg-transparent",
      className,
      aliasedClassName,
    )}"
    ${raw(toAttrs({ ...props, "data-label": label, "data-disabled": disabled, disabled }))}
  >
    <div class="col-start-1">${render(children)}</div>
    <span data-slot="combobox-item-indicator" class="col-start-2 flex items-center"
      >${checkIcon()}</span
    >
  </div>`;
}

export type ComboboxEmptyInput = Omit<HTMLElementProps<HTMLDivElement>, "className" | "children"> &
  Record<string, unknown> & { children?: unknown; class?: string; className?: string };

export function ComboboxEmpty(input: ComboboxEmptyInput = {}) {
  const {
    children = "No options found.",
    class: className,
    className: aliasedClassName,
    ...props
  } = input;
  return html`<div
    data-slot="combobox-empty"
    class="${cn(
      "mx-1.5 shrink-0 px-4 py-2 text-[0.925rem] leading-4 text-areia-subtle empty:m-0 empty:p-0",
      className,
      aliasedClassName,
    )}"
    ${raw(toAttrs(props))}
  >
    ${render(children)}
  </div>`;
}

export type ComboboxGroupInput = Omit<HTMLElementProps<HTMLDivElement>, "className" | "children"> &
  Record<string, unknown> & { children?: unknown; class?: string; className?: string };

export function ComboboxGroup(input: ComboboxGroupInput = {}) {
  const { children, class: className, className: aliasedClassName, ...props } = input;
  return html`<div
    data-slot="combobox-group"
    class="${cn(
      "mt-2 border-t border-areia-divider pt-2 first:mt-0 first:border-t-0 first:pt-0",
      className,
      aliasedClassName,
    )}"
    ${raw(toAttrs(props))}
  >
    ${render(children)}
  </div>`;
}

export type ComboboxGroupLabelInput = Omit<
  HTMLElementProps<HTMLDivElement>,
  "className" | "children"
> &
  Record<string, unknown> & { children?: unknown; class?: string; className?: string };

export function ComboboxGroupLabel(input: ComboboxGroupLabelInput = {}) {
  const { children, class: className, className: aliasedClassName, ...props } = input;
  return html`<div
    data-slot="combobox-label"
    class="${cn(
      "mx-1.5 px-2 py-1.5 text-sm font-medium text-areia-subtle",
      className,
      aliasedClassName,
    )}"
    ${raw(toAttrs(props))}
  >
    ${render(children)}
  </div>`;
}

export type ComboboxSeparatorInput = Omit<HTMLElementProps<HTMLDivElement>, "className"> &
  Record<string, unknown> & { class?: string; className?: string };

export function ComboboxSeparator(input: ComboboxSeparatorInput = {}) {
  const { class: className, className: aliasedClassName, ...props } = input;
  return html`<div
    data-slot="combobox-separator"
    class="${cn("my-1 h-px bg-areia-divider", className, aliasedClassName)}"
    ${raw(toAttrs(props))}
  ></div>`;
}

export type ComboboxSearchInputInput = Omit<
  HTMLElementProps<HTMLInputElement>,
  "className" | "size"
> &
  Record<string, unknown> & {
    size?: ComboboxSize;
    variant?: "default" | "error";
    class?: string;
    className?: string;
  };

/** @deprecated Use `ComboboxSearchInputInput` instead. */
export type ComboboxPopupInputInput = ComboboxSearchInputInput;

export function ComboboxInput(input: ComboboxSearchInputInput = {}) {
  const { binds, attrs: props } = splitBindProps(input);
  const {
    size = COMBOBOX_DEFAULT_VARIANTS.size,
    variant = "default",
    class: className,
    className: aliasedClassName,
    ...rest
  } = props as ComboboxSearchInputInput;
  return boundVoidElement(
    "input",
    binds,
    ` data-slot="combobox-input" class="${cn(
      inputVariants({ size, variant }),
      "mx-1.5 w-[calc(100%-0.75rem)] shrink-0 first:mb-2",
      className,
      aliasedClassName,
    )}"${toAttrs(rest)} />`,
  );
}

export type ComboboxChipInput = Omit<HTMLElementProps<HTMLSpanElement>, "className" | "children"> &
  Record<string, unknown> & {
    children?: unknown;
    removeLabel?: string;
    class?: string;
    className?: string;
  };

export function ComboboxChip(input: ComboboxChipInput = {}) {
  const {
    children,
    removeLabel = "Remove",
    class: className,
    className: aliasedClassName,
    ...props
  } = input;
  return html`<span
    class="${cn(
      "flex h-6 items-center gap-2.5 rounded-sm bg-areia-surface-muted py-0 pl-2 pr-0.75 text-sm ring-1 ring-areia-divider",
      className,
      aliasedClassName,
    )}"
    ${raw(toAttrs(props))}
  >
    ${render(children)}
    <button
      type="button"
      aria-label="${removeLabel}"
      class="flex cursor-pointer rounded-md border-0 bg-transparent p-1 hover:bg-areia-control-hover"
    >
      ${xIcon(10)}
    </button>
  </span>`;
}

function renderItems(items: ComboboxItems) {
  if (Array.isArray(items)) {
    return items.map((item) =>
      ComboboxItem({ value: item.value, disabled: item.disabled, children: item.label }),
    );
  }

  return Object.entries(items).flatMap(([value, item]) => {
    if (item === null || item === undefined) return [];
    const descriptor =
      typeof item === "object" && !Array.isArray(item) && "label" in item ? item : undefined;
    return ComboboxItem({
      value,
      disabled: descriptor && "disabled" in descriptor ? Boolean(descriptor.disabled) : false,
      children: descriptor ? descriptor.label : item,
    });
  });
}

function comboboxInputBinds(binds: Partial<Record<string, unknown>>) {
  const { "bind:open": _o, "bind:group": _g, "bind:value": _v, ...rest } = binds;
  return rest;
}

/** Coalesce `bind:value` into `bind:group` so the group-bind helpers see the selection bind. */
function withSelectionBind<T extends Record<string, unknown>>(input: T): Record<string, unknown> {
  if (input["bind:group"] != null || input["bind:value"] == null) return input;
  return { ...input, "bind:group": input["bind:value"] };
}

function renderCombobox(input: ComboboxInput, children?: unknown[]) {
  const { binds, attrs } = splitBindProps(input);
  // Open/selection binds stay off the template — createOpenBindSync /
  // createGroupBindSync bridge them. A template bind remorphs this island when
  // those signals change; while the list is portaled that recreates items in the
  // empty host slot and duplicates them after restore.
  const inputBinds = comboboxInputBinds(binds);

  const {
    autoHighlight,
    class: className,
    className: aliasedClassName,
    children: inputChildren,
    defaultOpen: defaultOpenProp,
    defaultValue: defaultValueProp,
    description: _description,
    disabled,
    error,
    filter: _filter,
    id,
    inputSide,
    itemToStringValue: _itemToStringValue,
    items,
    label: _label,
    labelTooltip: _labelTooltip,
    multiple,
    name,
    onInputValueChange: _onInputValueChange,
    onOpenChange: _onOpenChange,
    onValueChange: _onValueChange,
    openOnFocus,
    placeholder,
    required,
    size = COMBOBOX_DEFAULT_VARIANTS.size,
    variant: _variant,
    align,
    alignOffset,
    avoidCollisions,
    collisionPadding,
    side,
    sideOffset,
    ...inputPassthrough
  } = attrs as ComboboxInput;
  // Read bind defaults without tracking — a tracked read re-renders (and remorphs)
  // on every selection change. While the list is portaled, that remorph recreates
  // items in the empty host slot and duplicates the popup contents after restore.
  const defaultOpen = untrack(() => openBindDefault(input, defaultOpenProp));
  const defaultValue = untrack(
    () =>
      groupBindDefault(withSelectionBind(input), defaultValueProp) as string | string[] | undefined,
  );
  const variant = error ? "error" : "default";
  const normalizedError = normalizeError(error);
  const describedBy =
    typeof inputPassthrough["aria-describedby"] === "string"
      ? inputPassthrough["aria-describedby"]
      : undefined;
  const placementProps = {
    align,
    alignOffset,
    avoidCollisions,
    collisionPadding,
    side,
    sideOffset,
  };
  const content = children ?? (items ? renderItems(items) : inputChildren);

  const inner = html`${ComboboxTriggerInput({
    ...inputPassthrough,
    ...inputBinds,
    id,
    multiple,
    name,
    placeholder,
    disabled,
    required,
    size,
    variant: variant as "default" | "error",
    "aria-invalid": normalizedError != null ? "true" : inputPassthrough["aria-invalid"],
    "aria-describedby": describedBy || undefined,
  })}
  ${ComboboxContent({
    ...placementProps,
    children: ComboboxList({ children: [ComboboxEmpty(), content] }),
  })}`;

  const openSuffix = ` data-slot="combobox" class="${cn(
    "relative w-full",
    comboboxVariants({ inputSide }),
    className,
    aliasedClassName,
  )}"${inputDataAttrs({
    autoHighlight,
    defaultOpen,
    defaultValue,
    disabled,
    multiple,
    name,
    openOnFocus,
    placeholder,
    required,
  })}${placementDataAttrs(placementProps)}`;

  return boundElement("div", {}, openSuffix, inner);
}

function renderField(input: ComboboxInput, children?: unknown[]) {
  const { label, labelTooltip: _labelTooltip, description, error } = input;
  const normalizedError = normalizeError(error);
  const control = renderCombobox(input, children);

  if (label == null && description == null && normalizedError == null) return control;

  return Field.Static({
    label,
    description,
    error: normalizedError,
    invalid: normalizedError != null,
    children: control,
  });
}

export const ComboboxRoot = ilha((input: ComboboxInput) => {
  let host: Element;
  const hostRef = state<Element | null>(null);

  const openChange = action((open: boolean) => {
    getBindBridge(host, "open")?.onUserChange(open);
  });
  const valueChange = action((value: string | string[] | null) => {
    getBindBridge(host, "value")?.onUserChange(value);
  });

  effect.once(({ host: __host }) => {
    host = __host;
    hostRef(__host);

    const root = host.matches('[data-slot="combobox"]')
      ? host
      : host.querySelector('[data-slot="combobox"]');
    if (!root) return;

    disposeBindBridge(host);

    const selectionInput = withSelectionBind(input);

    stampMorphPreserve(root, MORPH_CONTROLLER_STYLE);
    const controller = ComboboxPrimitive.createCombobox(root, {
      align: input.align,
      alignOffset: input.alignOffset,
      autoHighlight: input.autoHighlight,
      avoidCollisions: input.avoidCollisions,
      collisionPadding: input.collisionPadding,
      defaultOpen: openBindDefault(input, input.defaultOpen),
      defaultValue:
        (groupBindDefault(selectionInput, input.defaultValue) as string | string[] | undefined) ??
        undefined,
      disabled: input.disabled,
      filter: input.filter,
      itemToStringValue: input.itemToStringValue,
      multiple: input.multiple,
      name: input.name,
      onInputValueChange: input.onInputValueChange,
      onOpenChange: (open) => openChange(open),
      onValueChange: (value) => valueChange(value),
      openOnFocus: input.openOnFocus,
      placeholder: input.placeholder,
      required: input.required,
      side: input.side,
      sideOffset: input.sideOffset,
      onPortalMounted: input.onPortalMounted,
    });

    createBindBridge(
      host,
      "open",
      openBindSource(input, controller, {
        onUserChange: (open) => input.onOpenChange?.(open),
      }),
    );
    createBindBridge(
      host,
      "value",
      groupBindSource(
        selectionInput,
        {
          getValue: () => (input.multiple ? [...controller.values] : controller.value),
          setValue: (value) => {
            if (value == null) controller.clear();
            else controller.setValues(Array.isArray(value) ? value : [value]);
          },
        },
        {
          mode: input.multiple ? "multiple" : "single",
          onUserChange: (value) =>
            (input.onValueChange as ComboboxPrimitive.ComboboxOptions["onValueChange"])?.(value),
        },
      ),
    );

    const bindTarget =
      root.querySelector<HTMLElement>('[data-slot="combobox-input"]') ??
      root.querySelector<HTMLElement>('[data-slot="combobox"]');
    const cleanupThis = applyThisBind(bindTarget, input);

    return () => {
      cleanupThis?.();
      disposeBindBridge(host);
    };
  });

  effect(() => {
    getBindBridge(hostRef() ?? host, "open")?.applyFromSignal();
    getBindBridge(hostRef() ?? host, "value")?.applyFromSignal();
  });

  return renderField(input);
});

function ComboboxBase(children: unknown[]): ReturnType<typeof html>;
function ComboboxBase(input?: ComboboxInput, children?: unknown[]): ReturnType<typeof html>;
function ComboboxBase(inputOrChildren: ComboboxInput | unknown[] = {}, children?: unknown[]) {
  const input = Array.isArray(inputOrChildren) ? {} : inputOrChildren;
  const optionChildren = Array.isArray(inputOrChildren) ? inputOrChildren : children;
  return renderField(input, optionChildren);
}

export const Combobox = Object.assign(ComboboxRoot, {
  Root: ComboboxRoot,
  Static: ComboboxBase,
  TriggerInput: ComboboxTriggerInput,
  TriggerValue: ComboboxTriggerValue,
  Content: ComboboxContent,
  Input: ComboboxInput,
  Empty: ComboboxEmpty,
  List: ComboboxList,
  Item: ComboboxItem,
  Group: ComboboxGroup,
  GroupLabel: ComboboxGroupLabel,
  Separator: ComboboxSeparator,
  Chip: ComboboxChip,
});
