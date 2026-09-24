import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

export const MAX_RUNTIME_BYTES = 35 * 1024 * 1024;

export const ALLOWED_LICENSES = new Set([
  "CC0-1.0",
  "CC-BY-3.0",
  "CC-BY-4.0",
  "MIT",
  "Apache-2.0",
  "BSD-2-Clause",
  "BSD-3-Clause",
  "OFL-1.1",
]);

const REQUIRED_FIELDS = [
  "id",
  "file",
  "type",
  "creator",
  "sourceUrl",
  "license",
  "licenseUrl",
  "modifications",
  "usage",
  "critical",
  "bytes",
];

function isHttpsUrl(value) {
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

function isSourceUrl(value) {
  return isHttpsUrl(value) || (typeof value === "string" && /^\/scripts\/[a-z0-9./-]+$/i.test(value));
}

function resolveLocalAssetPath(assetsDirectory, file) {
  if (typeof file !== "string" || file.length === 0 || /^(?:[a-z]+:|[\\/])/i.test(file)) return null;
  const normalized = file.replaceAll("\\", "/");
  if (normalized.split("/").includes("..")) return null;
  const resolved = path.resolve(assetsDirectory, normalized);
  const relative = path.relative(assetsDirectory, resolved);
  if (!relative || relative.startsWith("..") || path.isAbsolute(relative)) return null;
  return resolved;
}

function validateLocalPath(errors, assetsDirectory, file, label) {
  const resolvedPath = resolveLocalAssetPath(assetsDirectory, file);
  if (!resolvedPath) {
    const reason = typeof file === "string" && file.replaceAll("\\", "/").split("/").includes("..")
      ? "contains path traversal"
      : "must be a local path inside the assets directory";
    errors.push(`${label} file ${reason}`);
  }
  return resolvedPath;
}

async function validateRuntimeFile(errors, assetsDirectory, runtimeFile, label, checkFiles) {
  const resolvedPath = validateLocalPath(errors, assetsDirectory, runtimeFile?.file, label);
  if (!Number.isSafeInteger(runtimeFile?.bytes) || runtimeFile.bytes <= 0) {
    errors.push(`${label} bytes must be a positive integer`);
  }
  if (!checkFiles || !resolvedPath) return;
  try {
    const stats = await stat(resolvedPath);
    if (!stats.isFile()) errors.push(`${label} does not resolve to a file`);
    if (Number.isSafeInteger(runtimeFile.bytes) && runtimeFile.bytes !== stats.size) {
      errors.push(`${label} bytes ${runtimeFile.bytes} does not match file size ${stats.size}`);
    }
  } catch {
    errors.push(`${label} file is missing: ${runtimeFile.file}`);
  }
}

export async function validateEchoAssetManifest(manifest, options = {}) {
  const assetsDirectory = path.resolve(options.assetsDirectory ?? "projects/echo-hall/assets");
  const attributions = options.attributions ?? "";
  const checkFiles = options.checkFiles ?? true;
  const errors = [];
  const ids = new Set();
  let totalBytes = 0;

  if (!Array.isArray(manifest)) {
    return { errors: ["Asset manifest must be an array"], totalBytes: 0 };
  }

  for (const [index, entry] of manifest.entries()) {
    const label = entry?.id || `entry ${index}`;
    if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
      errors.push(`Asset ${label} must be an object`);
      continue;
    }

    for (const field of REQUIRED_FIELDS) {
      if (!Object.hasOwn(entry, field)) errors.push(`Asset ${label} is missing ${field}`);
    }

    if (typeof entry.id !== "string" || !/^[a-z0-9][a-z0-9-]*$/.test(entry.id)) {
      errors.push(`Asset ${label} has an invalid id`);
    } else if (ids.has(entry.id)) {
      errors.push(`Duplicate asset id: ${entry.id}`);
    } else {
      ids.add(entry.id);
    }

    validateLocalPath(errors, assetsDirectory, entry.file, `Asset ${label}`);

    if (!ALLOWED_LICENSES.has(entry.license)) errors.push(`Asset ${label} does not use an allowed license`);
    if (!isSourceUrl(entry.sourceUrl)) {
      errors.push(`Asset ${label} sourceUrl must be an HTTPS URL or repository-local generator URL`);
    }
    if (!isHttpsUrl(entry.licenseUrl)) errors.push(`Asset ${label} licenseUrl must be an HTTPS URL`);
    if (typeof entry.creator !== "string" || entry.creator.trim().length === 0) errors.push(`Asset ${label} lacks a creator`);
    if (typeof entry.type !== "string" || entry.type.trim().length === 0) errors.push(`Asset ${label} lacks a type`);
    if (typeof entry.modifications !== "string" || entry.modifications.trim().length === 0) errors.push(`Asset ${label} lacks modifications`);
    if (typeof entry.usage !== "string" || entry.usage.trim().length === 0) errors.push(`Asset ${label} lacks usage`);
    if (typeof entry.critical !== "boolean") errors.push(`Asset ${label} critical must be boolean`);
    if (!Number.isSafeInteger(entry.bytes) || entry.bytes <= 0) {
      errors.push(`Asset ${label} bytes must be a positive integer`);
    }

    if (!attributions.includes(entry.id)) errors.push(`Asset ${label} is missing attribution documentation`);

    if (entry.lods !== undefined) {
      if (!entry.lods || typeof entry.lods !== "object" || Array.isArray(entry.lods)) {
        errors.push(`Asset ${label} lods must be an object`);
      } else {
        const lodFiles = new Set();
        for (const level of ["high", "low"]) {
          const lod = entry.lods[level];
          const lodLabel = `Asset ${label} ${level} LOD`;
          if (!lod || typeof lod !== "object" || Array.isArray(lod)) {
            errors.push(`${lodLabel} is missing`);
            continue;
          }
          await validateRuntimeFile(errors, assetsDirectory, lod, lodLabel, checkFiles);
          if (!Number.isSafeInteger(lod.triangles) || lod.triangles <= 0) {
            errors.push(`${lodLabel} triangles must be a positive integer`);
          }
          if (typeof lod.file === "string" && lodFiles.has(lod.file)) {
            errors.push(`${lodLabel} duplicates another LOD file`);
          }
          lodFiles.add(lod.file);
          if (Number.isSafeInteger(lod.bytes) && lod.bytes > 0) totalBytes += lod.bytes;
        }
        if (entry.lods.high && (entry.file !== entry.lods.high.file || entry.bytes !== entry.lods.high.bytes)) {
          errors.push(`Asset ${label} top-level file and bytes must mirror the high LOD`);
        }
      }
    } else {
      await validateRuntimeFile(errors, assetsDirectory, entry, `Asset ${label}`, checkFiles);
      if (Number.isSafeInteger(entry.bytes) && entry.bytes > 0) totalBytes += entry.bytes;
    }
  }

  if (totalBytes <= 0) errors.push("Runtime asset total must be greater than 0 bytes");
  if (totalBytes > MAX_RUNTIME_BYTES) errors.push("Runtime asset total exceeds the 35 MB budget");
  return { errors, totalBytes };
}

async function runCli() {
  const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
  const assetsDirectory = path.join(repositoryRoot, "projects", "echo-hall", "assets");
  const manifestPath = path.join(assetsDirectory, "asset-manifest.json");
  const attributionsPath = path.join(assetsDirectory, "ATTRIBUTIONS.md");
  let manifest;
  let attributions;

  try {
    [manifest, attributions] = await Promise.all([
      readFile(manifestPath, "utf8").then(JSON.parse),
      readFile(attributionsPath, "utf8"),
    ]);
  } catch (error) {
    console.error(`Unable to load Echo Run asset metadata: ${error.message}`);
    process.exitCode = 1;
    return;
  }

  const result = await validateEchoAssetManifest(manifest, { assetsDirectory, attributions });
  if (result.errors.length > 0) {
    for (const error of result.errors) console.error(error);
    process.exitCode = 1;
    return;
  }
  console.log(`${manifest.length} Listener assets validated (${result.totalBytes} bytes)`);
}

if (process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url) await runCli();
