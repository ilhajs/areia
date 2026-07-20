import { Button } from "areia";

const DEMO_ATTR = "data-areia-sonner-demo";
const bound = new WeakSet<Element>();
let scheduled = false;

function bindSonnerDemos(doc: Document = document) {
  for (const button of doc.querySelectorAll<HTMLButtonElement>(`button[${DEMO_ATTR}]`)) {
    if (bound.has(button)) continue;
    bound.add(button);
    button.addEventListener("click", async () => {
      const { showToast } = await import("areia/sonner");
      showToast("success", "Project saved", {
        description: "Your changes are now live.",
      });
    });
  }
}

function scheduleSonnerDemoBind() {
  if (typeof document === "undefined") return;
  if (scheduled) return;
  scheduled = true;
  queueMicrotask(() => {
    scheduled = false;
    bindSonnerDemos();
  });
}

/**
 * Live toast demo for the Sonner doc page.
 *
 * Plain function (not an Ilha island) so Imprensa MDX auto-bind re-invokes it
 * on the client and schedules click wiring. `showToast` ensures a toaster root
 * is mounted before firing.
 */
export function SonnerDemo(_props: Record<string, unknown> = {}) {
  scheduleSonnerDemoBind();
  return Button({
    variant: "primary",
    type: "button",
    [DEMO_ATTR]: true,
    children: "Save project",
  });
}
