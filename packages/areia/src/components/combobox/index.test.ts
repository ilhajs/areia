import { GlobalRegistrator } from "@happy-dom/global-registrator";
import { describe, expect, it } from "bun:test";
import ilha, { html, mount, signal, type SignalAccessor } from "ilha";
import { markupValue as markup } from "$lib/test-markup";
import { Combobox, comboboxVariants, type ComboboxInput } from "./index";

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

async function mountCombobox(input: ComboboxInput = {}) {
  const Panel = ilha.render(
    () =>
      html`${Combobox({
        items: [
          { value: "apple", label: "Apple" },
          { value: "banana", label: "Banana" },
        ],
        ...input,
      })}`,
  );

  document.body.innerHTML = await Panel.hydratable({}, { name: "Panel", snapshot: true });
  mount({ Panel }, { root: document.body, lazy: false });
  await settle();

  return {
    root: document.querySelector('[data-slot="combobox"]') as HTMLElement,
    input: document.querySelector('[data-slot="combobox-input"]') as HTMLInputElement,
    trigger: document.querySelector('[data-slot="combobox-trigger"]') as HTMLElement,
    content: document.querySelector('[data-slot="combobox-content"]') as HTMLElement,
  };
}

describe("comboboxVariants", () => {
  it("returns empty by default", () => {
    const classes = comboboxVariants();
    expect(classes).toBe("");
  });
});

describe("Combobox", () => {
  it("is an ilha island by default", () => {
    const islandKey = Symbol.for("ilha.island");
    expect((Combobox as unknown as Record<symbol, unknown>)[islandKey]).toBeTruthy();
    expect(typeof Combobox.mount).toBe("function");
    expect((Combobox.Static as unknown as Record<symbol, unknown>)[islandKey]).toBeFalsy();
    expect(markup(Combobox({}))).not.toContain("data-areia-combobox");
  });

  it("Static returns plain markup without auto-bind markers", () => {
    const output = markup(Combobox.Static({}));
    expect(output).toContain('data-slot="combobox"');
    expect(output).not.toContain("data-areia-combobox");
    expect(output).not.toContain("data-ilha");
  });

  it("renders wrapper with data-slot", () => {
    const output = markup(Combobox({}));
    expect(output).toContain('data-slot="combobox"');
  });

  it("renders trigger input", () => {
    const output = markup(Combobox({}));
    expect(output).toContain('data-slot="combobox-input"');
    expect(output).toContain('data-slot="combobox-trigger"');
  });

  it("renders content hidden by default", () => {
    const output = markup(Combobox({}));
    expect(output).toContain('data-slot="combobox-content"');
    expect(output).toContain("hidden");
  });

  it("renders items from items prop", () => {
    const output = markup(
      Combobox({
        items: [
          { value: "a", label: "Alpha" },
          { value: "b", label: "Beta", disabled: true },
        ],
      }),
    );
    expect(output).toContain('data-slot="combobox-item"');
    expect(output).toContain("Alpha");
    expect(output).toContain("Beta");
  });

  it("renders empty state", () => {
    const output = markup(Combobox({}));
    expect(output).toContain('data-slot="combobox-empty"');
    expect(output).toContain("No options found");
  });

  it("wraps in field when label is provided", () => {
    const output = markup(Combobox({ label: "Country" }));
    expect(output).toContain('data-slot="field"');
    expect(output).toContain('data-slot="field-label"');
  });

  it("applies error styling when error is provided", () => {
    const output = markup(Combobox({ error: "Required" }));
    expect(output).toContain("!ring-areia-destructive");
    expect(output).toContain('aria-invalid="true"');
  });

  it("merges custom class and className", () => {
    const output = markup(Combobox({ class: "a", className: "b" }));
    expect(output).toContain("a");
    expect(output).toContain("b");
  });

  it("stamps data-multiple on the root when multiple is set", () => {
    const output = markup(Combobox({ multiple: true }));
    expect(output).toMatch(/data-slot="combobox"[^>]*data-multiple/);
  });

  it("serializes an array defaultValue as JSON in multiple mode", () => {
    const output = markup(Combobox({ multiple: true, defaultValue: ["a", "b"] }));
    expect(output).toContain("data-default-value");
    expect(output).toContain("a&quot;");
  });

  it("renders a chips container and Badge chip template in multiple mode", () => {
    const output = markup(Combobox({ multiple: true }));
    expect(output).toContain('data-slot="combobox-chips"');
    expect(output).toContain('data-slot="combobox-chip-template"');
    expect(output).toContain('data-slot="combobox-chip-label"');
    expect(output).toContain('data-slot="combobox-chip-remove"');
    expect(output).toContain("bg-areia-surface-muted");
  });

  it("places passthrough data attributes on the combobox input, not the root", () => {
    const output = markup(Combobox({ "data-params": "x", name: "country" }));
    expect(output).toContain('data-params="x"');
    expect(output).toContain('name="country"');
    expect(output).not.toMatch(/data-slot="combobox"[^>]*data-params/);
  });
});

describe("Combobox.Item", () => {
  it("renders with data-slot", () => {
    const output = markup(Combobox.Item({ value: "x", children: "X" }));
    expect(output).toContain('data-slot="combobox-item"');
    expect(output).toContain('data-value="x"');
  });
});

describe("Combobox.Empty", () => {
  it("renders with data-slot", () => {
    const output = markup(Combobox.Empty());
    expect(output).toContain('data-slot="combobox-empty"');
  });
});

describe("Combobox.Group", () => {
  it("renders with data-slot", () => {
    const output = markup(Combobox.Group({}));
    expect(output).toContain('data-slot="combobox-group"');
  });
});

