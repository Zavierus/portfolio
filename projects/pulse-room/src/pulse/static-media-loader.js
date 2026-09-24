const DEFAULT_MAX_BYTES = 96 * 1024 * 1024;

function abortReason(signal) {
  return signal?.reason ?? new DOMException("The operation was aborted", "AbortError");
}

function trackKey(track) {
  const key = track?.id || track?.url;
  if (!key) throw new TypeError("A static audio track requires an id or URL");
  return String(key);
}

function trackUrl(track) {
  if (!track || typeof track.url !== "string" || !track.url) {
    throw new TypeError("A static audio track requires a URL");
  }
  return track.url;
}

export function createStaticMediaLoader({
  fetchImpl = globalThis.fetch?.bind(globalThis),
  urlApi = globalThis.URL,
  maxBytes = DEFAULT_MAX_BYTES,
  directFileUrls = globalThis.location?.protocol === "file:",
  baseUrl = globalThis.document?.baseURI || globalThis.location?.href || "",
} = {}) {
  if (typeof fetchImpl !== "function") throw new TypeError("fetchImpl must be a function");
  if (!urlApi || typeof urlApi.createObjectURL !== "function" || typeof urlApi.revokeObjectURL !== "function") {
    throw new TypeError("urlApi must provide createObjectURL and revokeObjectURL");
  }
  if (!Number.isFinite(maxBytes) || maxBytes <= 0) throw new TypeError("maxBytes must be positive");

  const entries = new Map();
  const leasesByKey = new Map();
  let selectedKey = null;
  let warmKey = null;
  let byteTotal = 0;
  let clock = 0;
  let disposed = false;

  function directTrackUrl(track) {
    if (!directFileUrls) return "";
    try {
      const resolved = new URL(trackUrl(track), baseUrl || undefined);
      return resolved.protocol === "file:" ? resolved.href : "";
    } catch {
      return "";
    }
  }

  function touch(entry) {
    entry.lastUsed = ++clock;
  }

  function revoke(entry) {
    if (!entry || entry.revoked) return;
    entry.revoked = true;
    if (entry.objectUrl && !entry.direct) {
      urlApi.revokeObjectURL(entry.objectUrl);
    }
    entry.objectUrl = "";
    if (entry.bytes) {
      byteTotal = Math.max(0, byteTotal - entry.bytes);
      entry.bytes = 0;
    }
  }

  function remove(entry, { abort = false } = {}) {
    if (!entry) return;
    if (entries.get(entry.key) === entry) entries.delete(entry.key);
    if (abort && !entry.controller.signal.aborted) {
      entry.controller.abort(new DOMException("Static media entry discarded", "AbortError"));
    }
    revoke(entry);
  }

  function evictUnowned() {
    for (const entry of [...entries.values()]) {
      if (
        entry.key !== selectedKey
        && entry.key !== warmKey
        && entry.leases === 0
        && entry.waiters === 0
      ) {
        remove(entry, { abort: !entry.ready });
      }
    }
  }

  function enforceBudget() {
    while (byteTotal > maxBytes) {
      const candidate = [...entries.values()]
        .filter((entry) => entry.ready && entry.leases === 0 && entry.waiters === 0 && entry.key !== selectedKey)
        .sort((left, right) => left.lastUsed - right.lastUsed)[0];
      if (!candidate) break;
      if (candidate.key === warmKey) warmKey = null;
      remove(candidate);
    }
  }

  function startEntry(track) {
    const key = trackKey(track);
    const existing = entries.get(key);
    if (existing) {
      touch(existing);
      return existing;
    }

    const controller = new AbortController();
    const entry = {
      key,
      controller,
      promise: null,
      objectUrl: "",
      direct: false,
      bytes: 0,
      ready: false,
      revoked: false,
      leases: 0,
      waiters: 0,
      lastUsed: 0,
    };
    touch(entry);
    entries.set(key, entry);
    const directUrl = directTrackUrl(track);
    if (directUrl) {
      entry.objectUrl = directUrl;
      entry.direct = true;
      entry.ready = true;
      entry.promise = Promise.resolve(entry);
      return entry;
    }
    entry.promise = (async () => {
      const response = await fetchImpl(trackUrl(track), {
        signal: controller.signal,
        headers: { Range: "bytes=0-" },
      });
      if (!response?.ok) {
        throw new Error(`Audio fetch failed with HTTP ${response?.status ?? "unknown"}`);
      }
      const blob = await response.blob();
      if (!blob || !Number.isFinite(blob.size) || blob.size <= 0) {
        throw new Error("Audio fetch returned an empty Blob");
      }
      if (disposed || controller.signal.aborted || entries.get(key) !== entry) {
        throw abortReason(controller.signal);
      }
      entry.objectUrl = urlApi.createObjectURL(blob);
      entry.bytes = blob.size;
      entry.ready = true;
      byteTotal += blob.size;
      touch(entry);
      enforceBudget();
      return entry;
    })().catch((error) => {
      remove(entry);
      throw error;
    });
    return entry;
  }

  async function waitForEntry(entry, signal) {
    if (signal?.aborted) throw abortReason(signal);
    entry.waiters += 1;
    let onAbort;
    try {
      if (!signal) return await entry.promise;
      return await Promise.race([
        entry.promise,
        new Promise((_, reject) => {
          onAbort = () => reject(abortReason(signal));
          signal.addEventListener("abort", onAbort, { once: true });
        }),
      ]);
    } finally {
      if (onAbort) signal.removeEventListener("abort", onAbort);
      entry.waiters = Math.max(0, entry.waiters - 1);
      if (signal?.aborted && entry.waiters === 0 && entry.leases === 0 && entry.key !== warmKey) {
        if (selectedKey === entry.key) selectedKey = null;
        remove(entry, { abort: !entry.ready });
      }
    }
  }

  function leaseEntry(entry) {
    if (disposed || entry.revoked || entries.get(entry.key) !== entry) {
      throw new DOMException("Static media loader is disposed", "AbortError");
    }
    entry.leases += 1;
    touch(entry);
    let released = false;
    const lease = Object.freeze({
      key: entry.key,
      url: entry.objectUrl,
      bytes: entry.bytes,
      release() {
        if (released) return false;
        released = true;
        entry.leases = Math.max(0, entry.leases - 1);
        leasesByKey.get(entry.key)?.delete(lease);
        if (leasesByKey.get(entry.key)?.size === 0) leasesByKey.delete(entry.key);
        touch(entry);
        evictUnowned();
        enforceBudget();
        return true;
      },
    });
    if (!leasesByKey.has(entry.key)) leasesByKey.set(entry.key, new Set());
    leasesByKey.get(entry.key).add(lease);
    return lease;
  }

  const api = {
    async acquire(track, { signal } = {}) {
      if (disposed) throw new DOMException("Static media loader is disposed", "AbortError");
      const key = trackKey(track);
      const previousSelected = selectedKey;
      selectedKey = key;
      if (warmKey === key) warmKey = null;
      const entry = startEntry(track);
      try {
        const ready = await waitForEntry(entry, signal);
        evictUnowned();
        return leaseEntry(ready);
      } catch (error) {
        if (selectedKey === key) selectedKey = previousSelected === key ? key : null;
        throw error;
      }
    },

    release(target) {
      if (target && typeof target.release === "function") return target.release();
      let key;
      try {
        key = trackKey(target);
      } catch {
        return false;
      }
      const leases = [...(leasesByKey.get(key) ?? [])];
      let released = false;
      for (const lease of leases) released = lease.release() || released;
      return released;
    },

    async warm(track) {
      if (disposed) return false;
      const nextKey = track ? trackKey(track) : null;
      if (warmKey && warmKey !== nextKey && warmKey !== selectedKey) {
        const oldWarm = entries.get(warmKey);
        warmKey = null;
        if (oldWarm?.leases === 0 && oldWarm.waiters === 0) {
          remove(oldWarm, { abort: !oldWarm.ready });
        }
      }
      if (!track || nextKey === selectedKey) {
        warmKey = null;
        evictUnowned();
        return false;
      }
      warmKey = nextKey;
      const entry = startEntry(track);
      try {
        await entry.promise;
        if (disposed || warmKey !== nextKey) return false;
        touch(entry);
        enforceBudget();
        return true;
      } catch {
        if (warmKey === nextKey) warmKey = null;
        return false;
      }
    },

    dispose() {
      if (disposed) return false;
      disposed = true;
      selectedKey = null;
      warmKey = null;
      leasesByKey.clear();
      for (const entry of [...entries.values()]) remove(entry, { abort: !entry.ready });
      entries.clear();
      return true;
    },
  };

  return Object.freeze(api);
}
