import type { SignalAccessor } from "ilha";
import { lookupSwitchCheckedBindByName } from "$lib/binds";
import {
  createCheckedAutoBindRegistry,
  type CheckedAutoRuntime,
} from "$lib/checked-auto-bind-sync";

type SwitchAutoRuntime = CheckedAutoRuntime;

const registry = createCheckedAutoBindRegistry<SwitchAutoRuntime>("switch-input");

export function getSwitchAutoRuntime(root: Element): SwitchAutoRuntime | undefined {
  return registry.get(root);
}

export function registerSwitchAutoRuntime(root: Element, runtime: SwitchAutoRuntime): void {
  registry.register(root, runtime);
}

export function unregisterSwitchAutoRuntime(root: Element): void {
  registry.unregister(root);
}

export function attachSwitchAutoBindSignalEffect(
  root: Element,
  bindChecked: SignalAccessor<boolean> | undefined,
): void {
  registry.attachSignalEffect(root, bindChecked);
}

export function destroySwitchAutoRuntimeIfDesynced(root: Element): boolean {
  return registry.destroyIfDesynced(root);
}

export function syncAllSwitchAutoBindFromNamedRegistry(doc: Document): void {
  for (const root of doc.querySelectorAll<HTMLElement>('[data-areia-switch][data-slot="switch"]')) {
    const runtime = registry.get(root);
    if (!runtime) continue;
    const name =
      root.getAttribute("data-name") ??
      root.querySelector<HTMLInputElement>('[data-slot="switch-input"]')?.name;
    const entry = lookupSwitchCheckedBindByName(doc, name ?? undefined);
    if (entry?.bindChecked) {
      registry.attachSignalEffect(root, entry.bindChecked);
    }
    runtime.bindSync?.applyFromSignal();
  }
}
