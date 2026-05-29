import type { Config } from "tailwindcss";
import createPlugin from "tailwindcss/plugin";
import { areiaThemeConfig } from "./theme-config";
import { darkVariables, lightVariables } from "./tokens";

const areiaPlugin = createPlugin(
  ({ addBase, addVariant }) => {
    addBase({
      ":root": lightVariables,
      ".dark": darkVariables,
    });
    addVariant("dark", "&:where(.dark, .dark *)");
  },
  {
    theme: areiaThemeConfig as unknown as NonNullable<Config["theme"]>,
    content: [`${import.meta.dirname}/**/*.js`, "./node_modules/areia/dist/**/*.js"],
  },
);

export default areiaPlugin;
export const handler = areiaPlugin.handler;
export const config = areiaPlugin.config as Partial<Config>;
