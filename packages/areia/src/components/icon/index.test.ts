import { describe, expect, it } from "bun:test";
import { Icon } from "./index";

function markup(value: unknown): string {
  if (value && typeof value === "object" && "value" in value) {
    return String(value.value);
  }
  return String(value);
}

describe("Icon", () => {
  it("renders an svg with aria-hidden when no label", () => {
    const output = markup(Icon({ icon: [["path", { d: "M0 0" }]] }));
    expect(output).toContain("<svg");
    expect(output).toContain('aria-hidden="true"');
    expect(output).not.toContain('role="img"');
  });

  it("renders accessible icon with label", () => {
    const output = markup(Icon({ icon: [["path", { d: "M0 0" }]], label: "Settings" }));
    expect(output).toContain('role="img"');
    expect(output).toContain('aria-label="Settings"');
    expect(output).not.toContain('aria-hidden="true"');
  });

  it("applies default stroke width", () => {
    const output = markup(Icon({ icon: [["path", { d: "M0 0" }]] }));
    expect(output).toContain('stroke-width="1.75"');
  });

  it("applies custom stroke width", () => {
    const output = markup(Icon({ icon: [["path", { d: "M0 0" }]], strokeWidth: 2 }));
    expect(output).toContain('stroke-width="2"');
  });

  it("merges custom classes", () => {
    const output = markup(Icon({ icon: [["path", { d: "M0 0" }]], class: "custom-icon" }));
    expect(output).toContain("custom-icon");
  });

  it("renders icon children from node", () => {
    const output = markup(Icon({ icon: [["circle", { cx: "12", cy: "12", r: "10" }]] }));
    expect(output).toContain("<circle");
    expect(output).toContain('cx="12"');
  });
});
