import { GlobalRegistrator } from "@happy-dom/global-registrator";
import { afterEach, describe, expect, it } from "bun:test";
import ilha, { html, mount } from "ilha";
import { markupValue as markup } from "$lib/test-markup";
import { Switch } from "./index";

try {
  GlobalRegistrator.register();
} catch {
  // Already registered by another DOM test file in the same Bun process.
}

describe("Switch", () => {
  it("default export is an ilha island", () => {
    const ISLAND = Symbol.for("ilha.island");
    expect(
      ISLAND in Switch ||
        Object.getOwnPropertySymbols(Switch).some((s) => s.description === "ilha.island"),
    ).toBe(true);
    expect(typeof Switch.mount).toBe("function");
  });

  it("renders switch markup without data-areia attrs", () => {
    const output = markup(Switch({ label: "Use Bun", name: "useBun" }));
    expect(output).toContain('data-slot="switch"');
    expect(output).not.toContain("data-areia-switch");
  });

  it("Static omits island markers and data-areia attrs", () => {
    const output = markup(Switch.Static({ label: "Use Bun" }));
    expect(output).toContain('data-slot="switch"');
    expect(output).not.toContain("data-areia-switch");
    expect(output).not.toContain("data-ilha");
  });
});

describe("Switch in ilha island", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("nests Switch island with bind:checked under a parent island", () => {
    const ProjectCreatorForm = ilha
      .state("useBun", false)
      .derived("createCommand", ({ state }) => {
        const pm = state.useBun() ? "bunx" : "npx";
        return `${pm} giget@latest gh:ilhajs/ilha/templates/vite`;
      })
      .render(
        ({ state }) =>
          html`${Switch({ label: "Use Bun", name: "useBun", "bind:checked": state.useBun })}`,
      );

    const output = markup(ProjectCreatorForm());
    expect(output).toContain("data-ilha-bind");
    expect(output).toContain('data-slot="switch"');
    expect(output).not.toContain("data-areia-switch");
    expect(output).not.toContain("&lt;label");
    expect(output).not.toMatch(/aria-checked="true"/);
  });

  it("toggles with checked + onCheckedChange", async () => {
    const ProjectCreatorForm = ilha
      .state("useBun", false)
      .derived("createCommand", ({ state }) => {
        const pm = state.useBun() ? "bunx" : "npx";
        return `${pm} giget@latest`;
      })
      .render(
        ({ state, derived }) => html`
          ${Switch({
            label: "Use Bun",
            name: "useBunCb",
            checked: state.useBun(),
            onCheckedChange: (c) => state.useBun(c),
          })}
          <span data-testid="cmd">${derived.createCommand()}</span>
        `,
      );

    document.body.innerHTML = await ProjectCreatorForm.hydratable(
      {},
      { name: "ProjectCreatorForm", snapshot: true },
    );
    mount({ ProjectCreatorForm }, { root: document.body, lazy: false });
    await new Promise<void>((r) => requestAnimationFrame(() => r()));
    await new Promise<void>((r) => queueMicrotask(() => r()));

    const cmd = () => document.querySelector("[data-testid=cmd]")?.textContent ?? "";
    const switchRoot = document.querySelector('[data-slot="switch"]') as HTMLElement | null;
    const input = document.querySelector("[name=useBunCb]") as HTMLInputElement | null;

    expect(input?.hasAttribute("data-ilha-bind")).toBe(false);
    expect(switchRoot?.hasAttribute("data-areia-switch")).toBe(false);
    expect(cmd()).toContain("npx");
    switchRoot?.click();
    await Promise.resolve();
    await Promise.resolve();
    expect(cmd()).toContain("bunx");
    expect(switchRoot?.getAttribute("aria-checked")).toBe("true");
    switchRoot?.click();
    await Promise.resolve();
    expect(cmd()).toContain("npx");
    expect(switchRoot?.getAttribute("aria-checked")).toBe("false");
  });

  it("toggles parent state and updates derived output", async () => {
    const warn = console.warn;
    const warnings: string[] = [];
    console.warn = (...args: unknown[]) => {
      const msg = args.map(String).join(" ");
      if (msg.includes("createSwitch() called more than once")) warnings.push(msg);
      warn(...args);
    };

    const ProjectCreatorForm = ilha
      .state("useBun", false)
      .derived("createCommand", ({ state }) => {
        const pm = state.useBun() ? "bunx" : "npx";
        return `${pm} giget@latest`;
      })
      .render(
        ({ state, derived }) => html`
          ${Switch({ label: "Use Bun", name: "useBun", "bind:checked": state.useBun })}
          <span data-testid="cmd">${derived.createCommand()}</span>
        `,
      );

    document.body.innerHTML = await ProjectCreatorForm.hydratable(
      {},
      { name: "ProjectCreatorForm", snapshot: true },
    );
    mount({ ProjectCreatorForm }, { root: document.body, lazy: false });
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    await new Promise<void>((resolve) => queueMicrotask(() => resolve()));
    await Promise.resolve();

    const cmd = () => document.querySelector("[data-testid=cmd]")?.textContent ?? "";
    const switchRoot = document.querySelector('[data-slot="switch"]') as HTMLElement | null;

    expect(cmd()).toContain("npx");
    expect(switchRoot?.getAttribute("aria-checked")).toBe("false");

    switchRoot?.click();
    await Promise.resolve();
    await Promise.resolve();

    expect(cmd()).toContain("bunx");
    expect(switchRoot?.getAttribute("aria-checked")).toBe("true");
    expect(warnings).toEqual([]);

    console.warn = warn;
  });

  it("toggles state when Switch bind is nested inside a child island under a parent page", async () => {
    const warn = console.warn;
    const warnings: string[] = [];
    console.warn = (...args: unknown[]) => {
      const msg = args.map(String).join(" ");
      if (msg.includes("createSwitch() called more than once")) warnings.push(msg);
      warn(...args);
    };

    const ProjectCreatorForm = ilha
      .state("useBun", false)
      .derived("createCommand", ({ state }) => {
        const pm = state.useBun() ? "bunx" : "npx";
        return `${pm} giget@latest`;
      })
      .render(
        ({ state, derived }) => html`
          ${Switch({ label: "Use Bun", name: "useBun", "bind:checked": state.useBun })}
          <span data-testid="cmd">${derived.createCommand()}</span>
        `,
      );

    const Page = ilha.render(
      () => html`<section data-testid="page">${ProjectCreatorForm()}</section>`,
    );

    document.body.innerHTML = await Page.hydratable({}, { name: "Page", snapshot: true });
    mount({ Page, ProjectCreatorForm }, { root: document.body, lazy: false });
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    await new Promise<void>((resolve) => queueMicrotask(() => resolve()));
    await Promise.resolve();

    const cmd = () => document.querySelector("[data-testid=cmd]")?.textContent ?? "";
    const switchRoot = document.querySelector('[data-slot="switch"]') as HTMLElement | null;

    expect(cmd()).toContain("npx");
    switchRoot?.click();
    await Promise.resolve();
    await Promise.resolve();

    expect(cmd()).toContain("bunx");
    expect(warnings).toEqual([]);

    console.warn = warn;
  });
});
