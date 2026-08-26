import { describe, expect, it } from "bun:test";
import { createFloatingFormIsland } from "../src/FloatingForm.tsx";
import { GlobalRegistrator } from "@happy-dom/global-registrator";
import { mount } from "ilha";

try {
  GlobalRegistrator.register();
} catch {
  // Already registered
}

describe("FloatingForm island", () => {
  it("renders a draggable panel with form fields", async () => {
    const mockSchema = {
      "~standard": {
        version: 1 as const,
        vendor: "mock",
        validate: async (val: any) => ({ value: val }),
      },
    };
    const defaultValues = { theme: "dark", wireframe: false };

    const FloatingFormIsland = createFloatingFormIsland(mockSchema, {
      defaultValues,
      title: "My DevTools",
    });

    document.body.replaceChildren();

    const ssr = await FloatingFormIsland.hydratable(
      {},
      { name: "FloatingForm", snapshot: true, skipOnMount: false },
    );

    // pi-lens-ignore: slop -- trusted SSR output from ilha.hydratable(), not user data
    document.body.insertAdjacentHTML("beforeend", ssr);
    const { unmount } = mount(
      { FloatingForm: FloatingFormIsland },
      { root: document.body, lazy: false },
    );

    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

    const header = document.querySelector('[data-slot="floating-form-header"]');
    expect(header).not.toBeNull();
    expect(header?.textContent).toContain("My DevTools");

    expect(document.body.innerHTML).toContain("Theme");

    // Fields must render as real inputs (not unresolved ilha-async markers),
    // and changing one must fire onChange with updated values.
    const changes: Array<Record<string, unknown>> = [];
    const Controls = createFloatingFormIsland(mockSchema, {
      defaultValues,
      title: "Controls",
      onChange: (values) => changes.push(values as Record<string, unknown>),
    });

    const ssr2 = await Controls.hydratable(
      {},
      { name: "Controls", snapshot: true, skipOnMount: false },
    );
    const host = document.createElement("div");
    document.body.appendChild(host);
    const parsed = new DOMParser().parseFromString(ssr2, "text/html");
    host.replaceChildren(...Array.from(parsed.body.childNodes));
    const { unmount: unmountControls } = mount({ Controls }, { root: document.body, lazy: false });
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

    // No async slot markers may survive SSR.
    expect(host.innerHTML).not.toContain("ilha-async");

    const checkbox = host.querySelector('input[type="checkbox"]') as HTMLInputElement | null;
    expect(checkbox).not.toBeNull();
    checkbox!.click();
    await new Promise<void>((resolve) => setTimeout(resolve, 30));

    expect(changes.length).toBeGreaterThan(0);
    unmountControls();
    unmount();
  });

  it("drags without jumping when the panel is offset from the viewport origin", async () => {
    const { setupDrag } = await import("../src/drag.ts");

    document.body.replaceChildren();
    // Offset container: style.left/top are relative to this, not the viewport.
    const container = document.createElement("div");
    container.style.position = "relative";
    container.style.marginLeft = "300px";
    container.style.marginTop = "150px";
    const panel = document.createElement("div");
    panel.style.width = "100px";
    panel.style.height = "50px";
    const header = document.createElement("div");
    header.style.height = "20px";
    panel.appendChild(header);
    container.appendChild(panel);
    document.body.appendChild(container);

    // happy-dom has no layout engine — stub the geometry setupDrag reads.
    // The panel sits at offset (20, 20) inside the container, which itself
    // sits at viewport (300, 150).
    Object.defineProperty(panel, "offsetLeft", { value: 20, configurable: true });
    Object.defineProperty(panel, "offsetTop", { value: 20, configurable: true });
    Object.defineProperty(panel, "offsetWidth", { value: 100, configurable: true });
    Object.defineProperty(header, "offsetHeight", { value: 20, configurable: true });
    Object.defineProperty(container, "clientWidth", { value: 1000, configurable: true });
    Object.defineProperty(container, "clientHeight", { value: 500, configurable: true });
    panel.getBoundingClientRect = () =>
      ({
        left: 320,
        top: 170,
        right: 420,
        bottom: 220,
        width: 100,
        height: 50,
        x: 320,
        y: 170,
        toJSON: () => {},
      }) as DOMRect;

    setupDrag(header, panel, { x: 20, y: 20 });

    const pointer = (type: string, x: number, y: number) => {
      header.dispatchEvent(
        new PointerEvent(type, {
          bubbles: true,
          pointerId: 1,
          clientX: x,
          clientY: y,
        }),
      );
    };

    // Press at the header's viewport position, then move +10px.
    const rect = header.getBoundingClientRect();
    pointer("pointerdown", rect.left, rect.top);
    pointer("pointermove", rect.left + 10, rect.top);
    pointer("pointerup", rect.left + 10, rect.top);

    // No jump: left should advance by exactly the pointer delta from 20px,
    // not by 300px+ (the container's viewport offset).
    expect(panel.style.left).toBe("30px");
    expect(panel.style.top).toBe("20px");
  });
});
