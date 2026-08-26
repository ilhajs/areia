import type { Config } from "tailwindcss";
import createPlugin from "tailwindcss/plugin";
import { areiaThemeConfig } from "./theme-config";
import { darkVariables, lightVariables } from "./tokens";

export interface AreiaPluginOptions {
  darkModeSelector?: string;
}

// Ensure the return type is explicitly annotated to avoid TypeScript errors
const areiaPlugin: ReturnType<typeof createPlugin.withOptions<AreiaPluginOptions>> =
  createPlugin.withOptions<AreiaPluginOptions>(
    (options = {}) => {
      return ({ addBase, addVariant }) => {
        const darkSelector = options.darkModeSelector || '.dark, [data-theme="dark"]';

        addBase({
          ":root": lightVariables,
          [darkSelector]: darkVariables,
        });
        addVariant("dark", `&:where(${darkSelector}, ${darkSelector} *)`);
      };
    },
    (_options = {}) => {
      return {
        // SAFETY: areiaThemeConfig is a full Tailwind theme partial; the Config
        // generic is stricter than what withOptions plugins may return.
        theme: areiaThemeConfig as unknown as NonNullable<Config["theme"]>,
        content: [`${import.meta.dirname}/**/*.js`, "./node_modules/areia/dist/**/*.js"],
      };
    },
  );

export default areiaPlugin;
// Ensure we export the handler and config from the default plugin instance for backward compatibility
// since withOptions returns a function that can also be called.
// When not called, Tailwind handles it, but manual access to handler/config might be used by someone.
// Actually, `withOptions` returns a function, which doesn't have `handler` and `config` properties on itself!
// If people were doing `import { handler, config } from 'areia/plugin'`, we need to provide them.
export const handler = areiaPlugin().handler;
export const config = areiaPlugin().config as Partial<Config>;
