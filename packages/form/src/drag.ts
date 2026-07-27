export function setupDrag(
  headerRef: HTMLElement,
  panelRef: HTMLElement,
  initialPosition?: { x: number; y: number },
) {
  let isDragging = false;
  let startX = 0;
  let startY = 0;
  let startLeft = initialPosition?.x ?? 20;
  let startTop = initialPosition?.y ?? 20;

  panelRef.style.position = "absolute";
  panelRef.style.left = `${startLeft}px`;
  panelRef.style.top = `${startTop}px`;

  const onPointerDown = (e: PointerEvent) => {
    // Prevent dragging if clicking on an interactive element inside the header
    if ((e.target as HTMLElement).closest("button, input, [data-drag-ignore]")) return;

    isDragging = true;
    startX = e.clientX;
    startY = e.clientY;
    const rect = panelRef.getBoundingClientRect();
    startLeft = rect.left;
    startTop = rect.top;

    headerRef.setPointerCapture(e.pointerId);
    headerRef.addEventListener("pointermove", onPointerMove);
    headerRef.addEventListener("pointerup", onPointerUp);
    headerRef.addEventListener("pointercancel", onPointerUp);
  };

  const onPointerMove = (e: PointerEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;

    let nextX = startLeft + dx;
    let nextY = startTop + dy;

    const parent = panelRef.parentElement;
    if (parent) {
      const maxLeft = parent.clientWidth - panelRef.offsetWidth;
      const maxTop = parent.clientHeight - headerRef.offsetHeight;
      if (nextX < 0) nextX = 0;
      if (nextY < 0) nextY = 0;
      if (nextX > maxLeft) nextX = maxLeft;
      if (nextY > maxTop) nextY = maxTop;
    }

    panelRef.style.left = `${nextX}px`;
    panelRef.style.top = `${nextY}px`;
  };

  const onPointerUp = (e: PointerEvent) => {
    if (!isDragging) return;
    isDragging = false;
    headerRef.releasePointerCapture(e.pointerId);
    headerRef.removeEventListener("pointermove", onPointerMove);
    headerRef.removeEventListener("pointerup", onPointerUp);
    headerRef.removeEventListener("pointercancel", onPointerUp);
  };

  headerRef.addEventListener("pointerdown", onPointerDown);

  return () => {
    headerRef.removeEventListener("pointerdown", onPointerDown);
  };
}
