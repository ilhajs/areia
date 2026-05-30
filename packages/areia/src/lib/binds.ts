import { html, type RawHtml, type SignalAccessor } from "ilha";

export const BIND_PROP_NAMES = [
  "bind:value",
  "bind:valueAsNumber",
  "bind:valueAsDate",
  "bind:checked",
  "bind:group",
  "bind:open",
  "bind:files",
  "bind:this",
] as const;

export type BindPropName = (typeof BIND_PROP_NAMES)[number];

export type GroupBindAccessor =
  | SignalAccessor<string>
  | SignalAccessor<string[]>
  | SignalAccessor<string | string[] | number | boolean | null>;

export type IlhaBindProps = {
  "bind:value"?: SignalAccessor<string>;
  "bind:valueAsNumber"?: SignalAccessor<number | null>;
  "bind:valueAsDate"?: SignalAccessor<Date | null>;
  "bind:checked"?: SignalAccessor<boolean>;
  "bind:group"?: GroupBindAccessor;
  "bind:open"?: SignalAccessor<boolean>;
  "bind:files"?: SignalAccessor<FileList | null>;
  "bind:this"?: SignalAccessor<HTMLElement | null>;
};

export type OmitBindProps<T> = {
  [K in keyof T as K extends BindPropName ? never : K]: T[K];
};

export function isBindProp(key: string): key is BindPropName {
  return key.startsWith("bind:");
}

export function splitBindProps<T extends Record<string, unknown>>(input: T) {
  const binds: Partial<Record<BindPropName, unknown>> = {};
  const attrs: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(input)) {
    if (isBindProp(key)) binds[key as BindPropName] = value;
    else attrs[key] = value;
  }

  return { binds, attrs: attrs as OmitBindProps<T> };
}

function templateChunks(chunks: string[], values: unknown[]): RawHtml {
  const tpl = Object.assign([...chunks], { raw: [...chunks] }) as TemplateStringsArray;
  return html(tpl, ...values);
}

function appendBinds(chunks: string[], values: unknown[], binds: Record<string, unknown>) {
  for (const [name, value] of Object.entries(binds)) {
    if (value == null) continue;
    chunks[chunks.length - 1] += ` ${name}=`;
    values.push(value);
    chunks.push("");
  }
}

function normalizeVoidSuffix(staticSuffix: string, hasBinds: boolean) {
  if (!hasBinds || !/\/>\s*$/.test(staticSuffix)) return staticSuffix;
  return staticSuffix.replace(/\/>\s*$/, ">");
}

/** Render a void element with optional ilha `bind:*` directives. */
export function boundVoidElement(
  tag: string,
  binds: Record<string, unknown>,
  staticSuffix: string,
): RawHtml {
  const hasBinds = Object.values(binds).some((value) => value != null);
  const chunks: string[] = [`<${tag}`];
  const values: unknown[] = [];
  appendBinds(chunks, values, binds);
  chunks[chunks.length - 1] += normalizeVoidSuffix(staticSuffix, hasBinds);
  return templateChunks(chunks, values);
}

/** Render an element with optional ilha `bind:*` directives and inner HTML. */
export function boundElement(
  tag: string,
  binds: Record<string, unknown>,
  openSuffix: string,
  inner: unknown,
  closeTag = `</${tag}>`,
): RawHtml {
  const chunks: string[] = [`<${tag}`];
  const values: unknown[] = [];
  appendBinds(chunks, values, binds);
  chunks[chunks.length - 1] += `${openSuffix}>`;
  values.push(inner);
  chunks.push(closeTag);
  return templateChunks(chunks, values);
}

export function getBindAccessor<T>(
  input: Record<string, unknown>,
  key: BindPropName,
): SignalAccessor<T> | undefined {
  const value = input[key];
  if (typeof value !== "function") return undefined;
  return value as SignalAccessor<T>;
}

/** Read bind accessors so ilha `.effect()` tracks signal dependencies. */
export function subscribeBindProps(input: Record<string, unknown>) {
  for (const key of BIND_PROP_NAMES) {
    getBindAccessor(input, key)?.();
  }
}

export type CheckedBindSync = {
  applyFromSignal: () => void;
  onUserChange: (checked: boolean) => void;
};

/** Bridge ilha checked/group bindings to custom checkbox-like controls. */
export function createCheckedBindSync(
  input: Record<string, unknown>,
  controller: { checked: boolean; setChecked: (checked: boolean, indeterminate?: boolean) => void },
  itemValue?: string,
): CheckedBindSync | null {
  const bindGroup = getBindAccessor<string | string[] | number | boolean | null>(
    input,
    "bind:group",
  );
  const bindChecked = getBindAccessor<boolean>(input, "bind:checked");

  if (bindGroup && itemValue !== undefined) {
    return {
      applyFromSignal: () => {
        const current = bindGroup();
        const selected = Array.isArray(current) ? current.map(String) : current;
        controller.setChecked(
          Array.isArray(selected) ? selected.includes(itemValue) : String(selected) === itemValue,
        );
      },
      onUserChange: (checked) => {
        const current = bindGroup();
        if (Array.isArray(current)) {
          const arr = [...current.map(String)];
          const idx = arr.indexOf(itemValue);
          if (checked && idx === -1) arr.push(itemValue);
          if (!checked && idx !== -1) arr.splice(idx, 1);
          bindGroup(arr);
          return;
        }
        if (checked) bindGroup(itemValue);
      },
    };
  }

  if (bindChecked) {
    return {
      applyFromSignal: () => controller.setChecked(Boolean(bindChecked())),
      onUserChange: (checked) => bindChecked(checked),
    };
  }

  return null;
}

