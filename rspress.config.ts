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
          return `import ${JSON.stringify(demoPath)};
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
            areia: ["./packages/areia/src/index.ts"],
            "@areia/slots": ["./packages/slots/src/index.ts"],
            "areia/components/*": ["./packages/areia/src/components/*"],
            "$components/*": ["./packages/areia/src/components/*"],
            "$lib/*": ["./packages/areia/src/lib/*"],
          },
        },
      },
    }),
  ],
  markdown: {
    shiki: {
      langs: ["tsx", "ts", "js", "html", "json", "css", "bash", "sh", "text"],
    },
  },
  globalStyles: path.join(__dirname, "docs.css"),
  builderConfig: {
    resolve: {
      alias: {
        areia: path.join(__dirname, "packages", "areia", "src", "index.ts"),
        "@areia/slots": path.join(__dirname, "packages", "slots", "src", "index.ts"),
        "areia/components": path.join(__dirname, "packages", "areia", "src", "components"),
        $components: path.join(__dirname, "packages", "areia", "src", "components"),
        $lib: path.join(__dirname, "packages", "areia", "src", "lib"),
      },
    },
  },
});
