/**
 * Attributes areia controllers own imperatively. Ilha's morph must neither
 * overwrite nor strip them on re-renders — declared per element via the
 * `data-morph-preserve` opt-in (ilha >= 0.9.4). Mirrors the list ilha used to
 * hardcode for `[data-slot]` elements before the opt-in existed.
 */
const CONTROLLER_OWNED_ATTRS = [
  "data-checked",
  "data-unchecked",
  "data-indeterminate",
  "aria-checked",
  "data-open",
  "data-closed",
  "data-state",
  "aria-expanded",
  "aria-hidden",
  "data-selected",
  "data-panel-open",
  // Value / interaction widgets
  "data-value",
  "data-dragging",
  "data-highlighted",
  "data-orientation",
  "data-disabled",
  "data-side",
  "data-align",
  "data-position",
  "data-collapsed",
  "data-expanded",
  "data-month",
  "data-active",
  "data-align-trigger",
  "aria-valuenow",
  "aria-valuemin",
  "aria-valuemax",
  "aria-valuetext",
  "aria-selected",
  "aria-controls",
  "aria-orientation",
  "aria-disabled",
  "aria-required",
  "aria-haspopup",
  "aria-activedescendant",
  "aria-pressed",
  "hidden",
  "inert",
  "tabindex",
  "role",
];

/**
 * Controllers that write layout/position/size as inline CSS should pass this
 * as the `extra` argument to {@link stampMorphPreserve}. Not part of the
 * default list — most data-slot trees only own discrete attributes.
 */
export const MORPH_CONTROLLER_STYLE = ["style"] as const;

const MORPH_PRESERVE_ATTR = "data-morph-preserve";

/**
 * Merge user-supplied `data-morph-preserve` tokens with required ones.
 * Order is stable: existing tokens first, then any missing required tokens.
 */
export function mergeMorphPreserve(user: unknown, required: readonly string[]): string {
  const tokens = new Set(
    String(user ?? "")
      .split(/\s+/)
      .filter(Boolean),
  );
  for (const t of required) tokens.add(t);
  return [...tokens].join(" ");
}

function stampElement(el: Element, extra: readonly string[] = []): void {
  const required =
    extra.length === 0 ? CONTROLLER_OWNED_ATTRS : [...CONTROLLER_OWNED_ATTRS, ...extra];
  const existing = el.getAttribute(MORPH_PRESERVE_ATTR);
  if (existing === null) {
    el.setAttribute(MORPH_PRESERVE_ATTR, required.join(" "));
    return;
  }
  const tokens = new Set(existing.split(/\s+/).filter(Boolean));
  for (const attr of required) tokens.add(attr);
  el.setAttribute(MORPH_PRESERVE_ATTR, [...tokens].join(" "));
}

function stampTree(root: Element, extra: readonly string[] = []): void {
  if (root.hasAttribute("data-slot")) stampElement(root, extra);
  for (const el of root.querySelectorAll("[data-slot]")) stampElement(el, extra);
}

const observedRoots = new WeakMap<Element, Set<string>>();

/**
 * Mark `root` and its `[data-slot]` parts so ilha morphs keep controller-owned
 * attributes. Call whenever a controller takes ownership of `root`'s subtree.
 * Existing `data-morph-preserve` tokens (user-provided) are merged, not
 * clobbered, and ilha never lets a template strip the marker itself.
 *
 * Pass `extra` for attributes that a specific controller owns beyond the shared
 * list (e.g. {@link MORPH_CONTROLLER_STYLE} for layout/position widgets).
 *
 * Re-renders can insert fresh `[data-slot]` elements (morph clones of template
 * markup that lack the marker); a subtree observer stamps those as they
 * appear. The observer lives as long as the subtree — it becomes collectible
 * together with `root` once the element is dropped.
 */
export function stampMorphPreserve(
  root: Element | null | undefined,
  extra: readonly string[] = [],
): void {
  if (!root) return;
  stampTree(root, extra);

  const prev = observedRoots.get(root);
  if (prev) {
    let changed = false;
    for (const attr of extra) {
      if (!prev.has(attr)) {
        prev.add(attr);
        changed = true;
      }
    }
    // Re-stamp if new extras were requested after the initial observe.
    if (changed) stampTree(root, [...prev]);
    return;
  }

  const extraSet = new Set(extra);
  observedRoots.set(root, extraSet);
  if (typeof MutationObserver === "undefined") return;
  const observer = new MutationObserver((records) => {
    const currentExtra = [...(observedRoots.get(root) ?? extraSet)];
    for (const record of records) {
      for (const node of record.addedNodes) {
        if (node instanceof Element) stampTree(node, currentExtra);
      }
    }
  });
  observer.observe(root, { childList: true, subtree: true });
}
