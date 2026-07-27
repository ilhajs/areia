import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import plugin from "./plugin";
import { darkVariables, lightVariables } from "./tokens";

const here = dirname(fileURLToPath(import.meta.url));
const pkgRoot = join(here, "../..");

describe("areia tailwind plugin", () => {
  it("exports a tailwind plugin handler with theme mappings", () => {
    // With `withOptions`, `plugin` is a function that returns an object with `handler` and `config`.
    const instance = (plugin as any).__isOptionsFunction ? (plugin as any)() : plugin;

    const config = instance.config as {
      theme?: { extend?: { colors?: Record<string, string>; textColor?: Record<string, string> } };
      content?: string[];
    };

    expect(typeof instance.handler).toBe("function");
    expect(config.theme?.extend?.colors?.["areia-background"]).toBe("var(--areia-background)");
    expect(config.theme?.extend?.textColor?.["areia-subtle"]).toBe("var(--areia-text-subtle)");
    expect(config.content?.[0]).toBe(`${import.meta.dirname}/**/*.js`);
    expect(config.content?.[1]).toBe("./node_modules/areia/dist/**/*.js");
  });

  it("supports custom dark mode selector via options", () => {
    const instance = (plugin as any)({ darkModeSelector: '[data-mode="dark"]' });
    const addedBases: any[] = [];
    const addedVariants: any[] = [];

    const mockAddBase = (base: any) => addedBases.push(base);
    const mockAddVariant = (name: string, definition: string) =>
      addedVariants.push({ name, definition });

    instance.handler({
      addBase: mockAddBase,
      addVariant: mockAddVariant,
      theme: () => ({}),
      e: (x: string) => x,
    } as any);

    expect(addedBases.length).toBe(1);
    expect(addedBases[0][":root"]).toBeDefined();
    expect(addedBases[0]['[data-mode="dark"]']).toBeDefined();

    expect(addedVariants.length).toBe(1);
    expect(addedVariants[0].name).toBe("dark");
    expect(addedVariants[0].definition).toBe('&:where([data-mode="dark"], [data-mode="dark"] *)');
  });

  it("defines light and dark design tokens", () => {
    expect(lightVariables["--areia-background"]).toContain("var(--color-white)");
    expect(darkVariables["--areia-background"]).toContain("oklch(10%");
    expect(lightVariables["--areia-primary"]).toContain("oklch");
    expect(lightVariables["--areia-ring"]).toBe("var(--areia-primary)");
    expect(darkVariables["--areia-ring"]).toBe("var(--areia-primary)");
    expect(lightVariables["--areia-primary-soft"]).toContain("var(--areia-primary)");
    expect(lightVariables["--areia-primary-soft-foreground"]).toBe("var(--areia-primary)");
    expect(darkVariables["--areia-primary-soft"]).toContain("var(--areia-primary)");
    expect(darkVariables["--areia-primary-soft-foreground"]).toBe("var(--areia-primary)");
  });

  it("ships a tailwind.css entry that loads the plugin", () => {
    const entry = readFileSync(join(pkgRoot, "tailwind.css"), "utf8");
    expect(entry.trim()).toBe('@plugin "areia";');
  });
});
