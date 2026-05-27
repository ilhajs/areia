import { describe, expect, it } from "bun:test";
import { Dialog, dialogVariants } from "./index";

function markup(value: unknown): string {
  if (value && typeof value === "object" && "value" in value) {
    return String(value.value);
  }
  return String(value);
}

describe("dialogVariants", () => {
  it("returns default base classes", () => {
    const classes = dialogVariants();
    expect(classes).toContain("fixed");
    expect(classes).toContain("rounded-xl");
  });

  it("applies sm size classes", () => {
    const classes = dialogVariants({ size: "sm" });
    expect(classes).toContain("min-w-72");
  });
});

describe("Dialog", () => {
  it("renders trigger and content", () => {
    const output = markup(Dialog({ children: "Open", content: "Hello" }));
    expect(output).toContain('data-slot="dialog"');
    expect(output).toContain('data-slot="dialog-trigger"');
    expect(output).toContain('data-slot="dialog-content"');
    expect(output).toContain("Hello");
  });

  it("renders content hidden by default", () => {
    const output = markup(Dialog({ children: "Open", content: "Hello" }));
    expect(output).toContain('data-slot="dialog-content"');
    expect(output).toContain("hidden");
  });

  it("renders overlay hidden by default", () => {
    const output = markup(Dialog({ children: "Open", content: "Hello" }));
    expect(output).toContain('data-slot="dialog-overlay"');
    expect(output).toContain("hidden");
  });

  it("renders portal wrapper", () => {
    const output = markup(Dialog({ children: "Open", content: "Hello" }));
    expect(output).toContain('data-slot="dialog-portal"');
  });

  it("sets data-alert-dialog for alertdialog role", () => {
    const output = markup(Dialog({ children: "Open", content: "Hello", role: "alertdialog" }));
    expect(output).toContain("data-alert-dialog");
  });

  it("composes children when they contain dialog-content slot", () => {
    const output = markup(
      Dialog({
        children: [Dialog.Trigger({ children: "Open" }), Dialog.Content({ children: "Hello" })],
      }),
    );
    expect(output).toContain('data-slot="dialog-content"');
  });

  it("merges custom class and className", () => {
    const output = markup(Dialog({ children: "X", content: "Y", class: "a", className: "b" }));
    expect(output).toContain("a");
    expect(output).toContain("b");
  });
});

describe("Dialog.Trigger", () => {
  it("renders with data-slot", () => {
    const output = markup(Dialog.Trigger({ children: "Open" }));
    expect(output).toContain('data-slot="dialog-trigger"');
  });
});

describe("Dialog.Content", () => {
  it("renders with data-slot and hidden", () => {
    const output = markup(Dialog.Content({ children: "Body" }));
    expect(output).toContain('data-slot="dialog-content"');
    expect(output).toContain("hidden");
  });
});

describe("Dialog.Title", () => {
  it("renders h2 with data-slot", () => {
    const output = markup(Dialog.Title({ children: "Title" }));
    expect(output).toContain('data-slot="dialog-title"');
    expect(output).toContain("<h2");
  });
});

describe("Dialog.Description", () => {
  it("renders p with data-slot", () => {
    const output = markup(Dialog.Description({ children: "Desc" }));
    expect(output).toContain('data-slot="dialog-description"');
    expect(output).toContain("<p");
  });
});
