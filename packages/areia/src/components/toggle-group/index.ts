import ilha, { html, raw } from "ilha";
import { ToggleGroup as ToggleGroupPrimitive } from "@areia/slots";
import { cn } from "$lib/cn";
import { toAttrs } from "$lib/input";
import type { HTMLElementProps } from "$lib/types";
import {
  toggleVariants,
  type ToggleVariantsProps,
  type ToggleSize,
  type ToggleVariant,
} from "$components/toggle";

type Renderable = unknown;

function render(value: Renderable): unknown {
  if (value === null || value === undefined || value === false) return "";
  if (Array.isArray(value)) return value.map(render);
  if (typeof value === "object" && "value" in value && typeof value.value === "string") {
    return raw(value.value);
  }
  return value;
}

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
  const {
    children,
    class: className,
    className: aliasedClassName,
    type = "single",
    defaultValue,
    disabled,
    orientation = "horizontal",
    loop,
    variant,
    size,
    onValueChange: _onValueChange,
    ...rest
  } = input;

  return html`<div
    data-slot="toggle-group"
    data-type="${type}"
    class="${cn(toggleGroupVariants(), className, aliasedClassName)}"
    ${raw(
      toAttrs({
        ...rest,
        "data-default-value":
          defaultValue == null
            ? undefined
            : Array.isArray(defaultValue)
              ? defaultValue.join(" ")
              : defaultValue,
        "data-multiple": type === "multiple" ? "" : undefined,
        "data-orientation": orientation,
        "data-loop": loop,
        "data-disabled": disabled,
      }),
    )}
  >
    ${render(children)}
  </div>`;
}

const ToggleGroupRoot = ilha
  .input<ToggleGroupInput>()
  .onMount(({ host, input }) => {
    const root = host.matches('[data-slot="toggle-group"]')
      ? host
      : host.querySelector('[data-slot="toggle-group"]');
    if (!root) return;

    const controller = ToggleGroupPrimitive.createToggleGroup(root, {
      defaultValue: input.defaultValue,
      multiple: input.type === "multiple",
      orientation: input.orientation,
      loop: input.loop,
      disabled: input.disabled,
      onValueChange: input.onValueChange,
    } satisfies ToggleGroupPrimitive.ToggleGroupOptions);

    return () => controller.destroy();
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
