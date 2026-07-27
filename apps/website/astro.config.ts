import { defineConfig } from "astro/config";
import icon from "astro-icon";
import tailwindcss from "@tailwindcss/vite";
import nimbus, { defineConfig as defineNimbusConfig } from "@cloudflare/nimbus-docs";
import { tableScroll } from "@cloudflare/nimbus-docs/markdown";
import ilha from "@ilha/astro";

const nimbusConfig = defineNimbusConfig({
  site: "https://areia.ilha.build",
  title: "Areia",
  description:
    "Handcrafted UI for Ilha — import first, eject later. Vanilla TypeScript components with Tailwind-native theming.",
  locale: "en",
  github: "https://github.com/ilhajs/areia",
  socialImageAlt: "Areia documentation preview",
  // Components vs Slots: header tabs switch sections; rail shows only the
  // active top-level section's children (same pattern as Ilha guide/tutorial).
  sidebar: {
    scope: "section",
    items: [
      { label: "Components", autogenerate: { directory: "components" } },
      { label: "Slots", autogenerate: { directory: "slots" } },
    ],
  },
});

export default defineConfig({
  output: "static",
  vite: {
    plugins: [tailwindcss()],
  },
  prefetch: {
    prefetchAll: true,
    defaultStrategy: "hover",
  },
  integrations: [
    icon(),
    ilha(),
    nimbus(nimbusConfig, {
      rules: {
        "nimbus/frontmatter-shape": "error",
        "nimbus/internal-link": "error",
      },
      markdown: {
        hastPlugins: [tableScroll()],
      },
    }),
  ],
});
