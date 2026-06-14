import { describe, expect, it } from "bun:test";
import { markupValue as markup } from "$lib/test-markup";
import { ClipboardText, clipboardTextVariants } from "./index";

describe("clipboardTextVariants", () => {
  it("returns default lg classes", () => {
    const classes = clipboardTextVariants();
    expect(classes).toContain("bg-areia-control-background");
    expect(classes).toContain("text-sm");
  });

  it("applies sm size classes", () => {
    const classes = clipboardTextVariants({ size: "sm" });
    expect(classes).toContain("text-xs");
  });
});

describe("ClipboardText", () => {
  it("renders wrapper with data-slot", () => {
    const output = markup(ClipboardText({ text: "abc123" }));
    expect(output).toContain('data-slot="clipboard-text"');
  });

  it("displays text value", () => {
    const output = markup(ClipboardText({ text: "abc123" }));
    expect(output).toContain('data-slot="clipboard-text-value"');
    expect(output).toContain("abc123");
  });

  it("renders copy button", () => {
    const output = markup(ClipboardText({ text: "abc123" }));
    expect(output).toContain('data-slot="clipboard-text-button"');
    expect(output).toContain('aria-label="Copy to clipboard"');
  });

  it("renders tooltip when tooltip is true", () => {
    const output = markup(ClipboardText({ text: "abc123", tooltip: true }));
    expect(output).toContain('data-slot="tooltip"');
    expect(output).toContain("Copy");
  });

  it("renders sr-only status element", () => {
    const output = markup(ClipboardText({ text: "abc123" }));
    expect(output).toContain('data-slot="clipboard-text-status"');
    expect(output).toContain('aria-live="polite"');
  });

  it("sets data-copy-text attribute", () => {
    const output = markup(ClipboardText({ text: "abc123", textToCopy: "override" }));
    expect(output).toContain('data-copy-text="override"');
  });

  it("merges custom class and className", () => {
    const output = markup(ClipboardText({ text: "x", class: "a", className: "b" }));
    expect(output).toContain("a");
    expect(output).toContain("b");
  });
});
