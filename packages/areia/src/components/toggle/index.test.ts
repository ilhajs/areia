import { describe, expect, it } from "bun:test";
import { markupValue as markup } from "$lib/test-markup";
import { Toggle, toggleVariants } from "./index";

describe("toggleVariants", () => {
  it("returns default classes", () => {
    const classes = toggleVariants();
    expect(classes).toContain("bg-areia-control-background");
    expect(classes).toContain("h-9");
  });

  it("applies outline variant", () => {
    const classes = toggleVariants({ variant: "outline" });
    expect(classes).toContain("border");
    expect(classes).toContain("bg-transparent");
  });

  it("applies sm size", () => {
    const classes = toggleVariants({ size: "sm" });
    expect(classes).toContain("h-8");
    expect(classes).toContain("text-xs");
  });
});

describe("Toggle", () => {
  it("renders button with data-slot", () => {
    const output = markup(Toggle({ children: "Bold" }));
    expect(output).toContain('data-slot="toggle"');
    expect(output).toContain("Bold");
  });

  it("marks default export for static slot auto-bind", () => {
    const output = markup(Toggle({ children: "Bold" }));
    expect(output).toContain("data-areia-toggle");
  });

  it("omits static auto-bind marker when onPressedChange is set", () => {
    const output = markup(Toggle({ children: "Bold", onPressedChange: () => {} }));
    expect(output).not.toContain("data-areia-toggle");
  });

  it("sets data-default-pressed", () => {
    const output = markup(Toggle({ defaultPressed: true }));
    expect(output).toContain('data-default-pressed=""');
  });

  it("sets data-disabled when disabled", () => {
    const output = markup(Toggle({ disabled: true }));
    expect(output).toContain('data-disabled="true"');
  });

  it("merges custom class and className", () => {
    const output = markup(Toggle({ children: "X", class: "a", className: "b" }));
    expect(output).toContain("a");
    expect(output).toContain("b");
  });
});
