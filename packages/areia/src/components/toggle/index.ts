import ilha, { html, raw } from "ilha";
import { Toggle as TogglePrimitive } from "@areia/slots";
import { cn } from "$lib/cn";
import { render } from "$lib/markup";
import { toAttrs } from "$lib/input";
import type { HTMLElementProps } from "$lib/types";
import { stampMorphPreserve } from "$lib/morph-preserve";

export const TOGGLE_VARIANTS = {
  variant: {
    default: {
      classes:
        "bg-areia-control-background text-areia-control-foreground ring ring-areia-control-border hover:bg-areia-control-hover data-[state=on]:bg-areia-control-hover data-[state=on]:ring-areia-control-active",
    },
    outline: {
      classes:
        "border border-areia-border bg-transparent hover:bg-areia-control-hover data-[state=on]:bg-areia-control-hover",
    },
  },
  size: {
    sm: { classes: "h-8 gap-1 rounded-md px-2.5 text-xs" },
    default: { classes: "h-9 gap-1.5 rounded-lg px-3 text-base" },
    lg: { classes: "h-10 gap-2 rounded-lg px-4 text-base" },
  },
} as const;

export type ToggleVariant = keyof typeof TOGGLE_VARIANTS.variant;
export type ToggleSize = keyof typeof TOGGLE_VARIANTS.size;

export interface ToggleVariantsProps {
  variant?: ToggleVariant;
  size?: ToggleSize;
}

export const TOGGLE_DEFAULT_VARIANTS = {
  variant: "default",
  size: "default",
} as const;

export function toggleVariants({
  variant = TOGGLE_DEFAULT_VARIANTS.variant,
  size = TOGGLE_DEFAULT_VARIANTS.size,
}: ToggleVariantsProps = {}) {
  return cn(
    "inline-flex items-center justify-center whitespace-nowrap font-medium transition-colors outline-none",
    "focus-visible:ring-2 focus-visible:ring-areia-ring focus-visible:ring-offset-2",
    "disabled:pointer-events-none disabled:opacity-50",
    TOGGLE_VARIANTS.variant[variant].classes,
    TOGGLE_VARIANTS.size[size].classes,
  );
}

export type ToggleInput = Omit<HTMLElementProps<HTMLButtonElement>, "className" | "children"> &
  ToggleVariantsProps &
  Pick<TogglePrimitive.ToggleOptions, "defaultPressed" | "disabled" | "onPressedChange"> &
  Record<string, unknown> & {
    children?: unknown;
    class?: string;
    className?: string;
  };

function toggleDataAttrs(input: Pick<ToggleInput, "defaultPressed" | "disabled">) {
  return toAttrs({
    "data-default-pressed": input.defaultPressed ? "" : undefined,
    "data-disabled": input.disabled ? "true" : undefined,
  });
}

function renderToggle(input: ToggleInput = {}, autoBind = false) {
  const {
    defaultPressed,
    disabled,
    variant = TOGGLE_DEFAULT_VARIANTS.variant,
    size = TOGGLE_DEFAULT_VARIANTS.size,
    class: className,
    className: aliasedClassName,
    children,
    onPressedChange: _onPressedChange,
    ...rest
  } = input;

  return html`<button
    type="button"
    data-slot="toggle"
    class="${cn(toggleVariants({ variant, size }), className, aliasedClassName)}"
    ${raw(toggleDataAttrs({ defaultPressed, disabled }))}
    ${raw(
      toAttrs({
        ...rest,
        disabled: disabled || undefined,
        "data-areia-toggle": autoBind ? "" : undefined,
      }),
    )}
  >
    ${render(children)}
  </button>`;
}

const toggleAutoBindScheduled = new WeakSet<Document>();

function scheduleToggleAutoBind(doc: Document | undefined = globalThis.document) {
  if (!doc || toggleAutoBindScheduled.has(doc)) return;
  toggleAutoBindScheduled.add(doc);
  queueMicrotask(() => {
    toggleAutoBindScheduled.delete(doc);
    for (const root of doc.querySelectorAll<HTMLElement>(
      '[data-areia-toggle][data-slot="toggle"]',
    )) {
      stampMorphPreserve(root);
      TogglePrimitive.createToggle(root);
    }
  });
}

function needsToggleIsland(input: ToggleInput) {
  return input.onPressedChange != null;
}

function ToggleComponent(input: ToggleInput = {}) {
  if (needsToggleIsland(input)) return ToggleRoot(input);
  scheduleToggleAutoBind();
  return renderToggle(input, true);
}

export const ToggleRoot = ilha
  .input<ToggleInput>()
  .onMount(({ host, input }) => {
    const root = host.matches('[data-slot="toggle"]')
      ? (host as HTMLElement)
      : (host.querySelector('[data-slot="toggle"]') as HTMLElement | null);
    if (!root) return;

    stampMorphPreserve(root);
    const controller = TogglePrimitive.createToggle(root, {
      defaultPressed: input.defaultPressed,
      disabled: input.disabled,
      onPressedChange: input.onPressedChange,
    } satisfies TogglePrimitive.ToggleOptions);

    return () => controller.destroy();
  })
  .render(({ input }) => renderToggle(input));

export const Toggle = Object.assign(ToggleComponent, {
  Root: ToggleRoot,
  Static: renderToggle,
});
