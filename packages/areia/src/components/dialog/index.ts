import ilha, { html, raw } from "ilha";
import { Dialog as DialogPrimitive } from "@areia/slots";

const dialogControllers = new WeakMap<Element, DialogPrimitive.DialogController>();
import {
  createOpenBindSync,
  openBindDefault,
  subscribeBindProps,
  type IlhaBindProps,
} from "$lib/binds";
import { cn } from "$lib/cn";
import { hasSlot, render, withSlot } from "$lib/markup";
import { toAttrs } from "$lib/input";
import type { HTMLElementProps } from "$lib/types";

/** Dialog size and role variant definitions. */
export const DIALOG_VARIANTS = {
  size: {
    sm: {
      classes: "min-w-72",
      description: "Small dialog for simple confirmations",
    },
    base: {
      classes: "sm:min-w-96",
      description: "Default dialog width",
    },
    lg: {
      classes: "min-w-[32rem]",
      description: "Large dialog for complex content",
    },
    xl: {
      classes: "min-w-[48rem]",
      description: "Extra large dialog for detailed views",
    },
  },
  role: {
    dialog: {
      classes: "",
      description: "Standard dialog for general-purpose modals",
    },
    alertdialog: {
      classes: "",
      description: "Alert dialog for confirmation flows requiring acknowledgment",
    },
  },
} as const;

export const DIALOG_DEFAULT_VARIANTS = {
  size: "base",
  role: "dialog",
} as const;

export type DialogSize = keyof typeof DIALOG_VARIANTS.size;
export type DialogRole = keyof typeof DIALOG_VARIANTS.role;

export interface DialogVariantsProps {
  /**
   * Dialog width.
   * - `"sm"` — Small for simple confirmations
   * - `"base"` — Default width
   * - `"lg"` — Large for complex content
   * - `"xl"` — Extra large for detailed views
   * @default "base"
   */
  size?: DialogSize;
}

type VariantConfig = Record<string, { classes: string }>;

function resolveVariant<TVariants extends VariantConfig, TKey extends keyof TVariants>(
  variants: TVariants,
  value: TKey | undefined,
  fallback: TKey,
) {
  return variants[value ?? fallback] ?? variants[fallback];
}

export function dialogVariants({ size = DIALOG_DEFAULT_VARIANTS.size }: DialogVariantsProps = {}) {
  return cn(
    "fixed top-1/2 left-1/2 z-[calc(50+var(--dialog-content-stack-index,0))] w-full max-w-[calc(100vw-2rem)] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-xl bg-areia-background text-areia-default shadow-lg outline outline-1 outline-areia-divider sm:w-auto sm:max-w-[calc(100vw-3rem)]",
    "transition-[transform,scale,opacity] duration-150 data-[starting-style]:scale-90 data-[starting-style]:opacity-0 data-[ending-style]:scale-90 data-[ending-style]:opacity-0",
    resolveVariant(DIALOG_VARIANTS.size, size, DIALOG_DEFAULT_VARIANTS.size).classes,
  );
}

function overlayVariants() {
  return cn(
    "fixed inset-0 z-[calc(40+var(--dialog-overlay-stack-index,0))] bg-areia-recessed/80",
    "transition-opacity duration-150 data-[starting-style]:opacity-0 data-[ending-style]:opacity-0",
  );
}

function dataAttrs(
  input: Pick<
    DialogInput,
    "alertDialog" | "closeOnClickOutside" | "closeOnEscape" | "defaultOpen" | "lockScroll"
  >,
) {
  return toAttrs({
    "data-alert-dialog": input.alertDialog,
    "data-close-on-click-outside": input.closeOnClickOutside,
    "data-close-on-escape": input.closeOnEscape,
    "data-default-open": input.defaultOpen,
    "data-lock-scroll": input.lockScroll,
  });
}

export type DialogTriggerInput = Omit<HTMLElementProps<HTMLElement>, "className" | "children"> &
  Record<string, unknown> & {
    children?: unknown;
    /** Trigger tag name. Defaults to `button`. */
    as?: "button" | "span" | "div" | "a";
    class?: string;
    className?: string;
  };

export function DialogTrigger(input: DialogTriggerInput = {}) {
  const {
    as = "button",
    children = "Open",
    class: className,
    className: aliasedClassName,
    type,
    ...props
  } = input;
  const slottedChild = withSlot(children, "dialog-trigger", className, aliasedClassName);
  if (slottedChild) return slottedChild;

  const tag = as;

  return html`<${raw(tag)}
    data-slot="dialog-trigger"
    class="${cn(className, aliasedClassName)}"
    ${raw(
      toAttrs({
        ...props,
        tabindex:
          tag === "span" || tag === "div"
            ? (props.tabindex ?? props.tabIndex ?? 0)
            : props.tabindex,
        type: tag === "button" ? (type ?? "button") : type,
      }),
    )}
  >${render(children)}</${raw(tag)}>`;
}

