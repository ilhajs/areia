import {
  getParts,
  getRoots,
  getDataNumber,
  getDataString,
  reuseRootBinding,
  hasRootBinding,
  setRootBinding,
  clearRootBinding,
  ensureId,
  emit,
  on,
} from "../core";

export type ProgressStatus = "indeterminate" | "progressing" | "complete";

export interface ProgressOptions {
  /** Current value. Null/undefined means indeterminate. */
  value?: number | null;
  /** Minimum value. @default 0 */
  min?: number;
  /** Maximum value. @default 100 */
  max?: number;
  /** Locale used by Intl.NumberFormat. */
  locale?: Intl.LocalesArgument;
  /** Number formatting options for the value slot. */
  format?: Intl.NumberFormatOptions;
  /** Human-readable aria-valuetext formatter. */
  getAriaValueText?: (formattedValue: string | null, value: number | null) => string;
  /** Called when value changes. */
  onValueChange?: (value: number | null) => void;
}

export interface ProgressSetDetail {
  value?: number | null;
  min?: number;
  max?: number;
}

export interface ProgressController {
  readonly value: number | null;
  readonly min: number;
  readonly max: number;
  readonly status: ProgressStatus;
  readonly percent: number | null;
  setValue(value: number | null): void;
  set(detail: ProgressSetDetail): void;
  destroy(): void;
}

const ROOT_BINDING_KEY = "@areia/slots:Progress";
const DUPLICATE_BINDING_WARNING =
  "[@areia/slots:Progress] createProgress() called more than once for the same root. Returning the existing controller. Destroy it before rebinding with new options.";

