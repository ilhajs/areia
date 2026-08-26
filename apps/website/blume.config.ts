import { fileURLToPath } from "node:url";

import ilha from "@ilha/astro";
import { defineConfig } from "blume";

export default defineConfig({
  title: "Areia",
  description:
    "Handcrafted UI for Ilha — import first, eject later. Vanilla TypeScript components with Tailwind-native theming.",
  logo: "/logo.svg",
  github: { owner: "ilhajs", repo: "areia", dir: "apps/website" },
  navigation: {
    tabs: [
      { label: "Components", path: "/components" },
      { label: "Slots", path: "/slots" },
    ],
  },
  ai: { llmsTxt: true },
  deployment: { site: "https://areia.ilha.build" },
  seo: {
    og: { enabled: true, logo: "/logo.svg", titles: { "/": "Areia - Handcrafted UI for Ilha" } },
    robots: true,
    sitemap: true,
    structuredData: true,
  },
  markdown: {
    codeBlocks: {
      theme: { light: "catppuccin-latte", dark: "catppuccin-mocha" },
    },
  },
  react: { compiler: false },
  integrations: [
    ilha(),
    {
      name: "header-override",
      hooks: {
        "astro:config:setup": ({ updateConfig }) => {
          const headerPath = fileURLToPath(
            new URL("./src/components/blume/Header.astro", import.meta.url),
          );
          updateConfig({
            vite: {
              resolve: {
                alias: [{ find: /^\.\/Header\.astro$/u, replacement: headerPath }],
              },
            },
          });
        },
      },
    },
  ],
});
