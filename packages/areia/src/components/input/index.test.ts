import { describe, expect, it } from "bun:test";
import { Input, inputVariants } from "./index";

function markup(value: unknown): string {
  if (value && typeof value === "object" && "value" in value) {
    return String(value.value);
  }
  return String(value);
}

describe("inputVariants", () => {
  it("returns default base classes", () => {
    const classes = inputVariants();
    expect(classes).toContain("h-9");
    expect(classes).toContain("rounded-lg");
    expect(classes).toContain("bg-areia-control-background");
  });

  it("applies sm size classes", () => {
    const classes = inputVariants({ size: "sm" });
    expect(classes).toContain("h-6.5");
    expect(classes).toContain("rounded-md");
  });

  it("applies error variant classes", () => {
    const classes = inputVariants({ variant: "error" });
    expect(classes).toContain("!ring-areia-destructive");
  });

  it("applies parent focus indicator", () => {
    const classes = inputVariants({ parentFocusIndicator: true });
    expect(classes).toContain("focus-within:ring-areia-ring/50");
  });
});

describe("Input", () => {
  it("renders an input element", () => {
    const output = markup(Input({}));
    expect(output).toContain("<input");
  });

  it("applies default size classes", () => {
    const output = markup(Input({}));
    expect(output).toContain("h-9");
  });

  it("applies error styling when error is provided", () => {
    const output = markup(Input({ error: "Required" }));
    expect(output).toContain("!ring-areia-destructive");
    expect(output).toContain('aria-invalid="true"');
  });

  it("wraps in field when label is provided", () => {
    const output = markup(Input({ label: "Email" }));
    expect(output).toContain('data-slot="field"');
    expect(output).toContain('data-slot="field-label"');
  });

  it("wraps in field when description is provided", () => {
    const output = markup(Input({ description: "Hint" }));
    expect(output).toContain('data-slot="field"');
    expect(output).toContain('data-slot="field-description"');
  });

  it("wraps in field when error object is provided", () => {
    const output = markup(Input({ error: { message: "Oops" } }));
    expect(output).toContain('data-slot="field"');
    expect(output).toContain('data-slot="field-error"');
    expect(output).toContain("Oops");
  });

  it("adds password manager ignore attributes", () => {
    const output = markup(Input({ passwordManagerIgnore: true }));
    expect(output).toContain('data-1p-ignore="true"');
    expect(output).toContain('data-lpignore="true"');
  });

  it("merges custom class and className", () => {
    const output = markup(Input({ class: "a", className: "b" }));
    expect(output).toContain("a");
    expect(output).toContain("b");
  });
});
