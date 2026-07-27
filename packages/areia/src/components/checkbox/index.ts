import ilha, { html, raw } from "ilha";
import { Checkbox as CheckboxPrimitive } from "@areia/slots";
import {
  boundVoidElement,
  createCheckedBindSync,
  splitBindProps,
  subscribeBindProps,
  type IlhaBindProps,
} from "$lib/binds";
import { cn } from "$lib/cn";
import { toAttrs } from "$lib/input";
import type { HTMLElementProps } from "$lib/types";
import { Label } from "$components/label";
import { stampMorphPreserve } from "$lib/morph-preserve";

/** Checkbox variant definitions mapping variant names to their Tailwind classes. */
export const CHECKBOX_VARIANTS = {
  variant: {
    default: {
      classes: "ring-areia-control-border",
      description: "Default checkbox appearance",
    },
    error: {
      classes: "ring-areia-destructive",
      description: "Error state for validation failures",
    },
  },
} as const;

export const CHECKBOX_DEFAULT_VARIANTS = {
  variant: "default",
} as const;

export type CheckboxVariant = keyof typeof CHECKBOX_VARIANTS.variant;

export interface CheckboxVariantsProps {
  /**
   * Visual variant.
   * - `"default"` — Standard checkbox appearance
   * - `"error"` — Error state for validation failures
   * @default "default"
   */
  variant?: CheckboxVariant;
}

type VariantConfig = Record<string, { classes: string }>;

function resolveVariant<TVariants extends VariantConfig, TKey extends keyof TVariants>(
  variants: TVariants,
  value: TKey | undefined,
  fallback: TKey,
) {
  return variants[value ?? fallback] ?? variants[fallback];
}

export function checkboxVariants({
  variant = CHECKBOX_DEFAULT_VARIANTS.variant,
}: CheckboxVariantsProps = {}) {
  return cn(
    resolveVariant(CHECKBOX_VARIANTS.variant, variant, CHECKBOX_DEFAULT_VARIANTS.variant).classes,
  );
}

function checkIcon() {
  return html`<svg
    aria-hidden="true"
    class="size-3"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="3"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <path d="M20 6 9 17l-5-5"></path>
  </svg>`;
}

function minusIcon() {
  return html`<svg
    aria-hidden="true"
    class="size-3"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="3"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <path d="M5 12h14"></path>
  </svg>`;
}

type InputProps = Omit<HTMLElementProps<HTMLInputElement>, "className" | "type">;

export type CheckboxInput = InputProps &
  CheckboxVariantsProps &
  IlhaBindProps &
  Record<string, unknown> & {
    /** Label content for the checkbox. */
    label?: unknown;
    /** Tooltip text rendered as a native title on the label text. */
    labelTooltip?: string;
    /** When true, checkbox appears before label. When false, label appears before checkbox. */
    controlFirst?: boolean;
    /** Whether the checkbox is checked. */
    checked?: boolean;
    /** Whether the checkbox is in an indeterminate visual state. */
    indeterminate?: boolean;
    /** Additional CSS classes applied to the checkbox control. */
    class?: string;
    className?: string;
  };

function checkboxDataAttrs(
  input: Pick<
    CheckboxInput,
    "checked" | "disabled" | "indeterminate" | "required" | "name" | "value"
  > & { defaultChecked?: boolean; readOnly?: boolean; uncheckedValue?: string },
) {
  return toAttrs({
    "data-default-checked": input.checked ?? input.defaultChecked,
    "data-disabled": input.disabled,
    "data-indeterminate": input.indeterminate,
    "data-required": input.required,
    "data-read-only": input.readOnly,
    "data-name": input.name,
    "data-value": input.value,
    "data-unchecked-value": input.uncheckedValue,
  });
}

