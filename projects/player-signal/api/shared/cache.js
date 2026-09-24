export function createMemoryCache(options = {}) {
  const entries = new Map();
  const now = options.now ?? Date.now;
  return Object.freeze({
    get(key) { const entry = entries.get(key); if (!entry) return null; if (entry.expiresAt <= now()) { entries.delete(key); return null; } return structuredClone(entry.value); },
    set(key, value, ttlMs = 300_000) { entries.set(key, { value: structuredClone(value), expiresAt: now() + Math.max(1, ttlMs) }); },
    clear() { entries.clear(); },
  });
}
