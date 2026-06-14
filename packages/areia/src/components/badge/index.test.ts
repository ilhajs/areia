import { describe, expect, it } from "bun:test";
import { markupValue as markup } from "$lib/test-markup";
import { Badge, badgeVariants } from "./index";

describe("badgeVariants", () => {
  it("returns default primary classes", () => {
    const classes = badgeVariants();
    expect(classes).toContain("inline-flex");
    expect(classes).toContain("rounded-full");
    expect(classes).toContain("bg-areia-primary");
  });

  it("applies error variant classes", () => {
    const classes = badgeVariants({ variant: "error" });
    expect(classes).toContain("bg-areia-destructive-soft/60");
  });

  it("applies outline variant classes", () => {
    const classes = badgeVariants({ variant: "outline" });
    expect(classes).toContain("border");
    expect(classes).toContain("bg-transparent");
  });
});

describe("Badge", () => {
  it("renders a span with children", () => {
    const output = markup(Badge({ children: "Beta" }));
    expect(output).toContain("<span");
    expect(output).toContain("Beta");
  });

  it("applies default variant classes", () => {
    const output = markup(Badge({ children: "New" }));
    expect(output).toContain("bg-areia-primary");
  });

  it("applies variant prop classes", () => {
    const output = markup(Badge({ variant: "success", children: "Done" }));
    expect(output).toContain("bg-areia-success-soft/70");
  });

  it("merges custom class and className", () => {
    const output = markup(Badge({ children: "Tag", class: "a", className: "b" }));
    expect(output).toContain("a");
    expect(output).toContain("b");
  });

  it("passes through attributes", () => {
    const output = markup(Badge({ children: "Tag", id: "badge-1" }));
    expect(output).toContain('id="badge-1"');
  });
});
