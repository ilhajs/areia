import { defineConfig } from "tsdown";

export default defineConfig({
  entry: {
    sonner: "src/entry-sonner.ts",
    index: "src/entry.ts",
    plugin: "src/tailwind/plugin.ts",
  },
  platform: "browser",
  dts: true,
});