function checkboxControl(input: CheckboxInput) {
  const { binds, attrs: restProps } = splitBindProps(input);
  const {
    class: className,
    className: aliasedClassName,
    checked,
    disabled,
    indeterminate,
    variant = CHECKBOX_DEFAULT_VARIANTS.variant,
    id,
    name,
    value,
    required,
    readOnly,
    defaultChecked,
    uncheckedValue,
    form,
    role,
    tabIndex,
    tabindex,
    "aria-checked": ariaChecked,
    "aria-disabled": ariaDisabled,
    "aria-readonly": ariaReadonly,
    "aria-required": ariaRequired,
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledby,
    "aria-describedby": ariaDescribedby,
    ...inputRest
  } = restProps as CheckboxInput;

  const hasCheckedBind = binds["bind:checked"] != null || binds["bind:group"] != null;

  return html`<span
    data-slot="checkbox"
    class="${cn(
      "relative inline-flex size-4 shrink-0 cursor-pointer items-center justify-center rounded-sm border-0 bg-areia-control-background ring outline-none",
      "data-checked:bg-areia-foreground data-checked:ring-areia-foreground data-indeterminate:bg-areia-foreground data-indeterminate:ring-areia-foreground",
      "focus-visible:ring-2 focus-visible:ring-areia-ring",
      "data-disabled:cursor-not-allowed data-disabled:opacity-50 data-readonly:cursor-default",
      checkboxVariants({ variant }),
      className,
      aliasedClassName,
    )}"
    ${raw(
      checkboxDataAttrs({
        checked,
        disabled,
        indeterminate,
        required,
        readOnly,
        name,
        value,
        defaultChecked,
        uncheckedValue: typeof uncheckedValue === "string" ? uncheckedValue : undefined,
      }),
    )}
    ${raw(
      toAttrs({
        role: role ?? "checkbox",
        tabindex: disabled ? -1 : (tabindex ?? tabIndex ?? 0),
        "aria-checked": ariaChecked ?? (indeterminate ? "mixed" : checked ? "true" : "false"),
        "aria-disabled": ariaDisabled ?? (disabled ? "true" : undefined),
        "aria-readonly": ariaReadonly ?? (readOnly ? "true" : undefined),
        "aria-required": ariaRequired ?? (required ? "true" : undefined),
        "aria-label": ariaLabel,
        "aria-labelledby": ariaLabelledby,
        "aria-describedby": ariaDescribedby,
      }),
    )}
  >
    ${boundVoidElement(
      "input",
      binds,
      ` type="checkbox" data-slot="checkbox-input" class="sr-only peer" data-checkbox-generated="input"${toAttrs(
        {
          ...inputRest,
          id,
          name,
          value,
          form,
          required,
          disabled,
          ...(hasCheckedBind ? {} : { checked: Boolean(checked ?? defaultChecked) }),
        },
      )} />`,
    )}
    <span
      data-slot="checkbox-indicator"
      class="pointer-events-none absolute inset-0 flex items-center justify-center text-areia-inverse"
    >
      ${indeterminate ? minusIcon() : checkIcon()}
    </span>
  </span>`;
}

/** Single checkbox with an optional built-in label wrapper. */
function renderCheckbox(input: CheckboxInput = {}) {
  const { label, labelTooltip, controlFirst = true, required, disabled, ...rest } = input;
  const controlId = typeof rest.id === "string" ? rest.id : undefined;
  const control = checkboxControl({ ...rest, id: controlId, disabled, required });

  if (label == null) return control;

  return html`<label
    class="${cn(
      "inline-flex items-center gap-2 text-base text-areia-default",
      controlFirst ? "flex-row" : "flex-row-reverse justify-end",
      disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
    )}"
  >
    ${control}
    ${Label({
      label,
      showOptional: required === false,
      tooltip: labelTooltip,
      asContent: true,
      class: disabled ? "cursor-not-allowed" : "cursor-pointer",
    })}
  </label>`;
}

export type CheckboxItemInput = CheckboxInput & {
  /** Value of the checkbox when used in a group. */
  value?: string;
};

/** Individual checkbox item intended for use inside a checkbox group. */
export function CheckboxItem(input: CheckboxItemInput = {}) {
  return Checkbox(input);
}

export interface CheckboxLegendInput {
  label: unknown;
  class?: string;
  className?: string;
}

/** Styled legend for checkbox groups. */
export function CheckboxLegend({
  label,
  class: className,
  className: aliasedClassName,
}: CheckboxLegendInput) {
  return html`<legend
    class="${cn("text-base font-medium text-areia-default", className, aliasedClassName)}"
  >
    ${label}
  </legend>`;
}

export type CheckboxGroupInput = Omit<
  HTMLElementProps<HTMLFieldSetElement>,
  "children" | "className"
