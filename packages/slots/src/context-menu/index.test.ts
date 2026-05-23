import { describe, expect, it, beforeEach } from "bun:test";
import { createContextMenu, create } from "./index";
import { clearRootBinding, setRootBinding } from "../core";

describe("ContextMenu", () => {
  const ROOT_BINDING_KEY = "@areia/slots:ContextMenu";

  const setup = (options: Parameters<typeof createContextMenu>[1] = {}, html?: string) => {
    document.body.innerHTML =
      html ??
      `
      <div data-slot="context-menu" id="root">
        <div data-slot="context-menu-trigger" id="trigger">Area</div>
        <div data-slot="context-menu-content" id="content">
          <button data-slot="context-menu-item" data-value="copy">Copy</button>
          <button data-slot="context-menu-item" data-value="paste">Paste</button>
          <button data-slot="context-menu-item" data-value="disabled" data-disabled>Disabled</button>
          <button data-slot="context-menu-checkbox-item" data-value="show-hidden">Show hidden</button>
        </div>
      </div>
    `;
    const root = document.getElementById("root")!;
    const trigger = document.getElementById("trigger")!;
    const content = document.getElementById("content")!;
    const items = content.querySelectorAll<HTMLElement>(
      '[data-slot="context-menu-item"], [data-slot="context-menu-checkbox-item"]',
    );
    const controller = createContextMenu(root, options);
    return { root, trigger, content, items, controller };
  };

  beforeEach(() => {
    document.body.innerHTML = "";
  });

  it("initializes closed with ARIA attributes", () => {
    const { trigger, content, controller } = setup();

    expect(content.hidden).toBe(true);
    expect(content.getAttribute("role")).toBe("menu");
    expect(trigger.getAttribute("aria-haspopup")).toBe("menu");
    expect(trigger.getAttribute("aria-expanded")).toBe("false");

    controller.destroy();
  });

  it("opens at the pointer on contextmenu", () => {
    const { trigger, content, controller } = setup();
    const event = new MouseEvent("contextmenu", {
      bubbles: true,
      cancelable: true,
      clientX: 120,
      clientY: 80,
    });

    trigger.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(true);
    expect(controller.isOpen).toBe(true);
    expect(content.hidden).toBe(false);
    expect(content.style.position).toBe("fixed");
    expect(content.style.transform).toContain("translate3d");

    controller.destroy();
  });

  it("measures after applying fixed positioning on first open", () => {
    const { trigger, content, controller } = setup();
    Object.defineProperty(content, "offsetWidth", {
      configurable: true,
      get() {
        return content.style.position === "fixed" ? 160 : 1000;
      },
    });
    Object.defineProperty(content, "offsetHeight", {
      configurable: true,
      value: 80,
    });
    content.getBoundingClientRect = () =>
      ({
        x: 0,
        y: 0,
        top: 0,
        left: 0,
        right: content.offsetWidth,
        bottom: 80,
        width: content.offsetWidth,
        height: 80,
        toJSON: () => ({}),
      }) as DOMRect;

    trigger.dispatchEvent(
      new MouseEvent("contextmenu", {
        bubbles: true,
        cancelable: true,
        clientX: 120,
        clientY: 80,
      }),
    );

    expect(content.style.transform).toContain("translate3d(120px,");

    controller.destroy();
  });

  it("closes on outside pointerdown", () => {
    const { controller } = setup();
    controller.open({ x: 10, y: 20 });

    document.body.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));

    expect(controller.isOpen).toBe(false);
    controller.destroy();
  });

  it("highlights and selects items with keyboard", () => {
    const { root, content, items, controller } = setup();
    const selected: string[] = [];
    root.addEventListener("context-menu:select", (event) => {
      selected.push((event as CustomEvent).detail.value);
    });

    controller.open({ x: 10, y: 20 });
    content.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }));
    expect(items[0]?.hasAttribute("data-highlighted")).toBe(true);
    content.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));

    expect(selected).toEqual(["copy"]);
    expect(controller.isOpen).toBe(false);

    controller.destroy();
  });

  it("selects items with pointer click and toggles checkbox item state", () => {
    const { root, items, controller } = setup({ closeOnSelect: false });
    const selected: string[] = [];
    root.addEventListener("context-menu:select", (event) => {
      selected.push((event as CustomEvent).detail.value);
    });

    controller.open({ x: 10, y: 20 });
    items[3]?.click();

    expect(selected).toEqual(["show-hidden"]);
    expect(items[3]?.getAttribute("aria-checked")).toBe("true");
    expect(items[3]?.hasAttribute("data-checked")).toBe(true);
    expect(controller.isOpen).toBe(true);

    controller.destroy();
  });

  it("opens after a touch long press", async () => {
    const { trigger, controller } = setup({ longPressDelay: 1 });
    trigger.dispatchEvent(
      new TouchEvent("touchstart", {
        bubbles: true,
        touches: [new Touch({ identifier: 1, target: trigger, clientX: 50, clientY: 60 })],
      }),
    );

    await new Promise((resolve) => setTimeout(resolve, 5));

    expect(controller.isOpen).toBe(true);
    controller.destroy();
  });

  it("create() binds all context menus and skips already bound roots", () => {
    document.body.innerHTML = `
      <div data-slot="context-menu"><div data-slot="context-menu-content"></div></div>
      <div data-slot="context-menu"><div data-slot="context-menu-content"></div></div>
    `;

    const controllers = create();
    expect(controllers).toHaveLength(2);
    expect(create()).toHaveLength(0);

    controllers.forEach((controller) => controller.destroy());
  });

  it("reuses a controller bound by another module copy", () => {
    const { root, controller } = setup();
    controller.destroy();

    const foreignController = { destroy() {} } as ReturnType<typeof createContextMenu>;
    setRootBinding(root, ROOT_BINDING_KEY, foreignController);

    expect(createContextMenu(root)).toBe(foreignController);

    clearRootBinding(root, ROOT_BINDING_KEY, foreignController);
  });
});
