import * as path from "node:path";
import { defineConfig } from "@rspress/core";
import { pluginPreview } from "@rspress/plugin-preview";
import { pluginTwoslash } from "@rspress/plugin-twoslash";

export default defineConfig({
  root: path.join(__dirname, "docs"),
  title: "Areia",
  icon: "/logo.svg",
  logo: "/logo.svg",
  themeConfig: {
    socialLinks: [
      {
        icon: "github",
        mode: "link",
        content: "https://github.com/ilhajs/areia",
      },
      {
        icon: "discord",
        mode: "link",
        content: "https://discord.gg/WnVTMCTz74",
      },
      {
        icon: "x",
        mode: "link",
        content: "https://x.com/ilha_js",
      },
    ],
  },
  plugins: [
    pluginPreview({
      defaultPreviewMode: "iframe-follow",
      previewLanguages: ["ts"],
      iframeOptions: {
        customEntry: ({ demoPath }) => {
          return `import ilha from "ilha";
          import Component from ${JSON.stringify(demoPath)};
          Component.mount(document.getElementById("root"));
        `;
        },
        builderConfig: {
          source: {
            preEntry: [path.join(__dirname, "docs.css")],
          },
        },
      },
      previewCodeTransform(codeInfo) {
        return codeInfo.code;
      },
    }),
    pluginTwoslash({
      twoslashOptions: {
        compilerOptions: {
          strict: true,
          baseUrl: __dirname,
          paths: {
            areia: ["./src/index.ts"],
            "areia/components/*": ["./src/components/*"],
            "$components/*": ["./src/components/*"],
            "$lib/*": ["./src/lib/*"],
          },
        },
      },
    }),
  ],
  globalStyles: path.join(__dirname, "docs.css"),
  builderConfig: {
    resolve: {
      alias: {
        areia: path.join(__dirname, "src", "index.ts"),
        "areia/components": path.join(__dirname, "src", "components"),
      },
    },
  },
});
