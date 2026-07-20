import { raw } from "ilha";
import type { IconNode } from "lucide";
import { cn } from "$lib/cn";

type IconAttrs = Record<string, string | number | boolean | undefined | null>;

export interface IconInput {
  /** Lucide icon node, e.g. `Info`, `TriangleAlert`, or `CircleX`. */
  icon?: IconNode;
  /** Additional CSS classes applied to the root SVG. */
  class?: string;
  className?: string;
  /** Accessible label. When omitted, the icon is hidden from assistive technology. */
  label?: string;
  /** SVG stroke width. */
  strokeWidth?: string | number;
}

function toKebab(str: string): string {
  return str.replace(/[A-Z]/g, (char) => `-${char.toLowerCase()}`);
}

function escapeAttr(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
}

function attrsToString(attrs: IconAttrs): string {
  return Object.entries(attrs)
    .flatMap(([key, value]) => {
      if (value === null || value === undefined || value === false) return [];
      const attr = key === "className" ? "class" : toKebab(key);
      if (value === true) return [attr];
      return `${attr}="${escapeAttr(String(value))}"`;
    })
    .join(" ");
}

export function Icon({
  icon,
  class: className,
  className: aliasedClassName,
  label,
  strokeWidth = 1.75,
}: IconInput) {
  // Imprensa MDX auto-bind re-invokes non-island components with `{}` for side
  // effects; tolerate a missing node so docs pages that import Icon stay quiet.
  if (!icon || !Array.isArray(icon)) {
    return raw("");
  }

  const children = icon
    .map(([tag, attrs]) => {
      const attrString = attrsToString(attrs as IconAttrs);
      return `<${tag}${attrString ? ` ${attrString}` : ""}></${tag}>`;
    })
    .join("");

  const accessibilityAttrs = label
    ? `role="img" aria-label="${escapeAttr(label)}"`
    : 'aria-hidden="true"';

  return raw(`<svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="${escapeAttr(String(strokeWidth))}"
    stroke-linecap="round"
    stroke-linejoin="round"
    class="${escapeAttr(cn("h-4 w-4", className, aliasedClassName))}"
    ${accessibilityAttrs}
  >${children}</svg>`);
}
