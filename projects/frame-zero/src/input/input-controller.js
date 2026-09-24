export function createInputController({ documentRef, canvas }) {
  let enabled = false;
  let attached = false;
  let previouslyLocked = false;
  const lostListeners = new Set();

  const handlePointerLock = () => {
    const locked = documentRef.pointerLockElement === canvas;
    if (previouslyLocked && !locked) {
      for (const listener of [...lostListeners]) listener();
    }
    previouslyLocked = locked;
  };

  return {
    attach() {
      if (attached) return;
      attached = true;
      documentRef.addEventListener("pointerlockchange", handlePointerLock);
    },
    detach() {
      if (!attached) return;
      attached = false;
      documentRef.removeEventListener("pointerlockchange", handlePointerLock);
      lostListeners.clear();
    },
    enable() {
      enabled = true;
    },
    disable() {
      enabled = false;
    },
    isEnabled() {
      return enabled;
    },
    onPointerLockLost(listener) {
      lostListeners.add(listener);
      return () => lostListeners.delete(listener);
    },
  };
}

