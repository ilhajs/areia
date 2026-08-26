import { GlobalRegistrator } from "@happy-dom/global-registrator";
import { describe, expect, it } from "bun:test";
import { ilha, html, mount } from "ilha";
import { markupValue as markup } from "$lib/test-markup";
import { Slider } from "./index";

try {
  GlobalRegistrator.register();
} catch {
  // Already registered by another DOM test file in the same Bun process.
}

describe("Slider", () => {
  it("renders slider wrapper with data-slot", () => {
    const output = markup(Slider({}));
    expect(output).toContain('data-slot="slider"');
  });

  it("renders track and range", () => {
    const output = markup(Slider({}));
    expect(output).toContain('data-slot="slider-track"');
    expect(output).toContain('data-slot="slider-range"');
  });

  it("renders single thumb by default", () => {
    const output = markup(Slider({}));
    const thumbs = output.match(/data-slot="slider-thumb"/g);
    expect(thumbs?.length).toBe(1);
  });

  it("renders two thumbs for array value", () => {
    const output = markup(Slider({ value: [20, 80] }));
    const thumbs = output.match(/data-slot="slider-thumb"/g);
    expect(thumbs?.length).toBe(2);
  });

  it("sets data attributes", () => {
    const output = markup(Slider({ value: 50, min: 0, max: 100, step: 10 }));
    expect(output).toContain('data-default-value="50"');
    expect(output).toContain('data-min="0"');
    expect(output).toContain('data-max="100"');
    expect(output).toContain('data-step="10"');
  });

  it("sets vertical orientation class", () => {
    const output = markup(Slider({ orientation: "vertical" }));
    expect(output).toContain("h-full");
    expect(output).toContain('data-orientation="vertical"');
  });

  it("disables slider", () => {
    const output = markup(Slider({ disabled: true }));
    expect(output).toContain('data-disabled="true"');
    expect(output).toContain("opacity-50");
  });

  it("merges custom class and className", () => {
    const output = markup(Slider({ class: "a", className: "b" }));
    expect(output).toContain("a");
    expect(output).toContain("b");
  });

  it("stamps data-morph-preserve including style after mount", async () => {
    document.body.innerHTML = "";
    const App = ilha(() => html`${Slider({ value: 40, min: 0, max: 100 })}`);
    document.body.innerHTML = await App.hydratable(
      {},
      { name: "App", snapshot: true, skipOnMount: false },
    );
    const { unmount } = mount({ App }, { root: document.body, lazy: false });
    await Promise.resolve();
    try {
      const root = document.querySelector('[data-slot="slider"]');
      expect(root).toBeTruthy();
      const preserve = root!.getAttribute("data-morph-preserve") ?? "";
      expect(preserve.split(/\s+/)).toContain("style");
      expect(preserve.split(/\s+/)).toContain("data-value");
      const thumb = root!.querySelector('[data-slot="slider-thumb"]');
      expect((thumb?.getAttribute("data-morph-preserve") ?? "").split(/\s+/)).toContain("style");
    } finally {
      unmount();
    }
  });
});
