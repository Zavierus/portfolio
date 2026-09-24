export const DEFAULT_SWIPE_THRESHOLD = 48;

export function getSwipeDirection(gesture, threshold = DEFAULT_SWIPE_THRESHOLD) {
  const deltaX = gesture.endX - gesture.startX;
  const deltaY = gesture.endY - gesture.startY;
  const horizontalDistance = Math.abs(deltaX);

  if (horizontalDistance <= threshold || horizontalDistance <= Math.abs(deltaY)) return null;
  return deltaX < 0 ? "next" : "previous";
}

export function createSwipeTracker({
  onPrevious,
  onNext,
  threshold = DEFAULT_SWIPE_THRESHOLD,
} = {}) {
  let origin = null;

  return {
    start(event) {
      origin = { startX: event.clientX, startY: event.clientY };
    },

    end(event) {
      if (!origin) return null;
      const direction = getSwipeDirection({
        ...origin,
        endX: event.clientX,
        endY: event.clientY,
      }, threshold);
      origin = null;

      if (direction === "previous") onPrevious?.();
      if (direction === "next") onNext?.();
      return direction;
    },

    cancel() {
      origin = null;
    },
  };
}
