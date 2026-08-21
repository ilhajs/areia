import ilha, { html, raw } from "ilha";
import { Check, Copy } from "lucide";
import { buttonVariants, type ButtonSize } from "$components/button";
import { Icon } from "$components/icon";
import { inputVariants } from "$components/input";
import { Tooltip, type TooltipSide } from "$components/tooltip";
import { CLIPBOARD_TEXT_INLINE_ONCLICK, writeClipboard } from "$lib/clipboard";
import { cn } from "$lib/cn";
import { toAttrs } from "$lib/input";
import type { HTMLElementProps } from "$lib/types";

/** Clipboard text size variant definitions mapping sizes to their Tailwind classes. */
export const CLIPBOARD_TEXT_VARIANTS = {
  size: {
    sm: {
      classes: "text-xs",
      buttonSize: "sm",
      description: "Small clipboard text for compact UIs",
    },
    base: {
      classes: "text-sm",
      buttonSize: "base",
      description: "Default clipboard text size",
    },
    lg: {
      classes: "text-sm",
      buttonSize: "lg",
      description: "Large clipboard text for prominent display",
    },
  },
} as const;

export const CLIPBOARD_TEXT_DEFAULT_VARIANTS = {
  size: "lg",
} as const;

export type ClipboardTextSize = keyof typeof CLIPBOARD_TEXT_VARIANTS.size;

export interface ClipboardTextVariantsProps {
  /**
   * Size of the clipboard text field.
   * - `"sm"` — Small clipboard text for compact UIs
   * - `"base"` — Default clipboard text size
   * - `"lg"` — Large clipboard text for prominent display
   * @default "lg"
   */
  size?: ClipboardTextSize;
}

type VariantConfig = Record<string, { classes: string }>;

function resolveVariant<TVariants extends VariantConfig, TKey extends keyof TVariants>(
  variants: TVariants,
  value: TKey | undefined,
  fallback: TKey,
) {
  return variants[value ?? fallback] ?? variants[fallback];
}

function sizeConfig(size: ClipboardTextSize) {
  return (
    CLIPBOARD_TEXT_VARIANTS.size[size] ??
    CLIPBOARD_TEXT_VARIANTS.size[CLIPBOARD_TEXT_DEFAULT_VARIANTS.size]
  );
}

export function clipboardTextVariants({
  size = CLIPBOARD_TEXT_DEFAULT_VARIANTS.size,
}: ClipboardTextVariantsProps = {}) {
  return cn(
    "flex items-center overflow-hidden bg-areia-control-background px-0 font-mono",
    resolveVariant(CLIPBOARD_TEXT_VARIANTS.size, size, CLIPBOARD_TEXT_DEFAULT_VARIANTS.size)
      .classes,
  );
}

export type ClipboardTextLabels = {
  /** Accessible label for the copy button. @default "Copy to clipboard" */
  copyAction?: string;
};

export type ClipboardTextTooltip = {
  /** Text shown in the tooltip on hover. @default "Copy" */
  text?: unknown;
  /** Text announced after copying. @default "Copied" */
  copiedText?: string;
  /** Tooltip placement. @default "top" */
  side?: TooltipSide;
};

export type ClipboardTextInput = Omit<HTMLElementProps<HTMLDivElement>, "className" | "children"> &
  ClipboardTextVariantsProps &
  Record<string, unknown> & {
    /** The text to display and copy to the clipboard. */
    text: string;
    /** Text copied to the clipboard instead of `text`. */
    textToCopy?: string;
    /** Additional CSS classes applied to the root. */
    class?: string;
    className?: string;
    /** Callback fired after text is copied successfully. */
    onCopy?: (text: string) => void;
    /** Optional tooltip for the copy action. */
    tooltip?: ClipboardTextTooltip | boolean;
    /** Accessible labels for i18n. */
    labels?: ClipboardTextLabels;
  };

const copiedIcon = Icon({ icon: Check });
const copyIcon = Icon({ icon: Copy });

function srText(copiedText: string) {
  return html`<span
    data-slot="clipboard-text-status"
    class="sr-only"
    aria-live="polite"
    data-copied-text="${copiedText}"
  ></span>`;
}

function copyButton(input: {
  buttonSize: ButtonSize;
  copyAction: string;
  copiedText: string;
  textToCopy: string;
  inlineCopy?: boolean;
}) {
  const { buttonSize, copiedText, copyAction, textToCopy, inlineCopy } = input;

  const classes = cn(
    buttonVariants({ variant: "ghost", size: buttonSize, shape: "base" }),
    "relative isolate overflow-hidden rounded-l-none rounded-r-[inherit] border-l border-areia-divider px-3 transition-all duration-200",
    "focus:ring-inset focus:ring-areia-ring/50 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-areia-ring",
  );

  return html`<button
    aria-label="${copyAction}"
    data-slot="clipboard-text-button"
    data-copy-text="${textToCopy}"
    data-copied-text="${copiedText}"
    type="button"
    data-variant="ghost"
    class="${classes}"
    ${inlineCopy ? raw(` onclick="${CLIPBOARD_TEXT_INLINE_ONCLICK}"`) : ""}
  >
    <span class="contents"
      ><span
        data-slot="clipboard-text-copied-icon"
        class="pointer-events-none absolute inset-0 flex translate-y-full items-center justify-center opacity-0 transition-all duration-200"
        >${copiedIcon}</span
      >
      <span
        data-slot="clipboard-text-copy-icon"
        class="flex items-center justify-center transition-all duration-200"
        >${copyIcon}</span
      ></span
    >
  </button>`;
}

