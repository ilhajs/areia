import ilha, { html, raw } from "ilha";
import { Switch as SwitchPrimitive } from "@areia/slots";
import {
  boundVoidElement,
  createCheckedBindSync,
  splitBindProps,
  subscribeBindProps,
  type IlhaBindProps,
} from "$lib/binds";
import { cn } from "$lib/cn";
import { render } from "$lib/markup";
import { toAttrs } from "$lib/input";
import type { HTMLElementProps } from "$lib/types";
import { Label } from "$components/label";

/** Switch size and variant definitions mapping names to their Tailwind classes. */
export const SWITCH_VARIANTS = {
  size: {
    sm: {
      classes: "h-4 w-8",
      thumbClasses: "size-4 data-checked:translate-x-4",
      description: "Small switch for compact UIs",
    },
    base: {
      classes: "h-4.5 w-9",
      thumbClasses: "size-4.5 data-checked:translate-x-4.5",
      description: "Default switch size",
    },
    lg: {
      classes: "h-5 w-10",
      thumbClasses: "size-5 data-checked:translate-x-5",
      description: "Large switch for prominent toggles",
    },
  },
  variant: {
    default: {
      classes:
        "data-checked:bg-areia-primary data-checked:ring-areia-primary data-unchecked:bg-areia-surface-muted data-unchecked:ring-areia-surface-muted bg-areia-surface-muted ring-areia-surface-muted",
      thumbClasses: "bg-areia-background data-checked:bg-areia-primary-foreground",
      description: "Default switch with brand color",
    },
    neutral: {
      classes:
        "data-checked:bg-areia-foreground data-checked:ring-areia-foreground data-unchecked:bg-areia-surface-muted data-unchecked:ring-areia-surface-muted bg-areia-surface-muted ring-areia-surface-muted",
      thumbClasses: "bg-areia-background data-checked:bg-areia-background",
      description: "Monochrome switch for subtle toggles",
    },
  },
} as const;

export const SWITCH_DEFAULT_VARIANTS = {
  size: "base",
  variant: "default",
} as const;

export type SwitchSize = keyof typeof SWITCH_VARIANTS.size;
export type SwitchVariant = keyof typeof SWITCH_VARIANTS.variant;

export interface SwitchVariantsProps {
  /** Switch size. */
  size?: SwitchSize;
  /** Visual variant. */
  variant?: SwitchVariant;
}

type VariantConfig = Record<string, { classes: string; thumbClasses?: string }>;
function resolveVariant<TVariants extends VariantConfig, TKey extends keyof TVariants>(
  variants: TVariants,
  value: TKey | undefined,
  fallback: TKey,
) {
  return variants[value ?? fallback] ?? variants[fallback];
}

function sizeConfig(size: SwitchSize) {
  return resolveVariant(SWITCH_VARIANTS.size, size, SWITCH_DEFAULT_VARIANTS.size);
}

function variantConfig(variant: SwitchVariant) {
  return resolveVariant(SWITCH_VARIANTS.variant, variant, SWITCH_DEFAULT_VARIANTS.variant);
}

export function switchVariants({
  size = SWITCH_DEFAULT_VARIANTS.size,
  variant = SWITCH_DEFAULT_VARIANTS.variant,
}: SwitchVariantsProps = {}) {
  return cn(sizeConfig(size).classes, variantConfig(variant).classes);
}

export function switchThumbVariants({
  size = SWITCH_DEFAULT_VARIANTS.size,
  variant = SWITCH_DEFAULT_VARIANTS.variant,
}: SwitchVariantsProps = {}) {
  return cn(sizeConfig(size).thumbClasses, variantConfig(variant).thumbClasses);
}

type SwitchControlInput = Omit<HTMLElementProps<HTMLSpanElement>, "className" | "children"> &
  SwitchVariantsProps &
  Record<string, unknown> & {
    checked?: boolean;
    defaultChecked?: boolean;
    disabled?: boolean;
    readOnly?: boolean;
    required?: boolean;
    name?: string;
    value?: string;
    uncheckedValue?: string;
    transitioning?: boolean;
    class?: string;
    className?: string;
  };

