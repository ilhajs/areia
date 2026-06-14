import { describe, expect, it } from "bun:test";
import { markupValue as markup } from "$lib/test-markup";
import { Switch, switchVariants, switchThumbVariants } from "./index";

describe("switchVariants", () => {
  it("returns default base classes", () => {
    const classes = switchVariants();
    expect(classes).toContain("h-4.5");
    expect(classes).toContain("w-9");
  });

  it("applies sm size classes", () => {
    const classes = switchVariants({ size: "sm" });
    expect(classes).toContain("h-4");
    expect(classes).toContain("w-8");
  });

  it("applies neutral variant classes", () => {
    const classes = switchVariants({ variant: "neutral" });
    expect(classes).toContain("data-checked:bg-areia-foreground");
  });
});

describe("switchThumbVariants", () => {
  it("returns default thumb classes", () => {
    const classes = switchThumbVariants();
    expect(classes).toContain("size-4.5");
  });
});

describe("Switch", () => {
  it("renders control with data-slot", () => {
    const output = markup(Switch({}));
    expect(output).toContain('data-slot="switch"');
  });

  it("renders label wrapper when label is provided", () => {
    const output = markup(Switch({ label: "Enable" }));
    expect(output).toContain("Enable");
    expect(output).toContain("<label");
  });

  it("sets aria-checked when checked", () => {
    const output = markup(Switch({ checked: true }));
    expect(output).toContain('aria-checked="true"');
  });

  it("sets aria-disabled when disabled", () => {
    const output = markup(Switch({ disabled: true }));
    expect(output).toContain('aria-disabled="true"');
  });

  it("sets aria-readonly when readOnly", () => {
    const output = markup(Switch({ readOnly: true }));
    expect(output).toContain('aria-readonly="true"');
  });

  it("reverses order when controlFirst is false", () => {
    const output = markup(Switch({ label: "X", controlFirst: false }));
    expect(output).toContain("flex-row-reverse");
  });

  it("merges custom class and className", () => {
    const output = markup(Switch({ class: "a", className: "b" }));
    expect(output).toContain("a");
    expect(output).toContain("b");
  });

  it("places passthrough data attributes on the native input, not the visual root", () => {
    const output = markup(Switch({ "data-params": "x", id: "notify" }));
    expect(output).toContain('data-slot="switch-input"');
    expect(output).toContain('data-params="x"');
    expect(output).toContain('id="notify"');
    expect(output).not.toMatch(/data-slot="switch"[^>]*data-params/);
  });
});

describe("Switch.Group", () => {
  it("renders fieldset", () => {
    const output = markup(Switch.Group({ legend: "Options" }, []));
    expect(output).toContain("<fieldset");
    expect(output).toContain("Options");
  });
});
