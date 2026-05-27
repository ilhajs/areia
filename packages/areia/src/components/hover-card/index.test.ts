import { describe, expect, it } from "bun:test";
import { HoverCard, hoverCardVariants } from "./index";

function markup(value: unknown): string {
  if (value && typeof value === "object" && "value" in value) {
    return String(value.value);
  }
  return String(value);
}

describe("hoverCardVariants", () => {
  it("returns default classes", () => {
    const classes = hoverCardVariants();
    expect(classes).toContain("rounded-lg");
    expect(classes).toContain("bg-areia-background");
    expect(classes).toContain("shadow-lg");
  });
});

describe("HoverCard", () => {
  it("renders trigger and content", () => {
    const output = markup(HoverCard({ children: "Hover", content: "Hello" }));
    expect(output).toContain('data-slot="hover-card"');
    expect(output).toContain('data-slot="hover-card-trigger"');
    expect(output).toContain('data-slot="hover-card-content"');
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
