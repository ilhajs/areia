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

describe("Switch bind:checked in parent island", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("renders bind in parent markup without nested island slot", () => {
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
    expect(output).not.toContain("data-ilha-slot");
    expect(output).toContain('data-slot="switch"');
    expect(output).toContain("data-areia-switch");
    expect(output).not.toMatch(/aria-checked="true"/);
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
    await new Promise<void>((resolve) => queueMicrotask(() => resolve()));
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
});
