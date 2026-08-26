import { describe, expect, it } from "bun:test";
import { Form, renderForm } from "../src/Form.tsx";
import { createFormState } from "../src/state.ts";
import { GlobalRegistrator } from "@happy-dom/global-registrator";
try {
  GlobalRegistrator.register();
} catch {
  // Already registered
}

describe("Form component", () => {
  it("derives default values from schema defaults", async () => {
    const schema = {
      "~standard": {
        version: 1 as const,
        vendor: "mock",
        validate: (val: any) => {
          // Sync Standard Schema: fill defaults for missing keys.
          const value = { name: "Jane", age: 42, ...val };
          return { value };
        },
      },
    };

    const state = createFormState(schema);
    expect(state.defaults).toEqual({ name: "Jane", age: 42 });
    const output = String((renderForm({ schema, state, submitLabel: "Save" }) as any).value);

    expect(output).toContain("Jane");
    expect(output).toContain("42");
  });

  it("throws a helpful error when defaults cannot be derived", () => {
    const schema = {
      "~standard": {
        version: 1 as const,
        vendor: "mock",
        validate: () => ({ issues: [{ message: "missing default" }] }),
      },
    };
    expect(() => Form(schema as never)).toThrow(/derive default values/);
  });

  it("renders fields based on defaultValues", async () => {
    const mockSchema = {
      "~standard": {
        version: 1 as const,
        vendor: "mock",
        validate: async (val: any) => ({ value: val }),
      },
    };

    const formOutput = renderForm({
      schema: mockSchema,
      defaultValues: { name: "John", age: 30, active: true },
      submitLabel: "Save Profile",
    } as any) as any;
    const result = formOutput.value || String(formOutput);

    expect(result).toContain("Name");
    expect(result).toContain("Age");
    expect(result).toContain("Active");
    expect(result).toContain("Save Profile");
    // Boolean fields must emit real checkbox markup (not an empty island stub)
    expect(result).toContain('data-slot="checkbox"');
  });

  it("renders select options for enum-like schema defs", () => {
    const mockSchema = {
      "~standard": {
        version: 1 as const,
        vendor: "mock",
        validate: async (val: any) => ({ value: val }),
      },
      shape: {
        theme: {
          def: { type: "enum", entries: { light: "light", dark: "dark" } },
          options: ["light", "dark"],
        },
      },
    };

    const formOutput = renderForm({
      schema: mockSchema,
      defaultValues: { theme: "light" },
    } as any) as any;
    const result = formOutput.value || String(formOutput);

    expect(result).toContain("Theme");
    expect(result).toContain('data-slot="combobox"');
  });
});
