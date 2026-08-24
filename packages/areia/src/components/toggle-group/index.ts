import { ilha, html, raw } from "ilha";
import { ToggleGroup as ToggleGroupPrimitive } from "@areia/slots";
import {
  boundElement,
  createBindBridge,
  disposeBindBridge,
  getBindBridge,
  groupBindDefault,
  groupBindSource,
  splitBindProps,
  type IlhaBindProps,
} from "$lib/binds";
import { cn } from "$lib/cn";
import { render } from "$lib/markup";
import { toAttrs } from "$lib/input";
import type { HTMLElementProps } from "$lib/types";
import {
  toggleVariants,
  type ToggleVariantsProps,
  type ToggleSize,
  type ToggleVariant,
} from "$components/toggle";
import { stampMorphPreserve } from "$lib/morph-preserve";

export type ToggleGroupType = "single" | "multiple";

export interface ToggleGroupVariantsProps {
  /** Selection mode. */
  type?: ToggleGroupType;
  /** Visual variant passed to items. */
  variant?: ToggleVariant;
  /** Size passed to items. */
  size?: ToggleSize;
  /** Layout direction for keyboard navigation. */
  orientation?: "horizontal" | "vertical";
  /** Wrap keyboard focus at ends. */
  loop?: boolean;
}

export type ToggleGroupInput = Omit<HTMLElementProps<HTMLDivElement>, "className" | "children"> &
  ToggleGroupVariantsProps &
  IlhaBindProps &
  Record<string, unknown> & {
    /** Default selected value(s). */
    defaultValue?: string | string[];
    /** Disable the entire group. */
    disabled?: boolean;
    children?: unknown;
    class?: string;
    className?: string;
    onValueChange?: (value: string[]) => void;
  };

export type ToggleGroupItemInput = Omit<
  HTMLElementProps<HTMLButtonElement>,
  "className" | "children" | "value"
> &
  ToggleVariantsProps &
  Record<string, unknown> & {
    /** Unique item value. */
    value: string;
    children?: unknown;
    disabled?: boolean;
    class?: string;
    className?: string;
  };

function toggleGroupVariants() {
  return cn(
    "flex w-fit items-stretch overflow-hidden rounded-lg border border-areia-control-border *:focus-visible:relative *:focus-visible:z-10",
    "[&>button]:rounded-none [&>button]:shadow-none [&>button]:ring-0 [&>button]:border-0",
  );
}

function ToggleGroupItem(input: ToggleGroupItemInput = {} as ToggleGroupItemInput) {
  const {
    value,
    children,
    disabled,
    variant = "default",
    size = "default",
    class: className,
    className: aliasedClassName,
    ...rest
  } = input;

  return html`<button
    type="button"
    data-slot="toggle-group-item"
    data-value="${value}"
    class="${cn(toggleVariants({ variant, size }), className, aliasedClassName)}"
    ${raw(toAttrs({ ...rest, disabled: disabled || undefined }))}
  >
    ${children}
  </button>`;
}

function renderToggleGroup(input: ToggleGroupInput = {}) {
  const { binds, attrs: props } = splitBindProps(input);
  const {
    children,
    class: className,
    className: aliasedClassName,
    type = "single",
    defaultValue: defaultValueProp,
    disabled,
    orientation = "horizontal",
    loop,
    variant: _variant,
    size: _size,
    onValueChange: _onValueChange,
    ...rest
  } = props as ToggleGroupInput;
  const defaultValue = groupBindDefault(input, defaultValueProp);
  const resolvedDefaultValue =
    defaultValue == null
      ? undefined
      : Array.isArray(defaultValue)
        ? defaultValue.join(" ")
        : String(defaultValue);

  const openSuffix = ` data-slot="toggle-group" data-type="${type}" class="${cn(
    toggleGroupVariants(),
    className,
    aliasedClassName,
  )}"${toAttrs({
    ...rest,
    "data-default-value": resolvedDefaultValue,
    "data-multiple": type === "multiple" ? "" : undefined,
    "data-orientation": orientation,
    "data-loop": loop,
    "data-disabled": disabled,
  })}`;

  return boundElement("div", binds, openSuffix, render(children));
}

function resolveToggleGroupRoot(host: Element): HTMLElement | null {
  const root = host.matches('[data-slot="toggle-group"]')
    ? host
    : host.querySelector('[data-slot="toggle-group"]');
  return root as HTMLElement | null;
}

const ToggleGroupRoot = ilha
  .input<ToggleGroupInput>()
  .action("valueChange", (value: string[], { host }) => {
    getBindBridge(host, "value")?.onUserChange(value);
  })
  .onMount(({ host, input, action }) => {
    const root = resolveToggleGroupRoot(host);
    if (!root) return;

    const mode = input.type === "multiple" ? "multiple" : "single";

    disposeBindBridge(host, "value");

    stampMorphPreserve(root);
    const controller = ToggleGroupPrimitive.createToggleGroup(root, {
      defaultValue: groupBindDefault(input, input.defaultValue) ?? undefined,
      multiple: input.type === "multiple",
      orientation: input.orientation,
      loop: input.loop,
      disabled: input.disabled,
      onValueChange: (value) => action.valueChange(value),
    } satisfies ToggleGroupPrimitive.ToggleGroupOptions);

    createBindBridge(
      host,
      "value",
      groupBindSource(
        input,
        {
          getValue: () => controller.value,
          setValue: (value) => controller.setValue(value ?? []),
        },
        {
          mode,
          onUserChange: (value) => {
            if (Array.isArray(value)) input.onValueChange?.(value);
          },
          destroy: () => controller.destroy(),
        },
      ),
    );

    return () => disposeBindBridge(host);
  })
  .effect(({ host }) => {
    getBindBridge(host, "value")?.applyFromSignal();
  })
  .render(({ input }) => renderToggleGroup(input));

export type ToggleGroupSeparatorInput = Omit<
  HTMLElementProps<HTMLDivElement>,
  "className" | "children"
> &
  Record<string, unknown> & {
    class?: string;
    className?: string;
  };

function ToggleGroupSeparator(input: ToggleGroupSeparatorInput = {}) {
  const { class: className, className: aliasedClassName, ...rest } = input;

  return html`<div
    data-slot="toggle-group-separator"
    class="${cn("relative shrink-0 self-stretch bg-areia-border", className, aliasedClassName)}"
    ${raw(toAttrs(rest))}
  ></div>`;
}

export const ToggleGroup = Object.assign(ToggleGroupRoot, {
  Root: ToggleGroupRoot,
  Static: renderToggleGroup,
  Item: ToggleGroupItem,
  Separator: ToggleGroupSeparator,
});
