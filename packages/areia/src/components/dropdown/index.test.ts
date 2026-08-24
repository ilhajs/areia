import { GlobalRegistrator } from "@happy-dom/global-registrator";
import { describe, expect, it } from "bun:test";
import { markupValue as markup } from "$lib/test-markup";
import { ilha, html, mount } from "ilha";
import { Dropdown, dropdownVariants } from "./index";

try {
  GlobalRegistrator.register();
} catch {
  // Already registered by another DOM test file in the same Bun process.
}

async function settle() {
  await Promise.resolve();
  await Promise.resolve();
  await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
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

const ISLAND = Symbol.for("ilha.island");
const isIsland = (v: unknown) =>
  typeof v === "function" &&
  (ISLAND in v || Object.getOwnPropertySymbols(v).some((s) => s.description === "ilha.island"));

describe("Dropdown", () => {
  it("default export is an ilha island", () => {
    expect(isIsland(Dropdown)).toBe(true);
    expect(typeof Dropdown.mount).toBe("function");
  });

  it("renders trigger and content", () => {
    const output = markup(Dropdown({ trigger: "Open", children: "Hello" }));
    expect(output).toContain('data-slot="dropdown-menu"');
    expect(output).toContain('data-slot="dropdown-menu-trigger"');
    expect(output).toContain('data-slot="dropdown-menu-content"');
    expect(output).not.toContain("data-areia-dropdown");
  });

  it("Static returns plain markup without auto-bind markers", () => {
    const output = markup(Dropdown.Static({ trigger: "Open", children: "Hello" }));
    expect(output).toContain('data-slot="dropdown-menu"');
    expect(output).not.toContain("data-areia-dropdown");
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

  it("renders serialized HTML trigger markup instead of [object Object]", () => {
    const output = markup(
      Dropdown({
        trigger: { value: '<button type="button" data-testid="trigger">Open</button>' },
        children: "Hello",
      }),
    );
    expect(output).not.toContain("[object Object]");
    expect(output).toContain('data-testid="trigger"');
    expect(output).toContain("Open");
  });

  it("renders HTML trigger markup from ilha html helper", () => {
    const output = markup(
      Dropdown({
        trigger: html`<button type="button" class="custom-trigger">Open</button>`,
        children: "Hello",
      }),
    );
    expect(output).not.toContain("[object Object]");
    expect(output).not.toContain("&lt;button");
    expect(output).toContain('class="custom-trigger"');
    expect(output).toContain("Open");
  });

  it("renders composed trigger children", () => {
    const output = markup(
      Dropdown({
        children: [
          Dropdown.Trigger({ children: "Open" }),
          Dropdown.Content({ children: Dropdown.Item({ label: "One" }) }),
        ],
      }),
    );
    expect(output).toContain('data-slot="dropdown-menu-trigger"');
    expect(output).toContain('data-slot="dropdown-menu-content"');
    expect(output).toContain("Open");
  });

  it("renders serialized HTML in composed content", () => {
    const output = markup(
      Dropdown({
        children: [
          Dropdown.Trigger({ children: "Open" }),
          Dropdown.Content({
            children: { value: '<p data-testid="menu-body">Body</p>' },
          }),
        ],
      }),
    );
    expect(output).not.toContain("[object Object]");
    expect(output).toContain('data-testid="menu-body"');
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

  it("passes data-no-intercept through to anchor items", () => {
    const output = markup(Dropdown.Item({ label: "Link", href: "/x", "data-no-intercept": true }));
    expect(output).toContain("<a");
    expect(output).toContain("data-no-intercept");
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

describe("Dropdown behavior (island mount)", () => {
  async function mountDropdown(input: Parameters<typeof Dropdown>[0]) {
    const Panel = ilha.render(() => html`${Dropdown(input)}`);
    document.body.innerHTML = await Panel.hydratable({}, { name: "Panel", snapshot: true });
    mount({ Panel }, { root: document.body, lazy: false });
    await settle();
  }

  it("opens on trigger click and closes on item selection", async () => {
    await mountDropdown({
      trigger: "Open",
      items: [
        { label: "One", value: "1" },
        { label: "Two", value: "2" },
      ],
    });

    const content = document.querySelector('[data-slot="dropdown-menu-content"]') as HTMLElement;
    const trigger = document.querySelector('[data-slot="dropdown-menu-trigger"]') as HTMLElement;
    expect(content.hidden).toBe(true);

    trigger.click();
    await settle();
    expect(content.hidden).toBe(false);
    expect(trigger.getAttribute("aria-expanded")).toBe("true");

    const item = document.querySelector('[data-slot="dropdown-menu-item"]') as HTMLElement;
    item.click();
    await settle();
    expect(content.hidden).toBe(true);
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
  });

  it("closes on Escape key", async () => {
    await mountDropdown({ trigger: "Open", items: [{ label: "One", value: "1" }] });

    const content = document.querySelector('[data-slot="dropdown-menu-content"]') as HTMLElement;
    (document.querySelector('[data-slot="dropdown-menu-trigger"]') as HTMLElement).click();
    await settle();
    expect(content.hidden).toBe(false);

    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    await settle();
    expect(content.hidden).toBe(true);
  });
});
