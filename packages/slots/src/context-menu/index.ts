import {
  getPart,
  getRoots,
  getDataBool,
  getDataNumber,
  hasRootBinding,
  reuseRootBinding,
  setRootBinding,
  clearRootBinding,
  setAria,
  ensureId,
  on,
  emit,
  computeFloatingPosition,
  computeFloatingTransformOrigin,
  measurePopupContentRect,
  ensureItemVisibleInContainer,
  focusElement,
  createPortalLifecycle,
  containsWithPortals,
} from "../core";

export type ContextMenuItemType = "item" | "radio" | "checkbox";
export type ContextMenuOpenChangeSource = "pointer" | "keyboard" | "programmatic";
export type ContextMenuOpenChangeReason =
  | "trigger"
  | "select"
  | "outside"
  | "escape"
  | "tab"
  | "programmatic";

export interface ContextMenuOpenChangeDetail {
  open: boolean;
  previousOpen: boolean;
  source: ContextMenuOpenChangeSource;
  reason: ContextMenuOpenChangeReason;
}

export interface ContextMenuSelectDetail {
  value: string;
  item: HTMLElement;
  itemType: ContextMenuItemType;
  source: "pointer" | "keyboard";
  checked?: boolean;
}

export interface ContextMenuOptions {
  /** Initial open state */
  defaultOpen?: boolean;
  /** Close when clicking outside */
  closeOnClickOutside?: boolean;
  /** Close when pressing Escape */
  closeOnEscape?: boolean;
  /** Close when an item is selected */
  closeOnSelect?: boolean;
  /** Disable user interaction */
  disabled?: boolean;
  /** Long press delay for touch triggers in ms */
  longPressDelay?: number;
  /** Distance in px from the pointer anchor */
  sideOffset?: number;
  /** Viewport collision padding */
  collisionPadding?: number;
  /** Callback when open state changes */
  onOpenChange?: (open: boolean) => void;
  /** Callback when an item is selected */
  onSelect?: (value: string) => void;
  /** After portaled menu content mounts on open. */
  onPortalMounted?: (container: HTMLElement) => void;
}

export interface ContextMenuController {
  /** Open at the latest trigger position or at optional viewport coordinates */
  open(point?: { x: number; y: number }): void;
  /** Close the context menu */
  close(): void;
  /** Set open state programmatically */
  setOpen(open: boolean, point?: { x: number; y: number }): void;
  /** Current open state */
  readonly isOpen: boolean;
  /** Current highlighted value */
  readonly highlightedValue: string | null;
  /** Cleanup all listeners */
  destroy(): void;
}

interface ItemRecord {
  el: HTMLElement;
  type: ContextMenuItemType;
  value: string | null;
}

const ROOT_BINDING_KEY = "@areia/slots:ContextMenu";
const DUPLICATE_BINDING_WARNING =
  "[@areia/slots:ContextMenu] createContextMenu() called more than once for the same root. Returning the existing controller. Destroy it before rebinding with new options.";

const ITEM_SELECTOR =
  '[data-slot="context-menu-item"], [data-slot="context-menu-radio-item"], [data-slot="context-menu-checkbox-item"]';
const LONG_PRESS_DELAY = 500;

function setPresence(el: Element, name: string, present: boolean): void {
  if (present) el.setAttribute(name, "");
  else el.removeAttribute(name);
}

function getItemType(el: HTMLElement): ContextMenuItemType {
  switch (el.getAttribute("data-slot")) {
    case "context-menu-radio-item":
      return "radio";
    case "context-menu-checkbox-item":
      return "checkbox";
    default:
      return "item";
  }
}

function isDisabled(el: HTMLElement): boolean {
  return (
    el.hasAttribute("disabled") ||
    el.hasAttribute("data-disabled") ||
    el.getAttribute("aria-disabled") === "true"
  );
}

function getItemValue(el: HTMLElement): string | null {
  return el.dataset["value"] ?? el.getAttribute("value") ?? el.textContent?.trim() ?? null;
}

function rectFromPoint(x: number, y: number, size = 0): DOMRect {
  if (typeof DOMRect !== "undefined" && "fromRect" in DOMRect) {
    return DOMRect.fromRect({ x, y, width: size, height: size });
  }
  return {
    x,
    y,
    width: size,
    height: size,
    top: y,
    left: x,
    right: x + size,
    bottom: y + size,
    toJSON: () => ({}),
  } as DOMRect;
}

