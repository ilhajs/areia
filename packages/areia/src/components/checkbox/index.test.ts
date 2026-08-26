import { GlobalRegistrator } from "@happy-dom/global-registrator";
import { afterEach, describe, expect, it } from "bun:test";
import { ilha, html, state } from "ilha";
import { markupValue as markup, mountSsr } from "$lib/test-markup";
import { Checkbox, checkboxVariants } from "./index";

try {
  GlobalRegistrator.register();
} catch {
  // Already registered.
}

describe("checkboxVariants", () => {
  it("returns default classes", () => {
    const classes = checkboxVariants();
    expect(classes).toContain("ring-areia-control-border");
  });

  it("applies error variant classes", () => {
    const classes = checkboxVariants({ variant: "error" });
    expect(classes).toContain("ring-areia-destructive");
  });
});

describe("Checkbox", () => {
  it("default export is an ilha island", () => {
    const ISLAND = Symbol.for("ilha.island");
    expect(
      ISLAND in Checkbox ||
        Object.getOwnPropertySymbols(Checkbox).some((s) => s.description === "ilha.island"),
    ).toBe(true);
    expect(typeof Checkbox.mount).toBe("function");
  });

  it("uses bind:checked on the island", () => {
    const Panel = ilha(() => {
      const ok = state(false);
      return html`${Checkbox({ label: "OK", "bind:checked": ok })}`;
    });
    const output = markup(Panel());
    expect(output).toContain("data-ilha-bind");
    expect(output).toContain("data-ilha-slot");
    expect(output).not.toContain("data-areia-checkbox");
  });

  it("renders control with data-slot", () => {
    const output = markup(Checkbox({}));
    expect(output).toContain('data-slot="checkbox"');
    expect(output).not.toContain("data-areia-checkbox");
  });

  it("Static omits island markers and data-areia attrs", () => {
    const output = markup(Checkbox.Static({}));
    expect(output).toContain('data-slot="checkbox"');
    expect(output).not.toContain("data-areia-checkbox");
    expect(output).not.toContain("data-ilha");
  });

  it("renders label wrapper when label is provided", () => {
    const output = markup(Checkbox({ label: "Accept" }));
    expect(output).toContain("Accept");
    expect(output).toContain("<label");
  });

  it("sets aria-checked to true when checked", () => {
    const output = markup(Checkbox({ checked: true }));
    expect(output).toContain('aria-checked="true"');
  });

  it("sets aria-checked to mixed when indeterminate", () => {
    const output = markup(Checkbox({ indeterminate: true }));
    expect(output).toContain('aria-checked="mixed"');
  });

  it("sets aria-disabled when disabled", () => {
    const output = markup(Checkbox({ disabled: true }));
    expect(output).toContain('aria-disabled="true"');
  });

  it("reverses order when controlFirst is false", () => {
    const output = markup(Checkbox({ label: "X", controlFirst: false }));
    expect(output).toContain("flex-row-reverse");
  });

  it("merges custom class and className", () => {
    const output = markup(Checkbox({ class: "a", className: "b" }));
    expect(output).toContain("a");
    expect(output).toContain("b");
  });

  it("places passthrough data attributes on the native input, not the visual root", () => {
    const output = markup(
      Checkbox({ "data-params": "x", "data-todo-checkbox": true, id: "terms" }),
    );
    expect(output).toContain('data-slot="checkbox-input"');
    expect(output).toContain('data-params="x"');
    expect(output).toContain("data-todo-checkbox");
    expect(output).toContain('id="terms"');
    expect(output).not.toMatch(/data-slot="checkbox"[^>]*data-params/);
  });

  describe("bind:checked in nested island", () => {
    afterEach(() => {
      document.body.innerHTML = "";
    });

    it("updates child island signal when nested under parent page", async () => {
      let readOk!: () => boolean;

      const Child = ilha(() => {
        const ok = state(false);

        readOk = ok as () => boolean;
        return html`
          ${Checkbox({ label: "OK", "bind:checked": ok })}
          <span data-testid="flag">${ok()}</span>
        `;
      });

      const Page = ilha(() => html`<div>${Child()}</div>`);

      await mountSsr({ Page, Child }, "Page");
      await new Promise<void>((r) => requestAnimationFrame(() => r()));
      await Promise.resolve();
      await Promise.resolve();

      const root = document.querySelector('[data-slot="checkbox"]') as HTMLElement | null;
      expect(readOk()).toBe(false);
      root?.click();
      await new Promise<void>((r) => queueMicrotask(() => r()));
      await new Promise<void>((r) => queueMicrotask(() => r()));
      await new Promise<void>((r) => requestAnimationFrame(() => r()));

      expect(readOk()).toBe(true);
      expect(root?.getAttribute("aria-checked")).toBe("true");
    });

    it("does not call createCheckbox twice when ilha effect re-runs after hydration", async () => {
      const warn = console.warn;
      const warnings: string[] = [];
      console.warn = (...args: unknown[]) => {
        const msg = args.map(String).join(" ");
        if (msg.includes("createCheckbox() called more than once")) warnings.push(msg);
        warn(...args);
      };

      let setOk!: (v: boolean) => void;

      const Panel = ilha(() => {
        const ok = state(false);

        setOk = (v: boolean) => ok(v);
        return html`
          ${Checkbox({ label: "OK", "bind:checked": ok })}
          <span data-testid="flag">${ok()}</span>
        `;
      });

      await mountSsr({ Panel }, "Panel");
      await new Promise<void>((r) => requestAnimationFrame(() => r()));
      await Promise.resolve();
      await Promise.resolve();
      await Promise.resolve();

      setOk(true);
      await Promise.resolve();
      await Promise.resolve();

      expect(warnings).toEqual([]);
      console.warn = warn;
    });
  });
});

