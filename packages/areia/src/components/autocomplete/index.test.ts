import { describe, expect, it } from "bun:test";
import { markupValue as markup } from "$lib/test-markup";
import { Autocomplete, autocompleteVariants } from "./index";

describe("autocompleteVariants", () => {
  it("returns size classes", () => {
    const classes = autocompleteVariants({ size: "sm" });
    expect(classes).toContain("h-6.5");
    expect(classes).toContain("rounded-md");
  });
});

describe("Autocomplete", () => {
  it("renders wrapper with data-slot", () => {
    const output = markup(Autocomplete({}));
    expect(output).toContain('data-slot="autocomplete"');
  });

  it("renders input with data-slot", () => {
    const output = markup(Autocomplete({}));
    expect(output).toContain('data-slot="autocomplete-input"');
  });

  it("renders content hidden by default", () => {
    const output = markup(Autocomplete({}));
    expect(output).toContain('data-slot="autocomplete-content"');
    expect(output).toContain("hidden");
  });

  it("renders items from items array", () => {
    const output = markup(
      Autocomplete({
        items: [{ value: "a", label: "Alpha" }],
      }),
    );
    expect(output).toContain('data-slot="autocomplete-item"');
    expect(output).toContain("Alpha");
  });

  it("renders items from string array", () => {
    const output = markup(
      Autocomplete({
        items: ["Alpha", "Beta"],
      }),
    );
    expect(output).toContain('data-slot="autocomplete-item"');
    expect(output).toContain("Alpha");
  });

  it("renders empty state", () => {
    const output = markup(Autocomplete({}));
    expect(output).toContain('data-slot="autocomplete-empty"');
    expect(output).toContain("No suggestions found");
  });

  it("sets data-open-on-focus", () => {
    const output = markup(Autocomplete({ openOnFocus: true }));
    expect(output).toContain('data-open-on-focus="true"');
  });

  it("wraps in field when label is provided", () => {
    const output = markup(Autocomplete({ label: "City" }));
    expect(output).toContain('data-slot="field"');
  });

  it("applies error styling", () => {
    const output = markup(Autocomplete({ error: "Required" }));
    expect(output).toContain('aria-invalid="true"');
  });

  it("merges custom class and className", () => {
    const output = markup(Autocomplete({ class: "a", className: "b" }));
    expect(output).toContain("a");
    expect(output).toContain("b");
  });

  it("places passthrough data attributes on the autocomplete input, not the root", () => {
    const output = markup(Autocomplete({ "data-params": "x", name: "city" }));
    expect(output).toContain('data-params="x"');
    expect(output).toContain('name="city"');
    expect(output).not.toMatch(/data-slot="autocomplete"[^>]*data-params/);
  });
});

describe("Autocomplete.Item", () => {
  it("renders with data-slot", () => {
    const output = markup(Autocomplete.Item({ value: "x", children: "X" }));
    expect(output).toContain('data-slot="autocomplete-item"');
    expect(output).toContain('data-value="x"');
  });
});

describe("Autocomplete.Empty", () => {
  it("renders with data-slot", () => {
    const output = markup(Autocomplete.Empty());
    expect(output).toContain('data-slot="autocomplete-empty"');
  });
});
