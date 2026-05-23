import ilha, { html, raw } from "ilha";
import { cn } from "$lib/cn";
import { toAttrs } from "$lib/input";
import type { HTMLElementProps } from "$lib/types";
import { INPUT_DEFAULT_VARIANTS, INPUT_VARIANTS, inputVariants } from "$components/input";
import { Field } from "$components/field";

/** Autocomplete variant definitions. */
export const AUTOCOMPLETE_VARIANTS = {
  size: INPUT_VARIANTS.size,
} as const;

export const AUTOCOMPLETE_DEFAULT_VARIANTS = {
  size: INPUT_DEFAULT_VARIANTS.size,
} as const;

export type AutocompleteSize = keyof typeof AUTOCOMPLETE_VARIANTS.size;

export interface AutocompleteVariantsProps {
  /** Size of the autocomplete input. Matches Input component sizes. */
  size?: AutocompleteSize;
}

type Renderable = unknown;

type VariantConfig = Record<string, { classes: string }>;

function render(value: Renderable): string {
  if (value === null || value === undefined || value === false) return "";
  if (Array.isArray(value)) return value.map(render).join("");
  if (typeof value === "object" && "value" in value && typeof value.value === "string") {
    return value.value;
  }
  return String(value);
}

function resolveVariant<TVariants extends VariantConfig, TKey extends keyof TVariants>(
  variants: TVariants,
  value: TKey | undefined,
  fallback: TKey,
) {
  return variants[value ?? fallback] ?? variants[fallback];
}

export function autocompleteVariants({
  size = AUTOCOMPLETE_DEFAULT_VARIANTS.size,
}: AutocompleteVariantsProps = {}) {
  return cn(
    resolveVariant(AUTOCOMPLETE_VARIANTS.size, size, AUTOCOMPLETE_DEFAULT_VARIANTS.size).classes,
  );
}

export type AutocompleteItemDescriptor = {
  /** Display label for the suggestion. */
  label: unknown;
  /** Text inserted into the input when the suggestion is chosen. */
  value: string;
  /** When true, the suggestion cannot be chosen. */
  disabled?: boolean;
};

export type AutocompleteItems =
  | string[]
  | AutocompleteItemDescriptor[]
  | Record<string, unknown | { label: unknown; disabled?: boolean }>;

export type AutocompleteError = unknown | { message: unknown; match?: unknown };

export type AutocompleteInput = Omit<HTMLElementProps<HTMLDivElement>, "className" | "children"> &
  AutocompleteVariantsProps &
  Record<string, unknown> & {
    /** Suggestions shown as the user types. Free-form values remain valid. */
    items?: AutocompleteItems;
    /** Controlled input value. */
    value?: string | number;
    /** Initial input value. */
    defaultValue?: string | number;
    /** Called by `Autocomplete.Root` when the text input changes or a suggestion is picked. */
    onValueChange?: (value: string) => void;
    /** Called by `Autocomplete.Root` when the suggestion popup opens or closes. */
    onOpenChange?: (open: boolean) => void;
    /** Custom children. Defaults to InputGroup + Content from `items`. */
    children?: unknown;
    /** Label content. Enables the field wrapper. */
    label?: unknown;
    /** Tooltip text displayed next to the label. */
    labelTooltip?: string;
    /** Helper text displayed below the field. */
    description?: unknown;
    /** Error message. */
    error?: AutocompleteError;
    /** Placeholder text for the text input. */
    placeholder?: string;
    /** Disable interaction. */
    disabled?: boolean;
    /** Form validation required. */
    required?: boolean;
    /** Open suggestions when the input receives focus, even before typing. */
    openOnFocus?: boolean;
    /** Maximum suggestions rendered from `items`. */
    maxItems?: number;
    /** Case-insensitive substring filter for built-in `items`. Defaults to true. */
    filter?: boolean | ((item: AutocompleteItemDescriptor, query: string) => boolean);
    /** Additional classes applied to the autocomplete root. */
    class?: string;
    className?: string;
    /** Additional classes applied to the input. */
    inputClass?: string;
    inputClassName?: string;
  };