function setPresence(el: Element, attr: string, present: boolean): void {
  if (present) el.setAttribute(attr, "");
  else el.removeAttribute(attr);
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function valueToPercent(value: number, min: number, max: number): number {
  if (max === min) return 100;
  return ((value - min) / (max - min)) * 100;
}

function parseValue(value: unknown): number | null | undefined {
  if (value == null || value === "") return null;
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : null;
}

function formatValue(
  value: number | null,
  locale?: Intl.LocalesArgument,
  format?: Intl.NumberFormatOptions,
): string | null {
  if (value == null) return null;
  return new Intl.NumberFormat(locale, format).format(value);
}

function getDefaultAriaValueText(formattedValue: string | null, value: number | null): string {
  if (value == null) return "indeterminate progress";
  return formattedValue || `${value}%`;
}

function applyStatusAttrs(el: Element, status: ProgressStatus): void {
  setPresence(el, "data-indeterminate", status === "indeterminate");
  setPresence(el, "data-progressing", status === "progressing");
  setPresence(el, "data-complete", status === "complete");
  (el as HTMLElement).dataset.state = status;
}

export function createProgress(root: Element, options: ProgressOptions = {}): ProgressController {
  const existingController = reuseRootBinding<ProgressController>(
    root,
    ROOT_BINDING_KEY,
    DUPLICATE_BINDING_WARNING,
  );
  if (existingController) return existingController;

  const rootElement = root as HTMLElement;
  const labels = getParts<HTMLElement>(rootElement, "progress-label");
  const tracks = getParts<HTMLElement>(rootElement, "progress-track");
  const indicators = getParts<HTMLElement>(rootElement, "progress-indicator");
  const values = getParts<HTMLElement>(rootElement, "progress-value");
  const cleanups: Array<() => void> = [];

  let min = options.min ?? getDataNumber(rootElement, "min") ?? 0;
  let max = options.max ?? getDataNumber(rootElement, "max") ?? 100;
  if (max < min) [min, max] = [max, min];

  const locale = options.locale ?? getDataString(rootElement, "locale");
  const format = options.format;
  const getAriaValueText = options.getAriaValueText ?? getDefaultAriaValueText;
  const onValueChange = options.onValueChange;

  const initialValue =
    options.value !== undefined
      ? options.value
      : parseValue(rootElement.dataset["value"] ?? rootElement.getAttribute("aria-valuenow"));
  let currentValue = initialValue == null ? null : clamp(initialValue, min, max);

  const getStatus = (): ProgressStatus => {
    if (currentValue == null || !Number.isFinite(currentValue)) return "indeterminate";
    return currentValue >= max ? "complete" : "progressing";
  };

  const getPercent = (): number | null => {
    if (currentValue == null || !Number.isFinite(currentValue)) return null;
    return clamp(valueToPercent(currentValue, min, max), 0, 100);
  };

  const allParts = () => [rootElement, ...labels, ...tracks, ...indicators, ...values];

  const sync = () => {
    const status = getStatus();
    const percent = getPercent();
    const formatted = formatValue(currentValue, locale, format);

    rootElement.setAttribute("role", "progressbar");
    rootElement.setAttribute("aria-valuemin", String(min));
    rootElement.setAttribute("aria-valuemax", String(max));
    if (currentValue == null) {
      rootElement.removeAttribute("aria-valuenow");
    } else {
      rootElement.setAttribute("aria-valuenow", String(currentValue));
    }
    rootElement.setAttribute("aria-valuetext", getAriaValueText(formatted, currentValue));

    if (labels.length > 0) {
      const labelId = ensureId(labels[0]!, "progress-label");
      rootElement.setAttribute("aria-labelledby", labelId);
      for (const label of labels) {
        label.setAttribute("role", "presentation");
      }
    }

    rootElement.dataset.value = currentValue == null ? "" : String(currentValue);
    rootElement.dataset.min = String(min);
    rootElement.dataset.max = String(max);
    if (percent == null) {
      delete rootElement.dataset.percent;
    } else {
      rootElement.dataset.percent = String(percent);
    }

    for (const part of allParts()) {
      applyStatusAttrs(part, status);
    }

    for (const track of tracks) {
      track.setAttribute("aria-hidden", "true");
    }

    for (const indicator of indicators) {
      if (percent == null) {
        indicator.style.removeProperty("inset-inline-start");
        indicator.style.removeProperty("height");
        indicator.style.removeProperty("width");
        delete indicator.dataset.percent;
      } else {
        indicator.style.insetInlineStart = "0px";
        indicator.style.height = "inherit";
        indicator.style.width = `${percent}%`;
        indicator.dataset.percent = String(percent);
      }
    }

    for (const valueEl of values) {
      valueEl.setAttribute("aria-hidden", "true");
      valueEl.textContent = formatted ?? "";
    }
  };

  const update = (next: ProgressSetDetail, emitChange = true) => {
    const previousValue = currentValue;
    if (typeof next.min === "number" && Number.isFinite(next.min)) min = next.min;
    if (typeof next.max === "number" && Number.isFinite(next.max)) max = next.max;
    if (max < min) [min, max] = [max, min];
    if ("value" in next) {
      currentValue =
        next.value == null || !Number.isFinite(next.value) ? null : clamp(next.value, min, max);
    } else if (currentValue != null) {
      currentValue = clamp(currentValue, min, max);
    }
    sync();
    if (emitChange && previousValue !== currentValue) {
      emit(rootElement, "progress:value-change", {
        value: currentValue,
        previousValue,
        percent: getPercent(),
        status: getStatus(),
      });
      onValueChange?.(currentValue);
    }
  };

  cleanups.push(
    on(rootElement, "progress:set", (event) => {
      const detail = (event as CustomEvent).detail;
      if (typeof detail === "number" || detail == null) {
        update({ value: detail });
      } else {
        update(detail);
      }
    }),
  );

  sync();

  const controller: ProgressController = {
    get value() {
      return currentValue;
    },
    get min() {
      return min;
    },
    get max() {
      return max;
    },
    get status() {
      return getStatus();
    },
    get percent() {
      return getPercent();
    },
    setValue: (value) => update({ value }),
    set: (detail) => update(detail),
    destroy: () => {
      cleanups.forEach((cleanup) => cleanup());
      cleanups.length = 0;
      clearRootBinding(rootElement, ROOT_BINDING_KEY, controller);
    },
  };

  setRootBinding(rootElement, ROOT_BINDING_KEY, controller);
  return controller;
}

export function create(scope: ParentNode = document): ProgressController[] {
  const controllers: ProgressController[] = [];
  for (const root of getRoots(scope, "progress")) {
    if (hasRootBinding(root, ROOT_BINDING_KEY)) continue;
    controllers.push(createProgress(root));
  }
  return controllers;
}
