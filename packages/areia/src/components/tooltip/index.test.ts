import { describe, expect, it } from "bun:test";
import { markupValue as markup } from "$lib/test-markup";
import { Tooltip, tooltipVariants } from "./index";

describe("tooltipVariants", () => {
  it("returns default classes", () => {
    const classes = tooltipVariants();
    expect(classes).toContain("rounded-md");
    expect(classes).toContain("bg-areia-background");
    expect(classes).toContain("shadow-lg");
  });
});

const ISLAND = Symbol.for("ilha.island");
const isIsland = (v: unknown) =>
  typeof v === "function" &&
  (ISLAND in v || Object.getOwnPropertySymbols(v).some((s) => s.description === "ilha.island"));

describe("Tooltip", () => {
  it("default export is an ilha island", () => {
    expect(isIsland(Tooltip)).toBe(true);
    expect(typeof Tooltip.mount).toBe("function");
    const output = markup(Tooltip({ content: "Tip", children: "Hover me" }));
    expect(output).toContain('data-slot="tooltip"');
    expect(output).toContain('data-slot="tooltip-trigger"');
    expect(output).toContain('data-slot="tooltip-content"');
    expect(output).toContain("Tip");
    expect(output).toContain("Hover me");
    expect(output).not.toContain("data-areia-tooltip");
  });

  it("Static returns plain markup without auto-bind markers", () => {
    const output = markup(Tooltip.Static({ content: "Tip", children: "Hover me" }));
    expect(output).toContain('data-slot="tooltip"');
    expect(output).not.toContain("data-areia-tooltip");
    expect(output).not.toContain("data-ilha");
  });

  it("keeps button trigger children in composed markup", () => {
    const output = markup(
      Tooltip({
        content: "Create project",
        children: { value: '<button type="button" aria-label="Create project">+</button>' },
      }),
    );
    expect(output).toContain('aria-label="Create project"');
    expect(output).toContain(">+</button>");
    expect(output).not.toContain("data-areia-tooltip");
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

  it("renders serialized HTML trigger prop instead of [object Object]", () => {
    const output = markup(
      Tooltip({
        content: "Tip",
        trigger: { value: '<button type="button" data-testid="trigger">Hover</button>' },
      }),
    );
    expect(output).not.toContain("[object Object]");
    expect(output).toContain('data-testid="trigger"');
  });

  it("renders serialized HTML content instead of [object Object]", () => {
    const output = markup(
      Tooltip({
        children: "Hover",
        content: { value: '<span data-testid="tip">Tip text</span>' },
      }),
    );
    expect(output).not.toContain("[object Object]");
    expect(output).toContain('data-testid="tip"');
  });

  it("renders serialized HTML in Tooltip.Trigger", () => {
    const output = markup(
      Tooltip.Trigger({
        children: { value: '<button type="button" data-testid="trigger">Hover</button>' },
      }),
    );
    expect(output).not.toContain("[object Object]");
    expect(output).toContain('data-testid="trigger"');
  });
});
