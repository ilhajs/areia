import { describe, expect, it } from "bun:test";
import { Label, labelVariants } from "./index";

function markup(value: unknown): string {
  if (value && typeof value === "object" && "value" in value) {
    return String(value.value);
  }
  return String(value);
}

describe("labelVariants", () => {
  it("returns base label classes", () => {
    const classes = labelVariants();
    expect(classes).toContain("text-base");
    expect(classes).toContain("font-medium");
    expect(classes).toContain("text-areia-default");
  });
});

describe("Label", () => {
  it("renders a label element with children", () => {
    const output = markup(Label({ children: "Email" }));
    expect(output).toContain("<label");
    expect(output).toContain("Email");
  });

  it("renders optional indicator when required is false", () => {
    const output = markup(Label({ label: "Name", showOptional: true }));
    expect(output).toContain("(optional)");
  });

  it("renders as span when asContent is true", () => {
    const output = markup(Label({ children: "Title", asContent: true }));
    expect(output).toContain("<span");
    expect(output).not.toContain("<label");
  });

  it("sets htmlFor on label", () => {
    const output = markup(Label({ children: "Email", htmlFor: "email-input" }));
    expect(output).toContain('for="email-input"');
  });

  it("merges custom class and className", () => {
    const output = markup(Label({ children: "X", class: "a", className: "b" }));
    expect(output).toContain("a");
    expect(output).toContain("b");
  });
});