describe("Checkbox.Group", () => {
  it("renders fieldset", () => {
    const output = markup(Checkbox.Group({ legend: "Options" }, []));
    expect(output).toContain("<fieldset");
    expect(output).toContain("Options");
  });

  it("renders error text", () => {
    const output = markup(Checkbox.Group({ error: "Bad" }, []));
    expect(output).toContain("Bad");
    expect(output).toContain("text-areia-destructive-soft-foreground");
  });

  it("renders description text", () => {
    const output = markup(Checkbox.Group({ description: "Hint" }, []));
    expect(output).toContain("Hint");
    expect(output).toContain("text-areia-subtle");
  });
});

describe("Checkbox interactions (onCheckedChange + bind)", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  const frame = () => new Promise<void>((r) => requestAnimationFrame(() => r()));
  const tick = () => new Promise<void>((r) => queueMicrotask(() => r()));

  async function mountPanel(panel: ReturnType<typeof ilha>) {
    const mountResult = await mountSsr({ Panel: panel }, "Panel");
    await frame();
    await tick();
    await tick();
    return mountResult;
  }

  it("emits onCheckedChange exactly once per click", async () => {
    const calls: boolean[] = [];
    const panel = ilha(
      () => html`${Checkbox({ label: "Accept", onCheckedChange: (c) => calls.push(c) })}`,
    );
    await mountPanel(panel);

    const root = document.querySelector('[data-slot="checkbox"]') as HTMLElement | null;
    expect(root).not.toBeNull();

    root?.click();
    await tick();
    root?.click();
    await tick();

    expect(calls).toEqual([true, false]);
  });

  it("never serializes the callback into SSR/HTML output", () => {
    const output = markup(Checkbox({ label: "Accept", onCheckedChange: () => {} }));
    expect(output).not.toContain("onCheckedChange");
    expect(output).not.toMatch(/function\s*\(/);
    expect(output.match(/onchange/g) ?? []).toEqual([]);
  });

  it("updates bind:checked once and calls onCheckedChange once per click", async () => {
    const calls: boolean[] = [];
    const panel = ilha(() => {
      const ok = state(false);
      return html`${Checkbox({
          label: "OK",
          "bind:checked": ok,
          onCheckedChange: (c) => calls.push(c),
        })} <span data-testid="flag">${ok() ? "on" : "off"}</span>`;
    });

    await mountPanel(panel as never);
    const flag = () => document.querySelector("[data-testid=flag]")?.textContent ?? "";
    const root = document.querySelector('[data-slot="checkbox"]') as HTMLElement | null;

    expect(flag()).toBe("off");
    root?.click();
    await tick();
    await tick();
    await frame();

    expect(calls).toEqual([true]);
    expect(flag()).toBe("on");
    expect(root?.getAttribute("aria-checked")).toBe("true");
  });

  it("fires onCheckedChange once on keyboard space activation", async () => {
    const calls: boolean[] = [];
    const panel = ilha(
      () => html`${Checkbox({ label: "OK", onCheckedChange: (c) => calls.push(c) })}`,
    );
    await mountPanel(panel);

    const root = document.querySelector('[data-slot="checkbox"]') as HTMLElement | null;
    root?.dispatchEvent(new KeyboardEvent("keydown", { key: " ", bubbles: true }));
    await tick();

    expect(calls).toEqual([true]);
  });

  it("keeps multiple instances' callbacks independent", async () => {
    const callsA: boolean[] = [];
    const callsB: boolean[] = [];
    const panel = ilha(
      () =>
        html`${Checkbox({ label: "A", onCheckedChange: (c) => callsA.push(c) })}
        ${Checkbox({ label: "B", onCheckedChange: (c) => callsB.push(c) })}`,
    );
    await mountPanel(panel);

    const roots = Array.from(document.querySelectorAll('[data-slot="checkbox"]')) as HTMLElement[];
    expect(roots.length).toBe(2);

    roots[0].click();
    await tick();
    expect(callsA).toEqual([true]);
    expect(callsB).toEqual([]);

    roots[1].click();
    await tick();
    expect(callsB).toEqual([true]);
  });

  it("stops emitting onCheckedChange after unmount", async () => {
    const calls: boolean[] = [];
    const panel = ilha(
      () => html`${Checkbox({ label: "OK", onCheckedChange: (c) => calls.push(c) })}`,
    );
    const mountResult = await mountPanel(panel);

    const root = document.querySelector('[data-slot="checkbox"]') as HTMLElement | null;
    root?.click();
    await tick();
    expect(calls).toEqual([true]);

    mountResult.unmount();
    await tick();
    root?.click();
    await tick();
    expect(calls).toEqual([true]);
  });
});