export function createContextMenu(
  root: Element,
  options: ContextMenuOptions = {},
): ContextMenuController {
  const existingController = reuseRootBinding<ContextMenuController>(
    root,
    ROOT_BINDING_KEY,
    DUPLICATE_BINDING_WARNING,
  );
  if (existingController) return existingController;

  const rootElement = root as HTMLElement;
  const trigger = getPart<HTMLElement>(rootElement, "context-menu-trigger") ?? rootElement;
  const content = getPart<HTMLElement>(rootElement, "context-menu-content");

  if (!content) {
    throw new Error("ContextMenu requires a context-menu-content element");
  }

  const closeOnClickOutside =
    options.closeOnClickOutside ?? getDataBool(rootElement, "closeOnClickOutside") ?? true;
  const closeOnEscape = options.closeOnEscape ?? getDataBool(rootElement, "closeOnEscape") ?? true;
  const closeOnSelect = options.closeOnSelect ?? getDataBool(rootElement, "closeOnSelect") ?? true;
  const disabled = options.disabled ?? getDataBool(rootElement, "disabled") ?? false;
  const longPressDelay =
    options.longPressDelay ?? getDataNumber(rootElement, "longPressDelay") ?? LONG_PRESS_DELAY;
  const sideOffset = options.sideOffset ?? getDataNumber(rootElement, "sideOffset") ?? 2;
  const collisionPadding =
    options.collisionPadding ?? getDataNumber(rootElement, "collisionPadding") ?? 8;
  const onOpenChange = options.onOpenChange;
  const onPortalMounted = options.onPortalMounted;
  const onSelect = options.onSelect;

  const cleanups: Array<() => void> = [];
  const doc = rootElement.ownerDocument ?? document;
  const portal = createPortalLifecycle({ content, root: rootElement, enabled: true });

  let isOpen = false;
  let highlightedItem: HTMLElement | null = null;
  let items: ItemRecord[] = [];
  let enabledItems: ItemRecord[] = [];
  let anchorPoint = { x: 0, y: 0 };
  let touchStartPoint: { x: number; y: number } | null = null;
  let longPressTimer: ReturnType<typeof setTimeout> | null = null;

  const cacheItems = () => {
    items = [...content.querySelectorAll<HTMLElement>(ITEM_SELECTOR)].map((el) => ({
      el,
      type: getItemType(el),
      value: getItemValue(el),
    }));
    enabledItems = items.filter((item) => !isDisabled(item.el));
  };

  const setDataState = (state: "open" | "closed") => {
    rootElement.dataset.state = state;
    trigger.dataset.state = state;
    content.dataset.state = state;
    setPresence(rootElement, "data-open", state === "open");
    setPresence(rootElement, "data-closed", state === "closed");
    setPresence(trigger, "data-open", state === "open");
    setPresence(trigger, "data-closed", state === "closed");
    setPresence(content, "data-open", state === "open");
    setPresence(content, "data-closed", state === "closed");
  };

  const updatePosition = () => {
    content.style.position = "fixed";
    content.style.left = "0px";
    content.style.top = "0px";
    content.style.transform = "translate3d(0px, 0px, 0)";

    const anchorRect = rectFromPoint(anchorPoint.x, anchorPoint.y);
    const contentRect = measurePopupContentRect(content);
    const position = computeFloatingPosition({
      anchorRect,
      contentRect,
      side: "bottom",
      align: "start",
      sideOffset,
      alignOffset: 0,
      avoidCollisions: true,
      collisionPadding,
    });
    const transformOrigin = computeFloatingTransformOrigin({
      side: position.side,
      align: position.align,
      anchorRect,
      popupX: position.x,
      popupY: position.y,
    });

    content.style.transform = `translate3d(${position.x}px, ${position.y}px, 0)`;
    content.style.transformOrigin = transformOrigin;
    content.dataset.side = position.side;
    content.dataset.align = position.align;
  };

  const clearHighlight = () => {
    if (!highlightedItem) return;
    highlightedItem.removeAttribute("data-highlighted");
    highlightedItem = null;
  };

  const updateHighlight = (item: HTMLElement | null, focus = true) => {
    if (highlightedItem === item) return;
    clearHighlight();
    highlightedItem = item;
    if (!item) return;
    item.setAttribute("data-highlighted", "");
    if (focus) focusElement(item);
    ensureItemVisibleInContainer(item, content);
  };

  const syncItems = () => {
    cacheItems();
    for (const item of items) {
      const disabledItem = isDisabled(item.el);
      item.el.setAttribute("role", item.type === "item" ? "menuitem" : `menuitem${item.type}`);
      item.el.tabIndex = -1;
      setAria(item.el, "disabled", disabledItem ? true : null);
      if (item.type === "checkbox") {
        const checked =
          item.el.hasAttribute("data-checked") || item.el.getAttribute("aria-checked") === "true";
        setAria(item.el, "checked", checked);
      }
      if (item.type === "radio") {
        const checked =
          item.el.hasAttribute("data-checked") || item.el.getAttribute("aria-checked") === "true";
        setAria(item.el, "checked", checked);
      }
    }
  };

  const emitOpenChange = (
    open: boolean,
    previousOpen: boolean,
    source: ContextMenuOpenChangeSource,
    reason: ContextMenuOpenChangeReason,
  ) => {
    const detail: ContextMenuOpenChangeDetail = { open, previousOpen, source, reason };
    emit(rootElement, "context-menu:open-change", detail);
    emit(rootElement, "context-menu:change", detail);
    onOpenChange?.(open);
  };

  const openAt = (
    point: { x: number; y: number },
    source: ContextMenuOpenChangeSource,
    reason: ContextMenuOpenChangeReason,
  ) => {
    if (disabled) return;
    anchorPoint = point;
    const previousOpen = isOpen;
    isOpen = true;
    portal.mount();
    if (onPortalMounted) {
      requestAnimationFrame(() => onPortalMounted(portal.container as HTMLElement));
    }
    content.hidden = false;
    setAria(trigger, "expanded", true);
    setDataState("open");
    syncItems();
    updatePosition();
    focusElement(content);
    if (!previousOpen) emitOpenChange(true, previousOpen, source, reason);
  };

  const closeWithReason = (
    source: ContextMenuOpenChangeSource,
    reason: ContextMenuOpenChangeReason,
  ) => {
    if (!isOpen) return;
    const previousOpen = isOpen;
    isOpen = false;
    clearHighlight();
    content.hidden = true;
    portal.restore();
    setAria(trigger, "expanded", false);
    setDataState("closed");
    emitOpenChange(false, previousOpen, source, reason);
  };

  const selectItem = (item: ItemRecord, source: "pointer" | "keyboard") => {
    if (isDisabled(item.el) || !item.value) return;
    const detail: ContextMenuSelectDetail = {
      value: item.value,
      item: item.el,
      itemType: item.type,
      source,
    };

    if (item.type === "checkbox") {
      const checked = !(
        item.el.hasAttribute("data-checked") || item.el.getAttribute("aria-checked") === "true"
      );
      detail.checked = checked;
      setPresence(item.el, "data-checked", checked);
      setPresence(item.el, "data-unchecked", !checked);
      setAria(item.el, "checked", checked);
    }

    emit(rootElement, "context-menu:select", detail);
    onSelect?.(item.value);

    if (closeOnSelect) {
      closeWithReason(source, "select");
    }
  };

  const clearLongPress = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      longPressTimer = null;
    }
    touchStartPoint = null;
  };

  const triggerId = ensureId(trigger, "context-menu-trigger");
  const contentId = ensureId(content, "context-menu-content");
  trigger.setAttribute("aria-haspopup", "menu");
  trigger.setAttribute("aria-controls", contentId);
  setAria(trigger, "expanded", false);
  content.setAttribute("role", "menu");
  content.setAttribute("aria-labelledby", triggerId);
  content.tabIndex = -1;
  content.hidden = true;
  setDataState("closed");
  if (disabled) {
    trigger.setAttribute("aria-disabled", "true");
    rootElement.setAttribute("data-disabled", "");
  }

  if (options.defaultOpen ?? getDataBool(rootElement, "defaultOpen") ?? false) {
    queueMicrotask(() => openAt(anchorPoint, "programmatic", "programmatic"));
  }

  cleanups.push(
    on(trigger, "contextmenu", (event) => {
      const mouseEvent = event as MouseEvent;
      if (disabled) return;
      mouseEvent.preventDefault();
      mouseEvent.stopPropagation();
      openAt({ x: mouseEvent.clientX, y: mouseEvent.clientY }, "pointer", "trigger");
    }),
    on(trigger, "touchstart", (event) => {
      const touchEvent = event as TouchEvent;
      if (disabled || touchEvent.touches.length !== 1) return;
      const touch = touchEvent.touches[0];
      if (!touch) return;
      touchStartPoint = { x: touch.clientX, y: touch.clientY };
      longPressTimer = setTimeout(() => {
        if (!touchStartPoint) return;
        openAt(touchStartPoint, "pointer", "trigger");
        clearLongPress();
      }, longPressDelay);
    }),
    on(trigger, "touchmove", (event) => {
      if (!touchStartPoint) return;
      const touch = (event as TouchEvent).touches[0];
      if (!touch) return;
      if (
        Math.abs(touch.clientX - touchStartPoint.x) > 10 ||
        Math.abs(touch.clientY - touchStartPoint.y) > 10
      ) {
        clearLongPress();
      }
    }),
    on(trigger, "touchend", clearLongPress),
    on(trigger, "touchcancel", clearLongPress),
  );

  cleanups.push(
    on(content, "keydown", (event) => {
      const keyboardEvent = event as KeyboardEvent;
      if (keyboardEvent.key === "Tab") {
        closeWithReason("keyboard", "tab");
        return;
      }
      if (keyboardEvent.key === "Escape" && closeOnEscape) {
        keyboardEvent.preventDefault();
        closeWithReason("keyboard", "escape");
        return;
      }

      if (enabledItems.length === 0) return;
      const currentIndex = highlightedItem
        ? enabledItems.findIndex((item) => item.el === highlightedItem)
        : -1;
      switch (keyboardEvent.key) {
        case "ArrowDown":
          keyboardEvent.preventDefault();
          updateHighlight(
            enabledItems[(currentIndex + 1 + enabledItems.length) % enabledItems.length]?.el ??
              null,
          );
          break;
        case "ArrowUp":
          keyboardEvent.preventDefault();
          updateHighlight(
            enabledItems[(currentIndex - 1 + enabledItems.length) % enabledItems.length]?.el ??
              null,
          );
          break;
        case "Home":
          keyboardEvent.preventDefault();
          updateHighlight(enabledItems[0]?.el ?? null);
          break;
        case "End":
          keyboardEvent.preventDefault();
          updateHighlight(enabledItems[enabledItems.length - 1]?.el ?? null);
          break;
        case "Enter":
        case " ":
        case "Spacebar": {
          keyboardEvent.preventDefault();
          const item = enabledItems.find((candidate) => candidate.el === highlightedItem);
          if (item) selectItem(item, "keyboard");
          break;
        }
      }
    }),
  );

  cleanups.push(
    on(content, "pointermove", (event) => {
      const pointerEvent = event as PointerEvent;
      if (pointerEvent.pointerType === "touch") return;
      const target = (pointerEvent.target as Element | null)?.closest<HTMLElement>(ITEM_SELECTOR);
      if (!target || !content.contains(target) || isDisabled(target)) return;
      updateHighlight(target, true);
    }),
    on(content, "pointerleave", () => updateHighlight(null, false)),
    on(content, "click", (event) => {
      const target = (event.target as Element | null)?.closest<HTMLElement>(ITEM_SELECTOR);
      if (!target || !content.contains(target)) return;
      const item = items.find((candidate) => candidate.el === target);
      if (item) selectItem(item, "pointer");
    }),
  );

  cleanups.push(
    on(doc, "pointerdown", (event) => {
      if (!isOpen || !closeOnClickOutside) return;
      const target = event.target as Node | null;
      if (!target) return;
      if (containsWithPortals(rootElement, target) || containsWithPortals(content, target)) return;
      closeWithReason("pointer", "outside");
    }),
    on(doc, "keydown", (event) => {
      if (!isOpen || !closeOnEscape || (event as KeyboardEvent).key !== "Escape") return;
      closeWithReason("keyboard", "escape");
    }),
  );

  cleanups.push(
    on(rootElement, "context-menu:set", (event) => {
      const detail = (event as CustomEvent).detail;
      const open = typeof detail === "boolean" ? detail : detail?.open;
      const x = typeof detail?.x === "number" ? detail.x : anchorPoint.x;
      const y = typeof detail?.y === "number" ? detail.y : anchorPoint.y;
      if (open === true) openAt({ x, y }, "programmatic", "programmatic");
      if (open === false) closeWithReason("programmatic", "programmatic");
    }),
  );

  const controller: ContextMenuController = {
    get isOpen() {
      return isOpen;
    },
    get highlightedValue() {
      return items.find((item) => item.el === highlightedItem)?.value ?? null;
    },
    open: (point) => openAt(point ?? anchorPoint, "programmatic", "programmatic"),
    close: () => closeWithReason("programmatic", "programmatic"),
    setOpen: (open, point) => {
      if (open) openAt(point ?? anchorPoint, "programmatic", "programmatic");
      else closeWithReason("programmatic", "programmatic");
    },
    destroy: () => {
      clearLongPress();
      cleanups.forEach((fn) => fn());
      cleanups.length = 0;
      if (isOpen) portal.restore();
      clearRootBinding(rootElement, ROOT_BINDING_KEY, controller);
    },
  };

  setRootBinding(rootElement, ROOT_BINDING_KEY, controller);
  return controller;
}

export function create(scope: ParentNode = document): ContextMenuController[] {
  const controllers: ContextMenuController[] = [];
  for (const root of getRoots(scope, "context-menu")) {
    if (hasRootBinding(root, ROOT_BINDING_KEY)) continue;
    controllers.push(createContextMenu(root));
  }
  return controllers;
}
