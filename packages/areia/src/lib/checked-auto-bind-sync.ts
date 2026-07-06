import { effect } from "alien-signals";
import type { SignalAccessor } from "ilha";

export type CheckedAutoController = {
  checked: boolean;
  setChecked: (checked: boolean) => void;
  destroy?: () => void;
};

export type CheckedAutoRuntime<TController extends CheckedAutoController = CheckedAutoController> =
  {
    controller: TController;
    bindSync: { applyFromSignal: () => void } | null;
  };

/** Shared auto-mount runtime registry for checked controls (checkbox, switch). */
export function createCheckedAutoBindRegistry<TRuntime extends CheckedAutoRuntime>(
  inputSlot: string,
) {
  const runtimeByRoot = new WeakMap<Element, TRuntime>();
  const effectStops = new WeakMap<Element, () => void>();

  function stopEffect(root: Element): void {
    effectStops.get(root)?.();
    effectStops.delete(root);
  }

  return {
    get(root: Element): TRuntime | undefined {
      return runtimeByRoot.get(root);
    },
    register(root: Element, runtime: TRuntime): void {
      runtimeByRoot.set(root, runtime);
    },
    unregister(root: Element): void {
      runtimeByRoot.delete(root);
    },
    /** Keep slots UI in sync when Ilha re-renders without remorphing the control subtree. */
    attachSignalEffect(root: Element, bindChecked: SignalAccessor<boolean> | undefined): void {
      stopEffect(root);
      if (!bindChecked) return;

      const stop = effect(() => {
        const runtime = runtimeByRoot.get(root);
        if (!runtime) return;
        runtime.bindSync?.applyFromSignal();
      });

      effectStops.set(root, stop);
    },
    /** Ilha `bind:checked` can update the hidden input without going through slots — remount when desynced. */
    destroyIfDesynced(root: Element): boolean {
      const runtime = runtimeByRoot.get(root);
      if (!runtime) return false;
      const input = root.querySelector<HTMLInputElement>(`[data-slot="${inputSlot}"]`);
      if (!input) return false;
      const domChecked = input.checked;
      const slotsChecked = runtime.controller.checked;
      const aria = root.getAttribute("aria-checked");
      if (domChecked === slotsChecked && (!aria || (aria === "true") === slotsChecked)) {
        return false;
      }
      stopEffect(root);
      runtime.controller.destroy?.();
      runtimeByRoot.delete(root);
      return true;
    },
  };
}
