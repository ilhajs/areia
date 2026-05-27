import * as path from "node:path";
import { defineConfig } from "@rspress/core";
import { pluginPreview } from "@rspress/plugin-preview";
import { pluginTwoslash } from "@rspress/plugin-twoslash";
import ts from "typescript";

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
      previewLanguages: ["tsx", "ts"],
      previewCodeTransform: ({ language, code }) => {
        if (language !== "tsx") return code;
        return `/** @jsxImportSource ilha */\n${code}`;
      },
      iframeOptions: {
        customEntry: ({ demoPath }) => {
          return `
            (function(){
              function apply(dark) {
                document.documentElement.classList.toggle("dark", dark);
                document.documentElement.classList.toggle("rp-dark", dark);
                document.documentElement.style.colorScheme = dark ? "dark" : "light";
              }
              try {
                if (window.parent !== window) {
                  apply(window.parent.document.documentElement.classList.contains("dark"));
                }
                return;
              } catch {}
              if (window.parent !== window) {
                var handler = function(ev) {
                  if (ev.data && ev.data.type === "theme-change") {
                    apply(ev.data.dark);
                    window.removeEventListener("message", handler);
                  }
                };
                window.addEventListener("message", handler);
                window.parent.postMessage({ type: "request-theme" }, "*");
              }
            })();

            import(${JSON.stringify(demoPath)}).then((PreviewModule) => {
              const Preview = PreviewModule.default;
              if (Preview && typeof Preview.mount === "function") {
                Preview.mount(document.querySelector("#root"));
              }
            });
          `;
        },
        builderConfig: {
          source: {
            preEntry: [path.join(__dirname, "docs.css")],
          },
        },
      },
    }),
    pluginTwoslash({
      twoslashOptions: {
        filterNode(node) {
          if (node.type !== "hover") return true;
          if (["document", "getElementById"].includes(node.target)) return false;
          return true;
        },
        compilerOptions: {
          strict: true,
          baseUrl: __dirname,
          jsx: ts.JsxEmit.ReactJSX,
          jsxImportSource: "ilha",
          moduleResolution: ts.ModuleResolutionKind.Bundler,
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
    html: {
      tags: [
        {
          tag: "script",
          head: true,
          children: `
            (function() {
              window.addEventListener("message", function(e) {
                if (e.data && e.data.type === "request-theme" && e.source && e.source !== window) {
                  var isDark = document.documentElement.classList.contains("dark");
                  e.source.postMessage({ type: "theme-change", dark: isDark }, "*");
                }
              });
            })();
          `,
        },
      ],
    },
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
