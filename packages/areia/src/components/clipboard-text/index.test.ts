import { GlobalRegistrator } from "@happy-dom/global-registrator";
import { afterEach, describe, expect, it } from "bun:test";
import ilha, { html } from "ilha";
import { markupValue as markup, mountSsr } from "$lib/test-markup";
import { ClipboardText } from "./index";

try {
  GlobalRegistrator.register();
} catch {
  // Already registered by another DOM test file in the same Bun process.
}

describe("ClipboardText", () => {
  afterEach(() => {
    document.body.innerHTML = "";
    Object.defineProperty(navigator, "clipboard", { value: undefined, configurable: true });
  });

  const frame = () => new Promise<void>((r) => requestAnimationFrame(() => r()));
  const tick = () => new Promise<void>((r) => queueMicrotask(() => r()));

  it("never serializes the callback into SSR/HTML output", () => {
    const output = markup(ClipboardText({ text: "hi", onCopy: () => {} }));
    expect(output).not.toContain("onCopy");
    expect(output).not.toMatch(/function\s*\(/);
  });

  it("calls onCopy exactly once with the copied text when the button is clicked", async () => {
    let copies = 0;
    let text = "";
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: async (t: string) => void (text = t) },
      configurable: true,
    });

    const panel = ilha.render(
      () =>
        html`${ClipboardText({
          text: "secret",
          textToCopy: "secret-copy",
          onCopy: () => copies++,
        })}`,
    );

    await mountSsr({ Panel: panel }, "Panel");
    await frame();
    await tick();

    const button = document.querySelector(
      '[data-slot="clipboard-text-button"]',
    ) as HTMLElement | null;
    expect(button).not.toBeNull();
    button?.click();
    await tick();
    await tick();

    expect(text).toBe("secret-copy");
    expect(copies).toBe(1);
  });

  it("stops invoking onCopy after unmount", async () => {
    let copies = 0;
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: async () => {} },
      configurable: true,
    });

    const panel = ilha.render(
      () => html`${ClipboardText({ text: "secret", onCopy: () => copies++ })}`,
    );

    const mountResult = await mountSsr({ Panel: panel }, "Panel");
    await frame();
    await tick();

    const button = document.querySelector(
      '[data-slot="clipboard-text-button"]',
    ) as HTMLElement | null;
    button?.click();
    await tick();
    await tick();
    expect(copies).toBe(1);

    mountResult.unmount();
    await tick();

    button?.click();
    await tick();
    await tick();
    expect(copies).toBe(1);
  });
});
