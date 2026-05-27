import { describe, expect, it } from "bun:test";
import { Tooltip, tooltipVariants } from "./index";

function markup(value: unknown): string {
  if (value && typeof value === "object" && "value" in value) {
    return String(value.value);
  }
  return String(value);
}

describe("tooltipVariants", () => {
  it("returns default classes", () => {
    const classes = tooltipVariants();
    expect(classes).toContain("rounded-md");
    expect(classes).toContain("bg-areia-background");
    expect(classes).toContain("shadow-lg");
  });
});

describe("Tooltip", () => {
  it("renders trigger and content", () => {
    const output = markup(Tooltip({ content: "Tip", children: "Hover me" }));
    expect(output).toContain('data-slot="tooltip"');
    expect(output).toContain('data-slot="tooltip-trigger"');
    expect(output).toContain('data-slot="tooltip-content"');
    expect(output).toContain("Tip");
  });

  it("renders content hidden by default", () => {
    const output = markup(Tooltip({ content: "Tip", children: "Hover me" }));
    expect(output).toContain('data-slot="tooltip-content"');
    expect(output).toContain("hidden");
  });

  it("renders arrow by default", () => {
    const output = markup(Tooltip({ content: "Tip", children: "Hover me" }));
    expect(output).toContain('data-slot="tooltip-arrow"');
  });

  it("omits arrow when arrow is false", () => {
    const output = markup(Tooltip({ content: "Tip", children: "Hover me", arrow: false }));
    expect(output).not.toContain('data-slot="tooltip-arrow"');
  });

  it("sets data-side attribute", () => {
    const output = markup(Tooltip({ content: "Tip", children: "Hover me", side: "bottom" }));
    expect(output).toContain('data-side="bottom"');
  });

  it("merges custom class and className", () => {
    const output = markup(Tooltip({ content: "Tip", children: "X", class: "a", className: "b" }));
    expect(output).toContain("a");
    expect(output).toContain("b");
  });
});