export type SwitchInput = Omit<SwitchControlInput, "className" | "children"> &
  IlhaBindProps &
  Record<string, unknown> & {
    /** Label content for the switch. */
    label?: unknown;
    /** Tooltip content displayed next to the label. */
    labelTooltip?: string;
    /** When true, switch appears before label. When false, label appears before switch. */
    controlFirst?: boolean;
    /** Callback fired by `Switch.Root` when checked state changes. */
    onCheckedChange?: (checked: boolean) => void;
    className?: string;
  };

function dataAttrs(
  input: Pick<
    SwitchControlInput,
    "defaultChecked" | "disabled" | "readOnly" | "required" | "name" | "value" | "uncheckedValue"
  >,
) {
  return toAttrs({
    "data-default-checked": input.defaultChecked,
    "data-disabled": input.disabled,
    "data-read-only": input.readOnly,
    "data-required": input.required,
    "data-name": input.name,
    "data-value": input.value,
    "data-unchecked-value": input.uncheckedValue,
  });
}

function SwitchControl(input: SwitchControlInput = {}, autoBind = false) {
  const { binds, attrs: restProps } = splitBindProps(input);
  const {
    checked,
    defaultChecked,
    disabled,
    readOnly,
    required,
    name,
    value,
    uncheckedValue,
    transitioning,
    size = SWITCH_DEFAULT_VARIANTS.size,
    variant = SWITCH_DEFAULT_VARIANTS.variant,
    class: className,
    className: aliasedClassName,
    id,
    form,
    role,
    tabIndex,
    tabindex,
    "aria-checked": ariaChecked,
    "aria-disabled": ariaDisabled,
    "aria-readonly": ariaReadonly,
    "aria-required": ariaRequired,
    "aria-busy": ariaBusy,
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledby,
    "aria-describedby": ariaDescribedby,
    ...inputRest
  } = restProps as SwitchControlInput;

  const resolvedChecked = Boolean(checked ?? defaultChecked);
  const hasCheckedBind = binds["bind:checked"] != null || binds["bind:group"] != null;

  return html`<span
    data-slot="switch"
    class="${cn(
      "relative inline-flex shrink-0 cursor-pointer items-center border-0 p-0 ring outline-none",
      "rounded-[5px] supports-[corner-shape:squircle]:rounded-[10px] [corner-shape:squircle]",
      "transition-colors duration-150 ease-out motion-reduce:transition-none",
      "focus-visible:ring-2 focus-visible:ring-areia-ring",
      "data-disabled:cursor-not-allowed data-disabled:opacity-50 data-readonly:cursor-default",
      switchVariants({ size, variant }),
      className,
      aliasedClassName,
    )}"
    ${raw(
      dataAttrs({
        defaultChecked: checked ?? defaultChecked,
        disabled,
        readOnly,
        required,
        name,
        value,
        uncheckedValue: typeof uncheckedValue === "string" ? uncheckedValue : undefined,
      }),
    )}
    ${raw(
      toAttrs({
        role: role ?? "switch",
        tabindex: disabled ? -1 : (tabindex ?? tabIndex ?? 0),
        "aria-checked": ariaChecked ?? (resolvedChecked ? "true" : "false"),
        "aria-disabled": ariaDisabled ?? (disabled ? "true" : undefined),
        "aria-readonly": ariaReadonly ?? (readOnly ? "true" : undefined),
        "aria-required": ariaRequired ?? (required ? "true" : undefined),
        "aria-busy": ariaBusy ?? (transitioning ? "true" : undefined),
        "aria-label": ariaLabel,
        "aria-labelledby": ariaLabelledby,
        "aria-describedby": ariaDescribedby,
        "data-areia-switch": autoBind ? "" : undefined,
      }),
    )}
  >
    ${boundVoidElement(
      "input",
      binds,
      ` type="checkbox" data-slot="switch-input" class="sr-only peer" data-switch-generated="input"${toAttrs(
        {
          ...inputRest,
          id,
          name,
          value,
          form,
          required,
          disabled,
          ...(hasCheckedBind ? {} : { checked: resolvedChecked }),
        },
      )} />`,
    )}
    <span
      data-slot="switch-thumb"
      class="${cn(
        "pointer-events-none absolute top-0 bottom-0 block shadow-xs",
        "rounded-[5px] supports-[corner-shape:squircle]:rounded-[10px] [corner-shape:squircle]",
        "transition-transform duration-150 ease-out motion-reduce:transition-none",
        switchThumbVariants({ size, variant }),
      )}"
    ></span>
  </span>`;
}

