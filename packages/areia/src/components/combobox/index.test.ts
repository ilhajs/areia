import { GlobalRegistrator } from "@happy-dom/global-registrator";
import { describe, expect, it } from "bun:test";
import { markupValue as markup } from "$lib/test-markup";
import { Combobox, comboboxVariants } from "./index";

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

function mountCombobox() {
  document.body.innerHTML = markup(
    Combobox({
      items: [
        { value: "apple", label: "Apple" },
        { value: "banana", label: "Banana" },
      ],
    }),
  );
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

describe("Combobox behavior (auto-mount)", () => {
  it("opens on trigger click", async () => {
    const { input, trigger, content } = mountCombobox();
    await settle();
    expect(content.hidden).toBe(true);

    trigger.click();
    await settle();
    expect(content.hidden).toBe(false);
    expect(input.getAttribute("aria-expanded")).toBe("true");
  });

  it("filters items when typing", async () => {
    const { input, trigger } = mountCombobox();
    await settle();

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
    const { input, trigger, content } = mountCombobox();
    await settle();

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
});
