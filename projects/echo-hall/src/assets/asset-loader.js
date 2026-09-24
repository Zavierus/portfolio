const ADAPTER_BY_TYPE = Object.freeze({
  model: "gltf",
  "environment-light": "texture",
  audio: "audio",
});

function abortError(reason) {
  const message = typeof reason === "string" && reason ? reason : "Asset loading was aborted";
  if (typeof DOMException === "function") return new DOMException(message, "AbortError");
  const error = new Error(message);
  error.name = "AbortError";
  return error;
}

function isAbortError(error) {
  return error?.name === "AbortError";
}

function normalizeProgress(value) {
  const ratio = typeof value === "number"
    ? value
    : Number(value?.total) > 0
      ? Number(value.loaded) / Number(value.total)
      : 0;
  return Math.min(1, Math.max(0, Number.isFinite(ratio) ? ratio : 0));
}

function normalizeLocalPath(file) {
  if (typeof file !== "string" || file.length === 0) return null;
  if (/^(?:[a-z][a-z\d+.-]*:|[\\/])/i.test(file) || /[?#]/.test(file)) return null;

  const normalized = file.replaceAll("\\", "/");
  let decoded;
  try {
    decoded = decodeURIComponent(normalized).replaceAll("\\", "/");
  } catch {
    return null;
  }
  const segments = decoded.split("/");
  if (segments.some((segment) => segment === ".." || segment === "")) return null;
  return segments.filter((segment) => segment !== ".").join("/") || null;
}

function assetUrl(basePath, file) {
  const normalizedFile = normalizeLocalPath(file);
  if (!normalizedFile) return null;

  if (typeof basePath !== "string" || basePath.length === 0) return null;
  const normalizedBase = basePath.replaceAll("\\", "/").replace(/\/+$/, "");
  if (!normalizedBase || /^(?:[a-z][a-z\d+.-]*:|\/)/i.test(normalizedBase)) return null;
  if (normalizeLocalPath(normalizedBase) === null) return null;
  return `${normalizedBase}/${normalizedFile}`;
}

function progressReporter(manifest, onProgress) {
  const weights = manifest.map(({ bytes }) => Number(bytes));
  if (weights.some((weight) => !Number.isFinite(weight) || weight <= 0)) {
    throw new TypeError("Every asset must have a positive finite byte weight");
  }

  const totalBytes = weights.reduce((total, bytes) => total + bytes, 0);
  const ratios = manifest.map(() => 0);
  let lastReported = -1;

  const report = () => {
    const weighted = ratios.reduce((total, ratio, index) => total + ratio * weights[index], 0) / totalBytes;
    const value = Math.max(lastReported, Math.min(1, weighted));
    if (value > lastReported) {
      lastReported = value;
      onProgress(value);
    }
  };

  report();
  return (index, value) => {
    ratios[index] = Math.max(ratios[index], normalizeProgress(value));
    report();
  };
}

function raceAbort(promise, signal) {
  if (!signal) return promise;
  if (signal.aborted) return Promise.reject(abortError(signal.reason));

  return new Promise((resolve, reject) => {
    const cleanup = () => signal.removeEventListener("abort", onAbort);
    const onAbort = () => {
      cleanup();
      reject(abortError(signal.reason));
    };
    signal.addEventListener("abort", onAbort, { once: true });
    promise.then(
      (value) => {
        cleanup();
        resolve(value);
      },
      (error) => {
        cleanup();
        reject(error);
      },
    );
  });
}

async function loadWithRetry(adapter, url, context) {
  for (let attempt = 1; attempt <= 2; attempt += 1) {
    if (context.signal?.aborted) throw abortError(context.signal.reason);
    try {
      const pending = Promise.resolve(adapter(url, { ...context, attempt }));
      return await raceAbort(pending, context.signal);
    } catch (error) {
      if (isAbortError(error) || context.signal?.aborted) throw abortError(context.signal?.reason);
      if (attempt === 2) throw error;
    }
  }
}

export class AssetLoadError extends Error {
  constructor(failedIds) {
    super(`Critical assets failed to load: ${failedIds.join(", ")}`);
    this.name = "AssetLoadError";
    this.failedIds = [...failedIds];
  }
}

export async function loadEchoAssets(manifest, options = {}) {
  if (!Array.isArray(manifest)) throw new TypeError("Asset manifest must be an array");
  const onProgress = options.onProgress ?? (() => {});
  const signal = options.signal;
  if (typeof onProgress !== "function") throw new TypeError("Asset progress handler must be a function");
  if (signal?.aborted) throw abortError(signal.reason);
  if (manifest.length === 0) {
    onProgress(0);
    onProgress(1);
    return { assets: {}, warnings: [] };
  }

  const adapters = options.adapters ?? {};
  const basePath = options.basePath ?? "./assets";

  const updateProgress = progressReporter(manifest, onProgress);
  const tasks = manifest.map(async (entry, index) => {
    const url = assetUrl(basePath, entry.file);
    const adapterName = ADAPTER_BY_TYPE[entry.type];
    const adapter = adapters[adapterName];

    if (!url) {
      updateProgress(index, 1);
      throw new Error(`Asset ${entry.id} must use a local path`);
    }
    if (typeof adapter !== "function") {
      updateProgress(index, 1);
      throw new TypeError(`Asset ${entry.id} has no ${adapterName ?? entry.type} adapter`);
    }

    try {
      const value = await loadWithRetry(adapter, url, {
        asset: entry,
        signal,
        onProgress: (progress) => updateProgress(index, progress),
      });
      updateProgress(index, 1);
      return value;
    } catch (error) {
      if (!isAbortError(error)) updateProgress(index, 1);
      throw error;
    }
  });

  const settled = await Promise.allSettled(tasks);
  if (signal?.aborted || settled.some(({ status, reason }) => status === "rejected" && isAbortError(reason))) {
    throw abortError(signal?.reason);
  }

  const assets = {};
  const warnings = [];
  const failedIds = [];
  settled.forEach((result, index) => {
    const entry = manifest[index];
    if (result.status === "fulfilled") {
      assets[entry.id] = result.value;
    } else if (entry.critical) {
      failedIds.push(entry.id);
    } else {
      warnings.push({ id: entry.id, error: result.reason });
    }
  });

  if (failedIds.length > 0) throw new AssetLoadError(failedIds);
  return { assets, warnings };
}
