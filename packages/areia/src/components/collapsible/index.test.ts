import { GlobalRegistrator } from "@happy-dom/global-registrator";
import { afterEach, describe, expect, it } from "bun:test";
import { ilha, html } from "ilha";
import { markupValue as markup, mountSsr } from "$lib/test-markup";
import { Collapsible } from "./index";

try {
  GlobalRegistrator.register();
} catch {
  // Already registered by another DOM test file in the same Bun process.
}

describe("Collapsible", () => {
  it("default export is an ilha island", () => {
    const ISLAND = Symbol.for("ilha.island");
    expect(
      ISLAND in Collapsible ||
        Object.getOwnPropertySymbols(Collapsible).some((s) => s.description === "ilha.island"),
    ).toBe(true);
    expect(typeof Collapsible.mount).toBe("function");
  });

  it("renders trigger and panel", () => {
    const output = markup(Collapsible({ trigger: "Toggle", panel: "Content" }));
    expect(output).toContain('data-slot="collapsible"');
    expect(output).toContain('data-slot="collapsible-trigger"');
    expect(output).toContain('data-slot="collapsible-content"');
    expect(output).not.toContain("data-areia-collapsible");
  });

  it("Static omits island markers and data-areia attrs", () => {
    const output = markup(Collapsible.Static({ trigger: "Toggle", panel: "Content" }));
    expect(output).toContain('data-slot="collapsible"');
    expect(output).not.toContain("data-areia-collapsible");
    expect(output).not.toContain("data-ilha");
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

describe("Collapsible interactions (onOpenChange + bind)", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  const frame = () => new Promise<void>((r) => requestAnimationFrame(() => r()));
  const tick = () => new Promise<void>((r) => queueMicrotask(() => r()));

  it("emits onOpenChange once and updates bind:open when toggled", async () => {
    const calls: boolean[] = [];
    const panel = ilha.state("open", false).render(
      ({ state }) =>
        html`${Collapsible({
          children: [
            Collapsible.Trigger({ children: "Toggle" }),
            Collapsible.Panel({ children: "Body" }),
          ],
          "bind:open": state.open,
          onOpenChange: (o) => calls.push(o),
        })}`,
    );

    await mountSsr({ Panel: panel }, "Panel");
    await frame();
    await tick();

    const trigger = document.querySelector(
      '[data-slot="collapsible-trigger"]',
    ) as HTMLElement | null;
    expect(trigger).not.toBeNull();
    trigger?.click();
    await tick();
    await tick();

    expect(calls).toEqual([true]);
    trigger?.click();
    await tick();
    await tick();
    expect(calls).toEqual([true, false]);
  });
});