function renderClipboardText(input: ClipboardTextInput) {
  const {
    class: className,
    className: aliasedClassName,
    labels,
    onCopy,
    size = CLIPBOARD_TEXT_DEFAULT_VARIANTS.size,
    text,
    textToCopy = text,
    tooltip,
    ...props
  } = input;

  const config = sizeConfig(size);
  const copyAction = labels?.copyAction ?? "Copy to clipboard";
  const tooltipConfig = tooltip && typeof tooltip === "object" ? tooltip : undefined;
  const tooltipText = tooltipConfig?.text ?? "Copy";
  const copiedText = tooltipConfig?.copiedText ?? "Copied";
  const tooltipSide = tooltipConfig?.side ?? "top";
  const button = copyButton({
    buttonSize: config.buttonSize,
    copiedText,
    copyAction,
    textToCopy,
    inlineCopy: onCopy == null,
  });

  return html`<div
    data-slot="clipboard-text"
    class="${cn(
      inputVariants({ size: config.buttonSize, parentFocusIndicator: true }),
      clipboardTextVariants({ size }),
      className,
      aliasedClassName,
    )}"
    ${raw(toAttrs(props))}
  >
    <span data-slot="clipboard-text-value" class="grow truncate ps-4 pe-2">${text}</span>
    ${tooltip
      ? Tooltip.Static({
          content: tooltipText,
          side: tooltipSide,
          sideOffset: 8,
          trigger: button,
          triggerClass: "contents",
          contentClass: "font-sans text-xs",
        })
      : button}
    ${srText(copiedText)}
  </div>`;
}

function setCopiedState(root: Element, copied: boolean) {
  const copiedIconElement = root.querySelector('[data-slot="clipboard-text-copied-icon"]');
  const copyIconElement = root.querySelector('[data-slot="clipboard-text-copy-icon"]');
  const status = root.querySelector('[data-slot="clipboard-text-status"]');

  copiedIconElement?.classList.toggle("translate-y-full", !copied);
  copiedIconElement?.classList.toggle("translate-y-0", copied);
  copiedIconElement?.classList.toggle("opacity-0", !copied);
  copiedIconElement?.classList.toggle("opacity-100", copied);
  copyIconElement?.classList.toggle("-translate-y-full", copied);
  copyIconElement?.classList.toggle("opacity-0", copied);
  copyIconElement?.classList.toggle("opacity-100", !copied);

  if (status) {
    status.textContent = copied ? (status.getAttribute("data-copied-text") ?? "Copied") : "";
  }
}

const clipboardTimers = new WeakMap<Element, ReturnType<typeof setTimeout>>();

function resolveClipboardRoot(host: Element): HTMLElement | null {
  return host.matches('[data-slot="clipboard-text"]')
    ? (host as HTMLElement)
    : host.querySelector<HTMLElement>('[data-slot="clipboard-text"]');
}

export const ClipboardTextRoot = ilha
  .input<ClipboardTextInput>()
  .action("copy", async (_props: undefined, { input, host, signal }) => {
    const root = resolveClipboardRoot(host);
    if (!root) return;
    const text = input.textToCopy ?? input.text;
    try {
      await writeClipboard(text);
      if (signal.aborted) return;
      setCopiedState(root, true);
      input.onCopy?.(text);
      clearTimeout(clipboardTimers.get(host));
      const timer = setTimeout(() => setCopiedState(root, false), 1500);
      clipboardTimers.set(host, timer);
      signal.addEventListener("abort", () => clearTimeout(timer), { once: true });
    } catch (error) {
      if (signal.aborted) return;
      console.warn("Clipboard copy failed", error);
    }
  })
  .on("[data-slot='clipboard-text-button']@click", ({ action, input }) => {
    if (input.onCopy == null) return;
    action.copy();
  })
  .render(({ input }) => renderClipboardText(input));

function ClipboardTextBase(input: ClipboardTextInput) {
  return renderClipboardText(input);
}

function ClipboardTextComponent(input: ClipboardTextInput) {
  return input.onCopy ? ClipboardTextRoot(input) : renderClipboardText(input);
}

export const ClipboardText = Object.assign(ClipboardTextComponent, {
  Root: ClipboardTextRoot,
  Static: ClipboardTextBase,
});
