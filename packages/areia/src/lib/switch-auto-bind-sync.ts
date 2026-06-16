import { effect } from "alien-signals";
import type { SignalAccessor } from "ilha";
import { lookupSwitchCheckedBindByName } from "$lib/binds";

type SwitchAutoRuntime = {
  controller: {
    checked: boolean;
    setChecked: (checked: boolean) => void;
    destroy?: () => void;
  };
  bindSync: { applyFromSignal: () => void } | null;
};

const switchAutoRuntimeByRoot = new WeakMap<Element, SwitchAutoRuntime>();

export function getSwitchAutoRuntime(root: Element): SwitchAutoRuntime | undefined {
  return switchAutoRuntimeByRoot.get(root);
}

export function registerSwitchAutoRuntime(root: Element, runtime: SwitchAutoRuntime): void {
  switchAutoRuntimeByRoot.set(root, runtime);
}

export function unregisterSwitchAutoRuntime(root: Element): void {
  switchAutoRuntimeByRoot.delete(root);
}

const switchBindEffectStops = new WeakMap<Element, () => void>();

function stopSwitchBindEffect(root: Element): void {
  switchBindEffectStops.get(root)?.();
  switchBindEffectStops.delete(root);
}

/** Keep slots UI in sync when Ilha re-renders without remorphing the switch subtree. */
export function attachSwitchAutoBindSignalEffect(
  root: Element,
  bindChecked: SignalAccessor<boolean> | undefined,
): void {
  stopSwitchBindEffect(root);
  if (!bindChecked) return;

  const stop = effect(() => {
    const runtime = switchAutoRuntimeByRoot.get(root);
    if (!runtime) return;
    runtime.bindSync?.applyFromSignal();
  });

  switchBindEffectStops.set(root, stop);
}

/** Ilha `bind:checked` can update the hidden input without going through slots — remount when desynced. */
export function destroySwitchAutoRuntimeIfDesynced(root: Element): boolean {
  const runtime = switchAutoRuntimeByRoot.get(root);
  if (!runtime) return false;
  const input = root.querySelector<HTMLInputElement>('[data-slot="switch-input"]');
  if (!input) return false;
  const domChecked = input.checked;
  const slotsChecked = runtime.controller.checked;
  const aria = root.getAttribute("aria-checked");
  const ariaChecked = aria === "true";
  if (domChecked === slotsChecked && (!aria || ariaChecked === slotsChecked)) {
    return false;
  }
  stopSwitchBindEffect(root);
  runtime.controller.destroy?.();
  unregisterSwitchAutoRuntime(root);
  return true;
}

export function syncAllSwitchAutoBindFromNamedRegistry(doc: Document): void {
  for (const root of doc.querySelectorAll<HTMLElement>('[data-areia-switch][data-slot="switch"]')) {
    const runtime = switchAutoRuntimeByRoot.get(root);
    if (!runtime) continue;
    const name =
      root.getAttribute("data-name") ??
      root.querySelector<HTMLInputElement>('[data-slot="switch-input"]')?.name;
    const entry = lookupSwitchCheckedBindByName(doc, name ?? undefined);
    if (entry?.bindChecked) {
      attachSwitchAutoBindSignalEffect(root, entry.bindChecked);
    }
    runtime.bindSync?.applyFromSignal();
  }
}