> &
  Record<string, unknown> & {
    /** Legend text for the group. */
    legend?: unknown;
    /** Checkbox item markup. Prefer passing children as the second `Checkbox.Group` argument. */
    children?: unknown;
    /** Error message for the group. */
    error?: unknown;
    /** Helper text for the group. */
    description?: unknown;
    /** Whether all checkboxes in the group are disabled. */
    disabled?: boolean;
    /** Additional CSS classes. */
    class?: string;
    className?: string;
  };

type CheckboxGroupChild = unknown;

/** Fieldset wrapper for related checkbox controls. */
export function CheckboxGroup(children: CheckboxGroupChild[]): ReturnType<typeof html>;
export function CheckboxGroup(
  input?: CheckboxGroupInput,
  children?: CheckboxGroupChild[],
): ReturnType<typeof html>;
export function CheckboxGroup(
  inputOrChildren: CheckboxGroupInput | CheckboxGroupChild[] = {},
  children?: CheckboxGroupChild[],
) {
  const input = Array.isArray(inputOrChildren) ? {} : inputOrChildren;
  const {
    legend,
    children: inputChildren,
    error,
    description,
    disabled,
    class: className,
    className: aliasedClassName,
    ...rest
  } = input;
  const content = Array.isArray(inputOrChildren) ? inputOrChildren : (children ?? inputChildren);

  return html`<fieldset
    class="${cn("flex flex-col gap-4", className, aliasedClassName)}"
    ${raw(toAttrs({ ...rest, disabled }))}
  >
    ${legend != null ? CheckboxLegend({ label: legend }) : ""}
    <div class="flex flex-col gap-2">${content ?? ""}</div>
    ${error != null
      ? html`<p class="text-sm text-areia-destructive-soft-foreground">${error}</p>`
      : ""}
    ${description != null ? html`<p class="text-sm text-areia-subtle">${description}</p>` : ""}
  </fieldset>`;
}

type CheckboxBindRuntime = {
  controller: CheckboxPrimitive.CheckboxController;
  bindSync: ReturnType<typeof createCheckedBindSync>;
};

const checkboxBindRuntimeByHost = new WeakMap<Element, CheckboxBindRuntime>();

function resolveCheckboxRoot(host: Element): HTMLElement | null {
  const root = host.matches('[data-slot="checkbox"]')
    ? host
    : host.querySelector('[data-slot="checkbox"]');
  return root as HTMLElement | null;
}

export const CheckboxRoot = ilha
  .input<CheckboxInput>()
  .onMount(({ host, input }) => {
    const root = resolveCheckboxRoot(host);
    if (!root) return;

    const itemValue = typeof input.value === "string" ? input.value : undefined;
    let bindSync: ReturnType<typeof createCheckedBindSync> = null;

    stampMorphPreserve(root);
    const controller = CheckboxPrimitive.createCheckbox(root, {
      defaultChecked: typeof input.checked === "boolean" ? input.checked : undefined,
      indeterminate: typeof input.indeterminate === "boolean" ? input.indeterminate : undefined,
      disabled: typeof input.disabled === "boolean" ? input.disabled : undefined,
      required: typeof input.required === "boolean" ? input.required : undefined,
      name: typeof input.name === "string" ? input.name : undefined,
      value: itemValue,
      onCheckedChange: (checked) => {
        bindSync?.onUserChange(checked);
      },
    } satisfies CheckboxPrimitive.CheckboxOptions);

    bindSync = createCheckedBindSync(input, controller, itemValue);
    bindSync?.applyFromSignal();
    checkboxBindRuntimeByHost.set(host, { controller, bindSync });

    return () => {
      checkboxBindRuntimeByHost.delete(host);
      controller.destroy();
    };
  })
  .effect(({ host, input }) => {
    // Track bind accessors so this effect re-runs when signals change.
    subscribeBindProps(input);
    const runtime = checkboxBindRuntimeByHost.get(host);
    // onMount may run after the first effect pass — never call createCheckbox here.
    if (!runtime) return;
    runtime.bindSync?.applyFromSignal();
  })
  .render(({ input }) => renderCheckbox(input));

export const Checkbox = Object.assign(CheckboxRoot, {
  Root: CheckboxRoot,
  Static: renderCheckbox,
  Control: checkboxControl,
  Item: CheckboxItem,
  Group: CheckboxGroup,
  Legend: CheckboxLegend,
});
