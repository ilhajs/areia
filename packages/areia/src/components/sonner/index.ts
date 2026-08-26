import { effect, ilha, html, raw } from "ilha";
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

export const toast: typeof sonnerToast = Object.assign((message: string | unknown, data?: any) => {
  const id = sonnerToast(message as any, data);
  queueMicrotask(() => patchedToasts.forEach((callback) => callback()));
  return id;
}, sonnerToast);

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
      "dismiss",
      "loading",
    ] as const;
    const originals = new Map<string, any>();
    const notify = () => queueMicrotask(() => patchedToasts.forEach((callback) => callback()));

    const patch = (key: string) => {
      const original = (sonnerToast as any)[key];
      originals.set(key, original);
      (toast as any)[key] = (...args: unknown[]) => {
        const result = original(...args);
        notify();
        return result;
      };
    };

    methods.forEach(patch);

    // promise needs special handling to trigger render on resolution
    const originalPromise = sonnerToast.promise;
    originals.set("promise", originalPromise);
    toast.promise = (...args: any[]) => {
      const result = (originalPromise as any)(...args);
      notify();
      if (args[0] && typeof args[0].then === "function") {
        args[0].then(notify, notify);
      } else if (result && typeof result.then === "function") {
        result.then(notify, notify);
      } else if (result && typeof result.unwrap === "function") {
        result.unwrap().then(notify, notify);
      }
      return result;
    };

    unpatchToast = () => {
      for (const [key, original] of originals) {
        (toast as any)[key] = original;
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

function ensureSonnerStyles(doc: Document) {
  if (doc.getElementById("areia-sonner-styles")) return;

  const style = doc.createElement("style");
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
  doc.head.appendChild(style);
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
    position: fallback.position ?? (root.getAttribute("data-position") as any) ?? undefined,
    theme: fallback.theme ?? (root.getAttribute("data-theme") as any) ?? undefined,
    class: fallback.class ?? root.className,
    closeButton: fallback.closeButton ?? root.hasAttribute("data-close-button"),
    duration: fallback.duration ?? numberAttr(root, "data-duration"),
    visibleToasts: fallback.visibleToasts ?? numberAttr(root, "data-visible-toasts"),
    gap: fallback.gap ?? numberAttr(root, "data-gap"),
    richColors: fallback.richColors ?? root.hasAttribute("data-rich-colors"),
    expand: fallback.expand ?? root.hasAttribute("data-expand"),
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

const DOCUMENT_RUNTIME = Symbol.for("areia.sonner.document-runtime");
const DOCUMENT_RUNTIME_VERSION = 1;
const DEFAULT_INPUT: ToasterInput = {
  position: "bottom-right",
  theme: "system",
  richColors: true,
  closeButton: true,
};

type OwnerRegistration = {
  input: ToasterInput;
};

type DocumentRuntime = {
  version: typeof DOCUMENT_RUNTIME_VERSION;
  doc: Document;
  root: HTMLElement;
  owners: Map<HTMLElement, OwnerRegistration>;
  registerOwner: (owner: HTMLElement, input?: ToasterInput) => () => void;
  render: () => void;
  destroy: () => void;
  destroyed: boolean;
};

type RuntimeDocument = Document & {
  [DOCUMENT_RUNTIME]?: DocumentRuntime;
};

function runtimeFor(doc: Document): DocumentRuntime | undefined {
  const runtime = (doc as RuntimeDocument)[DOCUMENT_RUNTIME];
  return runtime?.version === DOCUMENT_RUNTIME_VERSION && !runtime.destroyed ? runtime : undefined;
}

function setRuntime(doc: Document, runtime: DocumentRuntime | undefined) {
  const target = doc as RuntimeDocument;
  if (runtime) {
    Object.defineProperty(target, DOCUMENT_RUNTIME, {
      value: runtime,
      configurable: true,
    });
  } else {
    delete target[DOCUMENT_RUNTIME];
  }
}

function attributeValue(value: unknown): string {
  if (typeof value === "object" && value !== null && "value" in value) {
    return String(value.value);
  }
  return String(value);
}

function applyRootInput(root: HTMLElement, input: ToasterInput) {
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

  while (root.attributes.length > 0) root.removeAttribute(root.attributes[0]!.name);
  root.id = attributeValue(id ?? "sonner-toaster");
  root.setAttribute("data-slot", "sonner-toaster");
  root.setAttribute("data-areia-sonner-toaster", "");
  root.setAttribute("data-theme", String(theme));
  root.setAttribute("data-position", position);
  root.className = cn(
    "fixed z-[2147483647] flex flex-col gap-3 pointer-events-none",
    positionClasses(position),
    className,
    aliasedClassName,
  );

  const optionalAttributes: Record<string, unknown> = {
    ...props,
    "data-rich-colors": richColors,
    "data-expand": expand,
    "data-duration": duration,
    "data-visible-toasts": visibleToasts,
    "data-close-button": closeButton,
    "data-gap": gap,
  };
  for (const [rawName, value] of Object.entries(optionalAttributes)) {
    if (
      value == null ||
      value === false ||
      typeof value === "function" ||
      rawName.startsWith("bind:") ||
      rawName.toLowerCase().startsWith("on")
    ) {
      continue;
    }
    const name = rawName === "className" ? "class" : rawName === "htmlFor" ? "for" : rawName;
    if (!/^[A-Za-z_:][A-Za-z0-9:._-]*$/.test(name) || name === "style") continue;
    root.setAttribute(name, value === true ? "" : attributeValue(value));
  }
}

function toasterElement(doc: Document, input: ToasterInput): HTMLElement {
  const root = doc.createElement("div");
  applyRootInput(root, input);
  return root;
}

function appendToastContent(parent: HTMLElement, value: unknown) {
  const resolved = typeof value === "function" ? value() : value;
  if (resolved == null || typeof resolved === "boolean") return;
  if (Array.isArray(resolved)) {
    resolved.forEach((item) => appendToastContent(parent, item));
    return;
  }
  if (resolved instanceof parent.ownerDocument.defaultView!.Node) {
    parent.appendChild(resolved);
    return;
  }
  if (typeof resolved === "object" && "value" in resolved) {
    const parsed = new parent.ownerDocument.defaultView!.DOMParser().parseFromString(
      String(resolved.value),
      "text/html",
    );
    parent.append(...parsed.body.childNodes);
    return;
  }
  parent.append(String(resolved));
}

function createToastElement(doc: Document, toastItem: ToastT, defaults: ToasterInput) {
  const type = toastItem.type ?? "normal";
  const closeButton = toastItem.closeButton ?? defaults.closeButton;
  const position = toastItem.position ?? defaults.position ?? "bottom-right";
  const toast = doc.createElement("div");
  toast.setAttribute("data-areia-sonner-toast", "");
  toast.setAttribute("data-toast-id", String(toastItem.id));
  toast.setAttribute("data-position", position);
  toast.setAttribute("data-type", type);
  toast.setAttribute("data-state", "open");
  toast.className = cn(
    "pointer-events-auto grid min-w-80 max-w-[calc(100vw-2rem)] gap-1 rounded-lg border border-areia-border bg-areia-background px-4 py-3 text-areia-default shadow-lg",
    type === "success" && "border-green-500",
    type === "error" && "border-red-500",
    type === "warning" && "border-yellow-500",
    type === "info" && "border-blue-500",
    toastItem.className,
  );

  const row = doc.createElement("div");
  row.className = "flex items-start gap-3";
  if (toastItem.icon) {
    const icon = doc.createElement("div");
    appendToastContent(icon, toastItem.icon);
    row.appendChild(icon);
  }
  const content = doc.createElement("div");
  content.className = "min-w-0 flex-1";
  const title = doc.createElement("div");
  title.className = "font-medium";
  appendToastContent(title, toastItem.title);
  content.appendChild(title);
  if (toastItem.description) {
    const description = doc.createElement("div");
    description.className = cn("text-sm text-areia-subtle", toastItem.descriptionClassName);
    appendToastContent(description, toastItem.description);
    content.appendChild(description);
  }
  row.appendChild(content);
  if (closeButton) {
    const close = doc.createElement("button");
    close.type = "button";
    close.setAttribute("data-areia-sonner-close", String(toastItem.id));
    close.className = "text-areia-subtle hover:text-areia-default";
    close.textContent = "×";
    row.appendChild(close);
  }
  toast.appendChild(row);
  return toast;
}

function createDocumentRuntime(doc: Document): DocumentRuntime {
  ensureSonnerStyles(doc);

  const root = toasterElement(doc, DEFAULT_INPUT);
  doc.body.appendChild(root);

  const owners = new Map<HTMLElement, OwnerRegistration>();
  const ownerRecords = new WeakMap<HTMLElement, OwnerRegistration>();
  const timers = new Map<string, ReturnType<typeof setTimeout>>();
  const removalTimers = new Map<string, ReturnType<typeof setTimeout>>();
  const dismissTimers = new Map<string, ReturnType<typeof setTimeout>>();
  const renderedToasts = new Map<string, string>();
  let activeInput: ToasterInput = DEFAULT_INPUT;
  let observer: MutationObserver | undefined;

  const runtime: DocumentRuntime = {
    version: DOCUMENT_RUNTIME_VERSION,
    doc,
    root,
    owners,
    registerOwner: () => () => {},
    render: () => {},
    destroy: () => {},
    destroyed: false,
  };

  const ensureRootConnected = () => {
    if (!root.isConnected || root.parentElement !== doc.body) doc.body.appendChild(root);
  };

  const resolveInput = () => {
    for (const [owner] of owners) {
      if (!owner.isConnected) owners.delete(owner);
    }
    const latest = [...owners.values()].at(-1);
    activeInput = latest?.input ?? DEFAULT_INPUT;
    applyRootInput(root, activeInput);
  };

  const scheduleDismiss = (id: string | number) => {
    const key = String(id);
    clearTimeout(dismissTimers.get(key));
    dismissTimers.set(
      key,
      setTimeout(() => {
        dismissTimers.delete(key);
        if (!runtime.destroyed) {
          const originalId = sonnerToast.getToasts().find((t) => String(t.id) === key)?.id ?? id;
          sonnerToast.dismiss(originalId);
        }
      }, EXIT_DURATION),
    );
  };

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
        removalTimers.delete(key);
        if (runtime.destroyed || !root.contains(toast)) return;
        toast.remove();
        renderedToasts.delete(key);
      }, EXIT_DURATION),
    );
  };

  const render = () => {
    if (runtime.destroyed) return;
    ensureRootConnected();
    const items = sonnerItems(activeInput);
    const nextIds = new Set(items.map((item) => String(item.id)));

    root.querySelectorAll<HTMLElement>("[data-areia-sonner-toast]").forEach((toast) => {
      const id = toast.dataset.toastId;
      if (id && !nextIds.has(id)) remove(id);
    });

    for (const item of items) {
      const key = String(item.id);
      const existing = root.querySelector<HTMLElement>(toastSelector(key));
      const signature = toMarkup(toastMarkup(item, activeInput));

      if (existing) {
        if (existing.dataset.state === "closed" || renderedToasts.get(key) === signature) continue;
        existing.replaceWith(createToastElement(doc, item, activeInput));
      } else {
        root.appendChild(createToastElement(doc, item, activeInput));
      }
      renderedToasts.set(key, signature);
    }

    for (const item of items) {
      const key = String(item.id);
      if (item.duration === Infinity || timers.has(key)) continue;
      const duration = item.duration ?? activeInput.duration ?? TOAST_LIFETIME;
      timers.set(
        key,
        setTimeout(() => {
          timers.delete(key);
          if (runtime.destroyed) return;
          item.onAutoClose?.(item);
          remove(item.id);
          scheduleDismiss(item.id);
        }, duration),
      );
    }
  };
  runtime.render = render;

  const unsubscribe = subscribeToSonner(render);
  const click = (event: Event) => {
    const target = event.target;
    if (!(target instanceof doc.defaultView!.Element)) return;
    const button = target.closest<HTMLElement>("[data-areia-sonner-close]");
    const id = button?.dataset.areiaSonnerClose;
    if (id == null) return;
    remove(id);
    scheduleDismiss(id);
  };
  root.addEventListener("click", click);

  const unregister = (owner: HTMLElement, registration: OwnerRegistration) => {
    if (ownerRecords.get(owner) !== registration) return;
    ownerRecords.delete(owner);
    if (owners.get(owner) === registration) owners.delete(owner);
    if (!runtime.destroyed) {
      resolveInput();
      render();
    }
  };

  runtime.registerOwner = (owner, input = {}) => {
    if (runtime.destroyed || owner === root) return () => {};
    ensureRootConnected();

    const registration = { input };
    registration.input = readInput(owner, input);
    ownerRecords.set(owner, registration);
    owners.set(owner, registration);

    owner.removeAttribute("data-areia-sonner-toaster");
    owner.setAttribute("data-areia-sonner-owner", "");
    owner.removeAttribute("id");
    owner.hidden = true;

    resolveInput();
    render();
    return () => unregister(owner, registration);
  };

  const ownersIn = (node: Node, selector: string) => {
    const matches: HTMLElement[] = [];
    if (node instanceof doc.defaultView!.HTMLElement && node.matches(selector)) matches.push(node);
    if (node instanceof doc.defaultView!.Element) {
      matches.push(...node.querySelectorAll<HTMLElement>(selector));
    }
    return matches;
  };

  observer = new doc.defaultView!.MutationObserver((mutations) => {
    if (runtime.destroyed) return;
    for (const mutation of mutations) {
      for (const node of mutation.removedNodes) {
        for (const owner of ownersIn(node, "[data-areia-sonner-owner]")) {
          const registration = ownerRecords.get(owner);
          if (registration) unregister(owner, registration);
        }
      }
      for (const node of mutation.addedNodes) {
        for (const owner of ownersIn(
          node,
          "[data-areia-sonner-toaster], [data-areia-sonner-owner]",
        )) {
          if (owner !== root) runtime.registerOwner(owner, readInput(owner));
        }
      }
    }
  });
  observer.observe(doc.documentElement, { childList: true, subtree: true });

  runtime.destroy = () => {
    if (runtime.destroyed) return;
    runtime.destroyed = true;
    observer?.disconnect();
    unsubscribe();
    root.removeEventListener("click", click);
    timers.forEach(clearTimeout);
    removalTimers.forEach(clearTimeout);
    dismissTimers.forEach(clearTimeout);
    owners.clear();
    root.remove();
    if (runtimeFor(doc) === runtime) setRuntime(doc, undefined);
  };

  setRuntime(doc, runtime);
  resolveInput();
  render();
  return runtime;
}

