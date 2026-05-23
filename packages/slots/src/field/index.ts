import {
  getPart,
  getParts,
  getRoots,
  getDataBool,
  getDataString,
  reuseRootBinding,
  hasRootBinding,
  setRootBinding,
  clearRootBinding,
  ensureId,
  on,
  emit,
} from "../core";

export type FieldValidationMode = "onBlur" | "onChange" | "onSubmit";
export type FieldValidationResult = string | string[] | null | undefined | false;
export type FieldValidate = (
  value: string,
  control: HTMLElement,
) => FieldValidationResult | Promise<FieldValidationResult>;

export interface FieldOptions {
  /** Field name. Defaults to data-name or the control name. */
  name?: string;
  /** Disable the field and control. */
  disabled?: boolean;
  /** Force invalid state independent of native/custom validation. */
  invalid?: boolean;
  /** Initial dirty state. */
  dirty?: boolean;
  /** Initial touched state. */
  touched?: boolean;
  /** When custom/native validation is committed. @default "onBlur" */
  validationMode?: FieldValidationMode;
  /** Custom validation function. Return a string or string[] to mark invalid. */
  validate?: FieldValidate;
  /** Debounce custom/native validation on change, in ms. */
  validationDebounceTime?: number;
  /** Called after validation state changes. */
  onValidityChange?: (valid: boolean) => void;
}

export interface FieldValidityData {
  valid: boolean;
  valueMissing: boolean;
  typeMismatch: boolean;
  patternMismatch: boolean;
  tooLong: boolean;
  tooShort: boolean;
  rangeUnderflow: boolean;
  rangeOverflow: boolean;
  stepMismatch: boolean;
  badInput: boolean;
  customError: boolean;
  error: string;
  errors: string[];
}

export interface FieldController {
  readonly name: string | undefined;
  readonly valid: boolean;
  readonly invalid: boolean;
  readonly dirty: boolean;
  readonly touched: boolean;
  readonly filled: boolean;
  readonly focused: boolean;
  readonly validity: FieldValidityData;
  validate(): Promise<FieldValidityData>;
  setInvalid(invalid: boolean, error?: string | string[]): void;
  clearInvalid(): void;
  destroy(): void;
}

const ROOT_BINDING_KEY = "@areia/slots:Field";
const DUPLICATE_BINDING_WARNING =
  "[@areia/slots:Field] createField() called more than once for the same root. Returning the existing controller. Destroy it before rebinding with new options.";

const CONTROL_SELECTOR = "input, textarea, select, button, [contenteditable], [tabindex]";

const DEFAULT_VALIDITY: FieldValidityData = {
  valid: true,
  valueMissing: false,
  typeMismatch: false,
  patternMismatch: false,
  tooLong: false,
  tooShort: false,
  rangeUnderflow: false,
  rangeOverflow: false,
  stepMismatch: false,
  badInput: false,
  customError: false,
  error: "",
  errors: [],
};

function setPresence(el: Element, attr: string, present: boolean): void {
  if (present) el.setAttribute(attr, "");
  else el.removeAttribute(attr);
}

function mergeIdRefs(...values: Array<string | null | undefined>): string | null {
  const ids = new Set<string>();
  for (const value of values) {
    if (!value) continue;
    for (const id of value.split(/\s+/)) {
      if (id) ids.add(id);
    }
  }
  return ids.size ? [...ids].join(" ") : null;
}

function getControl(root: HTMLElement): HTMLElement | null {
  return (
    getPart<HTMLElement>(root, "field-control") ?? root.querySelector<HTMLElement>(CONTROL_SELECTOR)
  );
}

function getControlValue(control: HTMLElement | null): string {
  if (!control) return "";
  if (
    control instanceof HTMLInputElement ||
    control instanceof HTMLTextAreaElement ||
    control instanceof HTMLSelectElement
  ) {
    return control.value;
  }
  return control.textContent ?? "";
}

function getNativeValidity(control: HTMLElement | null): FieldValidityData {
  if (!control || !("validity" in control)) return { ...DEFAULT_VALIDITY };
  const validity = (control as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement).validity;
  const errors: string[] = [];
  const message =
    "validationMessage" in control ? (control as HTMLInputElement).validationMessage : "";
  if (!validity.valid && message) errors.push(message);
  return {
    valid: validity.valid,
    valueMissing: validity.valueMissing,
    typeMismatch: validity.typeMismatch,
    patternMismatch: validity.patternMismatch,
    tooLong: validity.tooLong,
    tooShort: validity.tooShort,
    rangeUnderflow: validity.rangeUnderflow,
    rangeOverflow: validity.rangeOverflow,
    stepMismatch: validity.stepMismatch,
    badInput: validity.badInput,
    customError: validity.customError,
    error: errors[0] ?? "",
    errors,
  };
}

function normalizeValidationResult(result: FieldValidationResult): string[] {
  if (result === false || result == null) return [];
  if (Array.isArray(result)) return result.filter(Boolean);
  return result ? [result] : [];
}

