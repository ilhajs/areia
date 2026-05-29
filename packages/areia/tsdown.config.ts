import { defineConfig } from "tsdown";

export default defineConfig({
  entry: {
    index: "src/entry.ts",
    plugin: "src/tailwind/plugin.ts",
  },
  platform: "browser",
  dts: true,
});
