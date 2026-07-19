import { html, raw } from "ilha";
import { cn } from "$lib/cn";

/**
 * Decode HTML entities from a fully entity-escaped markup string (no literal tags).
 *
 * Serialized ilha markup contains literal `<` tags with correctly escaped
 * attribute values; decoding entities inside it would corrupt attributes like
 * `data-ilha-props`, so such strings pass through untouched.
 */
export function decodeMarkupEntities(markup: string): string {
  if (markup.includes("<")) return markup;
  if (!/&(?:lt|gt|quot|#39|amp);/.test(markup)) return markup;
  return markup
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&");
}

/** Extract serialized HTML string from ilha markup objects. */
export function rawValue(value: unknown): string | undefined {
  if (typeof value === "string") return value;
  if (
    typeof value === "object" &&
    value !== null &&
    "value" in value &&
    typeof value.value === "string"
  ) {
    return value.value;
  }
  return undefined;
}

export function islandCallParts(
  value: unknown,
): { island: { toString?: (props?: unknown) => string }; props?: unknown } | undefined {
  if (!value || (typeof value !== "object" && typeof value !== "function")) return undefined;
  const symbol = Object.getOwnPropertySymbols(value).find(
    (item) => item.description === "ilha.islandCall",
  );
  if (!symbol) return undefined;
  const record = value as Record<PropertyKey, unknown>;
  const island = record["island"];
  if (!island || (typeof island !== "object" && typeof island !== "function")) return undefined;
  return { island: island as { toString?: (props?: unknown) => string }, props: record["props"] };
}

export function isIlhaIsland(value: unknown): boolean {
  if (!value || (typeof value !== "object" && typeof value !== "function")) return false;
  return Object.getOwnPropertySymbols(value).some(
    (item) => item.description === "ilha.island" || item.description === "ilha.islandMountInternal",
  );
}

/** Unwrap serialized HTML and ilha islands for template interpolation. */
export function render(value: unknown): unknown {
  if (value === null || value === undefined || value === false) return "";
  if (Array.isArray(value)) return value.map(render);
  if (typeof value === "string") return raw(decodeMarkupEntities(value));
  const markup = rawValue(value);
  if (markup !== undefined) return raw(decodeMarkupEntities(markup));
  if (isIlhaIsland(value) || islandCallParts(value)) return value;
  return value;
}

/** Stringify markup for slot detection and HTML attribute injection. */
export function renderString(value: unknown): string {
  if (value === null || value === undefined || value === false) return "";
  if (Array.isArray(value)) return value.map(renderString).join("");
  if (isIlhaIsland(value)) return "";
  const markup = rawValue(value);
  if (markup !== undefined) return markup;
  const islandCall = islandCallParts(value);
  if (islandCall?.island.toString) return islandCall.island.toString(islandCall.props);
  if (typeof value === "object" && value !== null && "value" in value) {
    return String(value.value);
  }
  return String(value);
}

/** Like {@link renderString}, but serializes Ilha islands for `data-slot` detection. */
export function renderStringForSlots(value: unknown): string {
  if (value === null || value === undefined || value === false) return "";
  if (Array.isArray(value)) return value.map(renderStringForSlots).join("");
  if (isIlhaIsland(value) || islandCallParts(value)) {
    return rawValue(html`${value}`) ?? "";
  }
  return renderString(value);
}

/** Whether `children` / `content` / similar props carry markup or live Ilha islands. */
export function hasRenderableContent(value: unknown): boolean {
  if (value === null || value === undefined || value === false) return false;
  if (Array.isArray(value)) return value.some(hasRenderableContent);
  if (isIlhaIsland(value) || islandCallParts(value)) return true;
  const markup = rawValue(value);
  if (markup !== undefined) return markup.trim().length > 0;
  if (typeof value === "string") return value.trim().length > 0;
  return true;
}

/** Pre-render child props for {@link *.Static} SSR-only entry points (freezes reactive templates). */
export function normalizeStaticChildSlots<T extends Record<string, unknown>>(
  input: T,
  keys: readonly (keyof T)[],
): T {
  const next = { ...input };
  for (const key of keys) {
    const value = next[key];
    if (value != null) next[key] = render(value) as T[keyof T];
  }
  return next;
}

export function hasSlot(value: unknown, slot: string) {
  return new RegExp(`\\sdata-slot=["']${slot}["']`).test(renderStringForSlots(value));
}

/** Inject data-slot and classes into serialized HTML trigger markup. */
export function withSlot(
  value: unknown,
  slot: string,
  className?: string,
  aliasedClassName?: string,
) {
  const islandMarkup = isIlhaIsland(value) ? rawValue(html`${value}`) : undefined;
  const markup = islandMarkup ?? renderString(value);
  if (!markup || !markup.trimStart().startsWith("<")) return undefined;

  const classes = cn(className, aliasedClassName);
  let next = markup;

  if (!/\sdata-slot=/.test(next)) {
    next = next.replace(/<([a-zA-Z][^\s/>]*)([^>]*)>/, `<$1$2 data-slot="${slot}">`);
  }

  if (classes) {
    if (/\sclass=\"/.test(next)) {
      next = next.replace(/\sclass=\"([^\"]*)\"/, ` class="${classes} $1"`);
    } else {
      next = next.replace(/<([a-zA-Z][^\s/>]*)([^>]*)>/, `<$1$2 class="${classes}">`);
    }
  }

  return raw(next);
}