function renderSwitch(input: SwitchInput = {}, autoBind = false) {
  const {
    label,
    labelTooltip,
    controlFirst = true,
    required,
    disabled,
    id,
    onCheckedChange: _onCheckedChange,
    ...controlProps
  } = input;
  const controlId = typeof id === "string" ? id : undefined;
  const ariaLabel = controlProps["aria-label"] ?? (typeof label === "string" ? label : "Switch");
  const control = SwitchControl(
    {
      ...controlProps,
      id: controlId,
      disabled: Boolean(disabled),
      required: typeof required === "boolean" ? required : undefined,
      "aria-label": ariaLabel,
    },
    autoBind,
  );

  if (label == null) return control;

  return html`<label
    data-slot="switch-item"
    class="${cn(
      "inline-flex items-center gap-2 text-base text-areia-default",
      controlFirst ? "flex-row" : "flex-row-reverse justify-end",
      disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
    )}"
  >
    ${control}
    ${Label({
      asContent: true,
      label,
      showOptional: required === false,
      tooltip: labelTooltip,
      class: disabled ? "cursor-not-allowed" : "cursor-pointer",
    })}
  </label>`;
}

export interface SwitchLegendInput {
  /** Legend content. */
  label?: unknown;
  children?: unknown;
  class?: string;
  className?: string;
}

export function SwitchLegend(input: SwitchLegendInput = {}) {
  const { label, children, class: className, className: aliasedClassName } = input;
  return html`<legend
    class="${cn("text-base font-medium text-areia-default", className, aliasedClassName)}"
  >
    ${render(children ?? label)}
  </legend>`;
}

export type SwitchItemInput = SwitchInput & {
  /** Value of the switch when used in a group. */
  value?: string;
};

export function SwitchItem(input: SwitchItemInput = {}) {
  return Switch(input);
}

export type SwitchGroupInput = Omit<
  HTMLElementProps<HTMLFieldSetElement>,
  "children" | "className"
> &
  Record<string, unknown> & {
    legend?: unknown;
    children?: unknown;
    error?: unknown;
    description?: unknown;
    disabled?: boolean;
    controlFirst?: boolean;
    class?: string;
    className?: string;
  };

export function SwitchGroup(children: unknown[]): ReturnType<typeof html>;
export function SwitchGroup(
  input?: SwitchGroupInput,
  children?: unknown[],
): ReturnType<typeof html>;
export function SwitchGroup(
  inputOrChildren: SwitchGroupInput | unknown[] = {},
  children?: unknown[],
) {
  const input = Array.isArray(inputOrChildren) ? {} : inputOrChildren;
  const {
    legend,
    children: inputChildren,
    error,
    description,
    disabled,
    controlFirst = true,
    class: className,
    className: aliasedClassName,
    ...rest
  } = input;
  const content = Array.isArray(inputOrChildren) ? inputOrChildren : (children ?? inputChildren);

  return html`<fieldset
    class="${cn(
      "flex flex-col gap-4",
      !controlFirst &&
        "[&_[data-slot=switch-item]]:flex-row-reverse [&_[data-slot=switch-item]]:justify-end",
      className,
      aliasedClassName,
    )}"
    data-control-first="${controlFirst ? "true" : "false"}"
    ${raw(toAttrs({ ...rest, disabled }))}
  >
    ${legend != null ? SwitchLegend({ label: legend }) : ""}
    <div class="flex flex-col gap-2">${content ?? ""}</div>
    ${error != null
      ? html`<p class="text-sm text-areia-destructive-soft-foreground">${render(error)}</p>`
      : description != null
        ? html`<p class="text-sm text-areia-subtle">${render(description)}</p>`
        : ""}
  </fieldset>`;
}

