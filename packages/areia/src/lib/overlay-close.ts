import { html, raw } from "ilha";
import type { RawHtml } from "ilha";
import { cn } from "$lib/cn";
import { toAttrs } from "$lib/input";
import { isIlhaIsland, islandCallParts, render, renderString, withSlot } from "$lib/markup";

export type OverlayCloseTag = "button" | "span" | "div" | "a";

export function overlayCloseChildNeedsButtonWrapper(children: unknown): boolean {
  if (children === null || children === undefined || children === false) return false;
  if (typeof children === "string" || typeof children === "number") return false;
  if (isIlhaIsland(children) || islandCallParts(children)) return false;
  const markup = renderString(children).trimStart();
  if (!markup) return false;
  return markup.startsWith("<svg") || /^<svg[\s>]/i.test(markup);
}

export function resolveOverlayCloseChildren(children: unknown, as: OverlayCloseTag) {
  if (as !== "button") return children;
  if (!overlayCloseChildNeedsButtonWrapper(children)) return children;
  return html`<span class="inline-flex">${render(children)}</span>`;
}

export function renderOverlayClose(input: {
  slot: string;
  as?: OverlayCloseTag;
  children?: unknown;
  class?: string;
  className?: string;
  type?: string | RawHtml;
  props?: Record<string, unknown>;
}): ReturnType<typeof html> {
  const {
    slot,
    as = "button",
    children = "Close",
    class: className,
    className: aliasedClassName,
    type,
    props = {},
  } = input;

  const resolvedChildren = resolveOverlayCloseChildren(children, as);
  const slottedChild = withSlot(resolvedChildren, slot, className, aliasedClassName);
  if (slottedChild) {
    if (as === "button" && overlayCloseChildNeedsButtonWrapper(children)) {
      return html`<button
        type="${type ?? "button"}"
        data-slot="${slot}"
        class="${cn(className, aliasedClassName)}"
        ${raw(toAttrs(props))}
      >
        ${render(children)}
      </button>`;
    }
    return slottedChild;
  }

  const tag = as;

  return html`<${raw(tag)}
    data-slot="${slot}"
    class="${cn(className, aliasedClassName)}"
    ${raw(toAttrs({ ...props, type: tag === "button" ? (type ?? "button") : type }))}
  >${render(resolvedChildren)}</${raw(tag)}>`;
}
