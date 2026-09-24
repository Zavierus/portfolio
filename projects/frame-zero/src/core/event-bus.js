export function createEventBus() {
  const listeners = new Map();

  return {
    on(type, listener) {
      const bucket = listeners.get(type) ?? new Set();
      bucket.add(listener);
      listeners.set(type, bucket);
      return () => bucket.delete(listener);
    },
    emit(type, payload) {
      for (const listener of [...(listeners.get(type) ?? [])]) listener(payload);
    },
    clear() {
      listeners.clear();
    },
  };
}
