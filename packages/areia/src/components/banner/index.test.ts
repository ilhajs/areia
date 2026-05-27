import { describe, expect, it } from "bun:test";
import { Banner, bannerVariants } from "./index";

function markup(value: unknown): string {
  if (value && typeof value === "object" && "value" in value) {
    return String(value.value);
  }
  return String(value);
}

describe("bannerVariants", () => {
  it("returns default variant classes", () => {
    const classes = bannerVariants();
    expect(classes).toContain("rounded-lg");
    expect(classes).toContain("border");
    expect(classes).toContain("bg-areia-info-soft/30");
  });

  it("applies alert variant classes", () => {
    const classes = bannerVariants({ variant: "alert" });
    expect(classes).toContain("bg-areia-warning-soft/15");
  });

  it("applies error variant classes", () => {
    const classes = bannerVariants({ variant: "error" });
    expect(classes).toContain("bg-areia-destructive-soft/15");
  });
});

describe("Banner", () => {
  it("renders simple text banner", () => {
    const output = markup(Banner({ text: "Hello" }));
    expect(output).toContain("Hello");
    expect(output).toContain("rounded-lg");
  });

  it("renders structured banner with title and description", () => {
    const output = markup(Banner({ title: "Heads up", description: "Details" }));
    expect(output).toContain("Heads up");
    expect(output).toContain("Details");
  });

  it("renders icon in structured banner", () => {
    const output = markup(Banner({ title: "Alert", icon: "⚠️" }));
    expect(output).toContain("⚠️");
  });

  it("renders action slot", () => {
    const output = markup(Banner({ title: "Alert", action: "Undo" }));
    expect(output).toContain("Undo");
  });

  it("applies variant classes", () => {
    const output = markup(Banner({ text: "Oops", variant: "error" }));
    expect(output).toContain("bg-areia-destructive-soft/15");
  });

  it("merges custom class and className", () => {
    const output = markup(Banner({ text: "X", class: "a", className: "b" }));
    expect(output).toContain("a");
    expect(output).toContain("b");
  });
});