function normalizeError(error: AutocompleteError): unknown {
  if (error && typeof error === "object" && "message" in error) return error.message;
  return error;
}

function normalizeItems(items: AutocompleteItems | undefined): AutocompleteItemDescriptor[] {
  if (!items) return [];
  if (Array.isArray(items)) {
    return items.map((item) => (typeof item === "string" ? { value: item, label: item } : item));
  }
  return Object.entries(items).flatMap(([value, item]) => {
    if (item === null || item === undefined) return [];
    if (typeof item === "object" && !Array.isArray(item) && "label" in item) {
      return [
        { value, label: item.label, disabled: "disabled" in item ? Boolean(item.disabled) : false },
      ];
    }
    return [{ value, label: item, disabled: false }];
  });
}

function filterItems(items: AutocompleteItemDescriptor[], input: AutocompleteInput) {
  const query = String(input.value ?? input.defaultValue ?? "");
  const filter = input.filter ?? true;
  const filtered =
    typeof filter === "function"
      ? items.filter((item) => filter(item, query))
      : filter
        ? items.filter((item) => item.value.toLowerCase().includes(query.toLowerCase()))
        : items;
  return filtered.slice(0, input.maxItems ?? filtered.length);
}

function checkIcon() {
  return html`<svg
    aria-hidden="true"
    class="size-3.5"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2.5"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <path d="M20 6 9 17l-5-5"></path>
  </svg>`;
}

export type AutocompleteInputGroupInput = Omit<
  HTMLElementProps<HTMLInputElement>,
  "className" | "children" | "size"
> &
  AutocompleteVariantsProps &
  Record<string, unknown> & {
    class?: string;
    className?: string;
  };

export function AutocompleteInputGroup(input: AutocompleteInputGroupInput = {}) {
  const {
    class: className,
    className: aliasedClassName,
    size = AUTOCOMPLETE_DEFAULT_VARIANTS.size,
    ...props
  } = input;

  return html`<input
    data-slot="autocomplete-input"
    class="${cn(
      inputVariants({ size, focusIndicator: true }),
      "w-full",
      className,
      aliasedClassName,
    )}"
    autocomplete="off"
    ${raw(toAttrs(props))}
  />`;
}

export type AutocompleteContentInput = Omit<
  HTMLElementProps<HTMLDivElement>,
  "className" | "children"
> &
  Record<string, unknown> & {
    children?: unknown;
    class?: string;
    className?: string;
  };

export function AutocompleteContent(input: AutocompleteContentInput = {}) {
  const { children, class: className, className: aliasedClassName, ...props } = input;
  return html`<div
    data-slot="autocomplete-content"
    hidden
    class="${cn(
      "absolute top-[calc(100%+0.25rem)] left-0 z-50 flex max-h-96 w-full min-w-48 flex-col rounded-lg bg-areia-background py-1.5 text-areia-default shadow-lg ring ring-areia-divider",
      className,
      aliasedClassName,
    )}"
    ${raw(toAttrs(props))}
  >
    ${raw(render(children))}
  </div>`;
}

export type AutocompleteListInput = Omit<
  HTMLElementProps<HTMLDivElement>,
  "className" | "children"
> &
  Record<string, unknown> & { children?: unknown; class?: string; className?: string };

export function AutocompleteList(input: AutocompleteListInput = {}) {
  const { children, class: className, className: aliasedClassName, ...props } = input;
  return html`<div
    data-slot="autocomplete-list"
    class="${cn(
      "min-h-0 flex-1 overflow-y-auto overscroll-contain scroll-pb-2 scroll-pt-2",
      className,
      aliasedClassName,
    )}"
    ${raw(toAttrs(props))}
  >
    ${raw(render(children))}
  </div>`;
}