function acquireDocumentRuntime(doc: Document) {
  return runtimeFor(doc) ?? createDocumentRuntime(doc);
}

/** Mount toaster owner placeholders into the document-owned singleton runtime. */
export function ensureToastersMounted(doc: Document | undefined = globalThis.document) {
  if (!doc) return;
  const runtime = acquireDocumentRuntime(doc);
  doc.querySelectorAll<HTMLElement>("[data-areia-sonner-toaster]").forEach((owner) => {
    if (owner !== runtime.root) runtime.registerOwner(owner, readInput(owner));
  });
}

/** @internal Explicit document-runtime teardown for tests, HMR, and realm disposal. */
export function destroyToasterRuntime(doc: Document | undefined = globalThis.document) {
  if (!doc) return;
  runtimeFor(doc)?.destroy();
}

/** Guarantee a live toaster exists, then show a toast (docs / late SPA mounts). */
export function showToast(
  type: "success" | "error" | "info" | "warning" | "message" | "loading",
  title: string,
  options?: Parameters<typeof sonnerToast.success>[1],
) {
  const runtime = typeof document === "undefined" ? undefined : acquireDocumentRuntime(document);
  const id = type === "message" ? sonnerToast(title, options) : sonnerToast[type](title, options);
  // Named methods are patched above; this explicit render also covers callable toast().
  runtime?.render();
  return id;
}

if (typeof document !== "undefined") {
  const boot = () => ensureToastersMounted(document);
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    queueMicrotask(boot);
  }
}

export const ToasterRoot = ilha((input: ToasterInput) => {
  let host: Element;

  effect.once(({ host: __host }) => {
    host = __host;

    const root = host.matches("[data-areia-sonner-toaster]")
      ? (host as HTMLElement)
      : host.querySelector<HTMLElement>("[data-areia-sonner-toaster]");
    if (!root) return;
    return acquireDocumentRuntime(root.ownerDocument).registerOwner(root, input);
  });

  return renderToaster(input);
});

export function ToasterStatic(input: ToasterInput = {}) {
  return renderToaster(input);
}

export const Toaster = Object.assign(ToasterRoot, {
  Root: ToasterRoot,
  Static: ToasterStatic,
});
