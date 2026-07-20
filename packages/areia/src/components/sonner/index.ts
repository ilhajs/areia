import ilha, { html, raw } from "ilha";
import { toast as sonnerToast } from "sonner";
import { cn } from "$lib/cn";
import { toAttrs } from "$lib/input";
import type { HTMLElementProps } from "$lib/types";
import type { ToastT, ToastToDismiss, ToasterProps } from "sonner";

export type ToasterInput = Omit<HTMLElementProps<HTMLDivElement>, "className" | "children"> &
  Omit<
    ToasterProps,
    "className" | "style" | "icons" | "toastOptions" | "hotkey" | "swipeDirections"
  > &
  Record<string, unknown> & {
    class?: string;
    className?: string;
  };

type ToastRecord = ToastT | ToastToDismiss;
type ToastMethod = (...args: unknown[]) => unknown;

const patchedToasts = new Set<() => void>();
let unpatchToast: (() => void) | undefined;

function subscribeToSonner(listener: () => void) {
  patchedToasts.add(listener);

  if (!unpatchToast) {
    const methods = [
      "success",
      "info",
      "warning",
      "error",
      "custom",
      "message",
      "promise",
      "dismiss",
      "loading",
    ] as const;
    const originals = new Map<string, ToastMethod>();
    const notify = () => queueMicrotask(() => patchedToasts.forEach((callback) => callback()));

    const patch = (key: string) => {
      const original = (sonnerToast as unknown as Record<string, ToastMethod>)[key];
      originals.set(key, original);
      (sonnerToast as unknown as Record<string, ToastMethod>)[key] = (...args: unknown[]) => {
        const result = original(...args);
        notify();
        return result;
      };
    };

    methods.forEach(patch);
    unpatchToast = () => {
      for (const [key, original] of originals) {
        if (key === "default") continue;
        (sonnerToast as unknown as Record<string, ToastMethod>)[key] = original;
      }
      unpatchToast = undefined;
    };
  }

  return () => {
    patchedToasts.delete(listener);
    if (patchedToasts.size === 0) unpatchToast?.();
  };
}

