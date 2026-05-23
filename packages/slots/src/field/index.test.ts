import { describe, expect, it, beforeEach } from "bun:test";
import { createField, create } from "./index";
import { clearRootBinding, setRootBinding } from "../core";

describe("Field", () => {
  const ROOT_BINDING_KEY = "@areia/slots:Field";

  const setup = (options: Parameters<typeof createField>[1] = {}, html?: string) => {
    document.body.innerHTML =
      html ??
      `
      <div data-slot="field" id="root">
        <label data-slot="field-label" id="label">Email</label>
        <input data-slot="field-control" id="control" name="email" required />
        <p data-slot="field-description" id="description">Use a work email.</p>
        <div data-slot="field-error" id="error"></div>
        <output data-slot="field-validity" id="validity"></output>
      </div>
    `;
    const root = document.getElementById("root")!;
    const label = document.getElementById("label") as HTMLLabelElement;
    const control = document.getElementById("control") as HTMLInputElement;
    const description = document.getElementById("description")!;
    const error = document.getElementById("error")!;
    const validity = document.getElementById("validity")!;
    const controller = createField(root, options);
    return { root, label, control, description, error, validity, controller };
  };

  beforeEach(() => {
    document.body.innerHTML = "";
  });

  it("associates label and messages with the control", () => {
    const { label, control, description, error, controller } = setup();

    expect(label.htmlFor).toBe(control.id);
    expect(control.getAttribute("aria-labelledby")).toContain(label.id);
    expect(control.getAttribute("aria-describedby")).toContain(description.id);
    expect(control.getAttribute("aria-describedby")).not.toContain(error.id);
    expect(control.getAttribute("aria-invalid")).toBe("false");
    expect(error.hidden).toBe(true);

    controller.destroy();
  });

  it("tracks focused, dirty, touched, and filled state", () => {
    const { root, control, controller } = setup();

    control.dispatchEvent(new FocusEvent("focus", { bubbles: true }));
    expect(controller.focused).toBe(true);
    expect(root.hasAttribute("data-focused")).toBe(true);

    control.value = "hello";
    control.dispatchEvent(new Event("input", { bubbles: true }));
    expect(controller.dirty).toBe(true);
    expect(controller.filled).toBe(true);
    expect(root.hasAttribute("data-dirty")).toBe(true);
    expect(root.hasAttribute("data-filled")).toBe(true);

    control.dispatchEvent(new FocusEvent("blur", { bubbles: true }));
    expect(controller.touched).toBe(true);
    expect(controller.focused).toBe(false);
    expect(root.hasAttribute("data-touched")).toBe(true);

    controller.destroy();
  });

  it("commits native required validation on blur", async () => {
    const { root, control, error, validity, controller } = setup();

    control.dispatchEvent(new FocusEvent("blur", { bubbles: true }));
    await Promise.resolve();

    expect(controller.invalid).toBe(true);
    expect(controller.validity.valueMissing).toBe(true);
    expect(root.hasAttribute("data-invalid")).toBe(true);
    expect(error.hidden).toBe(false);
    expect(validity.dataset.valid).toBe("false");

    controller.destroy();
  });

  it("supports custom validation", async () => {
    const { control, error, controller } = setup({
      validate: (value) => (value.includes("@") ? null : "Enter an email address"),
    });

    control.value = "nope";
    const validity = await controller.validate();

    expect(validity.valid).toBe(false);
    expect(validity.customError).toBe(true);
    expect(error.hidden).toBe(false);
    expect(error.textContent).toBe("Enter an email address");

    controller.destroy();
  });

  it("sets and clears invalid state imperatively", async () => {
    const { control, error, controller } = setup();

    controller.setInvalid(true, "Server rejected this value");
    expect(controller.invalid).toBe(true);
    expect(error.hidden).toBe(false);
    expect(error.textContent).toBe("Server rejected this value");

    control.value = "valid";
    controller.clearInvalid();
    await Promise.resolve();
    expect(controller.valid).toBe(true);
    expect(error.hidden).toBe(true);

    controller.destroy();
  });

  it("create() binds all field roots and skips already bound roots", () => {
    document.body.innerHTML = `
      <div data-slot="field"><input data-slot="field-control" /></div>
      <div data-slot="field"><input data-slot="field-control" /></div>
    `;

    const controllers = create();
    expect(controllers).toHaveLength(2);
    expect(create()).toHaveLength(0);

    controllers.forEach((controller) => controller.destroy());
  });

  it("reuses a controller bound by another module copy", () => {
    const { root, controller } = setup();
    controller.destroy();

    const foreignController = { destroy() {} } as ReturnType<typeof createField>;
    setRootBinding(root, ROOT_BINDING_KEY, foreignController);

    expect(createField(root)).toBe(foreignController);

    clearRootBinding(root, ROOT_BINDING_KEY, foreignController);
  });
});
