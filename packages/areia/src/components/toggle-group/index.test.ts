import { describe, expect, it } from "bun:test";
import { ilha, html } from "ilha";
import { markupValue as markup } from "$lib/test-markup";
import { ToggleGroup } from "./index";

describe("ToggleGroup", () => {
  it("default export is an ilha island", () => {
    const ISLAND = Symbol.for("ilha.island");
    expect(
      ISLAND in ToggleGroup ||
        Object.getOwnPropertySymbols(ToggleGroup).some((s) => s.description === "ilha.island"),
    ).toBe(true);
    expect(typeof ToggleGroup.mount).toBe("function");
  });

  it("renders wrapper with data-slot", () => {
    const output = markup(ToggleGroup({}));
    expect(output).toContain('data-slot="toggle-group"');
    expect(output).not.toContain("data-areia-toggle-group");
  });

  it("Static omits island markers and data-areia attrs", () => {
    const output = markup(ToggleGroup.Static({}));
    expect(output).toContain('data-slot="toggle-group"');
    expect(output).not.toContain("data-areia-toggle-group");
    expect(output).not.toContain("data-ilha");
  });

  it("uses bind:group on the island", () => {
    const Panel = ilha.state("v", "a").render(
      ({ state }) =>
        html`${ToggleGroup({
          "bind:group": state.v,
          children: [
            ToggleGroup.Item({ value: "a", children: "A" }),
            ToggleGroup.Item({ value: "b", children: "B" }),
          ],
        })}`,
    );
    const output = markup(Panel());
    expect(output).toContain("data-ilha-bind");
    expect(output).toContain("data-ilha-slot");
    expect(output).not.toContain("data-areia-toggle-group");
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
