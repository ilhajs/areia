import { describe, expect, it, beforeEach } from "bun:test";
import { createProgress, create } from "./index";
import { clearRootBinding, setRootBinding } from "../core";

describe("Progress", () => {
  const ROOT_BINDING_KEY = "@areia/slots:Progress";

  const setup = (options: Parameters<typeof createProgress>[1] = {}, html?: string) => {
    document.body.innerHTML =
      html ??
      `
      <div data-slot="progress" id="root">
        <span data-slot="progress-label" id="label">Loading</span>
        <div data-slot="progress-track" id="track">
          <div data-slot="progress-indicator" id="indicator"></div>
        </div>
        <span data-slot="progress-value" id="value"></span>
      </div>
    `;
    const root = document.getElementById("root")!;
    const label = document.getElementById("label")!;
    const track = document.getElementById("track")!;
    const indicator = document.getElementById("indicator")!;
    const value = document.getElementById("value")!;
    const controller = createProgress(root, options);
    return { root, label, track, indicator, value, controller };
  };

  beforeEach(() => {
    document.body.innerHTML = "";
  });

  it("initializes determinate progress with ARIA and data attributes", () => {
    const { root, label, track, indicator, value, controller } = setup({ value: 25 });

    expect(root.getAttribute("role")).toBe("progressbar");
    expect(root.getAttribute("aria-valuemin")).toBe("0");
    expect(root.getAttribute("aria-valuemax")).toBe("100");
    expect(root.getAttribute("aria-valuenow")).toBe("25");
    expect(root.getAttribute("aria-labelledby")).toBe(label.id);
    expect(root.hasAttribute("data-progressing")).toBe(true);
    expect(track.getAttribute("aria-hidden")).toBe("true");
    expect(indicator.style.width).toBe("25%");
    expect(indicator.dataset.percent).toBe("25");
    expect(value.textContent).toBe("25");
    expect(controller.status).toBe("progressing");
    expect(controller.percent).toBe(25);

    controller.destroy();
  });

  it("supports indeterminate progress", () => {
    const { root, indicator, value, controller } = setup({ value: null });

    expect(root.hasAttribute("aria-valuenow")).toBe(false);
    expect(root.getAttribute("aria-valuetext")).toBe("indeterminate progress");
    expect(root.hasAttribute("data-indeterminate")).toBe(true);
    expect(indicator.style.width).toBe("");
    expect(value.textContent).toBe("");
    expect(controller.status).toBe("indeterminate");
    expect(controller.percent).toBeNull();

    controller.destroy();
  });

  it("marks complete when value reaches max", () => {
    const { root, indicator, controller } = setup({ value: 100 });

    expect(root.hasAttribute("data-complete")).toBe(true);
    expect(indicator.style.width).toBe("100%");
    expect(controller.status).toBe("complete");

    controller.destroy();
  });

  it("updates value, clamps to range, and emits change events", () => {
    const { root, indicator, controller } = setup({ value: 10, max: 50 });
    const changes: Array<number | null> = [];
    root.addEventListener("progress:value-change", (event) => {
      changes.push((event as CustomEvent).detail.value);
    });

    controller.setValue(75);

    expect(controller.value).toBe(50);
    expect(controller.percent).toBe(100);
    expect(indicator.style.width).toBe("100%");
    expect(changes).toEqual([50]);

    controller.setValue(null);
    expect(controller.status).toBe("indeterminate");
    expect(changes).toEqual([50, null]);

    controller.destroy();
  });

  it("supports data attributes and progress:set", () => {
    const { root, indicator, controller } = setup(
      {},
      `
      <div data-slot="progress" id="root" data-value="30" data-min="10" data-max="50">
        <div data-slot="progress-indicator" id="indicator"></div>
      </div>
    `,
    );

    expect(controller.value).toBe(30);
    expect(controller.percent).toBe(50);
    expect(indicator.style.width).toBe("50%");

    root.dispatchEvent(new CustomEvent("progress:set", { detail: { value: 50 }, bubbles: true }));
    expect(controller.status).toBe("complete");

    controller.destroy();
  });

  it("create() binds all progress roots and skips already bound roots", () => {
    document.body.innerHTML = `
      <div data-slot="progress"></div>
      <div data-slot="progress"></div>
    `;

    const controllers = create();
    expect(controllers).toHaveLength(2);
    expect(create()).toHaveLength(0);

    controllers.forEach((controller) => controller.destroy());
  });

  it("reuses a controller bound by another module copy", () => {
    const { root, controller } = setup();
    controller.destroy();

    const foreignController = { destroy() {} } as ReturnType<typeof createProgress>;
    setRootBinding(root, ROOT_BINDING_KEY, foreignController);

    expect(createProgress(root)).toBe(foreignController);

    clearRootBinding(root, ROOT_BINDING_KEY, foreignController);
  });
});