function applyStateAttrs(
  el: Element,
  state: {
    disabled: boolean;
    touched: boolean;
    dirty: boolean;
    valid: boolean;
    invalid: boolean;
    filled: boolean;
    focused: boolean;
  },
): void {
  setPresence(el, "data-disabled", state.disabled);
  setPresence(el, "data-touched", state.touched);
  setPresence(el, "data-dirty", state.dirty);
  setPresence(el, "data-valid", state.valid);
  setPresence(el, "data-invalid", state.invalid);
  setPresence(el, "data-filled", state.filled);
  setPresence(el, "data-focused", state.focused);
}

function setText(el: HTMLElement, value: string | string[]): void {
  if (Array.isArray(value)) {
    el.textContent = value.join(" ");
  } else {
    el.textContent = value;
  }
}

export function createField(root: Element, options: FieldOptions = {}): FieldController {
  const existingController = reuseRootBinding<FieldController>(
    root,
    ROOT_BINDING_KEY,
    DUPLICATE_BINDING_WARNING,
  );
  if (existingController) return existingController;

  const rootElement = root as HTMLElement;
  const control = getControl(rootElement);
  const labels = getParts<HTMLElement>(rootElement, "field-label");
  const descriptions = getParts<HTMLElement>(rootElement, "field-description");
  const errors = getParts<HTMLElement>(rootElement, "field-error");
  const items = getParts<HTMLElement>(rootElement, "field-item");
  const validityViews = getParts<HTMLElement>(rootElement, "field-validity");

  const disabled = options.disabled ?? getDataBool(rootElement, "disabled") ?? false;
  const validationMode =
    options.validationMode ??
    (getDataString(rootElement, "validationMode") as FieldValidationMode | undefined) ??
    "onBlur";
  const validationDebounceTime = options.validationDebounceTime ?? 0;
  const validate = options.validate;
  const onValidityChange = options.onValidityChange;
  const cleanups: Array<() => void> = [];

  let name =
    options.name ??
    getDataString(rootElement, "name") ??
    (control instanceof HTMLInputElement ||
    control instanceof HTMLTextAreaElement ||
    control instanceof HTMLSelectElement
      ? control.name || undefined
      : undefined);
  let dirty = options.dirty ?? getDataBool(rootElement, "dirty") ?? false;
  let touched = options.touched ?? getDataBool(rootElement, "touched") ?? false;
  let focused = false;
  let filled = getControlValue(control) !== "";
  let forcedInvalid = options.invalid ?? getDataBool(rootElement, "invalid") ?? false;
  let externalErrors: string[] = [];
  let validity: FieldValidityData = { ...DEFAULT_VALIDITY };
  let validationTimer: ReturnType<typeof setTimeout> | null = null;
  let validationVersion = 0;

  const allStateElements = () => [
    rootElement,
    ...labels,
    ...descriptions,
    ...errors,
    ...items,
    ...validityViews,
  ];

  const updateValidityViews = () => {
    for (const view of validityViews) {
      view.dataset.valid = String(validity.valid && !forcedInvalid);
      view.dataset.error = validity.error;
      view.dataset.errors = JSON.stringify(validity.errors);
    }
  };

  const sync = () => {
    const invalid = forcedInvalid || !validity.valid;
    const valid = !invalid;
    for (const el of allStateElements()) {
      applyStateAttrs(el, { disabled, touched, dirty, valid, invalid, filled, focused });
    }

    if (control) {
      if (disabled && "disabled" in control) {
        (
          control as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | HTMLButtonElement
        ).disabled = true;
      }
      if (
        name &&
        (control instanceof HTMLInputElement ||
          control instanceof HTMLTextAreaElement ||
          control instanceof HTMLSelectElement)
      ) {
        control.name = name;
      }
      const labelIds = labels.map((label) => ensureId(label, "field-label"));
      const messageIds = [...descriptions, ...(invalid ? errors : [])].map((message) =>
        ensureId(message, "field-message"),
      );
      const labelledBy = mergeIdRefs(control.getAttribute("aria-labelledby"), labelIds.join(" "));
      const describedBy = mergeIdRefs(
        control.getAttribute("aria-describedby"),
        messageIds.join(" "),
      );
      if (labelledBy) control.setAttribute("aria-labelledby", labelledBy);
      if (describedBy) control.setAttribute("aria-describedby", describedBy);
      else control.removeAttribute("aria-describedby");
      control.setAttribute("aria-invalid", invalid ? "true" : "false");
      if (labels.length > 0) {
        const controlId = ensureId(control, "field-control");
        for (const label of labels) {
          if (label instanceof HTMLLabelElement) label.htmlFor = controlId;
        }
      }
    }

    for (const error of errors) {
      const match = error.dataset["match"];
      const shouldShow = match
        ? Boolean((validity as unknown as Record<string, unknown>)[match])
        : invalid;
      error.hidden = !shouldShow;
      if (shouldShow && error.textContent?.trim() === "" && validity.errors.length > 0) {
        setText(error, validity.errors);
      }
    }

    updateValidityViews();
  };

  const commitValidity = (nextValidity: FieldValidityData) => {
    const previousValid = validity.valid && !forcedInvalid;
    validity = nextValidity;
    const nextValid = validity.valid && !forcedInvalid;
    sync();
    if (previousValid !== nextValid) {
      emit(rootElement, "field:validity-change", { valid: nextValid, validity });
      onValidityChange?.(nextValid);
    }
  };

  const runValidation = async (): Promise<FieldValidityData> => {
    const version = ++validationVersion;
    const nativeValidity = getNativeValidity(control);
    const customErrors = validate
      ? normalizeValidationResult(await validate(getControlValue(control), control ?? rootElement))
      : [];
    if (version !== validationVersion) return validity;

    const nextValidity: FieldValidityData = {
      ...nativeValidity,
      customError:
        nativeValidity.customError || customErrors.length > 0 || externalErrors.length > 0,
      valid: nativeValidity.valid && customErrors.length === 0 && externalErrors.length === 0,
      errors: [...nativeValidity.errors, ...customErrors, ...externalErrors],
      error: [...nativeValidity.errors, ...customErrors, ...externalErrors][0] ?? "",
    };
    commitValidity(nextValidity);
    return nextValidity;
  };

  const scheduleValidation = () => {
    if (validationTimer) clearTimeout(validationTimer);
    if (validationDebounceTime > 0) {
      validationTimer = setTimeout(() => void runValidation(), validationDebounceTime);
    } else {
      void runValidation();
    }
  };

  if (control) {
    cleanups.push(
      on(control, "input", () => {
        dirty = true;
        filled = getControlValue(control) !== "";
        sync();
        emit(rootElement, "field:change", { value: getControlValue(control), dirty, filled });
        if (validationMode === "onChange") scheduleValidation();
      }),
      on(control, "change", () => {
        dirty = true;
        filled = getControlValue(control) !== "";
        sync();
        if (validationMode === "onChange") scheduleValidation();
      }),
      on(control, "focus", () => {
        focused = true;
        sync();
      }),
      on(control, "blur", () => {
        focused = false;
        touched = true;
        sync();
        if (validationMode === "onBlur") scheduleValidation();
      }),
    );

    const form = control.closest("form");
    if (form) {
      cleanups.push(
        on(form, "submit", () => {
          touched = true;
          sync();
          if (validationMode === "onSubmit") scheduleValidation();
        }),
        on(form, "reset", () => {
          queueMicrotask(() => {
            dirty = false;
            touched = false;
            filled = getControlValue(control) !== "";
            forcedInvalid = options.invalid ?? getDataBool(rootElement, "invalid") ?? false;
            externalErrors = [];
            commitValidity({ ...DEFAULT_VALIDITY });
          });
        }),
      );
    }
  }

  cleanups.push(
    on(rootElement, "field:validate", () => {
      void runValidation();
    }),
    on(rootElement, "field:set-invalid", (event) => {
      const detail = (event as CustomEvent).detail;
      forcedInvalid = true;
      externalErrors = Array.isArray(detail?.error)
        ? detail.error
        : detail?.error
          ? [String(detail.error)]
          : [];
      commitValidity({
        ...validity,
        valid: false,
        customError: true,
        errors: externalErrors,
        error: externalErrors[0] ?? "",
      });
    }),
    on(rootElement, "field:clear-invalid", () => {
      forcedInvalid = false;
      externalErrors = [];
      void runValidation();
    }),
  );

  sync();

  const controller: FieldController = {
    get name() {
      return name;
    },
    get valid() {
      return validity.valid && !forcedInvalid;
    },
    get invalid() {
      return forcedInvalid || !validity.valid;
    },
    get dirty() {
      return dirty;
    },
    get touched() {
      return touched;
    },
    get filled() {
      return filled;
    },
    get focused() {
      return focused;
    },
    get validity() {
      return validity;
    },
    validate: runValidation,
    setInvalid: (invalid, error) => {
      forcedInvalid = invalid;
      externalErrors = invalid ? (Array.isArray(error) ? error : error ? [error] : []) : [];
      commitValidity({
        ...validity,
        valid: !invalid && validity.valid,
        customError: invalid || validity.customError,
        errors: externalErrors.length ? externalErrors : validity.errors,
        error: externalErrors[0] ?? validity.error,
      });
    },
    clearInvalid: () => {
      forcedInvalid = false;
      externalErrors = [];
      void runValidation();
    },
    destroy: () => {
      if (validationTimer) clearTimeout(validationTimer);
      cleanups.forEach((cleanup) => cleanup());
      cleanups.length = 0;
      clearRootBinding(rootElement, ROOT_BINDING_KEY, controller);
    },
  };

  setRootBinding(rootElement, ROOT_BINDING_KEY, controller);
  return controller;
}

export function create(scope: ParentNode = document): FieldController[] {
  const controllers: FieldController[] = [];
  for (const root of getRoots(scope, "field")) {
    if (hasRootBinding(root, ROOT_BINDING_KEY)) continue;
    controllers.push(createField(root));
  }
  return controllers;
}
