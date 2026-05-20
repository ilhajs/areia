import * as path from "node:path";
import { defineConfig } from "@rspress/core";
import { pluginPreview } from "@rspress/plugin-preview";
import { pluginTwoslash } from "@rspress/plugin-twoslash";

export default defineConfig({
  root: path.join(__dirname, "docs"),
  title: "My Site",
  icon: "/rspress-icon.png",
  logo: {
    light: "/rspress-light-logo.png",
    dark: "/rspress-dark-logo.png",
  },
  themeConfig: {
    socialLinks: [
      {
        icon: "github",
        mode: "link",
        content: "https://github.com/web-infra-dev/rspress",
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
