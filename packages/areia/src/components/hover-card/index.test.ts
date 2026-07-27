import { describe, expect, it } from "bun:test";
import { markupValue as markup } from "$lib/test-markup";
import { HoverCard, hoverCardVariants } from "./index";

describe("hoverCardVariants", () => {
  it("returns default classes", () => {
    const classes = hoverCardVariants();
    expect(classes).toContain("rounded-lg");
    expect(classes).toContain("bg-areia-background");
    expect(classes).toContain("shadow-lg");
  });
});

const ISLAND = Symbol.for("ilha.island");
const isIsland = (v: unknown) =>
  typeof v === "function" &&
  (ISLAND in v || Object.getOwnPropertySymbols(v).some((s) => s.description === "ilha.island"));

describe("HoverCard", () => {
  it("default export is an ilha island", () => {
    expect(isIsland(HoverCard)).toBe(true);
    expect(typeof HoverCard.mount).toBe("function");
  });

  it("renders trigger and content", () => {
    const output = markup(HoverCard({ children: "Hover", content: "Hello" }));
    expect(output).toContain('data-slot="hover-card"');
    expect(output).toContain('data-slot="hover-card-trigger"');
    expect(output).toContain('data-slot="hover-card-content"');
    expect(output).not.toContain("data-areia-hover-card");
  });

  it("Static returns plain markup without auto-bind markers", () => {
    const output = markup(HoverCard.Static({ children: "Hover", content: "Hello" }));
    expect(output).toContain('data-slot="hover-card"');
    expect(output).not.toContain("data-areia-hover-card");
  });

  it("renders content hidden by default", () => {
    const output = markup(HoverCard({ children: "Hover", content: "Hello" }));
    expect(output).toContain('data-slot="hover-card-content"');
    expect(output).toContain("hidden");
  });

  it("sets data-side attribute", () => {
    const output = markup(HoverCard({ children: "Hover", content: "Hello", side: "top" }));
    expect(output).toContain('data-side="top"');
  });

  it("merges custom class and className", () => {
    const output = markup(HoverCard({ children: "X", content: "Y", class: "a", className: "b" }));
    expect(output).toContain("a");
    expect(output).toContain("b");
  });
});

describe("HoverCard.Trigger", () => {
  it("renders with data-slot", () => {
    const output = markup(HoverCard.Trigger({ children: "Hover" }));
    expect(output).toContain('data-slot="hover-card-trigger"');
  });

  it("renders serialized HTML children instead of [object Object]", () => {
    const output = markup(
      HoverCard.Trigger({
        children: { value: '<button type="button" data-testid="trigger">Hover</button>' },
      }),
    );
    expect(output).not.toContain("[object Object]");
    expect(output).toContain('data-testid="trigger"');
  });
});

describe("HoverCard.Content", () => {
  it("renders with data-slot and hidden", () => {
    const output = markup(HoverCard.Content({ children: "Body" }));
    expect(output).toContain('data-slot="hover-card-content"');
    expect(output).toContain("hidden");
  });
});

describe("HoverCard.Title", () => {
  it("renders h3 with classes", () => {
    const output = markup(HoverCard.Title({ children: "Title" }));
    expect(output).toContain("<h3");
    expect(output).toContain("Title");
  });
});

describe("HoverCard.Description", () => {
  it("renders p with classes", () => {
    const output = markup(HoverCard.Description({ children: "Desc" }));
    expect(output).toContain("<p");
    expect(output).toContain("Desc");
  });
});
