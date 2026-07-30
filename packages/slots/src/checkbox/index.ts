import {
  getParts,
  getRoots,
  getDataBool,
  getDataString,
  reuseRootBinding,
  hasRootBinding,
  setRootBinding,
  clearRootBinding,
  setAria,
  ensureId,
  on,
  emit,
} from "../core";

export interface CheckboxOptions {
  /** Initial checked state */
  defaultChecked?: boolean;
  /** Initial mixed state. Cleared when the user toggles the checkbox. */
  indeterminate?: boolean;
  /** Disable user interaction and form submission */
  disabled?: boolean;
  /** Prevent user interaction while keeping the value submittable */
  readOnly?: boolean;
  /** Require a checked value for native form validation */
  required?: boolean;
  /** Form field name */
  name?: string;
  /** Form owner id for generated inputs */
  form?: string;
  /** Submitted value when checked, defaults to native checkbox "on" */
  value?: string;
  /** Submitted value when unchecked */
  uncheckedValue?: string;
  /** Callback when checked state changes */
  onCheckedChange?: (checked: boolean) => void;
}

export interface CheckboxController {
  /** Current checked state */
  readonly checked: boolean;
  /** Current mixed state */
  readonly indeterminate: boolean;
  /** Toggle the checked state and clear indeterminate */
  toggle(): void;
  /** Set checked state to true and clear indeterminate */
  check(): void;
  /** Set checked state to false and clear indeterminate */
  uncheck(): void;
  /** Set the checked state and optionally the indeterminate state */
  setChecked(checked: boolean, indeterminate?: boolean): void;
  /** Set the indeterminate/mixed state without changing checked */
  setIndeterminate(indeterminate: boolean): void;
  /** Cleanup listeners and generated inputs */
  destroy(): void;
}

const ROOT_BINDING_KEY = "@areia/slots:Checkbox";
const DUPLICATE_BINDING_WARNING =
  "[@areia/slots:Checkbox] createCheckbox() called more than once for the same root. Returning the existing controller. Destroy it before rebinding with new options.";

const VISUALLY_HIDDEN_STYLES = [
  "position:absolute",
  "width:1px",
  "height:1px",
  "padding:0",
  "margin:-1px",
  "overflow:hidden",
  "clip:rect(0, 0, 0, 0)",
  "white-space:nowrap",
  "border:0",
  "pointer-events:none",
].join(";");

function setPresence(el: Element, name: string, present: boolean): void {
  if (present) {
    el.setAttribute(name, "");
  } else {
    el.removeAttribute(name);
  }
}

function setCheckedStateAttrs(el: Element, checked: boolean, indeterminate: boolean): void {
  setPresence(el, "data-checked", checked);
  setPresence(el, "data-unchecked", !checked && !indeterminate);
  setPresence(el, "data-indeterminate", indeterminate);
}

function setFlagStateAttrs(
  el: Element,
  disabled: boolean,
  readOnly: boolean,
  required: boolean,
): void {
  setPresence(el, "data-disabled", disabled);
  setPresence(el, "data-readonly", readOnly);
  setPresence(el, "data-required", required);
}

function mergeIdRefs(existing: string | null, ids: string[]): string | null {
  const merged = new Set<string>();
  if (existing) {
    for (const id of existing.split(/\s+/)) {
      if (id) merged.add(id);
    }
  }
  for (const id of ids) {
    if (id) merged.add(id);
  }
  return merged.size > 0 ? [...merged].join(" ") : null;
}

function insertAfter(reference: Element, node: Element): void {
  const parent = reference.parentNode;
  if (!parent) {
    reference.appendChild(node);
    return;
  }
  parent.insertBefore(node, reference.nextSibling);
}

function isNativeButton(el: HTMLElement): el is HTMLButtonElement {
  return el.tagName === "BUTTON";
}

function isNaturallyFocusable(el: HTMLElement): boolean {
  const tagName = el.tagName;
  if (
    tagName === "BUTTON" ||
    tagName === "INPUT" ||
    tagName === "SELECT" ||
    tagName === "TEXTAREA"
  ) {
    return true;
  }
  if (tagName === "A") {
    return el.hasAttribute("href");
  }
  return false;
}

