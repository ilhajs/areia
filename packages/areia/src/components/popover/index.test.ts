import { describe, expect, it } from "bun:test";
import { Popover, popoverVariants } from "./index";

function markup(value: unknown): string {
  if (value && typeof value === "object" && "value" in value) {
    return String(value.value);
  }
  return String(value);
}

describe("popoverVariants", () => {
  it("returns default classes", () => {
    const classes = popoverVariants();
    expect(classes).toContain("rounded-lg");
    expect(classes).toContain("bg-areia-background");
    expect(classes).toContain("shadow-lg");
  });
});

describe("Popover", () => {
  it("renders trigger and content", () => {
    const output = markup(Popover({ children: "Open", content: "Hello" }));
    expect(output).toContain('data-slot="popover"');
    expect(output).toContain('data-slot="popover-trigger"');
    expect(output).toContain('data-slot="popover-content"');
  });

  it("renders content hidden by default", () => {
    const output = markup(Popover({ children: "Open", content: "Hello" }));
    expect(output).toContain('data-slot="popover-content"');
    expect(output).toContain("hidden");
  });

  it("renders arrow by default", () => {
    const output = markup(Popover({ children: "Open", content: "Hello" }));
    expect(output).toContain('data-slot="popover-arrow"');
  });

  it("sets data-side attribute", () => {
    const output = markup(Popover({ children: "Open", content: "Hello", side: "top" }));
    expect(output).toContain('data-side="top"');
  });

  it("merges custom class and className", () => {
    const output = markup(Popover({ children: "X", content: "Y", class: "a", className: "b" }));
    expect(output).toContain("a");
    expect(output).toContain("b");
  });
});

describe("Popover.Trigger", () => {
  it("renders with data-slot", () => {
    const output = markup(Popover.Trigger({ children: "Open" }));
    expect(output).toContain('data-slot="popover-trigger"');
  });
});

describe("Popover.Content", () => {
  it("renders with data-slot and hidden", () => {
    const output = markup(Popover.Content({ children: "Body" }));
    expect(output).toContain('data-slot="popover-content"');
    expect(output).toContain("hidden");
  });
});

describe("Popover.Title", () => {
  it("renders h3 with classes", () => {
    const output = markup(Popover.Title({ children: "Title" }));
    expect(output).toContain("<h3");
    expect(output).toContain("Title");
  });
});

describe("Popover.Description", () => {
  it("renders p with classes", () => {
    const output = markup(Popover.Description({ children: "Desc" }));
    expect(output).toContain("<p");
    expect(output).toContain("Desc");
  });
});
