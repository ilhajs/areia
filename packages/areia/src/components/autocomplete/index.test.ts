import { GlobalRegistrator } from "@happy-dom/global-registrator";
import { describe, expect, it } from "bun:test";
import { ilha, html, mount, state } from "ilha";
import { markupValue as markup } from "$lib/test-markup";
import { Autocomplete, autocompleteVariants } from "./index";

try {
  GlobalRegistrator.register();
} catch {
  // Already registered.
}

describe("autocompleteVariants", () => {
  it("returns size classes", () => {
    const classes = autocompleteVariants({ size: "sm" });
    expect(classes).toContain("h-6.5");
    expect(classes).toContain("rounded-md");
  });
});

describe("Autocomplete", () => {
  it("renders wrapper with data-slot", () => {
    const output = markup(Autocomplete({}));
    expect(output).toContain('data-slot="autocomplete"');
  });

  it("renders input with data-slot", () => {
    const output = markup(Autocomplete({}));
    expect(output).toContain('data-slot="autocomplete-input"');
  });

  it("renders content hidden by default", () => {
    const output = markup(Autocomplete({}));
    expect(output).toContain('data-slot="autocomplete-content"');
    expect(output).toContain("hidden");
  });

  it("renders items from items array", () => {
    const output = markup(
      Autocomplete({
        items: [{ value: "a", label: "Alpha" }],
      }),
    );
    expect(output).toContain('data-slot="autocomplete-item"');
    expect(output).toContain("Alpha");
  });

  it("renders items from string array", () => {
    const output = markup(
      Autocomplete({
        items: ["Alpha", "Beta"],
      }),
    );
    expect(output).toContain('data-slot="autocomplete-item"');
    expect(output).toContain("Alpha");
  });

  it("renders empty state", () => {
    const output = markup(Autocomplete({}));
    expect(output).toContain('data-slot="autocomplete-empty"');
    expect(output).toContain("No suggestions found");
  });

  it("sets data-open-on-focus", () => {
    const output = markup(Autocomplete({ openOnFocus: true }));
    expect(output).toContain('data-open-on-focus="true"');
  });

  it("wraps in field when label is provided", () => {
    const output = markup(Autocomplete({ label: "City" }));
    expect(output).toContain('data-slot="field"');
  });

  it("applies error styling", () => {
    const output = markup(Autocomplete({ error: "Required" }));
    expect(output).toContain('aria-invalid="true"');
  });

  it("merges custom class and className", () => {
    const output = markup(Autocomplete({ class: "a", className: "b" }));
    expect(output).toContain("a");
    expect(output).toContain("b");
  });

  it("places passthrough data attributes on the autocomplete input, not the root", () => {
    const output = markup(Autocomplete({ "data-params": "x", name: "city" }));
    expect(output).toContain('data-params="x"');
    expect(output).toContain('name="city"');
    expect(output).not.toMatch(/data-slot="autocomplete"[^>]*data-params/);
  });

  it("keeps a single open bind sync across ilha effect re-runs after hydration", async () => {
    let readOpen!: () => boolean;
    let setOpen!: (v: boolean) => void;

    const Panel = ilha(() => {
      const open = state(false);

      readOpen = open as () => boolean;
      setOpen = (v: boolean) => open(v);
      return html`${Autocomplete({
        items: [{ value: "a", label: "Alpha" }],
        "bind:open": open,
      })}`;
    });

    document.body.innerHTML = await Panel.hydratable(
      {},
      { name: "Panel", snapshot: true, skipOnMount: false },
    );
    mount({ Panel }, { root: document.body, lazy: false });
    await new Promise<void>((r) => requestAnimationFrame(() => r()));
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();

    expect(readOpen()).toBe(false);

    setOpen(true);
    await Promise.resolve();
    await Promise.resolve();
    await new Promise<void>((r) => requestAnimationFrame(() => r()));

    expect(readOpen()).toBe(true);

    setOpen(false);
    await Promise.resolve();
    await Promise.resolve();
    expect(readOpen()).toBe(false);
  });
});

describe("Autocomplete behavior", () => {
  async function mountAutocomplete() {
    const Panel = ilha(
      () =>
        html`${Autocomplete({
          items: [
            { value: "alpha", label: "Alpha" },
            { value: "beta", label: "Beta" },
          ],
        })}`,
    );

    document.body.innerHTML = await Panel.hydratable(
      {},
      { name: "Panel", snapshot: true, skipOnMount: false },
    );
    mount({ Panel }, { root: document.body, lazy: false });
    await new Promise<void>((r) => requestAnimationFrame(() => r()));
    await Promise.resolve();
    await Promise.resolve();

    return {
      root: document.querySelector('[data-slot="autocomplete"]') as HTMLElement,
      input: document.querySelector('[data-slot="autocomplete-input"]') as HTMLInputElement,
      content: document.querySelector('[data-slot="autocomplete-content"]') as HTMLElement,
    };
  }

  it("opens and filters items when typing", async () => {
    const { input, content } = await mountAutocomplete();
    expect(content.hidden).toBe(true);

    input.value = "al";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    await Promise.resolve();

    expect(content.hidden).toBe(false);
    const items = [...document.querySelectorAll<HTMLElement>('[data-slot="autocomplete-item"]')];
    expect(items).toHaveLength(1);
    expect(items[0]?.dataset["value"]).toBe("alpha");
  });

  it("selects highlighted item with ArrowDown + Enter and closes", async () => {
    const { input, content } = await mountAutocomplete();

    input.value = "a";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    await Promise.resolve();
    expect(content.hidden).toBe(false);

    input.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }));
    input.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
    await Promise.resolve();

    expect(input.value).toBe("alpha");
    expect(content.hidden).toBe(true);
  });

  it("closes on Escape", async () => {
    const { input, content } = await mountAutocomplete();

    input.value = "b";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    await Promise.resolve();
    expect(content.hidden).toBe(false);

    input.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    await Promise.resolve();
    expect(content.hidden).toBe(true);
  });
});

describe("Autocomplete.Item", () => {
  it("renders with data-slot", () => {
    const output = markup(Autocomplete.Item({ value: "x", children: "X" }));
    expect(output).toContain('data-slot="autocomplete-item"');
    expect(output).toContain('data-value="x"');
  });
});

describe("Autocomplete.Empty", () => {
  it("renders with data-slot", () => {
    const output = markup(Autocomplete.Empty());
    expect(output).toContain('data-slot="autocomplete-empty"');
  });
});
