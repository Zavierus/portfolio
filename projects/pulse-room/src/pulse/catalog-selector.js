const noop = () => {};

function validateCatalog(catalog) {
  if (!Array.isArray(catalog) || catalog.length !== 4) {
    throw new TypeError("PULSE selector requires exactly four catalog records");
  }
  const ids = new Set();
  for (const track of catalog) {
    if (!track || typeof track.id !== "string" || !track.id || ids.has(track.id)) {
      throw new TypeError("PULSE selector requires four unique track IDs");
    }
    ids.add(track.id);
  }
}

export function createCatalogSelectionController({
  catalog,
  initialId,
  onSelect = async () => true,
  onFocus = noop,
} = {}) {
  validateCatalog(catalog);
  const orderedCatalog = Object.freeze([...catalog]);
  const byId = new Map(orderedCatalog.map((track) => [track.id, track]));
  const listeners = new Set();
  let handler = onSelect;
  let focusHandler = onFocus;
  let selectedId = byId.has(initialId) ? initialId : orderedCatalog[0].id;
  let serial = 0;
  let disposed = false;

  const publish = (track, detail) => {
    for (const listener of listeners) {
      try {
        listener(track, detail);
      } catch {
        // Selector observers cannot invalidate a completed playback switch.
      }
    }
  };

  const api = {
    async select(id, detail = {}) {
      if (disposed) return false;
      const track = byId.get(String(id ?? ""));
      if (!track) return false;
      const requestSerial = ++serial;
      const accepted = await handler(track, Object.freeze({
        ...detail,
        serial: requestSerial,
      }));
      if (disposed || requestSerial !== serial || accepted === false) return false;
      selectedId = track.id;
      publish(track, Object.freeze({ ...detail, serial: requestSerial }));
      if (detail.origin === "list" && detail.userInitiated === true) {
        focusHandler(track, Object.freeze({ ...detail, serial: requestSerial }));
      }
      return true;
    },
    setHandler(nextHandler) {
      if (disposed) return false;
      handler = typeof nextHandler === "function" ? nextHandler : noop;
      return true;
    },
    setFocusHandler(nextHandler) {
      if (disposed) return false;
      focusHandler = typeof nextHandler === "function" ? nextHandler : noop;
      return true;
    },
    subscribe(listener) {
      if (disposed || typeof listener !== "function") return noop;
      listeners.add(listener);
      listener(byId.get(selectedId), Object.freeze({ initial: true, serial }));
      return () => listeners.delete(listener);
    },
    commit(id, detail = {}) {
      if (disposed) return false;
      const track = byId.get(String(id ?? ""));
      if (!track) return false;
      serial += 1;
      selectedId = track.id;
      publish(track, Object.freeze({ ...detail, serial }));
      return true;
    },
    dispose() {
      if (disposed) return false;
      disposed = true;
      serial += 1;
      listeners.clear();
      handler = noop;
      focusHandler = noop;
      return true;
    },
    get selectedId() {
      return selectedId;
    },
    get catalog() {
      return orderedCatalog;
    },
  };

  return Object.freeze(api);
}
