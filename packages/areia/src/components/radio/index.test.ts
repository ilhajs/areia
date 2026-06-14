import { describe, expect, it } from "bun:test";
import { markupValue as markup } from "$lib/test-markup";
import { Radio, radioVariants } from "./index";

describe("radioVariants", () => {
  it("returns default classes", () => {
    const classes = radioVariants();
    expect(classes).toContain("ring-areia-divider");
  });

  it("applies error variant classes", () => {
    const classes = radioVariants({ variant: "error" });
    expect(classes).toContain("ring-areia-destructive");
  });

  it("applies card appearance classes", () => {
    const classes = radioVariants({ appearance: "card" });
    expect(classes).toContain("rounded-lg");
    expect(classes).toContain("border");
  });
});

describe("Radio.Item", () => {
  it("renders radio input with label", () => {
    const output = markup(Radio.Item({ label: "One", value: "1" }));
    expect(output).toContain('type="radio"');
    expect(output).toContain("One");
  });

  it("renders card appearance", () => {
    const output = markup(Radio.Item({ label: "One", value: "1", appearance: "card" }));
    expect(output).toContain("rounded-lg");
    expect(output).toContain("border-areia-border");
  });

  it("renders description in card mode", () => {
    const output = markup(
      Radio.Item({ label: "One", value: "1", appearance: "card", description: "Details" }),
    );
    expect(output).toContain("Details");
  });

  it("reverses control position when controlPosition is end", () => {
    const output = markup(Radio.Item({ label: "One", value: "1", controlPosition: "end" }));
    expect(output).toContain("flex-row-reverse");
  });

  it("merges custom class and className", () => {
    const output = markup(Radio.Item({ label: "X", value: "x", class: "a", className: "b" }));
    expect(output).toContain("a");
    expect(output).toContain("b");
  });
});

describe("Radio.Group", () => {
  it("renders fieldset", () => {
    const output = markup(
      Radio.Group({ legend: "Pick one" }, [Radio.Item({ label: "A", value: "a" })]),
    );
    expect(output).toContain("<fieldset");
    expect(output).toContain("Pick one");
  });

  it("renders horizontal orientation", () => {
    const output = markup(
      Radio.Group({ orientation: "horizontal" }, [Radio.Item({ label: "A", value: "a" })]),
    );
    expect(output).toContain("flex-row");
  });

  it("renders error text", () => {
    const output = markup(Radio.Group({ error: "Bad" }, []));
    expect(output).toContain("Bad");
  });
});
