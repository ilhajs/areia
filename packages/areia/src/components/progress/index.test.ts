import { describe, expect, it } from "bun:test";
import { markupValue as markup } from "$lib/test-markup";
import { Progress } from "./index";

describe("Progress", () => {
  it("renders progress wrapper with data-slot", () => {
    const output = markup(Progress({}));
    expect(output).toContain('data-slot="progress"');
  });

  it("renders label and value row", () => {
    const output = markup(Progress({ label: "Loading", value: 50 }));
    expect(output).toContain('data-slot="progress-label"');
    expect(output).toContain("Loading");
    expect(output).toContain('data-slot="progress-value"');
  });

  it("hides value when showValue is false", () => {
    const output = markup(Progress({ label: "Loading", value: 50, showValue: false }));
    expect(output).toContain("Loading");
    expect(output).not.toContain('data-slot="progress-value"');
  });

  it("renders track and indicator", () => {
    const output = markup(Progress({}));
    expect(output).toContain('data-slot="progress-track"');
    expect(output).toContain('data-slot="progress-indicator"');
  });

  it("sets data attributes for value/min/max", () => {
    const output = markup(Progress({ value: 42, min: 0, max: 100 }));
    expect(output).toContain('data-value="42"');
    expect(output).toContain('data-min="0"');
    expect(output).toContain('data-max="100"');
  });

  it("merges custom class and className", () => {
    const output = markup(Progress({ class: "a", className: "b" }));
    expect(output).toContain("a");
    expect(output).toContain("b");
  });
});
