import "@fontsource-variable/geist";
import "@fontsource-variable/geist-mono";
import "./app.css";
import { createImprensa } from "imprensa/runtime";
import { watchAreiaCodePanels } from "$lib/components/preview";

/**
 * Imprensa injects a boot style that locks flex-grow on *every*
 * `[data-slot=resizable]` after the docs sidebar is dragged once:
 *
 *   html[data-imprensa-sidebar-layout] [data-slot="resizable"] > panel:first/last
 *
 * That breaks kitchen-sink / docs Resizable demos. Narrow it to the docs shell only.
 */
function scopeImprensaSidebarResizableCss() {
  if (typeof document === "undefined") return;

  const css = `
html[data-imprensa-sidebar-layout] .imprensa-docs-shell > [data-slot="resizable"] > [data-slot="resizable-panel"]:first-child {
  flex-grow: var(--imprensa-sidebar-pct) !important;
}
html[data-imprensa-sidebar-layout] .imprensa-docs-shell > [data-slot="resizable"] > [data-slot="resizable-panel"]:last-child {
  flex-grow: var(--imprensa-content-pct) !important;
}
`.trim();

  const boot = document.getElementById("imprensa-sidebar-layout-boot");
  if (boot) {
    boot.textContent = css;
    return;
  }

  // Boot style missing (e.g. mid-HMR) — still install a scoped rule.
  const style = document.createElement("style");
  style.id = "imprensa-sidebar-layout-boot";
  style.textContent = css;
  document.head.appendChild(style);
}

scopeImprensaSidebarResizableCss();

const imprensa = createImprensa();

void imprensa.init().then(() => {
  scopeImprensaSidebarResizableCss();
  watchAreiaCodePanels();
});
