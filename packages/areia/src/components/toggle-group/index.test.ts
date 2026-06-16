import { describe, expect, it } from "bun:test";
import { markupValue as markup } from "$lib/test-markup";
import { ToggleGroup } from "./index";

describe("ToggleGroup", () => {
  it("renders wrapper with data-slot", () => {
    const output = markup(ToggleGroup({}));
    expect(output).toContain('data-slot="toggle-group"');
  });

  it("marks default export for static slot auto-bind", () => {
    const output = markup(
      ToggleGroup({
        children: ToggleGroup.Item({ value: "a", children: "A" }),
      }),
    );
    expect(output).toContain("data-areia-toggle-group");
  });

  it("sets data-type to single by default", () => {
    const output = markup(ToggleGroup({}));
    expect(output).toContain('data-type="single"');
  });

  it("sets data-type to multiple", () => {
    const output = markup(ToggleGroup({ type: "multiple" }));
    expect(output).toContain('data-type="multiple"');
    expect(output).toContain('data-multiple=""');
  });

  it("sets data-orientation", () => {
    const output = markup(ToggleGroup({ orientation: "vertical" }));
    expect(output).toContain('data-orientation="vertical"');
  });

  it("sets data-disabled", () => {
    const output = markup(ToggleGroup({ disabled: true }));
    expect(output).toContain("data-disabled");
  });

  it("renders children", () => {
    const output = markup(
      ToggleGroup({
        children: ToggleGroup.Item({ value: "a", children: "A" }),
      }),
    );
    expect(output).toContain('data-slot="toggle-group-item"');
    expect(output).toContain('data-value="a"');
    expect(output).toContain("A");
  });

  it("merges custom class and className", () => {
    const output = markup(ToggleGroup({ class: "a", className: "b" }));
    expect(output).toContain("a");
    expect(output).toContain("b");
  });
});

describe("ToggleGroup.Item", () => {
  it("renders with data-slot", () => {
    const output = markup(ToggleGroup.Item({ value: "x", children: "X" }));
    expect(output).toContain('data-slot="toggle-group-item"');
    expect(output).toContain('data-value="x"');
  });
});

describe("ToggleGroup.Separator", () => {
  it("renders with data-slot", () => {
    const output = markup(ToggleGroup.Separator());
    expect(output).toContain('data-slot="toggle-group-separator"');
  });
});
