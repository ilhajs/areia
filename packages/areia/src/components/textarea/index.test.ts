import { describe, expect, it } from "bun:test";
import { markupValue as markup } from "$lib/test-markup";
import { Textarea, textareaVariants } from "./index";

describe("textareaVariants", () => {
  it("returns default base classes", () => {
    const classes = textareaVariants();
    expect(classes).toContain("w-full");
    expect(classes).toContain("bg-areia-control-background");
    expect(classes).toContain("resize-vertical");
  });

  it("applies lg size classes", () => {
    const classes = textareaVariants({ size: "lg" });
    expect(classes).toContain("text-base");
    expect(classes).toContain("rounded-lg");
  });

  it("applies error variant classes", () => {
    const classes = textareaVariants({ variant: "error" });
    expect(classes).toContain("!ring-areia-destructive");
  });
});

describe("Textarea", () => {
  it("renders a textarea element", () => {
    const output = markup(Textarea({}));
    expect(output).toContain("<textarea");
    expect(output).toContain("</textarea");
  });

  it("sets default rows to 3", () => {
    const output = markup(Textarea({}));
    expect(output).toContain('rows="3"');
  });

  it("uses value prop as text content", () => {
    const output = markup(Textarea({ value: "hello" }));
    expect(output).toContain("hello");
  });

  it("falls back to defaultValue", () => {
    const output = markup(Textarea({ defaultValue: "fallback" }));
    expect(output).toContain("fallback");
  });

  it("applies error styling when error is provided", () => {
    const output = markup(Textarea({ error: "Required" }));
    expect(output).toContain("!ring-areia-destructive");
    expect(output).toContain('aria-invalid="true"');
  });

  it("wraps in field when label is provided", () => {
    const output = markup(Textarea({ label: "Bio" }));
    expect(output).toContain('data-slot="field"');
    expect(output).toContain('data-slot="field-label"');
  });

  it("merges custom class and className", () => {
    const output = markup(Textarea({ class: "a", className: "b" }));
    expect(output).toContain("a");
    expect(output).toContain("b");
  });
});
