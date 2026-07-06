import type { SignalAccessor } from "ilha";
import { Checkbox as CheckboxPrimitive } from "@areia/slots";
import type { createCheckedBindSync } from "$lib/binds";
import { createCheckedAutoBindRegistry } from "$lib/checked-auto-bind-sync";

export type CheckboxAutoRuntime = {
  controller: CheckboxPrimitive.CheckboxController;
  bindSync: ReturnType<typeof createCheckedBindSync>;
};

const registry = createCheckedAutoBindRegistry<CheckboxAutoRuntime>("checkbox-input");

export function getCheckboxAutoRuntime(root: Element): CheckboxAutoRuntime | undefined {
  return registry.get(root);
}

export function registerCheckboxAutoRuntime(root: Element, runtime: CheckboxAutoRuntime): void {
  registry.register(root, runtime);
}

export function unregisterCheckboxAutoRuntime(root: Element): void {
  registry.unregister(root);
}

export function attachCheckboxAutoBindSignalEffect(
  root: Element,
  bindChecked: SignalAccessor<boolean> | undefined,
): void {
  registry.attachSignalEffect(root, bindChecked);
}

export function destroyCheckboxAutoRuntimeIfDesynced(root: Element): boolean {
  return registry.destroyIfDesynced(root);
}
