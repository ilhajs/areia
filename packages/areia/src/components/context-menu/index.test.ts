import { describe, expect, it } from "bun:test";
import { html } from "ilha";
import { ContextMenu } from "./index";

function markup(value: unknown): string {
  if (value && typeof value === "object" && "value" in value) {
    return String(value.value);
  }
  return String(value);
}

describe("ContextMenu", () => {
  it("renders trigger and content", () => {
    const output = markup(ContextMenu({ trigger: "Right click", children: "Hello" }));
    expect(output).toContain('data-slot="context-menu"');
    expect(output).toContain('data-slot="context-menu-trigger"');
    expect(output).toContain('data-slot="context-menu-content"');
  });

  it("renders content hidden by default", () => {
    const output = markup(ContextMenu({ trigger: "Right click", children: "Hello" }));
    expect(output).toContain('data-slot="context-menu-content"');
    expect(output).toContain("hidden");
  });

  it("renders composed children", () => {
    const output = markup(
      ContextMenu({
        children: [
          ContextMenu.Trigger({ children: "Right click" }),
          ContextMenu.Content({ children: ContextMenu.Item({ label: "One" }) }),
        ],
      }),
    );
    expect(output).toContain('data-slot="context-menu-content"');
    expect(output).toContain('data-slot="context-menu-item"');
  });

  it("renders HTML trigger markup instead of escaped syntax", () => {
    const output = markup(
      ContextMenu({
        trigger: html`<div
          class="rounded-lg border border-dashed border-areia-border p-8 text-center text-areia-subtle"
        >
          Right click here
        </div>`,
        children: ContextMenu.Item({ label: "Copy" }),
      }),
    );

    expect(output).not.toContain("&lt;div");
    expect(output).toContain('class="rounded-lg');
    expect(output).toContain("Right click here");
  });

  it("sets data-disabled", () => {
    const output = markup(ContextMenu({ trigger: "X", children: "Y", disabled: true }));
    expect(output).toContain("data-disabled");
  });

  it("merges custom class and className", () => {
    const output = markup(ContextMenu({ trigger: "X", children: "Y", class: "a", className: "b" }));
    expect(output).toContain("a");
    expect(output).toContain("b");
  });
});

describe("ContextMenu.Item", () => {
  it("renders with data-slot", () => {
    const output = markup(ContextMenu.Item({ label: "One" }));
    expect(output).toContain('data-slot="context-menu-item"');
    expect(output).toContain("One");
  });

  it("renders checkbox item", () => {
    const output = markup(ContextMenu.CheckboxItem({ label: "Check" }));
    expect(output).toContain('data-slot="context-menu-checkbox-item"');
  });

  it("renders radio item", () => {
    const output = markup(ContextMenu.RadioItem({ label: "Radio" }));
    expect(output).toContain('data-slot="context-menu-radio-item"');
  });
});
