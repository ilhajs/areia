import { describe, expect, it } from "bun:test";
import { renderForm } from "../src/Form.tsx";
import { GlobalRegistrator } from "@happy-dom/global-registrator";
try {
  GlobalRegistrator.register();
} catch {
  // Already registered
}

describe("Form component", () => {
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
