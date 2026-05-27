import { describe, expect, it } from "bun:test";
import { Dropdown, dropdownVariants } from "./index";

function markup(value: unknown): string {
  if (value && typeof value === "object" && "value" in value) {
    return String(value.value);
  }
  return String(value);
}

describe("dropdownVariants", () => {
  it("returns default item classes", () => {
    const v = dropdownVariants({ variant: "default" });
    expect(v.item).toContain("text-areia-default");
  });

  it("returns danger item classes", () => {
    const v = dropdownVariants({ variant: "danger" });
    expect(v.item).toContain("text-areia-danger");
  });
});

describe("Dropdown", () => {
  it("renders trigger and content", () => {
    const output = markup(Dropdown({ trigger: "Open", children: "Hello" }));
    expect(output).toContain('data-slot="dropdown-menu"');
    expect(output).toContain('data-slot="dropdown-menu-trigger"');
    expect(output).toContain('data-slot="dropdown-menu-content"');
  });

  it("renders content hidden by default", () => {
    const output = markup(Dropdown({ trigger: "Open", children: "Hello" }));
    expect(output).toContain('data-slot="dropdown-menu-content"');
    expect(output).toContain("hidden");
  });

  it("renders items from items prop", () => {
    const output = markup(
      Dropdown({
        trigger: "Open",
        items: [{ label: "One", value: "1" }],
      }),
    );
    expect(output).toContain('data-slot="dropdown-menu-item"');
    expect(output).toContain("One");
  });

  it("merges custom class and className", () => {
    const output = markup(Dropdown({ trigger: "X", children: "Y", class: "a", className: "b" }));
    expect(output).toContain("a");
    expect(output).toContain("b");
  });
});

describe("Dropdown.Item", () => {
  it("renders button with data-slot", () => {
    const output = markup(Dropdown.Item({ label: "One" }));
    expect(output).toContain('data-slot="dropdown-menu-item"');
    expect(output).toContain("One");
  });

  it("renders href as anchor", () => {
    const output = markup(Dropdown.Item({ label: "Link", href: "/x" }));
    expect(output).toContain("<a");
    expect(output).toContain('href="/x"');
  });

  it("renders external link with target", () => {
    const output = markup(Dropdown.Item({ label: "Link", href: "https://x.com", external: true }));
    expect(output).toContain('target="_blank"');
    expect(output).toContain('rel="noreferrer"');
  });

  it("renders checkbox item", () => {
    const output = markup(Dropdown.CheckboxItem({ label: "Check" }));
    expect(output).toContain('data-slot="dropdown-menu-checkbox-item"');
  });

  it("renders radio item", () => {
    const output = markup(Dropdown.RadioItem({ label: "Radio" }));
    expect(output).toContain('data-slot="dropdown-menu-radio-item"');
  });
});

describe("Dropdown.Label", () => {
  it("renders with data-slot", () => {
    const output = markup(Dropdown.Label({ children: "Group" }));
    expect(output).toContain('data-slot="dropdown-menu-label"');
  });
});

describe("Dropdown.Separator", () => {
  it("renders with data-slot", () => {
    const output = markup(Dropdown.Separator());
    expect(output).toContain('data-slot="dropdown-menu-separator"');
  });
});

describe("Dropdown.Shortcut", () => {
  it("renders with data-slot", () => {
    const output = markup(Dropdown.Shortcut({ children: "⌘K" }));
    expect(output).toContain('data-slot="dropdown-menu-shortcut"');
    expect(output).toContain("⌘K");
  });
});
