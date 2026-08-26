import { GlobalRegistrator } from "@happy-dom/global-registrator";
import { describe, expect, it } from "bun:test";
import { ilha, html, mount } from "ilha";
import { markupValue as markup } from "$lib/test-markup";
import { Dialog, dialogVariants } from "./index";

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

describe("dialogVariants", () => {
  it("returns default base classes", () => {
    const classes = dialogVariants();
    expect(classes).toContain("fixed");
    expect(classes).toContain("rounded-xl");
  });

  it("applies sm size classes", () => {
    const classes = dialogVariants({ size: "sm" });
    expect(classes).toContain("min-w-72");
  });
});

const ISLAND = Symbol.for("ilha.island");
const isIsland = (v: unknown) =>
  typeof v === "function" &&
  (ISLAND in v || Object.getOwnPropertySymbols(v).some((s) => s.description === "ilha.island"));

describe("Dialog", () => {
  it("default export is an ilha island", () => {
    expect(isIsland(Dialog)).toBe(true);
    expect(typeof Dialog.mount).toBe("function");
  });

  it("renders trigger and content", () => {
    const output = markup(Dialog({ children: "Open", content: "Hello" }));
    expect(output).toContain('data-slot="dialog"');
    expect(output).toContain('data-slot="dialog-trigger"');
    expect(output).toContain('data-slot="dialog-content"');
    expect(output).toContain("Hello");
    expect(output).not.toContain("data-areia-dialog");
  });

  it("Static returns plain markup without auto-bind markers", () => {
    const output = markup(Dialog.Static({ children: "Open", content: "Hello" }));
    expect(output).toContain('data-slot="dialog"');
    expect(output).not.toContain("data-areia-dialog");
  });

  it("renders content hidden by default", () => {
    const output = markup(Dialog({ children: "Open", content: "Hello" }));
    expect(output).toContain('data-slot="dialog-content"');
    expect(output).toContain("hidden");
  });

  it("renders overlay hidden by default", () => {
    const output = markup(Dialog({ children: "Open", content: "Hello" }));
    expect(output).toContain('data-slot="dialog-overlay"');
    expect(output).toContain("hidden");
  });

  it("renders portal wrapper", () => {
    const output = markup(Dialog({ children: "Open", content: "Hello" }));
    expect(output).toContain('data-slot="dialog-portal"');
  });

  it("sets data-alert-dialog for alertdialog role", () => {
    const output = markup(Dialog({ children: "Open", content: "Hello", role: "alertdialog" }));
    expect(output).toContain("data-alert-dialog");
  });

  it("composes children when they contain dialog-content slot", () => {
    const output = markup(
      Dialog({
        children: [Dialog.Trigger({ children: "Open" }), Dialog.Content({ children: "Hello" })],
      }),
    );
    expect(output).toContain('data-slot="dialog-content"');
  });

  it("merges custom class and className", () => {
    const output = markup(Dialog({ children: "X", content: "Y", class: "a", className: "b" }));
    expect(output).toContain("a");
    expect(output).toContain("b");
  });
});

describe("Dialog.Trigger", () => {
  it("renders with data-slot", () => {
    const output = markup(Dialog.Trigger({ children: "Open" }));
    expect(output).toContain('data-slot="dialog-trigger"');
  });
});

describe("Dialog.Content", () => {
  it("renders with data-slot and hidden", () => {
    const output = markup(Dialog.Content({ children: "Body" }));
    expect(output).toContain('data-slot="dialog-content"');
    expect(output).toContain("hidden");
  });
});

describe("Dialog.Close", () => {
  it("injects close slot into anchor children", () => {
    const output = markup(
      Dialog.Close({ children: { value: '<a href="/docs" data-no-intercept>Docs</a>' } }),
    );
    expect(output).toContain("<a");
    expect(output).toContain('data-slot="dialog-close"');
    expect(output).toContain("data-no-intercept");
    expect(output).not.toContain("<button");
  });

  it("wraps icon-only children in a button when as is button", () => {
    const output = markup(
      Dialog.Close({
        as: "button",
        "aria-label": "Close",
        children: {
          value: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M0 0"></path></svg>',
        },
      }),
    );
    expect(output).toContain("<button");
    expect(output).toContain('type="button"');
    expect(output).toContain('data-slot="dialog-close"');
    expect(output).toContain("<svg");
    expect(output).not.toMatch(/<svg[^>]*data-slot="dialog-close"/);
  });
});

describe("Dialog.Title", () => {
  it("renders h2 with data-slot", () => {
    const output = markup(Dialog.Title({ children: "Title" }));
    expect(output).toContain('data-slot="dialog-title"');
    expect(output).toContain("<h2");
  });
});

describe("Dialog.Description", () => {
  it("renders p with data-slot", () => {
    const output = markup(Dialog.Description({ children: "Desc" }));
    expect(output).toContain('data-slot="dialog-description"');
    expect(output).toContain("<p");
  });
});

describe("Dialog behavior (island mount)", () => {
  async function mountDialog(input: Parameters<typeof Dialog>[0]) {
    const Panel = ilha(() => html`${Dialog(input)}`);
    document.body.innerHTML = await Panel.hydratable(
      {},
      { name: "Panel", snapshot: true, skipOnMount: false },
    );
    mount({ Panel }, { root: document.body, lazy: false });
    await settle();
  }

  it("opens on trigger click and closes on Escape", async () => {
    await mountDialog({ children: "Open", content: "Hello" });

    const root = document.querySelector('[data-slot="dialog"]') as HTMLElement;
    const trigger = document.querySelector('[data-slot="dialog-trigger"]') as HTMLElement;
    const content = document.querySelector('[data-slot="dialog-content"]') as HTMLElement;
    expect(root.getAttribute("data-state")).toBe("closed");

    trigger.click();
    await settle();
    expect(root.getAttribute("data-state")).toBe("open");
    expect(content.hidden).toBe(false);

    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    await settle();
    expect(root.getAttribute("data-state")).toBe("closed");
  });

  it("closes on close button click", async () => {
    await mountDialog({
      children: "Open",
      content: [Dialog.Title({ children: "Title" }), Dialog.Close({ children: "Dismiss" })],
    });

    const root = document.querySelector('[data-slot="dialog"]') as HTMLElement;
    (document.querySelector('[data-slot="dialog-trigger"]') as HTMLElement).click();
    await settle();
    expect(root.getAttribute("data-state")).toBe("open");

    (document.querySelector('[data-slot="dialog-close"]') as HTMLElement).click();
    await settle();
    expect(root.getAttribute("data-state")).toBe("closed");
  });
});
