const clamp01 = (value) => Math.min(1, Math.max(0, Number(value) || 0));
const noop = () => {};

function createInstance(loaded, stage) {
  const factory = loaded?.module?.createPerformance ?? loaded?.module?.default;
  if (typeof factory !== "function") {
    throw new TypeError(`Performance ${loaded?.descriptor?.id ?? "unknown"} has no createPerformance factory`);
  }
  const performance = factory({ stage, descriptor: loaded.descriptor });
  if (!performance || typeof performance.update !== "function" || typeof performance.dispose !== "function") {
    throw new TypeError(`Performance ${loaded.descriptor.id} must expose update() and dispose()`);
  }
  performance.mount?.({ stage, descriptor: loaded.descriptor, quality: stage?.quality });
  return performance;
}

export function createPerformanceDirector({
  stage,
  loadPerformance,
  transitionDuration = 0.8,
  onStateChange = noop,
  onError = noop,
} = {}) {
  if (typeof loadPerformance !== "function") throw new TypeError("Performance director requires loadPerformance()");
  if (!Number.isFinite(transitionDuration) || transitionDuration < 0.65 || transitionDuration > 0.9) {
    throw new RangeError("Performance transition must stay between 650 and 900 ms");
  }

  const halfTransition = transitionDuration / 2;
  let state = "idle";
  let active = null;
  let activeDescriptor = null;
  let pending = null;
  let generation = 0;
  let transitionElapsed = 0;
  let lastPlaying = null;
  let currentTime = 0;
  let disposed = false;

  const setState = (next) => {
    if (state === next) return;
    state = next;
    onStateChange(next, activeDescriptor);
  };

  const mount = (loaded) => {
    activeDescriptor = loaded.descriptor;
    active = createInstance(loaded, stage);
    active.setEnvelope?.(0);
    transitionElapsed = 0;
    lastPlaying = null;
    setState("entering");
  };

  const beginLeaving = (loaded) => {
    pending = loaded;
    transitionElapsed = 0;
    active.setEnvelope?.(0);
    setState("leaving");
  };

  const api = {
    async select(track, { time = currentTime } = {}) {
      if (disposed) return false;
      const requestGeneration = ++generation;
      currentTime = Math.max(0, Number(time) || 0);
      setState("loading");
      try {
        const loaded = await loadPerformance(track);
        if (disposed || requestGeneration !== generation) return false;
        if (!loaded?.descriptor?.id) throw new TypeError("Loaded performance requires a descriptor id");
        if (loaded.descriptor.id === activeDescriptor?.id) {
          active.seek?.(currentTime);
          setState("performing");
          return true;
        }
        if (active) beginLeaving(loaded);
        else mount(loaded);
        return true;
      } catch (error) {
        if (requestGeneration !== generation || disposed) return false;
        pending = null;
        setState("fallback");
        onError(error, track);
        return false;
      }
    },
    update(frame = {}, delta = 1 / 60) {
      if (disposed) return false;
      const elapsedDelta = Math.min(transitionDuration, Math.max(0, Number(delta) || 0));
      const safeDelta = Math.min(0.05, elapsedDelta);
      currentTime = Math.max(0, Number(frame.currentTime) || 0);

      if (state === "leaving" && active) {
        transitionElapsed += elapsedDelta;
        active.setEnvelope?.(1 - clamp01(transitionElapsed / halfTransition));
        if (transitionElapsed >= halfTransition) {
          active.dispose();
          active = null;
          activeDescriptor = null;
          const next = pending;
          pending = null;
          if (next) mount(next);
          else setState("idle");
        }
      } else if (state === "entering" && active) {
        transitionElapsed += elapsedDelta;
        const envelope = clamp01(transitionElapsed / halfTransition);
        active.setEnvelope?.(envelope);
        if (envelope >= 1) setState("performing");
      }

      if (active) {
        const playing = Boolean(frame.playing);
        if (playing !== lastPlaying) {
          if (playing) active.resume?.();
          else active.pause?.();
          lastPlaying = playing;
        }
        active.update({ ...frame, currentTime }, safeDelta);
      }
      return true;
    },
    seek(time, frame = {}) {
      if (disposed) return false;
      currentTime = Math.max(0, Number(time) || 0);
      active?.seek?.(currentTime, frame);
      return true;
    },
    dispose() {
      if (disposed) return false;
      disposed = true;
      generation += 1;
      pending = null;
      active?.dispose();
      active = null;
      activeDescriptor = null;
      setState("disposed");
      return true;
    },
    get state() {
      return state;
    },
    get activeId() {
      return activeDescriptor?.id ?? null;
    },
    get currentTime() {
      return currentTime;
    },
  };

  return Object.freeze(api);
}
