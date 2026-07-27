import type { FieldType, UIOverride } from "./types.ts";

export function resolveFieldType(
  path: string,
  value: unknown,
  schema: any,
  overrides?: Record<string, UIOverride>,
): { type: FieldType; props: UIOverride } {
  // 1. Explicit UI overrides
  const override = overrides?.[path] || {};
  if (override.type) {
    return { type: override.type, props: override };
  }

  // 2. Schema introspection (Zod / Valibot / JSON Schema heuristics)
  const def = schema?.jsonSchema || schema?.def || schema;
  if (def) {
    // Zod 4 enums: `{ type: "enum", entries: { a: "a", ... } }`
    // JSON Schema / Zod 3: `enum` | `anyOf` | `options` arrays
    // Schema instance may also expose `.options` directly
    const enumValues =
      def.enum ||
      def.anyOf ||
      def.options ||
      (def.type === "enum" && def.entries ? Object.values(def.entries) : null) ||
      (Array.isArray(schema?.options) ? schema.options : null);

    if (enumValues) {
      const options = Array.isArray(enumValues)
        ? enumValues.map((opt: unknown) =>
            typeof opt === "object" && opt !== null && "value" in opt
              ? (opt as { label: string; value: unknown })
              : { label: String(opt), value: opt },
          )
        : [];
      return { type: "select", props: { ...override, options } };
    }

    const type = def.type || def.typeName;
    if (type === "number" || type === "integer" || type === "ZodNumber") {
      return { type: "number", props: override };
    }
    if (type === "boolean" || type === "ZodBoolean") {
      return { type: "boolean", props: override };
    }
    if ((type === "string" || type === "ZodString") && def.format === "color") {
      return { type: "color", props: override };
    }
  }

  // 3. Runtime value fallback
  if (typeof value === "number") {
    return { type: "number", props: override };
  }
  if (typeof value === "boolean") {
    return { type: "boolean", props: override };
  }
  if (typeof value === "string") {
    // Very naive color check for fallback
    if (/^#([0-9A-F]{3}){1,2}$/i.test(value)) {
      return { type: "color", props: override };
    }
    return { type: "text", props: override };
  }
  if (typeof value === "object" && value !== null) {
    return { type: "folder", props: override };
  }

  return { type: "text", props: override };
}

export function humanize(str: string): string {
  return str
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (s) => s.toUpperCase())
    .trim();
}
