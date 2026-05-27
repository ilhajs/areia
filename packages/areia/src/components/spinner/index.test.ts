import { describe, expect, it } from "bun:test";
import { Spinner, spinnerVariants } from "./index";

function markup(value: unknown): string {
  if (value && typeof value === "object" && "value" in value) {
    return String(value.value);
  }
  return String(value);
}

describe("spinnerVariants", () => {
  it("returns default base classes", () => {
    const classes = spinnerVariants();
    expect(classes).toContain("animate-spin");
    expect(classes).toContain("size-3.5");
  });

  it("applies lg size classes", () => {
    const classes = spinnerVariants({ size: "lg" });
    expect(classes).toContain("size-4");
  });
});

describe("Spinner", () => {
  it("renders an svg with data-slot spinner", () => {
    const output = markup(Spinner());
    expect(output).toContain('data-slot="spinner"');
    expect(output).toContain("<svg");
    expect(output).toContain('aria-hidden="true"');
  });

  it("renders with default size dimensions", () => {
    const output = markup(Spinner());
    expect(output).toContain('width="14"');
    expect(output).toContain('height="14"');
  });

  it("renders with lg size dimensions", () => {
    const output = markup(Spinner({ size: "lg" }));
    expect(output).toContain('width="16"');
    expect(output).toContain('height="16"');
  });

  it("merges custom classes", () => {
    const output = markup(Spinner({ class: "custom-spinner" }));
    expect(output).toContain("custom-spinner");
  });
});