function emitSwitchChange(root: Element, checked: boolean) {
  root.dispatchEvent(new CustomEvent("switch:change", { bubbles: true, detail: { checked } }));
}

type SwitchBindRuntime = {
  controller: SwitchPrimitive.SwitchController;
  bindSync: ReturnType<typeof createCheckedBindSync>;
};

const switchBindRuntimeByHost = new WeakMap<Element, SwitchBindRuntime>();

function resolveSwitchRoot(host: Element): HTMLElement | null {
  const root = host.matches('[data-slot="switch"]')
    ? host
    : host.querySelector('[data-slot="switch"]');
  return root as HTMLElement | null;
}

export const SwitchRoot = ilha
  .input<SwitchInput>()
  .onMount(({ host, input }) => {
    const root = resolveSwitchRoot(host);
    if (!root) return;

    let bindSync: ReturnType<typeof createCheckedBindSync> = null;

    const controller = SwitchPrimitive.createSwitch(root, {
      defaultChecked:
        typeof input.checked === "boolean"
          ? input.checked
          : typeof input.defaultChecked === "boolean"
            ? input.defaultChecked
            : undefined,
      disabled: typeof input.disabled === "boolean" ? input.disabled : undefined,
      readOnly: typeof input.readOnly === "boolean" ? input.readOnly : undefined,
      required: typeof input.required === "boolean" ? input.required : undefined,
      name: typeof input.name === "string" ? input.name : undefined,
      value: typeof input.value === "string" ? input.value : undefined,
      uncheckedValue: typeof input.uncheckedValue === "string" ? input.uncheckedValue : undefined,
      onCheckedChange: (checked) => {
        bindSync?.onUserChange(checked);
        input.onCheckedChange?.(checked);
        emitSwitchChange(root, checked);
      },
    } satisfies SwitchPrimitive.SwitchOptions);

    bindSync = createCheckedBindSync(input, controller);
    bindSync?.applyFromSignal();
    switchBindRuntimeByHost.set(host, { controller, bindSync });

    return () => {
      switchBindRuntimeByHost.delete(host);
      controller.destroy();
    };
  })
  .effect(({ host, input }) => {
    subscribeBindProps(input);
    const runtime = switchBindRuntimeByHost.get(host);
    if (!runtime) return;
    runtime.bindSync?.applyFromSignal();
  })
  .render(({ input }) => renderSwitch(input));

const switchAutoBindScheduled = new WeakSet<Document>();
const switchAutoBoundRoots = new WeakSet<Element>();

function scheduleSwitchAutoBind(doc: Document | undefined = globalThis.document) {
  if (!doc || switchAutoBindScheduled.has(doc)) return;
  switchAutoBindScheduled.add(doc);
  queueMicrotask(() => {
    switchAutoBindScheduled.delete(doc);
    for (const root of doc.querySelectorAll<HTMLElement>(
      '[data-areia-switch][data-slot="switch"]',
    )) {
      if (switchAutoBoundRoots.has(root)) continue;
      switchAutoBoundRoots.add(root);
      SwitchPrimitive.createSwitch(root);
    }
  });
}

function needsSwitchIsland(input: SwitchInput) {
  return input.onCheckedChange != null;
}

function SwitchComponent(input: SwitchInput = {}) {
  if (needsSwitchIsland(input)) return SwitchRoot(input);
  scheduleSwitchAutoBind();
  return renderSwitch(input, true);
}

function SwitchBase(input: SwitchInput = {}) {
  return renderSwitch(input);
}

export const Switch = Object.assign(SwitchComponent, {
  Root: SwitchRoot,
  Static: SwitchBase,
  Item: SwitchItem,
  Group: SwitchGroup,
  Legend: SwitchLegend,
  Control: SwitchControl,
});