describe("Combobox behavior", () => {
  it("opens on trigger click", async () => {
    const { input, trigger, content } = await mountCombobox();
    expect(content.hidden).toBe(true);

    trigger.click();
    await settle();
    expect(content.hidden).toBe(false);
    expect(input.getAttribute("aria-expanded")).toBe("true");
  });

  it("filters items when typing", async () => {
    const { input, trigger } = await mountCombobox();

    trigger.click();
    await settle();

    input.value = "app";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    await settle();

    const items = [...document.querySelectorAll<HTMLElement>('[data-slot="combobox-item"]')];
    expect(items.find((el) => el.dataset["value"] === "apple")?.hidden).toBe(false);
    expect(items.find((el) => el.dataset["value"] === "banana")?.hidden).toBe(true);
  });

  it("commits item label to input on item click and closes", async () => {
    const { input, trigger, content } = await mountCombobox();

    trigger.click();
    await settle();

    const apple = [...document.querySelectorAll<HTMLElement>('[data-slot="combobox-item"]')].find(
      (el) => el.dataset["value"] === "apple",
    ) as HTMLElement;
    apple.click();
    await settle();

    expect(input.value).toBe("Apple");
    expect(content.hidden).toBe(true);
  });

  it("toggles items without closing in multiple mode", async () => {
    const { root, trigger, content } = await mountCombobox({ multiple: true });

    trigger.click();
    await settle();

    const items = [...document.querySelectorAll<HTMLElement>('[data-slot="combobox-item"]')];
    items.find((el) => el.dataset["value"] === "apple")?.click();
    items.find((el) => el.dataset["value"] === "banana")?.click();
    await settle();

    expect(content.hidden).toBe(false);
    expect(root.getAttribute("data-value")).toBe("apple,banana");

    const chips = root.querySelectorAll<HTMLElement>('[data-slot="combobox-chip"]');
    expect(chips.length).toBe(2);
    expect(chips[0]?.textContent).toContain("Apple");
  });

  it("filters after clear → pick → clear with bind:value (no remorph duplicates)", async () => {
    const selected = signal<string | null>("apple");
    const Panel = ilha.render(
      () =>
        html`${Combobox({
          label: "Fruit",
          placeholder: "Search fruit...",
          "bind:value": selected,
          items: {
            apple: "Apple",
            banana: "Banana",
            cherry: "Cherry",
          },
        })}`,
    );

    document.body.innerHTML = await Panel.hydratable({}, { name: "Panel", snapshot: true });
    mount({ Panel }, { root: document.body, lazy: false });
    await settle();

    const input = document.querySelector('[data-slot="combobox-input"]') as HTMLInputElement;
    const content = document.querySelector('[data-slot="combobox-content"]') as HTMLElement;
    const clear = document.querySelector('[data-slot="combobox-clear"]') as HTMLButtonElement;

    clear.click();
    await settle();

    input.value = "ban";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    await settle();

    const banana = [...document.querySelectorAll<HTMLElement>('[data-slot="combobox-item"]')].find(
      (el) => el.dataset["value"] === "banana" && !el.hidden,
    );
    banana?.click();
    await settle();
    expect(selected()).toBe("banana");
    expect(document.querySelectorAll('[data-slot="combobox-item"]').length).toBe(3);

    clear.click();
    await settle();
    expect(selected()).toBe(null);

    input.value = "c";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    await settle();

    expect(content.hidden).toBe(false);
    expect(document.querySelectorAll('[data-slot="combobox-item"]').length).toBe(3);
    const visible = [...document.querySelectorAll<HTMLElement>('[data-slot="combobox-item"]')]
      .filter((el) => !el.hidden)
      .map((el) => el.dataset["value"]);
    expect(visible).toEqual(["cherry"]);
  });
});

describe("Combobox multiple-mode types", () => {
  it("discriminates value types on the multiple prop", () => {
    // Type-level assertions: these must compile without casts.
    const arraySignal = (() => ["apple"]) as SignalAccessor<string[]>;
    const stringSignal = (() => "apple") as SignalAccessor<string>;

    const multipleInput: ComboboxInput = {
      multiple: true,
      defaultValue: ["apple"],
      "bind:value": arraySignal,
      onValueChange: (next: string[]) => next,
    };
    const singleInput: ComboboxInput = {
      defaultValue: "apple",
      "bind:value": stringSignal,
      onValueChange: (next: string | null) => next,
    };

    // @ts-expect-error single mode does not accept an array defaultValue
    const invalid: ComboboxInput = { multiple: false, defaultValue: ["apple"] };

    expect(multipleInput.multiple).toBe(true);
    expect(singleInput.multiple).toBeUndefined();
    expect(invalid).toBeDefined();
  });

  it("syncs bind:value with the committed selection in multiple mode", async () => {
    let readSelected!: () => string[];

    const Panel = ilha
      .state("selected", () => [] as string[])
      .render(({ state }) => {
        readSelected = state.selected as () => string[];
        return html`${Combobox({
          multiple: true,
          "bind:value": state.selected as SignalAccessor<string[]>,
          items: [
            { value: "apple", label: "Apple" },
            { value: "banana", label: "Banana" },
          ],
        })}`;
      });

    document.body.innerHTML = await Panel.hydratable({}, { name: "Panel", snapshot: true });
    mount({ Panel }, { root: document.body, lazy: false });
    await settle();

    const trigger = document.querySelector('[data-slot="combobox-trigger"]') as HTMLElement;
    trigger.click();
    await settle();

    const items = [...document.querySelectorAll<HTMLElement>('[data-slot="combobox-item"]')];
    items.find((el) => el.dataset["value"] === "apple")?.click();
    items.find((el) => el.dataset["value"] === "banana")?.click();
    await settle();

    expect(readSelected()).toEqual(["apple", "banana"]);
  });
});
