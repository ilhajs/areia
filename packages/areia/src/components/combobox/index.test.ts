import { describe, expect, it } from "bun:test";
import { Combobox, comboboxVariants } from "./index";

function markup(value: unknown): string {
  if (value && typeof value === "object" && "value" in value) {
    return String(value.value);
  }
  return String(value);
}

describe("comboboxVariants", () => {
  it("returns empty by default", () => {
    const classes = comboboxVariants();
    expect(classes).toBe("");
  });
});

describe("Combobox", () => {
  it("renders wrapper with data-slot", () => {
    const output = markup(Combobox({}));
    expect(output).toContain('data-slot="combobox"');
  });

  it("renders trigger input", () => {
    const output = markup(Combobox({}));
    expect(output).toContain('data-slot="combobox-input"');
    expect(output).toContain('data-slot="combobox-trigger"');
  });

  it("renders content hidden by default", () => {
    const output = markup(Combobox({}));
    expect(output).toContain('data-slot="combobox-content"');
    expect(output).toContain("hidden");
  });

  it("renders items from items prop", () => {
    const output = markup(
      Combobox({
        items: [
          { value: "a", label: "Alpha" },
          { value: "b", label: "Beta", disabled: true },
        ],
      }),
    );
    expect(output).toContain('data-slot="combobox-item"');
    expect(output).toContain("Alpha");
    expect(output).toContain("Beta");
  });

  it("renders empty state", () => {
    const output = markup(Combobox({}));
    expect(output).toContain('data-slot="combobox-empty"');
    expect(output).toContain("No options found");
  });

  it("wraps in field when label is provided", () => {
    const output = markup(Combobox({ label: "Country" }));
    expect(output).toContain('data-slot="field"');
    expect(output).toContain('data-slot="field-label"');
  });

  it("applies error styling when error is provided", () => {
    const output = markup(Combobox({ error: "Required" }));
    expect(output).toContain("!ring-areia-destructive");
    expect(output).toContain('aria-invalid="true"');
  });

  it("merges custom class and className", () => {
    const output = markup(Combobox({ class: "a", className: "b" }));
    expect(output).toContain("a");
    expect(output).toContain("b");
  });

  it("places passthrough data attributes on the combobox input, not the root", () => {
    const output = markup(Combobox({ "data-params": "x", name: "country" }));
    expect(output).toContain('data-params="x"');
    expect(output).toContain('name="country"');
    expect(output).not.toMatch(/data-slot="combobox"[^>]*data-params/);
  });
});

describe("Combobox.Item", () => {
  it("renders with data-slot", () => {
    const output = markup(Combobox.Item({ value: "x", children: "X" }));
    expect(output).toContain('data-slot="combobox-item"');
    expect(output).toContain('data-value="x"');
  });
});

describe("Combobox.Empty", () => {
  it("renders with data-slot", () => {
    const output = markup(Combobox.Empty());
    expect(output).toContain('data-slot="combobox-empty"');
  });
});

describe("Combobox.Group", () => {
  it("renders with data-slot", () => {
    const output = markup(Combobox.Group({}));
    expect(output).toContain('data-slot="combobox-group"');
  });
});
