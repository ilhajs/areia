import { describe, expect, it } from "bun:test";
import { markupValue as markup } from "$lib/test-markup";
import { Toaster } from "./index";

describe("Toaster", () => {
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
});
