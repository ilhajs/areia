import { effect } from "alien-signals";
import type { SignalAccessor } from "ilha";
import { Checkbox as CheckboxPrimitive } from "@areia/slots";
import type { createCheckedBindSync } from "$lib/binds";

export type CheckboxAutoRuntime = {
  controller: CheckboxPrimitive.CheckboxController;
  bindSync: ReturnType<typeof createCheckedBindSync>;
};

const checkboxAutoRuntimeByRoot = new WeakMap<Element, CheckboxAutoRuntime>();

export function getCheckboxAutoRuntime(root: Element): CheckboxAutoRuntime | undefined {
  return checkboxAutoRuntimeByRoot.get(root);
}

export function registerCheckboxAutoRuntime(root: Element, runtime: CheckboxAutoRuntime): void {
  checkboxAutoRuntimeByRoot.set(root, runtime);
}

export function unregisterCheckboxAutoRuntime(root: Element): void {
  checkboxAutoRuntimeByRoot.delete(root);
}

const checkboxBindEffectStops = new WeakMap<Element, () => void>();

function stopCheckboxBindEffect(root: Element): void {
  checkboxBindEffectStops.get(root)?.();
  checkboxBindEffectStops.delete(root);
}

/** Keep slots UI in sync when Ilha re-renders without remorphing the checkbox subtree. */
export function attachCheckboxAutoBindSignalEffect(
  root: Element,
  bindChecked: SignalAccessor<boolean> | undefined,
): void {
  stopCheckboxBindEffect(root);
  if (!bindChecked) return;

  const stop = effect(() => {
    const runtime = checkboxAutoRuntimeByRoot.get(root);
    if (!runtime) return;
    runtime.bindSync?.applyFromSignal();
  });

  checkboxBindEffectStops.set(root, stop);
}

/** Ilha `bind:checked` can update the hidden input without going through slots — remount when desynced. */
export function destroyCheckboxAutoRuntimeIfDesynced(root: Element): boolean {
  const runtime = checkboxAutoRuntimeByRoot.get(root);
  if (!runtime) return false;
  const input = root.querySelector<HTMLInputElement>('[data-slot="checkbox-input"]');
  if (!input) return false;
  const domChecked = input.checked;
  const slotsChecked = runtime.controller.checked;
  const aria = root.getAttribute("aria-checked");
  const ariaChecked = aria === "true";
  if (domChecked === slotsChecked && (!aria || ariaChecked === slotsChecked)) {
    return false;
  }
  stopCheckboxBindEffect(root);
  runtime.controller.destroy();
  unregisterCheckboxAutoRuntime(root);
  return true;
}
