import { createCoverFallback } from "./cover-fallback.js";

const AUDIO_EXTENSION = /\.(mp3|wav|m4a|aac|ogg|flac)$/i;
const AUDIO_MIME_TYPES = new Set([
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/x-wav",
  "audio/mp4",
  "audio/x-m4a",
  "audio/aac",
  "audio/ogg",
  "audio/flac",
  "audio/x-flac",
]);

function localTrackHash(value) {
  let hash = 2166136261;
  for (const character of String(value)) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36);
}

function isSupportedFile(file) {
  if (!file) return false;
  const name = String(file.name ?? "");
  const type = String(file.type ?? "").toLowerCase();
  return AUDIO_EXTENSION.test(name) || AUDIO_MIME_TYPES.has(type);
}

export function createLocalMediaAdapter({
  urlApi = globalThis.URL,
  documentRef = globalThis.document,
  coverFactory = createCoverFallback,
} = {}) {
  if (!urlApi || typeof urlApi.createObjectURL !== "function" || typeof urlApi.revokeObjectURL !== "function") {
    throw new TypeError("urlApi must provide createObjectURL and revokeObjectURL");
  }

  const records = new Map();
  const leasesByKey = new Map();
  let disposed = false;

  function classify(files) {
    const accepted = [];
    const rejected = [];
    for (const file of Array.from(files ?? [])) {
      (isSupportedFile(file) ? accepted : rejected).push(file);
    }
    accepted.sort((left, right) => String(left.name ?? "").localeCompare(
      String(right.name ?? ""),
      "zh-CN",
      { numeric: true, sensitivity: "base" },
    ));
    return Object.freeze({
      accepted: Object.freeze(accepted),
      rejected: Object.freeze(rejected),
    });
  }

  function fallbackCover(id, file) {
    if (typeof file?.artwork === "string" && file.artwork) return file.artwork;
    try {
      const canvas = coverFactory(id, file?.analysisBands ?? {}, documentRef);
      return typeof canvas?.toDataURL === "function" ? canvas.toDataURL("image/png") : null;
    } catch {
      return null;
    }
  }

  function createTrack(file) {
    if (!isSupportedFile(file)) throw new TypeError("Unsupported local audio file");
    const filename = String(file.name ?? "local-audio");
    const title = filename.replace(/\.[^.]+$/, "") || "Local audio";
    const signature = [filename, Number(file.size) || 0, Number(file.lastModified) || 0].join(":");
    const id = `local-${localTrackHash(signature)}`;
    return Object.freeze({
      id,
      type: "local",
      source: "local",
      local: true,
      title,
      name: title,
      artist: "LOCAL FILE",
      composer: "LOCAL FILE",
      album: "PULSE ROOM / DEVICE",
      duration: 0,
      bpm: null,
      file,
      cover: fallbackCover(id, file),
      analysisUrl: null,
      revoke: false,
    });
  }

  function acquire(track) {
    if (disposed) throw new DOMException("Local media adapter is disposed", "AbortError");
    if (!track || !track.id || (!track.file && !track.localUrl)) {
      throw new TypeError("A File-backed local track is required");
    }
    const key = String(track.id);
    let record = records.get(key);
    if (!record) {
      const url = track.localUrl || urlApi.createObjectURL(track.file);
      record = {
        key,
        url,
        bytes: Number(track.file?.size || track.bytes || 0),
        refs: 0,
        revoked: false,
      };
      records.set(key, record);
    }
    record.refs += 1;
    let released = false;
    const lease = Object.freeze({
      key,
      url: record.url,
      bytes: record.bytes,
      release() {
        if (released) return false;
        released = true;
        record.refs = Math.max(0, record.refs - 1);
        leasesByKey.get(key)?.delete(lease);
        if (leasesByKey.get(key)?.size === 0) leasesByKey.delete(key);
        if (record.refs === 0 && !record.revoked) {
          record.revoked = true;
          records.delete(key);
          urlApi.revokeObjectURL(record.url);
        }
        return true;
      },
    });
    if (!leasesByKey.has(key)) leasesByKey.set(key, new Set());
    leasesByKey.get(key).add(lease);
    return lease;
  }

  function release(target) {
    if (target && typeof target.release === "function") return target.release();
    const key = target?.id ? String(target.id) : "";
    if (!key) return false;
    const leases = [...(leasesByKey.get(key) ?? [])];
    let released = false;
    for (const lease of leases) released = lease.release() || released;
    return released;
  }

  function dispose() {
    if (disposed) return false;
    disposed = true;
    leasesByKey.clear();
    for (const record of records.values()) {
      if (!record.revoked) urlApi.revokeObjectURL(record.url);
      record.revoked = true;
      record.refs = 0;
    }
    records.clear();
    return true;
  }

  return Object.freeze({ classify, createTrack, acquire, release, dispose });
}
