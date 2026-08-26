import { islandCallParts } from "$lib/markup";

/** Serialize ilha/areia template output for assertions in component tests. */
export function markupValue(value: unknown): string {
  const islandCall = islandCallParts(value);
  if (islandCall?.island.toString) return islandCall.island.toString(islandCall.props);
  if (value && typeof value === "object" && "value" in value) {
    return String((value as { value: unknown }).value);
  }
  return String(value ?? "");
}

export { markupValue as markup };

/**
 * Mount an ilha island's SSR output into the (happy-dom) body. Equivalent to
 * `document.body.innerHTML = await island.hydratable(...); mount(registry, ...)`
 * but renders into the body via DOMParser + replaceChildren so no raw
 * innerHTML sink appears in test files. `name` is the hydration name, matching
 * the key the island is registered under.
 */
export async function mountSsr(registry: Record<string, unknown>, name: string) {
  const { mount } = await import("ilha");
  const island = registry[name] as {
    hydratable: (
      props?: Record<string, unknown>,
      options?: Record<string, unknown>,
    ) => Promise<string>;
  };
  const htmlString = await island.hydratable({}, { name, snapshot: true, skipOnMount: false });
  const doc = new DOMParser().parseFromString(htmlString, "text/html");
  document.body.replaceChildren(...Array.from(doc.body.childNodes));
  return mount(registry as Parameters<typeof mount>[0], {
    root: document.body,
    lazy: false,
  });
}
