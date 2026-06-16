import ilha from "ilha";
import { ensureSwitchCheckedAutoBindAfterIlhaMount } from "$components/switch/index";

const ISLAND_MOUNT_INTERNAL = Symbol.for("ilha.islandMountInternal");
const AREIA_MOUNT_PATCHED = Symbol.for("areia.ilhaMountPatched");

let installed = false;

function scheduleSwitchAutoBindPasses(doc: Document) {
  ensureSwitchCheckedAutoBindAfterIlhaMount(doc);
  queueMicrotask(() => ensureSwitchCheckedAutoBindAfterIlhaMount(doc));
  requestAnimationFrame(() => ensureSwitchCheckedAutoBindAfterIlhaMount(doc));
}

function patchIslandRegistry(registry: Record<string, unknown>) {
  for (const island of Object.values(registry)) {
    if (!island || typeof island !== "function") continue;
    const rec = island as unknown as Record<symbol, unknown>;
    if (rec[AREIA_MOUNT_PATCHED]) continue;
    rec[AREIA_MOUNT_PATCHED] = true;

    const islandObj = island as unknown as {
      mount?: (host: Element, props?: unknown) => unknown;
    };
    const originalMount = islandObj.mount;
    if (typeof originalMount !== "function") continue;

    const internal = rec[ISLAND_MOUNT_INTERNAL] as
      | ((
          host: Element,
          props?: Record<string, unknown>,
        ) => {
          unmount: () => void;
          updateProps: (p?: Record<string, unknown>) => void;
        })
      | undefined;

    islandObj.mount = function (host: Element, props?: unknown) {
      const teardown = originalMount.call(island, host, props);
      const doc = host.ownerDocument ?? globalThis.document;
      scheduleSwitchAutoBindPasses(doc);
      return teardown;
    };

    if (internal) {
      rec[ISLAND_MOUNT_INTERNAL] = (host: Element, props?: Record<string, unknown>) => {
        const handle = internal(host, props);
        const doc = host.ownerDocument ?? globalThis.document;
        const updateProps = handle.updateProps;
        handle.updateProps = (next?: Record<string, unknown>) => {
          updateProps(next);
          queueMicrotask(() => ensureSwitchCheckedAutoBindAfterIlhaMount(doc));
        };
        scheduleSwitchAutoBindPasses(doc);
        return handle;
      };
    }
  }
}

/**
 * Re-run switch `bind:checked` auto-mount after Ilha `mount()` and child island updates.
 */
export function installIlhaCheckedControlAutoBindHooks(): void {
  if (installed || typeof globalThis.document === "undefined") return;
  installed = true;

  const mountAll = ilha.mount.bind(ilha);

  ilha.mount = (registry, options) => {
    patchIslandRegistry(registry as Record<string, unknown>);
    const result = mountAll(registry, options);
    const root = options?.root;
    const doc = root?.ownerDocument ?? globalThis.document;
    scheduleSwitchAutoBindPasses(doc);
    return result;
  };
}

installIlhaCheckedControlAutoBindHooks();