export type AutocompleteItemInput = Omit<
  HTMLElementProps<HTMLDivElement>,
  "className" | "children"
> &
  Record<string, unknown> & {
    children?: unknown;
    value: string;
    disabled?: boolean;
    class?: string;
    className?: string;
  };

export function AutocompleteItem(input: AutocompleteItemInput) {
  const {
    children,
    value,
    disabled,
    class: className,
    className: aliasedClassName,
    ...props
  } = input;
  return html`<div
    data-slot="autocomplete-item"
    data-value="${value}"
    class="${cn(
      "group mx-1.5 grid cursor-pointer grid-cols-[1fr_16px] gap-2 rounded px-2 py-1.5 text-base data-disabled:cursor-not-allowed data-disabled:text-areia-subtle data-disabled:opacity-60 data-highlighted:bg-areia-control-hover data-selected:font-medium",
      className,
      aliasedClassName,
    )}"
    ${raw(toAttrs({ ...props, "data-disabled": disabled, disabled }))}
  >
    <div class="col-start-1">${raw(render(children))}</div>
    <span
      data-slot="autocomplete-item-indicator"
      class="col-start-2 hidden items-center group-data-selected:flex"
    >
      ${checkIcon()}
    </span>
  </div>`;
}

export type AutocompleteEmptyInput = Omit<
  HTMLElementProps<HTMLDivElement>,
  "className" | "children"
> &
  Record<string, unknown> & { children?: unknown; class?: string; className?: string };

export function AutocompleteEmpty(input: AutocompleteEmptyInput = {}) {
  const {
    children = "No suggestions found.",
    class: className,
    className: aliasedClassName,
    ...props
  } = input;
  return html`<div
    data-slot="autocomplete-empty"
    class="${cn(
      "mx-1.5 shrink-0 px-4 py-2 text-[0.925rem] leading-4 text-areia-subtle",
      className,
      aliasedClassName,
    )}"
    ${raw(toAttrs(props))}
  >
    ${raw(render(children))}
  </div>`;
}

export type AutocompleteGroupInput = Omit<
  HTMLElementProps<HTMLDivElement>,
  "className" | "children"
> &
  Record<string, unknown> & { children?: unknown; class?: string; className?: string };

export function AutocompleteGroup(input: AutocompleteGroupInput = {}) {
  const { children, class: className, className: aliasedClassName, ...props } = input;
  return html`<div
    data-slot="autocomplete-group"
    class="${cn(
      "mt-2 border-t border-areia-divider pt-2 first:mt-0 first:border-t-0 first:pt-0",
      className,
      aliasedClassName,
    )}"
    ${raw(toAttrs(props))}
  >
    ${raw(render(children))}
  </div>`;
}

export type AutocompleteGroupLabelInput = Omit<
  HTMLElementProps<HTMLDivElement>,
  "className" | "children"
> &
  Record<string, unknown> & { children?: unknown; class?: string; className?: string };

export function AutocompleteGroupLabel(input: AutocompleteGroupLabelInput = {}) {
  const { children, class: className, className: aliasedClassName, ...props } = input;
  return html`<div
    data-slot="autocomplete-group-label"
    class="${cn(
      "mx-1.5 px-2 py-1.5 text-sm font-medium text-areia-subtle",
      className,
      aliasedClassName,
    )}"
    ${raw(toAttrs(props))}
  >
    ${raw(render(children))}
  </div>`;
}

export type AutocompleteSeparatorInput = Omit<
  HTMLElementProps<HTMLDivElement>,
  "className" | "children"
> &
  Record<string, unknown> & { class?: string; className?: string };

export function AutocompleteSeparator(input: AutocompleteSeparatorInput = {}) {
  const { class: className, className: aliasedClassName, ...props } = input;
  return html`<div
    data-slot="autocomplete-separator"
    class="${cn("mx-0 my-1 h-px bg-areia-divider", className, aliasedClassName)}"
    ${raw(toAttrs(props))}
  ></div>`;
}

