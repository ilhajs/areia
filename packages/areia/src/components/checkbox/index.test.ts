import { describe, expect, it } from "bun:test";
import { markupValue as markup } from "$lib/test-markup";
import { Checkbox, checkboxVariants } from "./index";

describe("checkboxVariants", () => {
  it("returns default classes", () => {
    const classes = checkboxVariants();
    expect(classes).toContain("ring-areia-control-border");
  });

  it("applies error variant classes", () => {
    const classes = checkboxVariants({ variant: "error" });
    expect(classes).toContain("ring-areia-destructive");
  });
});

describe("Checkbox", () => {
  it("renders control with data-slot", () => {
    const output = markup(Checkbox({}));
    expect(output).toContain('data-slot="checkbox"');
  });

  it("renders label wrapper when label is provided", () => {
    const output = markup(Checkbox({ label: "Accept" }));
    expect(output).toContain("Accept");
    expect(output).toContain("<label");
  });

  it("sets aria-checked to true when checked", () => {
    const output = markup(Checkbox({ checked: true }));
    expect(output).toContain('aria-checked="true"');
  });

  it("sets aria-checked to mixed when indeterminate", () => {
    const output = markup(Checkbox({ indeterminate: true }));
    expect(output).toContain('aria-checked="mixed"');
  });

  it("sets aria-disabled when disabled", () => {
    const output = markup(Checkbox({ disabled: true }));
    expect(output).toContain('aria-disabled="true"');
  });

  it("reverses order when controlFirst is false", () => {
    const output = markup(Checkbox({ label: "X", controlFirst: false }));
    expect(output).toContain("flex-row-reverse");
  });

  it("merges custom class and className", () => {
    const output = markup(Checkbox({ class: "a", className: "b" }));
    expect(output).toContain("a");
    expect(output).toContain("b");
  });

  it("places passthrough data attributes on the native input, not the visual root", () => {
    const output = markup(
      Checkbox({ "data-params": "x", "data-todo-checkbox": true, id: "terms" }),
    );
    expect(output).toContain('data-slot="checkbox-input"');
    expect(output).toContain('data-params="x"');
    expect(output).toContain("data-todo-checkbox");
    expect(output).toContain('id="terms"');
    expect(output).not.toMatch(/data-slot="checkbox"[^>]*data-params/);
  });
});

describe("Checkbox.Group", () => {
  it("renders fieldset", () => {
    const output = markup(Checkbox.Group({ legend: "Options" }, []));
    expect(output).toContain("<fieldset");
    expect(output).toContain("Options");
  });

  it("renders error text", () => {
    const output = markup(Checkbox.Group({ error: "Bad" }, []));
    expect(output).toContain("Bad");
    expect(output).toContain("text-areia-destructive-soft-foreground");
  });

  it("renders description text", () => {
    const output = markup(Checkbox.Group({ description: "Hint" }, []));
    expect(output).toContain("Hint");
    expect(output).toContain("text-areia-subtle");
  });
});
