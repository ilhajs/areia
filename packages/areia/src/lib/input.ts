// $lib/attrs.ts

function toKebab(str: string): string {
  return str.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);
}

function escapeAttr(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
}

export function toAttrs(input: Record<string, unknown>): string {
  const aliases: Record<string, string> = { className: "class", htmlFor: "for" };

  const attrs = Object.entries(input)
    .flatMap(([key, value]) => {
      if (key.startsWith("bind:")) return [];
      // Native event handlers must go through Ilha's JSX event registry. Raw
      // string attributes cannot preserve their identity and must never expose
      // function source in SSR markup.
      if (key.toLowerCase().startsWith("on") || typeof value === "function") return [];
      if (value === null || value === undefined || value === false) return [];
      const attr = aliases[key] ?? toKebab(key);
      if (value === true) return [attr];
      return [`${attr}="${escapeAttr(String(value))}"`];
    })
    .join(" ");

  return attrs.length ? ` ${attrs}` : "";
}