export type DialogOverlayInput = Omit<HTMLElementProps<HTMLDivElement>, "className" | "children"> &
  Record<string, unknown> & {
    class?: string;
    className?: string;
  };

export function DialogOverlay(input: DialogOverlayInput = {}) {
  const { class: className, className: aliasedClassName, ...props } = input;

  return html`<div
    data-slot="dialog-overlay"
    hidden
    class="${cn(overlayVariants(), className, aliasedClassName)}"
    ${raw(toAttrs(props))}
  ></div>`;
}

export type DialogContentInput = Omit<HTMLElementProps<HTMLDivElement>, "className" | "children"> &
  DialogVariantsProps &
  Record<string, unknown> & {
    children?: unknown;
    class?: string;
    className?: string;
  };

export function DialogContent(input: DialogContentInput = {}) {
  const {
    children,
    class: className,
    className: aliasedClassName,
    size = DIALOG_DEFAULT_VARIANTS.size,
    ...props
  } = input;

  return html`<div
    data-slot="dialog-content"
    hidden
    class="${cn(dialogVariants({ size }), className, aliasedClassName)}"
    ${raw(toAttrs(props))}
  >
    ${render(children)}
  </div>`;
}

export type DialogTitleInput = Omit<
  HTMLElementProps<HTMLHeadingElement>,
  "className" | "children"
> &
  Record<string, unknown> & {
    children?: unknown;
    class?: string;
    className?: string;
  };

export function DialogTitle(input: DialogTitleInput = {}) {
  const { children, class: className, className: aliasedClassName, ...props } = input;

  return html`<h2
    data-slot="dialog-title"
    class="${cn("m-0 text-xl leading-7 font-semibold", className, aliasedClassName)}"
    ${raw(toAttrs(props))}
  >
    ${children}
  </h2>`;
}

export type DialogDescriptionInput = Omit<
  HTMLElementProps<HTMLParagraphElement>,
  "className" | "children"
> &
  Record<string, unknown> & {
    children?: unknown;
    class?: string;
    className?: string;
  };

export function DialogDescription(input: DialogDescriptionInput = {}) {
  const { children, class: className, className: aliasedClassName, ...props } = input;

  return html`<p
    data-slot="dialog-description"
    class="${cn("m-0 text-base leading-6 text-areia-subtle", className, aliasedClassName)}"
    ${raw(toAttrs(props))}
  >
    ${children}
  </p>`;
}

export type DialogCloseInput = Omit<HTMLElementProps<HTMLElement>, "className" | "children"> &
  Record<string, unknown> & {
    children?: unknown;
    /** Close element tag name. Defaults to `button`. */
    as?: "button" | "span" | "div" | "a";
    class?: string;
    className?: string;
  };

export function DialogClose(input: DialogCloseInput = {}) {
  const {
    as = "button",
    children = "Close",
    class: className,
    className: aliasedClassName,
    type,
    ...props
  } = input;
  const slottedChild = withSlot(children, "dialog-close", className, aliasedClassName);
  if (slottedChild) return slottedChild;

  const tag = as;

  return html`<${raw(tag)}
    data-slot="dialog-close"
    class="${cn(className, aliasedClassName)}"
    ${raw(toAttrs({ ...props, type: tag === "button" ? (type ?? "button") : type }))}
  >${children}</${raw(tag)}>`;
}

export type DialogPortalInput = Omit<HTMLElementProps<HTMLDivElement>, "className" | "children"> &
  Record<string, unknown> & {
    children?: unknown;
    class?: string;
    className?: string;
  };

export function DialogPortal(input: DialogPortalInput = {}) {
  const { children, class: className, className: aliasedClassName, ...props } = input;

  return html`<div
    data-slot="dialog-portal"
    class="${cn(className, aliasedClassName)}"
    ${raw(toAttrs(props))}
  >
    ${render(children)}
  </div>`;
}

export type DialogInput = Omit<HTMLElementProps<HTMLDivElement>, "className" | "children"> &
  DialogPrimitive.DialogOptions &
  DialogVariantsProps &
  IlhaBindProps &
  Record<string, unknown> & {
    /** Dialog ARIA role. `alertdialog` disables outside-click closing by default. */
    role?: DialogRole;
    /** Dialog panel content. */
    content?: unknown;
    /** Trigger content. */
    children?: unknown;
    /** Custom trigger markup. Overrides generated trigger. */
    trigger?: unknown;
    /** Trigger tag name used when generated trigger is needed. */
    triggerAs?: DialogTriggerInput["as"];
    class?: string;
    className?: string;
    contentClass?: string;
    contentClassName?: string;
    overlayClass?: string;
    overlayClassName?: string;
    portalClass?: string;
    portalClassName?: string;
    triggerClass?: string;
    triggerClassName?: string;
  };

