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
    const config = plugin.config as {
      theme?: { extend?: { colors?: Record<string, string>; textColor?: Record<string, string> } };
      content?: string[];
    };

    expect(typeof plugin.handler).toBe("function");
    expect(config.theme?.extend?.colors?.["areia-background"]).toBe("var(--areia-background)");
    expect(config.theme?.extend?.textColor?.["areia-subtle"]).toBe("var(--areia-text-subtle)");
    expect(config.content?.[0]).toBe(`${import.meta.dirname}/**/*.js`);
    expect(config.content?.[1]).toBe("./node_modules/areia/dist/**/*.js");
  });

  it("defines light and dark design tokens", () => {
    expect(lightVariables["--areia-background"]).toContain("#fff");
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
