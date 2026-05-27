import { describe, expect, it } from "bun:test";
import { Collapsible } from "./index";

function markup(value: unknown): string {
  if (value && typeof value === "object" && "value" in value) {
    return String(value.value);
  }
  return String(value);
}

describe("Collapsible", () => {
  it("renders trigger and panel", () => {
    const output = markup(Collapsible({ trigger: "Toggle", panel: "Content" }));
    expect(output).toContain('data-slot="collapsible"');
    expect(output).toContain('data-slot="collapsible-trigger"');
    expect(output).toContain('data-slot="collapsible-content"');
  });

  it("renders accordion when items are provided", () => {
    const output = markup(
      Collapsible({
        items: [{ value: "a", label: "A", content: "Details" }],
      }),
    );
    expect(output).toContain('data-slot="accordion"');
    expect(output).toContain('data-slot="accordion-item"');
    expect(output).toContain('data-slot="accordion-trigger"');
    expect(output).toContain('data-slot="accordion-content"');
  });

  it("sets data-default-open", () => {
    const output = markup(Collapsible({ trigger: "T", panel: "P", defaultOpen: true }));
    expect(output).toContain("data-default-open");
  });

  it("merges custom class and className", () => {
    const output = markup(Collapsible({ trigger: "T", panel: "P", class: "a", className: "b" }));
    expect(output).toContain("a");
    expect(output).toContain("b");
  });
});

describe("Collapsible.Trigger", () => {
  it("renders with data-slot", () => {
    const output = markup(Collapsible.Trigger({ children: "Toggle" }));
    expect(output).toContain('data-slot="collapsible-trigger"');
  });
});

describe("Collapsible.Panel", () => {
  it("renders with data-slot", () => {
    const output = markup(Collapsible.Panel({ children: "Body" }));
    expect(output).toContain('data-slot="collapsible-content"');
  });
});

describe("Collapsible.Accordion", () => {
  it("renders with data-slot", () => {
    const output = markup(Collapsible.Accordion({}));
    expect(output).toContain('data-slot="accordion"');
  });
});
