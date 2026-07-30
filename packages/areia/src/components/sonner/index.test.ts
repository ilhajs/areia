import { GlobalRegistrator } from "@happy-dom/global-registrator";
import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { toast } from "sonner";
import { markupValue as markup } from "$lib/test-markup";
import { destroyToasterRuntime, ensureToastersMounted, showToast, Toaster } from "./index";

try {
  GlobalRegistrator.register();
} catch {
  // Already registered.
}

describe("Toaster", () => {
  beforeEach(() => {
    destroyToasterRuntime(document);
    toast.dismiss();
    document.body.replaceChildren();
  });

  afterEach(() => {
    toast.dismiss();
    destroyToasterRuntime(document);
    document.body.replaceChildren();
  });
  it("renders wrapper with data-slot", () => {
    const output = markup(Toaster.Static({}));
    expect(output).toContain('data-slot="sonner-toaster"');
  });

  it("sets default position", () => {
    const output = markup(Toaster.Static({}));
    expect(output).toContain('data-position="bottom-right"');
  });

  it("sets custom position", () => {
    const output = markup(Toaster.Static({ position: "top-left" }));
    expect(output).toContain('data-position="top-left"');
  });

  it("sets theme", () => {
    const output = markup(Toaster.Static({ theme: "dark" }));
    expect(output).toContain('data-theme="dark"');
  });

  it("sets data attributes", () => {
    const output = markup(
      Toaster.Static({
        richColors: true,
        expand: true,
        duration: 4000,
        visibleToasts: 5,
        closeButton: true,
      }),
    );
    expect(output).toContain("data-rich-colors");
    expect(output).toContain("data-expand");
    expect(output).toContain('data-duration="4000"');
    expect(output).toContain('data-visible-toasts="5"');
    expect(output).toContain("data-close-button");
  });

  it("sets fixed positioning class", () => {
    const output = markup(Toaster.Static({}));
    expect(output).toContain("fixed");
    expect(output).toContain("z-[2147483647]");
  });

  it("merges custom class and className", () => {
    const output = markup(Toaster.Static({ class: "a", className: "b" }));
    expect(output).toContain("a");
    expect(output).toContain("b");
  });

  it("keeps one document root while route owners are replaced", async () => {
    for (let index = 0; index < 5; index++) {
      const route = document.createElement("main");
      const owner = document.createElement("div");
      owner.setAttribute("data-areia-sonner-toaster", "");
      owner.setAttribute("data-position", index % 2 ? "top-left" : "bottom-right");
      route.appendChild(owner);
      document.body.querySelector("main")?.remove();
      document.body.appendChild(route);
      ensureToastersMounted(document);
      await Promise.resolve();

      expect(document.querySelectorAll("[data-areia-sonner-toaster]")).toHaveLength(1);
      expect(owner.hasAttribute("data-areia-sonner-owner")).toBe(true);
    }
  });

  it("renders and closes one toast after repeated owner replacement", async () => {
    for (let index = 0; index < 4; index++) {
      const owner = document.createElement("div");
      owner.setAttribute("data-areia-sonner-toaster", "");
      owner.setAttribute("data-close-button", "");
      document.body.querySelector("[data-areia-sonner-owner]")?.remove();
      document.body.appendChild(owner);
      ensureToastersMounted(document);
      await Promise.resolve();
    }

    showToast("success", "Saved", { duration: Infinity });
    await Promise.resolve();
    expect(document.querySelectorAll("[data-areia-sonner-toast]")).toHaveLength(1);

    document.querySelector<HTMLButtonElement>("[data-areia-sonner-close]")?.click();
    expect(document.querySelector("[data-areia-sonner-toast]")?.getAttribute("data-state")).toBe(
      "closed",
    );
  });

  it("tears down the exact document runtime idempotently", () => {
    ensureToastersMounted(document);
    const root = document.querySelector("[data-areia-sonner-toaster]");

    destroyToasterRuntime(document);
    destroyToasterRuntime(document);

    expect(root?.isConnected).toBe(false);
    expect(document.querySelectorAll("[data-areia-sonner-toaster]")).toHaveLength(0);
  });
});
