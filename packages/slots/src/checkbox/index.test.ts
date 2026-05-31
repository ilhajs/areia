import { describe, expect, it, beforeEach } from "bun:test";
import { createCheckbox, create } from "./index";
import { clearRootBinding, setRootBinding } from "../core";

describe("Checkbox", () => {
  const ROOT_BINDING_KEY = "@areia/slots:Checkbox";

  const setup = (options: Parameters<typeof createCheckbox>[1] = {}, html?: string) => {
    document.body.innerHTML =
      html ??
      `
      <label>
        <span data-slot="checkbox" id="root" data-name="terms" data-value="yes">
          <span data-slot="checkbox-indicator">✓</span>
        </span>
        Accept terms
      </label>
    `;
    const root = document.getElementById("root")!;
    const indicator = root.querySelector('[data-slot="checkbox-indicator"]') as HTMLElement;
    const controller = createCheckbox(root, options);
    const input = document.querySelector('[data-checkbox-generated="input"]') as HTMLInputElement;

    return { root, indicator, input, controller };
  };

  beforeEach(() => {
    document.body.innerHTML = "";
  });

  it("initializes unchecked with ARIA, data attributes, and generated input", () => {
    const { root, indicator, input, controller } = setup();

    expect(root.getAttribute("role")).toBe("checkbox");
    expect(root.getAttribute("aria-checked")).toBe("false");
    expect(root.hasAttribute("data-unchecked")).toBe(true);
    expect(root.hasAttribute("data-checked")).toBe(false);
    expect(indicator.hidden).toBe(true);
    expect(input.type).toBe("checkbox");
    expect(input.name).toBe("terms");
    expect(input.value).toBe("yes");
    expect(input.checked).toBe(false);

    controller.destroy();
  });

  it("toggles checked state on click", () => {
    const { root, indicator, input, controller } = setup();
    const changes: boolean[] = [];
    root.addEventListener("checkbox:change", (event) => {
      changes.push((event as CustomEvent).detail.checked);
    });

    root.click();

    expect(controller.checked).toBe(true);
    expect(root.getAttribute("aria-checked")).toBe("true");
    expect(root.hasAttribute("data-checked")).toBe(true);
    expect(indicator.hidden).toBe(false);
    expect(input.checked).toBe(true);
    expect(changes).toEqual([true]);

    controller.destroy();
  });

  it("toggles with Space but not Enter", () => {
    const { root, controller } = setup();

    root.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
    expect(controller.checked).toBe(false);

    root.dispatchEvent(new KeyboardEvent("keydown", { key: " ", bubbles: true }));
    expect(controller.checked).toBe(true);

    controller.destroy();
  });

  it("supports indeterminate state and clears it when toggled", () => {
    const { root, indicator, input, controller } = setup({ indeterminate: true });

    expect(controller.indeterminate).toBe(true);
    expect(root.getAttribute("aria-checked")).toBe("mixed");
    expect(root.hasAttribute("data-indeterminate")).toBe(true);
    expect(indicator.hidden).toBe(false);
    expect(input.indeterminate).toBe(true);

    root.click();

    expect(controller.indeterminate).toBe(false);
    expect(controller.checked).toBe(true);
    expect(root.getAttribute("aria-checked")).toBe("true");
    expect(input.indeterminate).toBe(false);

    controller.destroy();
  });

  it("keeps indicator mounted when data-keep-mounted is present", () => {
    const { indicator, controller } = setup(
      {},
      `
      <span data-slot="checkbox" id="root">
        <span data-slot="checkbox-indicator" data-keep-mounted>✓</span>
      </span>
    `,
    );

    expect(indicator.hidden).toBe(false);
    expect(indicator.hasAttribute("data-unchecked")).toBe(true);

    controller.destroy();
  });

  it("does not toggle when disabled or readonly", () => {
    const disabled = setup({ disabled: true });
    disabled.root.click();
    expect(disabled.controller.checked).toBe(false);
    expect(disabled.root.getAttribute("aria-disabled")).toBe("true");
    disabled.controller.destroy();

    const readonly = setup({ readOnly: true });
    readonly.root.click();
    expect(readonly.controller.checked).toBe(false);
    expect(readonly.root.getAttribute("aria-readonly")).toBe("true");
    readonly.controller.destroy();
  });

  it("submits uncheckedValue with a generated hidden input", () => {
    const { root, controller } = setup({ uncheckedValue: "no" });
    let unchecked = document.querySelector(
      '[data-checkbox-generated="unchecked"]',
    ) as HTMLInputElement | null;

    expect(unchecked?.name).toBe("terms");
    expect(unchecked?.value).toBe("no");

    root.click();
    unchecked = document.querySelector(
      '[data-checkbox-generated="unchecked"]',
    ) as HTMLInputElement | null;
    expect(unchecked).toBeNull();

    controller.destroy();
  });

  it("create() binds all checkbox roots and skips already bound roots", () => {
    document.body.innerHTML = `
      <span data-slot="checkbox" id="a"></span>
      <span data-slot="checkbox" id="b"></span>
    `;

    const controllers = create();
    expect(controllers).toHaveLength(2);
    expect(create()).toHaveLength(0);

    controllers.forEach((controller) => controller.destroy());
  });

  it("reuses a controller bound by another module copy", () => {
    const { root, controller } = setup();
    controller.destroy();

    const foreignController = { destroy() {} } as ReturnType<typeof createCheckbox>;
    setRootBinding(root, ROOT_BINDING_KEY, foreignController);

    expect(createCheckbox(root)).toBe(foreignController);

    clearRootBinding(root, ROOT_BINDING_KEY, foreignController);
  });

  it("reuses an embedded SSR input and preserves passthrough data attributes", () => {
    document.body.innerHTML = `
      <span data-slot="checkbox" id="root" data-name="terms" data-value="yes">
        <input
          type="checkbox"
          data-slot="checkbox-input"
          data-params="x"
          data-todo-checkbox
          data-checkbox-generated="input"
          class="sr-only"
        />
        <span data-slot="checkbox-indicator">✓</span>
      </span>
    `;
    const root = document.getElementById("root")!;
    const embedded = root.querySelector('[data-slot="checkbox-input"]') as HTMLInputElement;
    const controller = createCheckbox(root);
    const inputs = root.querySelectorAll('input[type="checkbox"]');

    expect(inputs.length).toBe(1);
    expect(inputs[0]).toBe(embedded);
    expect(embedded.getAttribute("data-params")).toBe("x");
    expect(embedded.hasAttribute("data-todo-checkbox")).toBe(true);

    root.click();
    expect(controller.checked).toBe(true);
    expect(embedded.checked).toBe(true);

    controller.destroy();
    expect(root.contains(embedded)).toBe(true);
  });
});