function renderDialog(input: DialogInput = {}) {
  const {
    alertDialog,
    children,
    class: className,
    className: aliasedClassName,
    closeOnClickOutside,
    closeOnEscape,
    content,
    contentClass,
    contentClassName,
    defaultOpen: defaultOpenProp,
    lockScroll,
    onOpenChange: _onOpenChange,
    overlayClass,
    overlayClassName,
    portalClass,
    portalClassName,
    role = DIALOG_DEFAULT_VARIANTS.role,
    size = DIALOG_DEFAULT_VARIANTS.size,
    trigger,
    triggerAs,
    triggerClass,
    triggerClassName,
    ...rootProps
  } = input;

  const isAlertDialog = alertDialog ?? role === "alertdialog";
  const defaultOpen = openBindDefault(input, defaultOpenProp);
  const composedChildren = render(children);
  const hasComposedContent = hasSlot(children, "dialog-content");
  const hasComposedTrigger = hasSlot(children, "dialog-trigger");
  const generatedTrigger = hasComposedTrigger
    ? undefined
    : (withSlot(trigger, "dialog-trigger", triggerClass, triggerClassName) ??
      withSlot(children, "dialog-trigger", triggerClass, triggerClassName) ??
      DialogTrigger({
        as: triggerAs,
        class: triggerClass,
        className: triggerClassName,
        children: trigger ?? children,
      }));

  return html`<div
    data-slot="dialog"
    class="${cn("inline-flex", className, aliasedClassName)}"
    ${raw(
      dataAttrs({
        alertDialog: isAlertDialog,
        closeOnClickOutside: closeOnClickOutside ?? (isAlertDialog ? false : undefined),
        closeOnEscape,
        defaultOpen,
        lockScroll,
      }),
    )}
    ${raw(toAttrs(rootProps))}
  >
    ${hasComposedContent ? composedChildren : generatedTrigger}
    ${hasComposedContent
      ? ""
      : DialogPortal({
          class: portalClass,
          className: portalClassName,
          children: html`${DialogOverlay({ class: overlayClass, className: overlayClassName })}
          ${DialogContent({
            class: contentClass,
            className: contentClassName,
            children: content,
            size,
          })}`,
        })}
  </div>`;
}

export const DialogRoot = ilha
  .input<DialogInput>()
  .onMount(({ host, input }) => {
    const root = host.matches('[data-slot="dialog"]')
      ? host
      : host.querySelector('[data-slot="dialog"]');
    if (!root) return;

    const isAlertDialog = input.alertDialog ?? input.role === "alertdialog";
    let bindSync: ReturnType<typeof createOpenBindSync> = null;

    const controller = DialogPrimitive.createDialog(root, {
      alertDialog: isAlertDialog,
      closeOnClickOutside: input.closeOnClickOutside ?? (isAlertDialog ? false : undefined),
      closeOnEscape: input.closeOnEscape,
      defaultOpen: openBindDefault(input, input.defaultOpen),
      lockScroll: input.lockScroll,
      onOpenChange: (open) => {
        bindSync?.onUserChange(open);
        input.onOpenChange?.(open);
      },
    });

    bindSync = createOpenBindSync(input, controller);
    bindSync?.applyFromSignal();
    dialogControllers.set(root, controller);

    return () => {
      dialogControllers.delete(root);
      controller.destroy();
    };
  })
  .effect(({ host, input }) => {
    subscribeBindProps(input);
    const root = host.matches('[data-slot="dialog"]')
      ? host
      : host.querySelector('[data-slot="dialog"]');
    if (!root) return;

    const controller = dialogControllers.get(root) ?? DialogPrimitive.createDialog(root);
    createOpenBindSync(input, controller)?.applyFromSignal();
  })
  .render(({ input }) => renderDialog(normalizeDialogInput(input)));

function normalizeDialogInput(input: DialogInput = {}): DialogInput {
  return {
    ...input,
    content: input.content == null ? input.content : render(input.content),
    trigger: input.trigger == null ? input.trigger : render(input.trigger),
    children: input.children == null ? input.children : render(input.children),
  };
}

function DialogBase(input: DialogInput = {}) {
  return renderDialog(normalizeDialogInput(input));
}

export const Dialog = Object.assign(DialogRoot, {
  Root: DialogRoot,
  Static: DialogBase,
  Trigger: DialogTrigger,
  Portal: DialogPortal,
  Overlay: DialogOverlay,
  Content: DialogContent,
  Title: DialogTitle,
  Description: DialogDescription,
  Close: DialogClose,
});
