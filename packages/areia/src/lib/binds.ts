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

export function openBindDefault(
  input: Record<string, unknown>,
  fallback?: boolean,
): boolean | undefined {
  const bindOpen = getBindAccessor<boolean>(input, "bind:open");
  if (bindOpen) return Boolean(bindOpen());
  return fallback;
}

/** Bridge ilha `bind:open` to overlay-style controllers. */

export type GroupBindMode = "single" | "multiple";

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

// ---------------------------------------------------------------------------
// Generic two-way bind bridge
// ---------------------------------------------------------------------------
// One small, typed internal bridge that owns the per-host storage, the
// user-versus-programmatic guard, and the applying-flag, so individual
// components no longer declare a WeakMap, a `subscribeBindProps` effect, or
// an `applying` guard. A config describes one value shape (checked / open /
// selection / date); the bridge itself has no component-specific branches.

export interface BindBridgeSource<Value> {
  /** Whether an external value source (a `bind:*` accessor) is active. */
  active: boolean;
  /** Read the authoritative external value (bind read). */
  readExternal: () => Value;
  /** Write the external value (bind signal write). No-op when inactive. */
  writeExternal: (value: Value) => void;
  /** Read the current controller value. */
  readController: () => Value;
  /** Write the controller value silently (wrapped in the applying guard). */
  writeController: (value: Value) => void;
  /** Optional custom equality between external and controller values. */
  equal?: (a: Value, b: Value) => boolean;
  /** Semantic callback fired exactly once per user interaction. */
  onUserChange?: (value: Value) => void;
  /** Optional cleanup (controller destroy, listeners). Runs on re-create + unmount. */
  dispose?: () => void;
  /**
   * Optional hook called after a successful programmatic controller write
   * (e.g. reposition an indicator). Not called for user-driven writes.
   */
  afterControllerWrite?: () => void;
}

export interface BindBridge<Value = unknown> {
  /**
   * Push the external value into the controller silently (programmatic /
   * controlled sync). Call inside `.effect()` so the read subscribes the
   * effect to the bind signal.
   */
  applyFromSignal(): void;
  /** User-driven change: write the bind once and fire the semantic callback once. */
  onUserChange(value: Value): void;
  /** Release the bridge (idempotent). Runs `source.dispose()`. */
  dispose(): void;
}

const bridgesByHost = new WeakMap<Element, Record<string, BindBridge<unknown>>>();
// ponytail: single module-level WeakMap shared by every component; per-name
// bridges. If one host ever needs unbounded distinct bridges this could become
// a per-name Map, but Areia uses at most two per host today.

export function createBindBridge<Value>(
  host: Element,
  name: string,
  source: BindBridgeSource<Value>,
): BindBridge<Value> {
  const equal = source.equal ?? ((a: Value, b: Value) => a === b);
  let applying = false;
  let disposed = false;

  const bridge: BindBridge<Value> = {
    applyFromSignal: () => {
      if (disposed || !source.active) return;
      const external = source.readExternal();
      if (equal(external, source.readController())) return;
      // Defer the programmatic controller write to a microtask: for controls
      // that also carry a native `bind:*` (e.g. checkbox/switch inputs) the
      // bind write mirrors a user interaction into the signal synchronously,
      // which would otherwise re-enter here with `applying` set and swallow
      // the user's semantic callback. Reading stays synchronous so the calling
      // `.effect()` still subscribes to the bind signal.
      queueMicrotask(() => {
        if (disposed) return;
        applying = true;
        try {
          source.writeController(external);
          source.afterControllerWrite?.();
        } finally {
          applying = false;
        }
      });
    },
    onUserChange: (value) => {
      if (disposed || applying) return;
      if (source.active && !equal(source.readExternal(), value)) {
        source.writeExternal(value);
      }
      source.onUserChange?.(value);
    },
    dispose: () => {
      if (disposed) return;
      disposed = true;
      source.dispose?.();
    },
  };

  let map = bridgesByHost.get(host);
  if (!map) {
    map = {};
    bridgesByHost.set(host, map);
  }
  map[name] = bridge as unknown as BindBridge<unknown>;
  return bridge;
}

/** Look up a bridge by name (typed at the boundary). */
export function getBindBridge<Value = unknown>(
  host: Element,
  name: string,
): BindBridge<Value> | undefined {
  return bridgesByHost.get(host)?.[name] as BindBridge<Value> | undefined;
}

/**
 * Dispose every bridge on a host (or one named bridge). Use the named form
 * *before* creating a controller on a possibly-rebound host, and the host form
 * as the island `.onMount` cleanup. Idempotent.
 */
export function disposeBindBridge(host: Element, name?: string): void {
  const map = bridgesByHost.get(host);
  if (!map) return;
  if (name != null) {
    map[name]?.dispose();
    delete map[name];
    return;
  }
  for (const bridge of Object.values(map)) bridge.dispose();
  bridgesByHost.delete(host);
}

// --- shape configs ----------------------------------------------------------

