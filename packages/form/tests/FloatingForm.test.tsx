import { describe, expect, it } from "bun:test";
import { createFloatingFormIsland } from "../src/FloatingForm.tsx";
import { GlobalRegistrator } from "@happy-dom/global-registrator";
import { mount } from "ilha";

try {
  GlobalRegistrator.register();
} catch {
  // Already registered
}

describe("FloatingForm island", () => {
  it("renders a draggable panel with form fields", async () => {
    const mockSchema = {
      "~standard": {
        version: 1 as const,
        vendor: "mock",
        validate: async (val: any) => ({ value: val }),
      },
    };

    const FloatingFormIsland = createFloatingFormIsland(
      mockSchema,
      { theme: "dark" },
      { title: "My DevTools" },
    );

    document.body.replaceChildren();

    const ssr = await FloatingFormIsland.hydratable({}, { name: "FloatingForm", snapshot: true });

    // pi-lens-ignore: slop -- trusted SSR output from ilha.hydratable(), not user data
    document.body.insertAdjacentHTML("beforeend", ssr);
    const { unmount } = mount(
      { FloatingForm: FloatingFormIsland },
      { root: document.body, lazy: false },
    );

    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

    const header = document.querySelector('[data-slot="floating-form-header"]');
    expect(header).not.toBeNull();
    expect(header?.textContent).toContain("My DevTools");

    expect(document.body.innerHTML).toContain("Theme");

    unmount();
  });
});