function getRootLabels(
  root: HTMLElement,
  controlInput?: HTMLInputElement | null,
): HTMLLabelElement[] {
  const labels: HTMLLabelElement[] = [];
  const wrappingLabel = root.closest("label");
  if (wrappingLabel instanceof HTMLLabelElement) {
    labels.push(wrappingLabel);
  }

  const id = controlInput?.id || root.id;
  if (!id) return labels;

  const doc = root.ownerDocument ?? document;
  const selector = `label[for="${CSS.escape(id)}"]`;
  for (const label of doc.querySelectorAll<HTMLLabelElement>(selector)) {
    if (!labels.includes(label)) {
      labels.push(label);
    }
  }

  return labels;
}

function findEmbeddedInput(root: HTMLElement): HTMLInputElement | null {
  const scoped = root.querySelector<HTMLInputElement>(
    ':scope > input[type="checkbox"][data-slot="checkbox-input"]',
  );
  if (scoped) return scoped;
  return root.querySelector<HTMLInputElement>(':scope > input[type="checkbox"]');
}

/**
 * Create a checkbox controller for a root element.
 *
 * Expected markup:
 * ```html
 * <label>
 *   <span data-slot="checkbox" data-name="terms">
 *     <input type="checkbox" data-slot="checkbox-input" />
 *     <span data-slot="checkbox-indicator"></span>
 *   </span>
 *   Accept terms
 * </label>
 * ```
 */
