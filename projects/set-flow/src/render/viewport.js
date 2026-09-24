import { createStudioScene } from "./studio-scene.js";

const DRAG_THRESHOLD_PX = 6;

export function createStudioViewport({ canvas, onSelect, onDragStart, onDragEnd, onContextLost, onContextRestored, policy } = {}) {
  const studio = createStudioScene({ canvas, policy });
  let pointerStart = null;
  let drag = null; // { assetId, started, offsetX, offsetZ }

  const handlePointerDown = (event) => {
    if (event.button !== 0) return;
    pointerStart = { x: event.clientX, y: event.clientY };
    const assetId = studio.pick(event);
    drag = assetId ? { assetId, started: false, offsetX: 0, offsetZ: 0 } : null;
  };

  const handlePointerMove = (event) => {
    if (!drag || !pointerStart) return;
    if (!drag.started) {
      if (Math.hypot(event.clientX - pointerStart.x, event.clientY - pointerStart.y) < DRAG_THRESHOLD_PX) return;
      if (!onDragStart?.(drag.assetId)) {
        drag = null;
        return;
      }
      const grab = studio.measureGrabOffset(drag.assetId, event);
      drag.offsetX = grab?.dx ?? 0;
      drag.offsetZ = grab?.dz ?? 0;
      drag.started = true;
    }
    studio.dragAssetToPointer(drag.assetId, event, drag.offsetX, drag.offsetZ);
  };

  const handlePointerUp = (event) => {
    if (event.button !== 0) return;
    const wasDragging = drag?.started === true;
    const dragAssetId = drag?.assetId ?? null;
    const start = pointerStart;
    pointerStart = null;
    drag = null;
    if (!start) return;
    const distance = Math.hypot(event.clientX - start.x, event.clientY - start.y);
    if (wasDragging) {
      onDragEnd?.(dragAssetId, event);
      return;
    }
    if (distance > DRAG_THRESHOLD_PX) return;
    const assetId = studio.pick(event);
    studio.setSelectedAsset(assetId);
    onSelect?.(assetId);
  };

  const handleDoubleClick = (event) => {
    const assetId = studio.pick(event);
    if (assetId) studio.focusAsset(assetId);
  };

  const handleContextLost = (event) => {
    event.preventDefault();
    onContextLost?.();
  };
  const handleContextRestored = () => onContextRestored?.();

  canvas.addEventListener("pointerdown", handlePointerDown);
  canvas.addEventListener("pointermove", handlePointerMove);
  canvas.addEventListener("pointerup", handlePointerUp);
  canvas.addEventListener("dblclick", handleDoubleClick);
  canvas.addEventListener("webglcontextlost", handleContextLost);
  canvas.addEventListener("webglcontextrestored", handleContextRestored);

  const resizeObserver = "ResizeObserver" in window
    ? new ResizeObserver(() => studio.resize())
    : null;
  resizeObserver?.observe(canvas);
  window.addEventListener("resize", studio.resize);

  return {
    ...studio,
    dispose() {
      resizeObserver?.disconnect();
      window.removeEventListener("resize", studio.resize);
      canvas.removeEventListener("pointerdown", handlePointerDown);
      canvas.removeEventListener("pointermove", handlePointerMove);
      canvas.removeEventListener("pointerup", handlePointerUp);
      canvas.removeEventListener("dblclick", handleDoubleClick);
      canvas.removeEventListener("webglcontextlost", handleContextLost);
      canvas.removeEventListener("webglcontextrestored", handleContextRestored);
      studio.dispose();
    },
  };
}