function renderItems(items: AutocompleteItemDescriptor[]) {
  if (!items.length) return AutocompleteEmpty();
  return items.map((item) =>
    AutocompleteItem({ value: item.value, disabled: item.disabled, children: item.label }),
  );
}

function renderAutocomplete(input: AutocompleteInput = {}, children?: unknown[]) {
  const {
    children: inputChildren,
    class: className,
    className: aliasedClassName,
    defaultValue,
    disabled,
    error,
    filter: _filter,
    inputClass,
    inputClassName,
    items,
    label: _label,
    labelTooltip: _labelTooltip,
    maxItems: _maxItems,
    onOpenChange: _onOpenChange,
    onValueChange: _onValueChange,
    openOnFocus,
    placeholder,
    required,
    size = AUTOCOMPLETE_DEFAULT_VARIANTS.size,
    value,
    ...rootProps
  } = input;
  const normalizedError = normalizeError(error);
  const content =
    children ??
    inputChildren ??
    AutocompleteContent({
      children: AutocompleteList({
        children: renderItems(filterItems(normalizeItems(items), input)),
      }),
    });

  return html`<div
    data-slot="autocomplete"
    data-open-on-focus="${openOnFocus ? "true" : "false"}"
    class="${cn("relative w-full", className, aliasedClassName)}"
    ${raw(toAttrs(rootProps))}
  >
    ${AutocompleteInputGroup({
      id: typeof rootProps.id === "string" ? rootProps.id : undefined,
      value: value == null ? undefined : String(value),
      defaultValue: defaultValue == null ? undefined : String(defaultValue),
      disabled,
      required,
      placeholder,
      size,
      class: inputClass,
      className: inputClassName,
      "aria-invalid": normalizedError ? "true" : rootProps["aria-invalid"],
    })}
    ${raw(render(content))}
  </div>`;
}

function renderField(input: AutocompleteInput, children?: unknown[]) {
  const { label, labelTooltip: _labelTooltip, description, error } = input;
  const normalizedError = normalizeError(error);
  const control = renderAutocomplete(input, children);

  if (label == null && description == null && normalizedError == null) return control;

  return Field.Static({
    label,
    description,
    error: normalizedError,
    invalid: normalizedError != null,
    children: control,
  });
}

function setOpen(root: Element, open: boolean, input: AutocompleteInput) {
  const content = root.querySelector<HTMLElement>('[data-slot="autocomplete-content"]');
  if (!content) return;
  content.hidden = !open || !content.querySelector('[data-slot="autocomplete-item"]');
  input.onOpenChange?.(!content.hidden);
  root.dispatchEvent(
    new CustomEvent("autocomplete:open-change", {
      bubbles: true,
      detail: { open: !content.hidden },
    }),
  );
}

function syncItems(root: Element, input: AutocompleteInput, query: string) {
  const list = root.querySelector<HTMLElement>('[data-slot="autocomplete-list"]');
  if (!list || !input.items) return;
  const nextInput = { ...input, value: query };
  list.innerHTML = render(renderItems(filterItems(normalizeItems(input.items), nextInput)));
  root.querySelectorAll<HTMLElement>('[data-slot="autocomplete-item"]').forEach((item) => {
    item.removeAttribute("data-highlighted");
    item.removeAttribute("data-selected");
  });
}

