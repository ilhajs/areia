import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "tsdown";

const here = dirname(fileURLToPath(import.meta.url));
const areiaSrc = resolve(here, "../areia/src");

export default defineConfig([
  {
    entry: {
      index: "src/index.ts",
    },
    platform: "browser",
    dts: true,
  },
  {
    entry: {
      standalone: "src/standalone.ts",
    },
    platform: "browser",
    dts: true,
    deps: {
      alwaysBundle: () => true,
    },
    alias: {
      areia: resolve(areiaSrc, "index.ts"),
      $lib: resolve(areiaSrc, "lib"),
      $components: resolve(areiaSrc, "components"),
    },
    define: {
      "import.meta.dirname": "undefined",
      "import.meta.url": "undefined",
    },
  },
]);