function renderNode(value: unknown) {
  const node = typeof value === "function" ? (value as () => unknown)() : value;
  if (node == null || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return node;
  if (typeof node === "object" && "value" in node)
    return raw(String((node as { value: unknown }).value));
  return "";
}

function toMarkup(value: unknown) {
  if (typeof value === "object" && value !== null && "value" in value) {
    return String((value as { value: unknown }).value);
  }
  return String(value ?? "");
}

function positionClasses(position: string) {
  return cn(
    position.includes("top") ? "top-4" : "bottom-4",
    position.includes("left") && "left-4",
    position.includes("right") && "right-4",
    position.includes("center") && "left-1/2 -translate-x-1/2",
  );
}

function ensureSonnerStyles() {
  if (typeof document === "undefined" || document.getElementById("areia-sonner-styles")) return;

  const style = document.createElement("style");
  style.id = "areia-sonner-styles";
  style.textContent = `
    [data-areia-sonner-toast] {
      --areia-sonner-enter-x: 0;
      --areia-sonner-enter-y: 100%;
      --areia-sonner-exit-x: 0;
      --areia-sonner-exit-y: 100%;
      transform-origin: center;
      will-change: transform, opacity;
      animation: areia-sonner-enter 400ms cubic-bezier(.21,1.02,.73,1) forwards;
    }
    [data-areia-sonner-toast][data-position*="right"] {
      --areia-sonner-enter-x: 100%;
      --areia-sonner-enter-y: 0;
      --areia-sonner-exit-x: 100%;
      --areia-sonner-exit-y: 0;
    }
    [data-areia-sonner-toast][data-position*="left"] {
      --areia-sonner-enter-x: -100%;
      --areia-sonner-enter-y: 0;
      --areia-sonner-exit-x: -100%;
      --areia-sonner-exit-y: 0;
    }
    [data-areia-sonner-toast][data-position*="top"]:not([data-position*="left"]):not([data-position*="right"]) {
      --areia-sonner-enter-y: -100%;
      --areia-sonner-exit-y: -100%;
    }
    [data-areia-sonner-toast][data-state="closed"] {
      pointer-events: none;
      animation: areia-sonner-exit 200ms ease-in forwards;
    }
    @keyframes areia-sonner-enter {
      from { opacity: 0; transform: translate3d(var(--areia-sonner-enter-x), var(--areia-sonner-enter-y), 0) scale(.95); }
      to { opacity: 1; transform: translate3d(0, 0, 0) scale(1); }
    }
    @keyframes areia-sonner-exit {
      from { opacity: 1; transform: translate3d(0, 0, 0) scale(1); }
      to { opacity: 0; transform: translate3d(var(--areia-sonner-exit-x), var(--areia-sonner-exit-y), 0) scale(.95); }
    }
    @media (prefers-reduced-motion: reduce) {
      [data-areia-sonner-toast],
      [data-areia-sonner-toast][data-state="closed"] {
        animation-duration: 1ms !important;
      }
    }
  `;
  document.head.appendChild(style);
}

function renderToaster(input: ToasterInput = {}) {
  const {
    class: className,
    className: aliasedClassName,
    id,
    position = "bottom-right",
    theme = "light",
    richColors,
    expand,
    duration,
    visibleToasts,
    closeButton,
    gap,
    ...props
  } = input;

  return html`<div
    id="${id ?? "sonner-toaster"}"
    data-slot="sonner-toaster"
    data-areia-sonner-toaster
    data-theme="${theme}"
    data-position="${position}"
    class="${cn(
      "fixed z-[2147483647] flex flex-col gap-3 pointer-events-none",
      positionClasses(position),
      className,
      aliasedClassName,
    )}"
    ${raw(
      toAttrs({
        ...props,
        "data-rich-colors": richColors,
        "data-expand": expand,
        "data-duration": duration,
        "data-visible-toasts": visibleToasts,
        "data-close-button": closeButton,
        "data-gap": gap,
      }),
    )}
  ></div>`;
}

function readInput(root: HTMLElement, fallback: ToasterInput = {}): ToasterInput {
  return {
    ...fallback,
    closeButton: fallback.closeButton ?? root.hasAttribute("data-close-button"),
    duration: fallback.duration ?? numberAttr(root, "data-duration"),
    visibleToasts: fallback.visibleToasts ?? numberAttr(root, "data-visible-toasts"),
  };
}

function numberAttr(root: HTMLElement, name: string) {
  const value = root.getAttribute(name);
  return value == null || value === "" ? undefined : Number(value);
}

function sonnerItems(input: ToasterInput) {
  return sonnerToast
    .getToasts()
    .filter((item: ToastRecord): item is ToastT => !("dismiss" in item))
    .slice(-(input.visibleToasts ?? 3));
}

const TOAST_LIFETIME = 4000;
const EXIT_DURATION = 200;

function toastSelector(id: string | number) {
  return `[data-toast-id="${CSS.escape(String(id))}"]`;
}

function toastMarkup(toastItem: ToastT, defaults: ToasterInput) {
  const type = toastItem.type ?? "normal";
  const closeButton = toastItem.closeButton ?? defaults.closeButton;
  const position = toastItem.position ?? defaults.position ?? "bottom-right";

  return html`<div
    data-areia-sonner-toast
    data-toast-id="${toastItem.id}"
    data-position="${position}"
    data-type="${type}"
    data-state="open"
    class="${cn(
      "pointer-events-auto grid min-w-80 max-w-[calc(100vw-2rem)] gap-1 rounded-lg border border-areia-border bg-areia-background px-4 py-3 text-areia-default shadow-lg",
      type === "success" && "border-green-500",
      type === "error" && "border-red-500",
      type === "warning" && "border-yellow-500",
      type === "info" && "border-blue-500",
      toastItem.className,
    )}"
  >
    <div class="flex items-start gap-3">
      ${toastItem.icon ? html`<div>${renderNode(toastItem.icon)}</div>` : ""}
      <div class="min-w-0 flex-1">
        <div class="font-medium">${renderNode(toastItem.title)}</div>
        ${toastItem.description
          ? html`<div class="${cn("text-sm text-areia-subtle", toastItem.descriptionClassName)}">
              ${renderNode(toastItem.description)}
            </div>`
          : ""}
      </div>
      ${closeButton
        ? html`<button
            type="button"
            data-areia-sonner-close="${toastItem.id}"
            class="text-areia-subtle hover:text-areia-default"
          >
            ×
          </button>`
        : ""}
    </div>
  </div>`;
}

const mountedRoots = new WeakMap<HTMLElement, () => void>();

function mountToaster(root: HTMLElement, input: ToasterInput = {}) {
  mountedRoots.get(root)?.();
  ensureSonnerStyles();

  const originalParent = root.parentNode;
  const originalNextSibling = root.nextSibling;
  if (root.parentElement !== document.body) document.body.appendChild(root);

  const timers = new Map<string, ReturnType<typeof setTimeout>>();
  const removalTimers = new Map<string, ReturnType<typeof setTimeout>>();
  const renderedToasts = new Map<string, string>();

  const remove = (id: string | number) => {
    const key = String(id);
    clearTimeout(timers.get(key));
    timers.delete(key);

    const toast = root.querySelector<HTMLElement>(toastSelector(key));
    if (!toast || toast.dataset.state === "closed") return;

    toast.dataset.state = "closed";
    clearTimeout(removalTimers.get(key));
    removalTimers.set(
      key,
      setTimeout(() => {
        toast.remove();
        renderedToasts.delete(key);
        removalTimers.delete(key);
      }, EXIT_DURATION),
    );
  };

  const render = () => {
    const currentInput = readInput(root, input);
    const items = sonnerItems(currentInput);
    const nextIds = new Set(items.map((item) => String(item.id)));

    root.querySelectorAll<HTMLElement>("[data-areia-sonner-toast]").forEach((toast) => {
      const id = toast.dataset.toastId;
      if (id && !nextIds.has(id)) remove(id);
    });

    for (const item of items) {
      const key = String(item.id);
      const existing = root.querySelector<HTMLElement>(toastSelector(key));
      const markup = toMarkup(toastMarkup(item, currentInput));

      if (existing) {
        if (existing.dataset.state === "closed" || renderedToasts.get(key) === markup) continue;
        existing.outerHTML = markup;
      } else {
        root.insertAdjacentHTML("beforeend", markup);
      }

      renderedToasts.set(key, markup);
    }

    for (const item of items) {
      const key = String(item.id);
      if (item.duration === Infinity || timers.has(key)) continue;
      const duration = item.duration ?? currentInput.duration ?? TOAST_LIFETIME;
      timers.set(
        key,
        setTimeout(() => {
          item.onAutoClose?.(item);
          remove(item.id);
          setTimeout(() => sonnerToast.dismiss(item.id), EXIT_DURATION);
        }, duration),
      );
    }
  };

  const unsubscribe = subscribeToSonner(render);
  const click = (event: Event) => {
    const button = (event.target as HTMLElement).closest<HTMLElement>("[data-areia-sonner-close]");
    if (button?.dataset.areiaSonnerClose) {
      remove(button.dataset.areiaSonnerClose);
      setTimeout(() => sonnerToast.dismiss(button.dataset.areiaSonnerClose), EXIT_DURATION);
    }
  };

  root.addEventListener("click", click);
  render();

  const destroy = () => {
    unsubscribe();
    root.removeEventListener("click", click);
    timers.forEach(clearTimeout);
    removalTimers.forEach(clearTimeout);
    if (originalParent) originalParent.insertBefore(root, originalNextSibling);
    mountedRoots.delete(root);
  };
  mountedRoots.set(root, destroy);
  return destroy;
}

/** Mount any toaster roots present in the document that are not yet live. */
export function ensureToastersMounted(doc: Document | undefined = globalThis.document) {
  if (!doc) return;
  doc
    .querySelectorAll<HTMLElement>("[data-areia-sonner-toaster]")
    .forEach((root) => !mountedRoots.has(root) && mountToaster(root));
}

function ensureToasterInDocument(doc: Document = document) {
  ensureToastersMounted(doc);
  if (doc.querySelector("[data-areia-sonner-toaster]")) return;

  const holder = doc.createElement("div");
  holder.innerHTML = toMarkup(
    renderToaster({
      position: "bottom-right",
      theme: "system",
      richColors: true,
      closeButton: true,
    }),
  );
  const root = holder.firstElementChild as HTMLElement | null;
  if (!root) return;
  doc.body.appendChild(root);
  mountToaster(root, {
    position: "bottom-right",
    theme: "system",
    richColors: true,
    closeButton: true,
  });
}

/** Guarantee a live toaster exists, then show a toast (docs / late SPA mounts). */
export function showToast(
  type: "success" | "error" | "info" | "warning" | "message" | "loading",
  title: string,
  options?: Parameters<typeof sonnerToast.success>[1],
) {
  if (typeof document !== "undefined") ensureToasterInDocument(document);
  if (type === "message") return sonnerToast(title, options);
  return sonnerToast[type](title, options);
}

if (typeof document !== "undefined") {
  const boot = () => ensureToastersMounted();
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    queueMicrotask(boot);
  }
  // Layout/SPA islands often insert the toaster after the module microtask.
  queueMicrotask(() => {
    const observer = new MutationObserver(() => ensureToastersMounted());
    observer.observe(document.documentElement, { childList: true, subtree: true });
  });
}

export const ToasterRoot = ilha
  .input<ToasterInput>()
  .onMount(({ host, input }) => {
    const root = host.matches("[data-areia-sonner-toaster]")
      ? (host as HTMLElement)
      : host.querySelector<HTMLElement>("[data-areia-sonner-toaster]");
    if (!root) return;
    return mountToaster(root, input);
  })
  .render(({ input }) => renderToaster(input));

export function ToasterStatic(input: ToasterInput = {}) {
  return renderToaster(input);
}

export const Toaster = Object.assign(ToasterRoot, {
  Root: ToasterRoot,
  Static: ToasterStatic,
});
