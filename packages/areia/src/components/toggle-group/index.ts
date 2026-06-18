import ilha, { html, raw } from "ilha";
import { ToggleGroup as ToggleGroupPrimitive } from "@areia/slots";
import {
  boundElement,
  createGroupBindSync,
  groupBindDefault,
  queueToggleGroupBindForAutoMount,
  splitBindProps,
  subscribeBindProps,
  takeToggleGroupBindQueue,
  type GroupBindAccessor,
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

function renderToggleGroup(input: ToggleGroupInput = {}, autoBind = false) {
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
    "data-areia-toggle-group": autoBind ? "" : undefined,
  })}`;

  if (autoBind && binds["bind:group"] != null) {
    queueToggleGroupBindForAutoMount(
      binds["bind:group"] as GroupBindAccessor,
      type === "multiple" ? "multiple" : "single",
    );
  }

  return boundElement("div", binds, openSuffix, render(children));
}

type ToggleGroupBindRuntime = {
  controller: ToggleGroupPrimitive.ToggleGroupController;
  groupSync: ReturnType<typeof createGroupBindSync>;
};

const toggleGroupBindRuntimeByHost = new WeakMap<Element, ToggleGroupBindRuntime>();

function resolveToggleGroupRoot(host: Element): HTMLElement | null {
  const root = host.matches('[data-slot="toggle-group"]')
    ? host
    : host.querySelector('[data-slot="toggle-group"]');
  return root as HTMLElement | null;
}

const ToggleGroupRoot = ilha
  .input<ToggleGroupInput>()
  .onMount(({ host, input }) => {
    const root = resolveToggleGroupRoot(host);
    if (!root) return;

    const mode = input.type === "multiple" ? "multiple" : "single";
    let groupSync: ReturnType<typeof createGroupBindSync> = null;

    const controller = ToggleGroupPrimitive.createToggleGroup(root, {
      defaultValue: groupBindDefault(input, input.defaultValue) ?? undefined,
      multiple: input.type === "multiple",
      orientation: input.orientation,
      loop: input.loop,
      disabled: input.disabled,
      onValueChange: (value) => {
        groupSync?.onUserChange(value);
        input.onValueChange?.(value);
      },
    } satisfies ToggleGroupPrimitive.ToggleGroupOptions);

    groupSync = createGroupBindSync(
      input,
      {
        getValue: () => controller.value,
        setValue: (value) => controller.setValue(value ?? []),
      },
      mode,
    );
    groupSync?.applyFromSignal();
    toggleGroupBindRuntimeByHost.set(host, { controller, groupSync });

    return () => {
      toggleGroupBindRuntimeByHost.delete(host);
      controller.destroy();
    };
  })
  .effect(({ host, input }) => {
    subscribeBindProps(input);
    const runtime = toggleGroupBindRuntimeByHost.get(host);
    if (!runtime) return;
    runtime.groupSync?.applyFromSignal();
  })
  .render(({ input }) => renderToggleGroup(input));

const toggleGroupAutoBindScheduled = new WeakSet<Document>();

type ToggleGroupAutoRuntime = {
  controller: ToggleGroupPrimitive.ToggleGroupController;
  groupSync: ReturnType<typeof createGroupBindSync>;
};

const toggleGroupAutoRuntimeByRoot = new WeakMap<Element, ToggleGroupAutoRuntime>();

function scheduleToggleGroupAutoBind(doc: Document | undefined = globalThis.document) {
  if (!doc || toggleGroupAutoBindScheduled.has(doc)) return;
  toggleGroupAutoBindScheduled.add(doc);
  queueMicrotask(() => {
    toggleGroupAutoBindScheduled.delete(doc);
    const queued = takeToggleGroupBindQueue(doc);
    let queueIndex = 0;

    for (const root of doc.querySelectorAll<HTMLElement>(
      '[data-areia-toggle-group][data-slot="toggle-group"]',
    )) {
      const existing = toggleGroupAutoRuntimeByRoot.get(root);
      if (existing) {
        existing.groupSync?.applyFromSignal();
        continue;
      }

      const entry = queued[queueIndex++];
      const bindInput = entry ? { "bind:group": entry.bindGroup } : {};
      let groupSync: ReturnType<typeof createGroupBindSync> = null;
      const mode = entry?.mode ?? "single";

      const controller = ToggleGroupPrimitive.createToggleGroup(root, {
        onValueChange: (value) => {
          groupSync?.onUserChange(value);
        },
      });

      if (entry) {
        groupSync = createGroupBindSync(
          bindInput,
          {
            getValue: () => controller.value,
            setValue: (value) => controller.setValue(value ?? []),
          },
          mode,
        );
        groupSync?.applyFromSignal();
      }

      toggleGroupAutoRuntimeByRoot.set(root, { controller, groupSync });
    }
  });
}

function needsToggleGroupIsland(input: ToggleGroupInput) {
  const { binds } = splitBindProps(input);
  return input.onValueChange != null || binds["bind:group"] != null;
}

function ToggleGroupComponent(input: ToggleGroupInput = {}) {
  if (needsToggleGroupIsland(input)) return ToggleGroupRoot(input);
  scheduleToggleGroupAutoBind();
  return renderToggleGroup(input, true);
}

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

export const ToggleGroup = Object.assign(ToggleGroupComponent, {
  Root: ToggleGroupRoot,
  Static: renderToggleGroup,
  Item: ToggleGroupItem,
  Separator: ToggleGroupSeparator,
});
