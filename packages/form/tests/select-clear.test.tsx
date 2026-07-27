import { GlobalRegistrator } from "@happy-dom/global-registrator";
import { describe, expect, it } from "bun:test";
import { mount } from "ilha";
import { Form } from "../src/index.ts";

try {
  GlobalRegistrator.register();
} catch {
  // Already registered
}

async function settle() {
  await Promise.resolve();
  await Promise.resolve();
  await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
  await new Promise<void>((resolve) => setTimeout(resolve, 30));
}

const mockSchema = {
  "~standard": {
    version: 1 as const,
    vendor: "mock",
    validate: async (val: unknown) => ({ value: val }),
  },
};

describe("Form select combobox", () => {
  it("filters after clear → pick → clear without remorphing duplicates", async () => {
    const BasicForm = Form(
      mockSchema as any,
      { name: "John", theme: "system", active: true },
      {
        uiOverrides: {
          theme: {
            type: "select",
            options: [
              { value: "light", label: "light" },
              { value: "dark", label: "dark" },
              { value: "system", label: "system" },
            ],
          },
        },
      },
    );

    document.body.innerHTML = await BasicForm.hydratable({}, { name: "BasicForm", snapshot: true });
    mount({ BasicForm }, { root: document.body, lazy: false });
    await settle();

    const input = document.querySelector('[data-slot="combobox-input"]') as HTMLInputElement;
    const content = document.querySelector('[data-slot="combobox-content"]') as HTMLElement;
    const clear = document.querySelector('[data-slot="combobox-clear"]') as HTMLButtonElement;

    clear.click();
    await settle();

    input.value = "dar";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    await settle();

    const dark = [...document.querySelectorAll<HTMLElement>('[data-slot="combobox-item"]')].find(
      (el) => el.dataset.value === "dark" && !el.hidden,
    );
    dark?.click();
    await settle();

    expect(document.querySelectorAll('[data-slot="combobox-item"]').length).toBe(3);
    expect(input.value).toBe("dark");

    clear.click();
    await settle();

    input.value = "li";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    await settle();

    expect(content.hidden).toBe(false);
    expect(document.querySelectorAll('[data-slot="combobox-item"]').length).toBe(3);
    const visible = [...document.querySelectorAll<HTMLElement>('[data-slot="combobox-item"]')]
      .filter((el) => !el.hidden)
      .map((el) => el.dataset.value);
    expect(visible).toEqual(["light"]);
  });
});