export const AutocompleteRoot = ilha
  .input<AutocompleteInput>()
  .onMount(({ host, input }) => {
    const root = host.matches('[data-slot="autocomplete"]')
      ? host
      : host.querySelector('[data-slot="autocomplete"]');
    if (!root) return;

    const textInput = root.querySelector<HTMLInputElement>('[data-slot="autocomplete-input"]');
    if (!textInput) return;

    const highlight = (item: HTMLElement | undefined) => {
      root
        .querySelectorAll<HTMLElement>('[data-slot="autocomplete-item"]')
        .forEach((element) => element.removeAttribute("data-highlighted"));
      item?.setAttribute("data-highlighted", "");
    };

    const handleInput = () => {
      const value = textInput.value;
      syncItems(root, input, value);
      input.onValueChange?.(value);
      root.dispatchEvent(
        new CustomEvent("autocomplete:value-change", { bubbles: true, detail: { value } }),
      );
      setOpen(root, true, input);
    };

    const handleFocus = () => {
      if (input.openOnFocus) setOpen(root, true, input);
    };

    const handleClick = (event: Event) => {
      const target = event.target as HTMLElement | null;
      const item = target?.closest<HTMLElement>('[data-slot="autocomplete-item"]');
      if (!item || !root.contains(item) || item.hasAttribute("data-disabled")) return;
      const value = item.dataset["value"] ?? "";
      textInput.value = value;
      root
        .querySelectorAll<HTMLElement>('[data-slot="autocomplete-item"]')
        .forEach((element) => element.toggleAttribute("data-selected", element === item));
      input.onValueChange?.(value);
      root.dispatchEvent(
        new CustomEvent("autocomplete:value-change", { bubbles: true, detail: { value } }),
      );
      setOpen(root, false, input);
      textInput.focus();
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      const items = Array.from(
        root.querySelectorAll<HTMLElement>('[data-slot="autocomplete-item"]:not([data-disabled])'),
      );
      const current = root.querySelector<HTMLElement>(
        '[data-slot="autocomplete-item"][data-highlighted]',
      );
      const index = current ? items.indexOf(current) : -1;
      if (event.key === "ArrowDown") {
        event.preventDefault();
        setOpen(root, true, input);
        highlight(items[Math.min(index + 1, items.length - 1)] ?? items[0]);
      }
      if (event.key === "ArrowUp") {
        event.preventDefault();
        setOpen(root, true, input);
        highlight(items[Math.max(index - 1, 0)] ?? items[items.length - 1]);
      }
      if (event.key === "Enter" && current) {
        event.preventDefault();
        current.click();
      }
      if (event.key === "Escape") setOpen(root, false, input);
    };

    const handleDocumentPointerDown = (event: PointerEvent) => {
      if (!root.contains(event.target as Node | null)) setOpen(root, false, input);
    };

    textInput.addEventListener("input", handleInput);
    textInput.addEventListener("focus", handleFocus);
    textInput.addEventListener("keydown", handleKeyDown);
    root.addEventListener("click", handleClick);
    document.addEventListener("pointerdown", handleDocumentPointerDown);

    return () => {
      textInput.removeEventListener("input", handleInput);
      textInput.removeEventListener("focus", handleFocus);
      textInput.removeEventListener("keydown", handleKeyDown);
      root.removeEventListener("click", handleClick);
      document.removeEventListener("pointerdown", handleDocumentPointerDown);
    };
  })
  .render(({ input }) => renderField(input));

function AutocompleteBase(children: unknown[]): ReturnType<typeof html>;
function AutocompleteBase(input?: AutocompleteInput, children?: unknown[]): ReturnType<typeof html>;
function AutocompleteBase(
  inputOrChildren: AutocompleteInput | unknown[] = {},
  children?: unknown[],
) {
  const input = Array.isArray(inputOrChildren) ? {} : inputOrChildren;
  const optionChildren = Array.isArray(inputOrChildren) ? inputOrChildren : children;
  return renderField(input, optionChildren);
}

export const Autocomplete = Object.assign(AutocompleteRoot, {
  Root: AutocompleteRoot,
  Static: AutocompleteBase,
  InputGroup: AutocompleteInputGroup,
  Content: AutocompleteContent,
  List: AutocompleteList,
  Item: AutocompleteItem,
  Empty: AutocompleteEmpty,
  Group: AutocompleteGroup,
  GroupLabel: AutocompleteGroupLabel,
  Separator: AutocompleteSeparator,
});