export type OpenBindController = {
  readonly isOpen: boolean;
  open: () => void;
  close: () => void;
};

export type OpenBindSync = {
  applyFromSignal: () => void;
  onUserChange: (open: boolean) => void;
};

/** Resolve initial open state from `bind:open` or a fallback prop. */
export function openBindDefault(
  input: Record<string, unknown>,
  fallback?: boolean,
): boolean | undefined {
  const bindOpen = getBindAccessor<boolean>(input, "bind:open");
  if (bindOpen) return Boolean(bindOpen());
  return fallback;
}

/** Bridge ilha `bind:open` to overlay-style controllers. */
export function createOpenBindSync(
  input: Record<string, unknown>,
  controller: OpenBindController,
): OpenBindSync | null {
  const bindOpen = getBindAccessor<boolean>(input, "bind:open");
  if (!bindOpen) return null;

  let applying = false;

  return {
    applyFromSignal: () => {
      applying = true;
      const open = Boolean(bindOpen());
      if (open && !controller.isOpen) controller.open();
      else if (!open && controller.isOpen) controller.close();
      applying = false;
    },
    onUserChange: (open: boolean) => {
      if (applying) return;
      if (Boolean(bindOpen()) !== open) bindOpen(open);
    },
  };
}

export type GroupBindMode = "single" | "multiple";

export type GroupBindSync = {
  applyFromSignal: () => void;
  onUserChange: (value: string | string[] | null) => void;
};

function signalToControllerValue(
  value: string | string[] | number | boolean | null | undefined,
  mode: GroupBindMode,
): string | string[] | null {
  if (value == null) return mode === "multiple" ? [] : null;
  if (Array.isArray(value)) return value.map(String);
  if (mode === "multiple") return [String(value)];
  return String(value);
}

function controllerToSignalValue(
  value: string | string[] | null,
  mode: GroupBindMode,
): string | string[] | null {
  if (value == null) return null;
  if (mode === "multiple") return Array.isArray(value) ? value : [value];
  if (Array.isArray(value)) return value[0] ?? null;
  return value;
}

function groupValuesEqual(a: string | string[] | null, b: string | string[] | null): boolean {
  if (a === b) return true;
  if (a == null || b == null) return false;
  const aArr = Array.isArray(a) ? a : [a];
  const bArr = Array.isArray(b) ? b : [b];
  return aArr.length === bArr.length && aArr.every((item, index) => item === bArr[index]);
}

/** Resolve initial value from `bind:group` or a fallback prop. */
export function groupBindDefault<T extends string | string[] | undefined>(
  input: Record<string, unknown>,
  fallback?: T,
): T | string | string[] | undefined {
  const bindGroup = getBindAccessor<string | string[] | number | boolean | null>(
    input,
    "bind:group",
  );
  if (bindGroup) {
    const value = bindGroup() as string | string[] | null;
    return value ?? undefined;
  }
  return fallback;
}

/** Bridge ilha `bind:group` to selection controllers (tabs, toggle groups, combobox). */
export function createGroupBindSync(
  input: Record<string, unknown>,
  controller: {
    getValue: () => string | string[] | null;
    setValue: (value: string | string[] | null) => void;
  },
  mode: GroupBindMode = "single",
): GroupBindSync | null {
  const bindGroup = getBindAccessor<string | string[] | number | boolean | null>(
    input,
    "bind:group",
  );
  if (!bindGroup) return null;

  let applying = false;

  return {
    applyFromSignal: () => {
      applying = true;
      const next = signalToControllerValue(bindGroup(), mode);
      if (!groupValuesEqual(next, controller.getValue())) controller.setValue(next);
      applying = false;
    },
    onUserChange: (value: string | string[] | null) => {
      if (applying) return;
      const current = signalToControllerValue(bindGroup(), mode);
      if (!groupValuesEqual(current, value)) {
        bindGroup(
          controllerToSignalValue(value, mode) as string | string[] | number | boolean | null,
        );
      }
    },
  };
}

export type DateBindSync = {
  applyFromSignal: () => void;
  onUserChange: (date: Date | null) => void;
};

/** Bridge ilha `bind:valueAsDate` to date-picker selection (single mode). */
export function createDateBindSync(
  input: Record<string, unknown>,
  controller: {
    getDate: () => Date | null | undefined;
    setDate: (date: Date | null) => void;
  },
): DateBindSync | null {
  const bindDate = getBindAccessor<Date | null>(input, "bind:valueAsDate");
  if (!bindDate) return null;

  let applying = false;

  const sameDay = (a: Date | null | undefined, b: Date | null | undefined) => {
    if (a == null && b == null) return true;
    if (a == null || b == null) return false;
    return a.getTime() === b.getTime();
  };

  return {
    applyFromSignal: () => {
      applying = true;
      const next = bindDate();
      if (!sameDay(next, controller.getDate())) controller.setDate(next);
      applying = false;
    },
    onUserChange: (date: Date | null) => {
      if (applying) return;
      const current = bindDate();
      if (!sameDay(current, date)) bindDate(date);
    },
  };
}

/** Write a mounted element into `bind:this` and clear it on cleanup. */
export function applyThisBind(
  element: HTMLElement | null,
  input: Record<string, unknown>,
): (() => void) | undefined {
  const bindThis = getBindAccessor<HTMLElement | null>(input, "bind:this");
  if (!bindThis) return undefined;
  if (element) bindThis(element);
  return () => bindThis(null);
}
