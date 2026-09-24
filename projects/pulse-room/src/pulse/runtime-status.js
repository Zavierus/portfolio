const DEFINITIONS = Object.freeze({
  ready: Object.freeze({
    level: "info",
    message: "",
    actions: Object.freeze([]),
  }),
  audio: Object.freeze({
    level: "error",
    message: "Audio could not load. Retry, choose another track, or import local audio.",
    actions: Object.freeze(["retry", "choose-track", "import-local"]),
  }),
  cover: Object.freeze({
    level: "warning",
    message: "Cover art could not load. A local fallback is active.",
    actions: Object.freeze(["retry", "choose-track", "import-local"]),
  }),
  depth: Object.freeze({
    level: "warning",
    message: "Cover depth is unavailable. The color particle field remains active.",
    actions: Object.freeze(["retry"]),
  }),
  analysis: Object.freeze({
    level: "warning",
    message: "Offline analysis is unavailable. Realtime audio response is active.",
    actions: Object.freeze([]),
  }),
  postprocessing: Object.freeze({
    level: "warning",
    message: "An optical effect was disabled. Playback continues with direct rendering.",
    actions: Object.freeze([]),
  }),
  shader: Object.freeze({
    level: "warning",
    message: "A visual shader failed. A simplified particle field is active.",
    actions: Object.freeze(["retry"]),
  }),
  "context-lost": Object.freeze({
    level: "warning",
    message: "Visual rendering was interrupted. Audio continues while the scene recovers.",
    actions: Object.freeze(["retry"]),
  }),
  "context-restored": Object.freeze({
    level: "info",
    message: "Visual rendering restored.",
    actions: Object.freeze([]),
  }),
  "import-invalid": Object.freeze({
    level: "error",
    message: "Import MP3, WAV, M4A, AAC, OGG, or FLAC audio.",
    actions: Object.freeze(["import-local"]),
  }),
});

function snapshot(kind, detail, serial) {
  const definition = DEFINITIONS[kind] ?? DEFINITIONS.ready;
  const error = detail?.error;
  return Object.freeze({
    serial,
    kind: DEFINITIONS[kind] ? kind : "ready",
    level: definition.level,
    message: String(detail?.message || definition.message),
    actions: definition.actions,
    blocking: false,
    trackId: detail?.trackId ? String(detail.trackId) : null,
    error: error ? String(error.message || error) : null,
  });
}

export function createRuntimeStatus() {
  const listeners = new Set();
  let serial = 0;
  let current = snapshot("ready", {}, serial);
  let disposed = false;

  const publish = () => {
    for (const listener of listeners) {
      try {
        listener(current);
      } catch {
        // Status observers cannot interrupt playback or recovery.
      }
    }
    return current;
  };

  return Object.freeze({
    report(kind, detail = {}) {
      if (disposed) return current;
      serial += 1;
      current = snapshot(String(kind || "ready"), detail, serial);
      return publish();
    },
    clear() {
      if (disposed) return current;
      serial += 1;
      current = snapshot("ready", {}, serial);
      return publish();
    },
    subscribe(listener) {
      if (disposed || typeof listener !== "function") return () => {};
      listeners.add(listener);
      try {
        listener(current);
      } catch {
        // Initial render follows the same isolation contract.
      }
      return () => listeners.delete(listener);
    },
    dispose() {
      if (disposed) return false;
      disposed = true;
      listeners.clear();
      return true;
    },
    get current() {
      return current;
    },
  });
}
