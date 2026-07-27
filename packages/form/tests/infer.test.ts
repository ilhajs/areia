import { describe, expect, it } from "bun:test";
import { resolveFieldType, humanize } from "../src/infer.ts";
import type { UIOverride } from "../src/types.ts";

describe("humanize", () => {
  it("should humanize camelCase keys", () => {
    expect(humanize("firstName")).toBe("First Name");
    expect(humanize("someLongPropName")).toBe("Some Long Prop Name");
  });
});

describe("resolveFieldType", () => {
  it("uses explicit uiOverrides", () => {
    const overrides: Record<string, UIOverride> = {
      foo: { type: "color", label: "My Color" },
    };
    const { type, props } = resolveFieldType("foo", "blue", {}, overrides);
    expect(type).toBe("color");
    expect(props.label).toBe("My Color");
  });

  it("infers from JSON Schema: enum -> select", () => {
    const schema = { jsonSchema: { enum: ["a", "b"] } };
    const { type, props } = resolveFieldType("foo", "a", schema);
    expect(type).toBe("select");
    expect(props.options).toEqual([
      { label: "a", value: "a" },
      { label: "b", value: "b" },
    ]);
  });

  it("infers Zod 4 enum def ({ type: 'enum', entries }) -> select", () => {
    const schema = {
      def: { type: "enum", entries: { light: "light", dark: "dark", system: "system" } },
      options: ["light", "dark", "system"],
    };
    const { type, props } = resolveFieldType("theme", "system", schema);
    expect(type).toBe("select");
    expect(props.options).toEqual([
      { label: "light", value: "light" },
      { label: "dark", value: "dark" },
      { label: "system", value: "system" },
    ]);
  });

  it("infers from JSON Schema: number/integer", () => {
    expect(resolveFieldType("foo", 123, { jsonSchema: { type: "number" } }).type).toBe("number");
    expect(resolveFieldType("foo", 123, { jsonSchema: { type: "integer" } }).type).toBe("number");
    expect(resolveFieldType("foo", 123, { typeName: "ZodNumber" }).type).toBe("number");
  });

  it("infers from JSON Schema: boolean", () => {
    expect(resolveFieldType("foo", true, { jsonSchema: { type: "boolean" } }).type).toBe("boolean");
    expect(resolveFieldType("foo", true, { typeName: "ZodBoolean" }).type).toBe("boolean");
  });

  it("infers from JSON Schema: color string", () => {
    expect(
      resolveFieldType("foo", "red", { jsonSchema: { type: "string", format: "color" } }).type,
    ).toBe("color");
  });

  it("falls back to runtime value typeof number", () => {
    expect(resolveFieldType("foo", 42, {}).type).toBe("number");
  });

  it("falls back to runtime value typeof boolean", () => {
    expect(resolveFieldType("foo", true, {}).type).toBe("boolean");
  });

  it("falls back to color for hex code", () => {
    expect(resolveFieldType("foo", "#ff0000", {}).type).toBe("color");
    expect(resolveFieldType("foo", "#FFF", {}).type).toBe("color");
  });

  it("falls back to text for other strings", () => {
    expect(resolveFieldType("foo", "hello", {}).type).toBe("text");
  });

  it("falls back to folder for objects", () => {
    expect(resolveFieldType("foo", { nested: true }, {}).type).toBe("folder");
  });
});
