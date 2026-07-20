import { GlobalRegistrator } from "@happy-dom/global-registrator";
import { describe, expect, it } from "bun:test";
import ilha, { html, mount } from "ilha";
import { markupValue as markup } from "$lib/test-markup";
import { Progress } from "./index";

try {
  GlobalRegistrator.register();
} catch {
  // Already registered by another DOM test file in the same Bun process.
}

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

  it("stamps data-morph-preserve including style after mount", async () => {
    document.body.innerHTML = "";
    const App = ilha.render(() => html`${Progress({ value: 42, min: 0, max: 100 })}`);
    document.body.innerHTML = await App.hydratable({}, { name: "App", snapshot: true });
    const { unmount } = mount({ App }, { root: document.body, lazy: false });
    await Promise.resolve();
    try {
      const root = document.querySelector('[data-slot="progress"]');
      expect(root).toBeTruthy();
      const preserve = root!.getAttribute("data-morph-preserve") ?? "";
      expect(preserve.split(/\s+/)).toContain("style");
      expect(preserve.split(/\s+/)).toContain("aria-valuenow");
      const indicator = root!.querySelector('[data-slot="progress-indicator"]');
      expect((indicator?.getAttribute("data-morph-preserve") ?? "").split(/\s+/)).toContain("style");
    } finally {
      unmount();
    }
  });
});
