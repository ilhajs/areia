import { GlobalRegistrator } from "@happy-dom/global-registrator";
import { afterEach, describe, expect, it } from "bun:test";
import ilha, { html, mount } from "ilha";
import { markupValue as markup } from "$lib/test-markup";
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
  it("uses CheckboxRoot island when bind:checked is set", () => {
    const Panel = ilha
      .state("ok", false)
      .render(({ state }) => html`${Checkbox({ label: "OK", "bind:checked": state.ok })}`);
    const output = markup(Panel());
    expect(output).toContain("data-ilha-bind");
    expect(output).toContain("data-ilha-slot");
    expect(output).not.toContain("data-areia-checkbox");
  });

  it("renders control with data-slot", () => {
    const output = markup(Checkbox({}));
    expect(output).toContain('data-slot="checkbox"');
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

      const Child = ilha.state("ok", false).render(({ state }) => {
        readOk = state.ok as () => boolean;
        return html`
          ${Checkbox({ label: "OK", "bind:checked": state.ok })}
          <span data-testid="flag">${state.ok()}</span>
        `;
      });

      const Page = ilha.render(() => html`<div>${Child()}</div>`);

      document.body.innerHTML = await Page.hydratable({}, { name: "Page", snapshot: true });
      mount({ Page, Child }, { root: document.body, lazy: false });
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

      const Panel = ilha.state("ok", false).render(({ state }) => {
        setOk = (v: boolean) => state.ok(v);
        return html`
          ${Checkbox({ label: "OK", "bind:checked": state.ok })}
          <span data-testid="flag">${state.ok()}</span>
        `;
      });

      document.body.innerHTML = await Panel.hydratable({}, { name: "Panel", snapshot: true });
      mount({ Panel }, { root: document.body, lazy: false });
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
