import { themeVariables } from "./tokens";

function stripPrefix(entries: [string, string][], prefix: string) {
  return Object.fromEntries(
    entries
      .filter(([key]) => key.startsWith(prefix))
      .map(([key, value]) => [key.slice(prefix.length), value]),
  );
}

const entries = Object.entries(themeVariables) as [string, string][];

export const areiaThemeConfig = {
  extend: {
    colors: stripPrefix(entries, "--color-"),
    textColor: stripPrefix(entries, "--text-color-"),
    fontFamily: {
      sans: ["var(--areia-font-sans)"],
      mono: ["var(--areia-font-mono)"],
    },
    fontSize: {
      xs: ["var(--areia-text-xs)", { lineHeight: "var(--areia-text-xs-line-height)" }],
      sm: ["var(--areia-text-sm)", { lineHeight: "var(--areia-text-sm-line-height)" }],
      base: ["var(--areia-text-md)", { lineHeight: "var(--areia-text-md-line-height)" }],
      lg: ["var(--areia-text-lg)", { lineHeight: "var(--areia-text-lg-line-height)" }],
      xl: ["var(--areia-text-xl)", { lineHeight: "var(--areia-text-xl-line-height)" }],
    },
  },
};
