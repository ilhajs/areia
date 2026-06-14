import { describe, expect, it } from "bun:test";
import { markupValue as markup } from "$lib/test-markup";
import { Select, selectVariants } from "./index";

describe("selectVariants", () => {
  it("returns default base classes", () => {
    const classes = selectVariants();
    expect(classes).toContain("w-full");
    expect(classes).toContain("appearance-none");
    expect(classes).toContain("bg-areia-control-background");
  });

  it("applies ghost variant classes", () => {
    const classes = selectVariants({ variant: "ghost" });
    expect(classes).toContain("bg-transparent");
    expect(classes).toContain("ring-transparent");
  });
});

describe("Select", () => {
  it("renders a select element", () => {
    const output = markup(Select({}));
    expect(output).toContain("<select");
  });

  it("renders options from items object", () => {
    const output = markup(
      Select({
        items: { a: "Alpha", b: { label: "Beta", disabled: true } },
      }),
    );
    expect(output).toContain('value="a"');
    expect(output).toContain("Alpha");
    expect(output).toContain('value="b"');
    expect(output).toContain("Beta");
  });

  it("renders placeholder option", () => {
    const output = markup(Select({ placeholder: "Pick one", items: { a: "A" } }));
    expect(output).toContain('value=""');
    expect(output).toContain("Pick one");
  });

  it("renders grouped options", () => {
    const output = markup(
      Select({
        children: Select.Group({
          label: "Group",
          children: Select.Option({ value: "x", label: "X" }),
        }),
      }),
    );
    expect(output).toContain("<optgroup");
    expect(output).toContain('label="Group"');
    expect(output).toContain("X");
  });

  it("wraps in field when label is provided", () => {
    const output = markup(Select({ label: "Country", items: { us: "USA" } }));
    expect(output).toContain('data-slot="field"');
    expect(output).toContain('data-slot="field-label"');
  });

  it("applies error styling when error is provided", () => {
    const output = markup(Select({ error: "Required", items: {} }));
    expect(output).toContain("!ring-areia-destructive");
    expect(output).toContain('aria-invalid="true"');
  });

  it("merges custom class and className", () => {
    const output = markup(Select({ class: "a", className: "b", items: {} }));
    expect(output).toContain("a");
    expect(output).toContain("b");
  });
});