/** Checked / boolean (checkbox, switch). Supports `bind:checked` and `bind:group`+itemValue. */
export function checkedBindSource<Input extends Record<string, unknown>>(
  input: Input,
  controller: {
    checked: boolean;
    setChecked: (checked: boolean, indeterminate?: boolean) => void;
  },
  opts: {
    itemValue?: string;
    onUserChange?: (checked: boolean) => void;
    destroy?: () => void;
    afterControllerWrite?: () => void;
  } = {},
): BindBridgeSource<boolean> {
  const bindChecked = getBindAccessor<boolean>(input, "bind:checked");
  const bindGroup = getBindAccessor<string | string[] | number | boolean | null>(
    input,
    "bind:group",
  );
  const itemValue = opts.itemValue;
  const usesGroup = Boolean(bindGroup) && itemValue !== undefined;

  const readSelected = (): boolean => {
    if (usesGroup) {
      const current = bindGroup!();
      if (Array.isArray(current)) return current.map(String).includes(itemValue);
      return String(current) === itemValue;
    }
    return Boolean(bindChecked?.());
  };
  const writeSelected = (checked: boolean): void => {
    if (usesGroup) {
      const current = bindGroup!();
      if (Array.isArray(current)) {
        const arr = current.map(String);
        const idx = arr.indexOf(itemValue);
        if (checked && idx === -1) arr.push(itemValue);
        if (!checked && idx !== -1) arr.splice(idx, 1);
        bindGroup!(arr);
      } else if (checked) {
        bindGroup!(itemValue);
      }
      return;
    }
    bindChecked?.(checked);
  };

  return {
    active: Boolean(bindChecked) || usesGroup,
    readExternal: readSelected,
    writeExternal: writeSelected,
    readController: () => controller.checked,
    writeController: (checked) => controller.setChecked(checked),
    onUserChange: opts.onUserChange,
    dispose: opts.destroy,
    afterControllerWrite: opts.afterControllerWrite,
  };
}

/** Open boolean (popover, dialog, collapsible, dropdown, context-menu, hover-card, …). */
export function openBindSource<Input extends Record<string, unknown>>(
  input: Input,
  controller: { isOpen: boolean; open: () => void; close: () => void },
  opts: {
    onUserChange?: (open: boolean) => void;
    destroy?: () => void;
    afterControllerWrite?: () => void;
  } = {},
): BindBridgeSource<boolean> {
  const bindOpen = getBindAccessor<boolean>(input, "bind:open");
  return {
    active: Boolean(bindOpen),
    readExternal: () => Boolean(bindOpen?.()),
    writeExternal: (open) => bindOpen?.(open),
    readController: () => controller.isOpen,
    writeController: (open) => (open ? controller.open() : controller.close()),
    onUserChange: opts.onUserChange,
    dispose: opts.destroy,
    afterControllerWrite: opts.afterControllerWrite,
  };
}

/** Group selection (tabs, toggle-group, combobox single/multiple). `bind:group`. */
export function groupBindSource<Input extends Record<string, unknown>>(
  input: Input,
  controller: {
    getValue: () => string | string[] | null;
    setValue: (value: string | string[] | null) => void;
  },
  opts: {
    mode?: GroupBindMode;
    onUserChange?: (value: string | string[] | null) => void;
    destroy?: () => void;
    afterControllerWrite?: () => void;
  } = {},
): BindBridgeSource<string | string[] | null> {
  const mode = opts.mode ?? "single";
  const bindGroup = getBindAccessor<string | string[] | number | boolean | null>(
    input,
    "bind:group",
  );
  return {
    active: Boolean(bindGroup),
    readExternal: () => signalToControllerValue(bindGroup?.(), mode),
    writeExternal: (value) =>
      bindGroup?.(
        controllerToSignalValue(value, mode) as string | string[] | number | boolean | null,
      ),
    readController: () => controller.getValue(),
    writeController: (value) => controller.setValue(value),
    equal: groupValuesEqual,
    onUserChange: opts.onUserChange,
    dispose: opts.destroy,
    afterControllerWrite: opts.afterControllerWrite,
  };
}

/** Date (date-picker single). `bind:valueAsDate`. */
export function dateBindSource<Input extends Record<string, unknown>>(
  input: Input,
  controller: {
    getDate: () => Date | null | undefined;
    setDate: (date: Date | null) => void;
  },
  opts: {
    onUserChange?: (date: Date | null) => void;
    destroy?: () => void;
    afterControllerWrite?: () => void;
  } = {},
): BindBridgeSource<Date | null> {
  const bindDate = getBindAccessor<Date | null>(input, "bind:valueAsDate");
  const sameDay = (a: Date | null | undefined, b: Date | null | undefined) => {
    if (a == null && b == null) return true;
    if (a == null || b == null) return false;
    return a.getTime() === b.getTime();
  };
  return {
    active: Boolean(bindDate),
    readExternal: () => bindDate?.() ?? null,
    writeExternal: (date) => bindDate?.(date),
    readController: () => controller.getDate() ?? null,
    writeController: (date) => controller.setDate(date),
    equal: sameDay,
    onUserChange: opts.onUserChange,
    dispose: opts.destroy,
    afterControllerWrite: opts.afterControllerWrite,
  };
}
