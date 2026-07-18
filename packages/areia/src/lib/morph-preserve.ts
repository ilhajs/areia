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
];

const MORPH_PRESERVE_ATTR = "data-morph-preserve";

function stampElement(el: Element): void {
  const existing = el.getAttribute(MORPH_PRESERVE_ATTR);
  if (existing === null) {
    el.setAttribute(MORPH_PRESERVE_ATTR, CONTROLLER_OWNED_ATTRS.join(" "));
    return;
  }
  const tokens = new Set(existing.split(/\s+/).filter(Boolean));
  for (const attr of CONTROLLER_OWNED_ATTRS) tokens.add(attr);
  el.setAttribute(MORPH_PRESERVE_ATTR, [...tokens].join(" "));
}

function stampTree(root: Element): void {
  if (root.hasAttribute("data-slot")) stampElement(root);
  for (const el of root.querySelectorAll("[data-slot]")) stampElement(el);
}

const observedRoots = new WeakSet<Element>();

/**
 * Mark `root` and its `[data-slot]` parts so ilha morphs keep controller-owned
 * attributes. Call whenever a controller takes ownership of `root`'s subtree.
 * Existing `data-morph-preserve` tokens (user-provided) are merged, not
 * clobbered, and ilha never lets a template strip the marker itself.
 *
 * Re-renders can insert fresh `[data-slot]` elements (morph clones of template
 * markup that lack the marker); a subtree observer stamps those as they
 * appear. The observer lives as long as the subtree — it becomes collectible
 * together with `root` once the element is dropped.
 */
export function stampMorphPreserve(root: Element | null | undefined): void {
  if (!root) return;
  stampTree(root);
  if (observedRoots.has(root) || typeof MutationObserver === "undefined") return;
  observedRoots.add(root);
  const observer = new MutationObserver((records) => {
    for (const record of records) {
      for (const node of record.addedNodes) {
        if (node instanceof Element) stampTree(node);
      }
    }
  });
  observer.observe(root, { childList: true, subtree: true });
}