export function createCheckbox(root: Element, options: CheckboxOptions = {}): CheckboxController {
  const existingController = reuseRootBinding<CheckboxController>(
    root,
    ROOT_BINDING_KEY,
    DUPLICATE_BINDING_WARNING,
  );
  if (existingController) return existingController;

  const rootElement = root as HTMLElement;
  const embeddedInput = findEmbeddedInput(rootElement);
  const disabled =
    options.disabled ??
    getDataBool(rootElement, "disabled") ??
    embeddedInput?.disabled ??
    (rootElement.hasAttribute("disabled") || rootElement.getAttribute("aria-disabled") === "true");
  const readOnly =
    options.readOnly ??
    getDataBool(rootElement, "readOnly") ??
    rootElement.getAttribute("aria-readonly") === "true";
  const required =
    options.required ??
    getDataBool(rootElement, "required") ??
    embeddedInput?.required ??
    rootElement.getAttribute("aria-required") === "true";
  const defaultChecked =
    options.defaultChecked ??
    getDataBool(rootElement, "defaultChecked") ??
    embeddedInput?.checked ??
    rootElement.getAttribute("aria-checked") === "true";
  const defaultIndeterminate =
    options.indeterminate ??
    getDataBool(rootElement, "indeterminate") ??
    rootElement.getAttribute("aria-checked") === "mixed";
  const name = options.name ?? getDataString(rootElement, "name") ?? embeddedInput?.name;
  const form =
    options.form ??
    getDataString(rootElement, "form") ??
    embeddedInput?.getAttribute("form") ??
    undefined;
  const value = options.value ?? getDataString(rootElement, "value") ?? embeddedInput?.value;
  const uncheckedValue = options.uncheckedValue ?? getDataString(rootElement, "uncheckedValue");
  const onCheckedChange = options.onCheckedChange;

  const cleanups: Array<() => void> = [];
  const doc = root.ownerDocument ?? document;
  const hiddenInput = embeddedInput ?? doc.createElement("input");
  if (!embeddedInput) {
    hiddenInput.type = "checkbox";
    hiddenInput.tabIndex = -1;
    hiddenInput.setAttribute("aria-hidden", "true");
    hiddenInput.setAttribute("data-checkbox-generated", "input");
    hiddenInput.style.cssText = VISUALLY_HIDDEN_STYLES;
    insertAfter(rootElement, hiddenInput);
  } else if (!hiddenInput.hasAttribute("data-checkbox-generated")) {
    hiddenInput.setAttribute("data-checkbox-generated", "input");
  }

  let uncheckedInput: HTMLInputElement | null = null;
  let currentChecked = Boolean(defaultChecked);
  let currentIndeterminate = Boolean(defaultIndeterminate);
  hiddenInput.defaultChecked = currentChecked;

  const getIndicators = () => getParts<HTMLElement>(rootElement, "checkbox-indicator");

  const syncGeneratedInputs = () => {
    hiddenInput.checked = currentChecked;
    hiddenInput.indeterminate = currentIndeterminate;
    hiddenInput.disabled = disabled;
    hiddenInput.required = required;
    if (form) {
      hiddenInput.setAttribute("form", form);
    } else {
      hiddenInput.removeAttribute("form");
    }
    if (name) {
      hiddenInput.name = name;
    } else {
      hiddenInput.removeAttribute("name");
    }
    if (value !== undefined) {
      hiddenInput.value = value;
    } else {
      hiddenInput.removeAttribute("value");
    }

    const needsUncheckedInput =
      !disabled && !currentChecked && name !== undefined && uncheckedValue !== undefined;

    if (!needsUncheckedInput) {
      uncheckedInput?.remove();
      uncheckedInput = null;
      return;
    }

    if (!uncheckedInput) {
      uncheckedInput = doc.createElement("input");
      uncheckedInput.type = "hidden";
      uncheckedInput.setAttribute("data-checkbox-generated", "unchecked");
      insertAfter(hiddenInput, uncheckedInput);
    }

    uncheckedInput.name = name;
    uncheckedInput.value = uncheckedValue;
    uncheckedInput.disabled = disabled;
    if (form) {
      uncheckedInput.setAttribute("form", form);
    } else {
      uncheckedInput.removeAttribute("form");
    }
  };

  const syncRoot = () => {
    if (isNativeButton(rootElement)) {
      if (!rootElement.hasAttribute("type")) {
        rootElement.setAttribute("type", "button");
      }
      rootElement.disabled = disabled;
    } else if (!isNaturallyFocusable(rootElement)) {
      if (disabled) {
        rootElement.tabIndex = -1;
      } else if (!rootElement.hasAttribute("tabindex")) {
        rootElement.tabIndex = 0;
      }
    }

    rootElement.setAttribute("role", "checkbox");
    setAria(rootElement, "checked", currentIndeterminate ? "mixed" : currentChecked);
    setAria(rootElement, "disabled", disabled ? true : null);
    setAria(rootElement, "readonly", readOnly ? true : null);
    setAria(rootElement, "required", required ? true : null);
    setCheckedStateAttrs(rootElement, currentChecked, currentIndeterminate);
    setFlagStateAttrs(rootElement, disabled, readOnly, required);

    for (const indicator of getIndicators()) {
      const rendered = currentChecked || currentIndeterminate;
      if (!rendered && !indicator.hasAttribute("data-keep-mounted")) {
        indicator.hidden = true;
      } else {
        indicator.hidden = false;
      }
      setCheckedStateAttrs(indicator, currentChecked, currentIndeterminate);
      setFlagStateAttrs(indicator, disabled, readOnly, required);
    }
  };

  let isDestroyed = false;

  const updateState = (checked: boolean, indeterminate = false, emitChange = true) => {
    if (isDestroyed) return;
    const nextChecked = Boolean(checked);
    const nextIndeterminate = Boolean(indeterminate);
    if (currentChecked === nextChecked && currentIndeterminate === nextIndeterminate) {
      syncGeneratedInputs();
      syncRoot();
      return;
    }

    const checkedChanged = currentChecked !== nextChecked;
    currentChecked = nextChecked;
    currentIndeterminate = nextIndeterminate;
    syncGeneratedInputs();
    syncRoot();

    if (!emitChange || !checkedChanged) return;
    emit(rootElement, "checkbox:change", { checked: currentChecked });
    onCheckedChange?.(currentChecked);
  };

  const toggleViaInput = () => {
    if (disabled || readOnly) return;
    currentIndeterminate = false;
    hiddenInput.click();
  };

  const labels = getRootLabels(rootElement, embeddedInput);
  if (labels.length > 0) {
    const labelIds = labels.map((label) => ensureId(label, "checkbox-label"));
    const labelledBy = mergeIdRefs(rootElement.getAttribute("aria-labelledby"), labelIds);
    if (labelledBy) {
      rootElement.setAttribute("aria-labelledby", labelledBy);
    }
  }

  syncGeneratedInputs();
  syncRoot();

  const nearestForm =
    hiddenInput.form ??
    (rootElement.closest("form") instanceof HTMLFormElement ? rootElement.closest("form") : null);
  if (nearestForm) {
    cleanups.push(
      on(nearestForm, "reset", () => {
        queueMicrotask(() => {
          if (isDestroyed) return;
          updateState(hiddenInput.checked, hiddenInput.indeterminate, false);
        });
      }),
    );
  }

  cleanups.push(
    on(hiddenInput, "click", (event) => {
      if (disabled || readOnly) {
        event.preventDefault();
      }
    }),
  );

  cleanups.push(
    on(hiddenInput, "change", () => {
      updateState(hiddenInput.checked, false);
    }),
  );

  cleanups.push(
    on(rootElement, "click", (event) => {
      if (event.target === hiddenInput || event.target === uncheckedInput) return;
      if (disabled || readOnly) {
        event.preventDefault();
        return;
      }
      event.preventDefault();
      toggleViaInput();
    }),
  );

  cleanups.push(
    on(rootElement, "keydown", (event) => {
      const keyboardEvent = event as KeyboardEvent;
      if (keyboardEvent.repeat) return;
      if (keyboardEvent.key === "Enter") {
        keyboardEvent.preventDefault();
        return;
      }
      if (keyboardEvent.key !== " " && keyboardEvent.key !== "Spacebar") {
        return;
      }

      keyboardEvent.preventDefault();
      toggleViaInput();
    }),
  );

  for (const label of labels) {
    if (label.contains(rootElement)) continue;
    cleanups.push(
      on(label, "click", (event) => {
        event.preventDefault();
        toggleViaInput();
      }),
    );
  }

  cleanups.push(
    on(rootElement, "checkbox:set", (event) => {
      const detail = (event as CustomEvent).detail;
      const checked =
        typeof detail === "boolean"
          ? detail
          : typeof detail?.checked === "boolean"
            ? detail.checked
            : typeof detail?.value === "boolean"
              ? detail.value
              : undefined;
      const indeterminate =
        typeof detail?.indeterminate === "boolean" ? detail.indeterminate : false;

      if (typeof checked === "boolean") {
        updateState(checked, indeterminate);
      } else if (typeof detail?.indeterminate === "boolean") {
        updateState(currentChecked, detail.indeterminate, false);
      }
    }),
  );

  const controller: CheckboxController = {
    get checked() {
      return currentChecked;
    },
    get indeterminate() {
      return currentIndeterminate;
    },
    toggle: () => updateState(!currentChecked, false),
    check: () => updateState(true, false),
    uncheck: () => updateState(false, false),
    setChecked: (checked, indeterminate = false) =>
      updateState(Boolean(checked), Boolean(indeterminate)),
    setIndeterminate: (indeterminate) => updateState(currentChecked, Boolean(indeterminate), false),
    destroy: () => {
      if (isDestroyed) return;
      isDestroyed = true;
      cleanups.forEach((fn) => fn());
      cleanups.length = 0;
      if (!embeddedInput) hiddenInput.remove();
      uncheckedInput?.remove();
      clearRootBinding(rootElement, ROOT_BINDING_KEY, controller);
    },
  };

  setRootBinding(rootElement, ROOT_BINDING_KEY, controller);
  return controller;
}

/**
 * Find and bind all checkbox instances in a scope.
 */
export function create(scope: ParentNode = document): CheckboxController[] {
  const controllers: CheckboxController[] = [];
  for (const root of getRoots(scope, "checkbox")) {
    if (hasRootBinding(root, ROOT_BINDING_KEY)) continue;
    controllers.push(createCheckbox(root));
  }
  return controllers;
}
