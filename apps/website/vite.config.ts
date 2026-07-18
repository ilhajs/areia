import { defineConfig } from "vite";
import { imprensa } from "imprensa";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    imprensa({
      hostname: "https://areia.ilha.build",
      repo: "https://github.com/ilhajs/areia",
      repoPath: "apps/website",
      siteName: "Areia",
      logoSrc: "/logo.svg",
      topLevelSplit: true,
      shiki: {
        themes: { light: "rose-pine-dawn", dark: "rose-pine" },
        langs: ["typescript", "tsx", "ts", "mdx", "shell", "bash", "css", "json", "html"],
      },
      head: {
        title: "Areia — UI kit for Ilha",
      },
      socials: [
        { service: "x", url: "https://x.com/ilha_js" },
        { service: "discord", url: "https://discord.gg/WnVTMCTz74" },
        { service: "github", url: "https://github.com/ilhajs/areia" },
      ],
      order: {
        components: 1,
        primitives: 2,
        "components.getting-started": 0,
      },
      llms: {
        siteName: "Areia",
        summary: "Vanilla TypeScript UI kit and headless primitives for Ilha.",
        section: "Documentation",
      },
    }),
  ],
  resolve: {
    // Prefer workspace packages during monorepo dev/build
    dedupe: ["ilha", "areia"],
  },
});
