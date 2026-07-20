import { GlobalRegistrator } from "@happy-dom/global-registrator";
import { describe, expect, it } from "bun:test";
import { mergeMorphPreserve, stampMorphPreserve } from "./morph-preserve";

try {
  GlobalRegistrator.register();
} catch {
  // Already registered by another DOM test file in the same Bun process.
}

function flushMutations(): Promise<void> {
  return new Promise((resolve) => queueMicrotask(() => resolve()));
}

describe("stampMorphPreserve", () => {
  it("stamps the root and every [data-slot] descendant", () => {
    const root = document.createElement("div");
    root.setAttribute("data-slot", "popover");
    root.innerHTML = `<button data-slot="popover-trigger"></button><div data-slot="popover-content"><span>plain</span></div>`;

    stampMorphPreserve(root);

    const marker = root.getAttribute("data-morph-preserve");
    expect(marker).toContain("data-open");
    expect(marker).toContain("data-state");
    expect(marker).toContain("aria-expanded");
    for (const el of root.querySelectorAll("[data-slot]")) {
      expect(el.getAttribute("data-morph-preserve")).toBe(marker);
    }
    expect(root.querySelector("span")!.hasAttribute("data-morph-preserve")).toBe(false);
  });

  it("merges with existing user-provided tokens instead of clobbering", () => {
    const root = document.createElement("div");
    root.setAttribute("data-slot", "switch");
    root.setAttribute("data-morph-preserve", "class data-custom");

    stampMorphPreserve(root);

    const tokens = root.getAttribute("data-morph-preserve")!.split(/\s+/);
    expect(tokens).toContain("class");
    expect(tokens).toContain("data-custom");
    expect(tokens).toContain("data-checked");
    expect(tokens).toContain("aria-checked");
  });

  it("stamps [data-slot] elements inserted after the initial call", async () => {
    const root = document.createElement("div");
    root.setAttribute("data-slot", "autocomplete");
    document.body.appendChild(root);
    stampMorphPreserve(root);

    const item = document.createElement("div");
    item.setAttribute("data-slot", "autocomplete-item");
    root.appendChild(item);
    await flushMutations();

    expect(item.getAttribute("data-morph-preserve")).toContain("data-selected");
    root.remove();
  });

  it("is idempotent across repeated calls", () => {
    const root = document.createElement("div");
    root.setAttribute("data-slot", "checkbox");
    stampMorphPreserve(root);
    const first = root.getAttribute("data-morph-preserve");
    stampMorphPreserve(root);
    expect(root.getAttribute("data-morph-preserve")).toBe(first);
  });

  it("merges extra controller-owned attrs (e.g. style)", () => {
    const root = document.createElement("div");
    root.setAttribute("data-slot", "resizable");
    stampMorphPreserve(root, ["style"]);
    const tokens = root.getAttribute("data-morph-preserve")!.split(/\s+/);
    expect(tokens).toContain("style");
    expect(tokens).toContain("data-state");
  });

  it("includes value/ARIA attrs controllers commonly own", () => {
    const root = document.createElement("div");
    root.setAttribute("data-slot", "slider");
    stampMorphPreserve(root);
    const marker = root.getAttribute("data-morph-preserve")!;
    for (const attr of [
      "data-value",
      "data-dragging",
      "aria-valuenow",
      "aria-valuemin",
      "aria-valuemax",
      "data-side",
      "data-highlighted",
      "hidden",
      "role",
    ]) {
      expect(marker.split(/\s+/)).toContain(attr);
    }
  });
});

describe("mergeMorphPreserve", () => {
  it("adds required tokens to a user list", () => {
    expect(mergeMorphPreserve("class", ["style"])).toBe("class style");
  });

  it("dedupes when style is already present", () => {
    expect(mergeMorphPreserve("style class", ["style"])).toBe("style class");
  });

  it("handles empty user value", () => {
    expect(mergeMorphPreserve(undefined, ["style"])).toBe("style");
  });
});
