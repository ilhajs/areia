import { GlobalRegistrator } from "@happy-dom/global-registrator";
import { describe, expect, it } from "bun:test";
import ilha, { html, jsxs, jsx, mount } from "ilha";
import { Resizable } from "./index";

try {
  GlobalRegistrator.register();
} catch {
  // Already registered by another DOM test file in the same Bun process.
}

function markup(value: unknown): string {
  if (value && typeof value === "object" && "value" in value) {
    return String(value.value);
  }

  return String(value);
}

describe("Resizable", () => {
  it("renders the root as a horizontal flex group by default", () => {
    const output = markup(
      Resizable.Static({
        children: [
          Resizable.Panel({ children: "Left" }),
          Resizable.Handle(),
          Resizable.Panel({ children: "Right" }),
        ],
      }),
    );

    expect(output).toContain('data-slot="resizable"');
    expect(output).toContain("flex");
    expect(output).toContain("h-full");
    expect(output).toContain("w-full");
    expect(output).toContain("data-[direction=vertical]:flex-col");
  });

  it("renders vertical direction data for CSS before hydration", () => {
    const output = markup(Resizable.Static({ direction: "vertical" }));

    expect(output).toContain('data-direction="vertical"');
    expect(output).toContain("data-[direction=vertical]:flex-col");
  });

  it("renders handle orientation and grip classes", () => {
    const output = markup(Resizable.Static({ children: Resizable.Handle({ withHandle: true }) }));

    expect(output).toContain('data-slot="resizable-handle"');
    expect(output).not.toContain('onpointerdown="');
    expect(output).toContain("cursor-col-resize");
    expect(output).toContain("data-[direction=vertical]:cursor-row-resize");
    expect(output).toContain("[&amp;[data-direction=vertical]&gt;div]:h-1");
    expect(output).toContain("[&amp;[data-direction=vertical]&gt;div]:w-6");
    expect(output).toContain('class="z-10 h-6 w-1 shrink-0 rounded-lg bg-areia-border"');
  });

  it("renders panel flex sizing from defaultSize", () => {
    const output = markup(
      Resizable.Static({ children: Resizable.Panel({ defaultSize: 35, children: "Side" }) }),
    );

    expect(output).toContain('data-default-size="35"');
    expect(output).toContain("flex-basis:0");
    expect(output).toContain("flex-shrink:1");
    expect(output).toContain("flex-grow:35");
  });

  it("renders serialized panel and handle parts from hydration props", () => {
    const output = markup(
      Resizable.Static({
        children: [
          { __areiaResizablePart: "panel", input: { defaultSize: 30, children: "Left" } },
          { __areiaResizablePart: "handle", input: { withHandle: true } },
          { __areiaResizablePart: "panel", input: { defaultSize: 70, children: "Right" } },
        ],
      }),
    );

    expect(output).not.toContain("[object Object]");
    expect(output).toContain('data-slot="resizable-panel"');
    expect(output).toContain('data-slot="resizable-handle"');
    expect(output).toContain("Left");
    expect(output).toContain("Right");
  });

  it("renders escaped coerced markup children instead of entity text", () => {
    const parts = [
      Resizable.Panel({ defaultSize: 50, minSize: 10, children: "Left" }),
      Resizable.Handle({ withHandle: true }),
      Resizable.Panel({ defaultSize: 50, minSize: 10, children: "Right" }),
    ];
    const joined = parts.map(String).join("");
    const escaped = joined
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
    const output = markup(
      Resizable.Static({
        children: { value: escaped },
      }),
    );

    expect(output).not.toContain("&lt;div");
    expect(output).not.toContain("[object Object]");
    expect(output).toContain('data-slot="resizable-panel"');
    expect(output).toContain('data-slot="resizable-handle"');
    expect(output).toContain("Left");
    expect(output).toContain("Right");
  });

  it("renders coerced markup children instead of [object Object]", () => {
    const parts = [
      Resizable.Panel({ defaultSize: 50, children: "Left" }),
      Resizable.Handle({ withHandle: true }),
      Resizable.Panel({ defaultSize: 50, children: "Right" }),
    ];
    const output = markup(
      Resizable.Static({
        children: { value: parts.map(String).join("") },
      }),
    );

    expect(output).not.toContain("[object Object]");
    expect(output).toContain('data-slot="resizable-panel"');
    expect(output).toContain('data-slot="resizable-handle"');
    expect(output).toContain("Left");
    expect(output).toContain("Right");
  });

  it("mounts interactive Ilha child islands inside panels", async () => {
    document.body.innerHTML = "";

    const Counter = ilha
      .state("count", 0)
      .on("button@click", ({ state }) => state.count(state.count() + 1))
      .render(({ state }) => html`<button type="button">Count: ${state.count}</button>`);

    const App = ilha.render(
      () =>
        html`${Resizable({
          direction: "horizontal",
          children: [
            Resizable.Panel({ defaultSize: 50, children: Counter }),
            Resizable.Handle(),
            Resizable.Panel({ defaultSize: 50, children: "Other" }),
          ],
        })}`,
    );

    document.body.innerHTML = await App.hydratable({}, { name: "App", snapshot: true });
    const { unmount } = mount({ App, Counter }, { root: document.body, lazy: false });

    try {
      await Promise.resolve();
      const root = document.querySelector('[data-slot="resizable"]');
      const button = document.querySelector<HTMLButtonElement>("button");

      expect(root).toBeTruthy();
      expect(root?.querySelector('[data-slot="resizable-handle"]')).toBeTruthy();
      expect(button?.textContent).toBe("Count: 0");
      expect(document.body.innerHTML).not.toContain(
        'data-ilha-slot="p:0" data-ilha-props="{}"></div>',
      );

      button?.click();
      await Promise.resolve();

      expect(button?.textContent).toBe("Count: 1");
    } finally {
      unmount();
    }
  });

  it("mounts interactive Ilha child islands inside nested panels", async () => {
    document.body.innerHTML = "";

    const Counter = ilha
      .state("count", 0)
      .on("button@click", ({ state }) => state.count(state.count() + 1))
      .render(({ state }) => html`<button type="button">Count: ${state.count}</button>`);

    const App = ilha.render(
      () =>
        html`${Resizable({
          direction: "horizontal",
          children: [
            Resizable.Panel({ defaultSize: 50, children: "Outer" }),
            Resizable.Handle(),
            Resizable.Panel({
              defaultSize: 50,
              children: Resizable({
                direction: "vertical",
                children: [
                  Resizable.Panel({ defaultSize: 50, children: Counter }),
                  Resizable.Handle(),
                  Resizable.Panel({ defaultSize: 50, children: "Other" }),
                ],
              }),
            }),
          ],
        })}`,
    );

    document.body.innerHTML = await App.hydratable({}, { name: "App", snapshot: true });
    const { unmount } = mount({ App, Counter }, { root: document.body, lazy: false });

    try {
      await Promise.resolve();
      const button = document.querySelector<HTMLButtonElement>("button");

      expect(document.querySelectorAll('[data-slot="resizable"]')).toHaveLength(2);
      expect(button?.textContent).toBe("Count: 0");
      expect(document.body.innerHTML).not.toContain(
        'data-ilha-slot="p:0" data-ilha-props="{}"></div>',
      );

      button?.click();
      await Promise.resolve();

      expect(button?.textContent).toBe("Count: 1");
    } finally {
      unmount();
    }
  });

  it("reconnects handles after island re-render", async () => {
    document.body.innerHTML = "";

    let renderCount = 0;
    const ResizableLayout = ilha.input<{ label?: string }>().render(({ input }) => {
      renderCount++;
      return html`${Resizable.Root({
        direction: "horizontal",
        children: [
          Resizable.Panel({ defaultSize: 50, children: input?.label ?? "Left" }),
          Resizable.Handle({ withHandle: true }),
          Resizable.Panel({ defaultSize: 50, children: "Right" }),
        ],
      })}`;
    });

    const App = ilha.render(() => html`<div>${ResizableLayout({ label: "Left" })}</div>`);
    document.body.innerHTML = await App.hydratable({}, { name: "App", snapshot: true });
    const island = mount({ App, ResizableLayout }, { root: document.body, lazy: false });
    await Promise.resolve();
    await new Promise((resolve) => setTimeout(resolve, 100));

    try {
      const root = document.querySelector('[data-slot="resizable"]') as HTMLElement;
      const drag = () => {
        const handle = document.querySelector('[data-slot="resizable-handle"]') as HTMLElement;
        const panels = document.querySelectorAll<HTMLElement>('[data-slot="resizable-panel"]');
        Object.defineProperty(root, "getBoundingClientRect", {
          configurable: true,
          value: () =>
            ({
              width: 1000,
              height: 500,
              top: 0,
              left: 0,
              right: 1000,
              bottom: 500,
              x: 0,
              y: 0,
              toJSON: () => {},
            }) as DOMRect,
        });
        handle.dispatchEvent(
          new PointerEvent("pointerdown", {
            bubbles: true,
            clientX: 500,
            pointerId: 1,
            pointerType: "mouse",
          }),
        );
        document.body.dispatchEvent(
          new PointerEvent("pointermove", {
            bubbles: true,
            clientX: 600,
            pointerId: 1,
            pointerType: "mouse",
          }),
        );
        return parseFloat(panels[0]?.style.flexGrow ?? "0");
      };

      expect(renderCount).toBeGreaterThan(1);
      expect(drag()).toBeCloseTo(60);

      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(document.querySelector('[data-slot="resizable-handle"]')?.getAttribute("role")).toBe(
        "separator",
      );
      expect(drag()).toBeCloseTo(60);
    } finally {
      island.unmount();
    }
  });

  it("supports dragging after Resizable.Root hydration remount", async () => {
    document.body.innerHTML = "";

    const Layout = ilha.render(
      () =>
        html`<div class="layout">
          ${Resizable.Root({
            direction: "horizontal",
            children: [
              Resizable.Panel({ defaultSize: 50, children: "Left" }),
              Resizable.Handle({ withHandle: true }),
              Resizable.Panel({ defaultSize: 50, children: "Right" }),
            ],
          })}
        </div>`,
    );

    document.body.innerHTML = await Layout.hydratable({}, { name: "Layout", snapshot: true });
    const { unmount } = mount({ Layout }, { root: document.body, lazy: false });
    await Promise.resolve();
    await new Promise((resolve) => setTimeout(resolve, 50));

    try {
      const root = document.querySelector('[data-slot="resizable"]') as HTMLElement;
      const handle = document.querySelector('[data-slot="resizable-handle"]') as HTMLElement;
      const panels = document.querySelectorAll<HTMLElement>('[data-slot="resizable-panel"]');

      expect(handle?.getAttribute("role")).toBe("separator");
      expect(panels).toHaveLength(2);

      Object.defineProperty(root, "getBoundingClientRect", {
        configurable: true,
        value: () =>
          ({
            width: 1000,
            height: 500,
            top: 0,
            left: 0,
            right: 1000,
            bottom: 500,
            x: 0,
            y: 0,
            toJSON: () => {},
          }) as DOMRect,
      });

      handle.dispatchEvent(
        new PointerEvent("pointerdown", {
          bubbles: true,
          clientX: 500,
          pointerId: 1,
          pointerType: "mouse",
        }),
      );
      document.body.dispatchEvent(
        new PointerEvent("pointermove", {
          bubbles: true,
          clientX: 600,
          pointerId: 1,
          pointerType: "mouse",
        }),
      );

      expect(parseFloat(panels[0]?.style.flexGrow ?? "0")).toBeCloseTo(60);
    } finally {
      unmount();
    }
  });

  it("Panel and Handle parts carry Symbol.for('ilha.renderPart')", () => {
    const RENDER_PART = Symbol.for("ilha.renderPart");
    const panel = Resizable.Panel({ defaultSize: 50 });
    const handle = Resizable.Handle();
    expect((panel as Record<symbol, unknown>)[RENDER_PART]).toBe(true);
    expect((handle as Record<symbol, unknown>)[RENDER_PART]).toBe(true);
  });

  it("does not carry ilha island symbols — Resizable must not be detected as a child island", () => {
    const ISLAND = Symbol.for("ilha.island");
    const isIsland = (v: unknown) =>
      typeof v === "function" &&
      (ISLAND in v || Object.getOwnPropertySymbols(v).some((s) => s.description === "ilha.island"));
    expect(isIsland(Resizable)).toBe(false);
  });

  it("nests panels inside root in SSR when used via JSX inside a layout island", async () => {
    document.body.innerHTML = "";
    const Layout = ilha.render(() =>
      jsxs("div", {
        class: "layout-container",
        children: [
          jsxs(Resizable, {
            direction: "horizontal",
            children: [
              jsx(Resizable.Panel, { defaultSize: 20, children: "Sidebar" }),
              jsx(Resizable.Handle, {}),
              jsx(Resizable.Panel, { defaultSize: 80, children: "Content" }),
            ],
          }),
        ],
      }),
    );
    document.body.innerHTML = await Layout.hydratable({}, { name: "Layout", snapshot: true });
    const root = document.querySelector('[data-slot="resizable"]');
    expect(root).toBeTruthy();
    expect(root?.querySelector('[data-slot="resizable-panel"]')).toBeTruthy();
    expect(root?.querySelector('[data-slot="resizable-handle"]')).toBeTruthy();
  });
});
