export const ALLOWED_ASSET_LICENSES = Object.freeze([
  "CC0-1.0",
  "CC-BY-4.0",
  "CUSTOM-PERMISSIVE",
  "PURCHASED",
]);

const ALLOWED_TYPES = new Set(["model", "material", "environment"]);
const ALLOWED_COLOR_SPACES = new Set(["srgb", "linear"]);
const ALLOWED_TEXTURE_FORMATS = new Set(["ktx2", "webp", "jpg", "png"]);

function isPositiveInteger(value) {
  return Number.isInteger(value) && value > 0;
}

function isSafeLocalPath(value, prefix) {
  if (typeof value !== "string" || !value.startsWith(prefix) || value.includes("\\")) return false;
  if (/^[a-z][a-z\d+.-]*:/i.test(value) || value.startsWith("/") || value.startsWith("//")) return false;
  return value.split("/").every((segment) => segment && segment !== "." && segment !== "..");
}

function isHttpUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

export function validateAssetManifest(manifest) {
  const errors = [];
  const items = [];
  const ids = new Set();
  const project = typeof manifest?.project === "string" ? manifest.project.trim() : "";
  const assets = Array.isArray(manifest?.assets) ? manifest.assets : [];

  const report = (index, asset, field, message) => errors.push({
    index,
    id: asset?.id ?? null,
    field,
    message,
  });

  if (manifest?.contractVersion !== 1) report(-1, null, "contractVersion", "must equal 1");
  if (!project) report(-1, null, "project", "must be a non-empty string");
  if (!Array.isArray(manifest?.assets)) report(-1, null, "assets", "must be an array");

  assets.forEach((asset, index) => {
    const id = typeof asset?.id === "string" ? asset.id.trim() : "";
    if (!id) report(index, asset, "id", "must be a non-empty string");
    else if (ids.has(id)) report(index, asset, "id", "must be unique within the manifest");
    else ids.add(id);

    if (!ALLOWED_TYPES.has(asset?.type)) report(index, asset, "type", "is not an allowed asset type");
    if (typeof asset?.published !== "boolean") report(index, asset, "published", "must be boolean");
    const originalAuthoredSource = asset?.source?.origin === "authored"
      && asset?.source?.license === "CUSTOM-PERMISSIVE";
    if (!originalAuthoredSource && !isHttpUrl(asset?.source?.url)) {
      report(index, asset, "source.url", "must be an HTTP(S) source URL");
    }
    if (typeof asset?.source?.author !== "string" || !asset.source.author.trim()) {
      report(index, asset, "source.author", "must identify the source author");
    }
    if (!ALLOWED_ASSET_LICENSES.includes(asset?.source?.license)) {
      report(index, asset, "source.license", "is not in the allowed license list");
    }
    if (!isSafeLocalPath(asset?.source?.path, "assets/source/")) {
      report(index, asset, "source.path", "must stay beneath assets/source");
    }

    const lods = Array.isArray(asset?.lods) ? asset.lods : [];
    if (!Array.isArray(asset?.lods)) report(index, asset, "lods", "must be an array");
    if (asset?.published && lods.length === 0) report(index, asset, "lods", "requires at least one published LOD");
    const levels = new Set();
    lods.forEach((lod, lodIndex) => {
      const prefix = `lods[${lodIndex}]`;
      if (typeof lod?.level !== "string" || !lod.level.trim() || levels.has(lod.level)) {
        report(index, asset, `${prefix}.level`, "must be a unique non-empty string");
      } else levels.add(lod.level);
      if (!isSafeLocalPath(lod?.path, "assets/runtime/")) {
        report(index, asset, `${prefix}.path`, "must stay beneath assets/runtime");
      }
      if (!isPositiveInteger(lod?.triangles)) report(index, asset, `${prefix}.triangles`, "must be a positive integer");
      if (!isPositiveInteger(lod?.bytes)) report(index, asset, `${prefix}.bytes`, "must be a positive integer");
    });

    const textures = Array.isArray(asset?.textures) ? asset.textures : [];
    if (!Array.isArray(asset?.textures)) report(index, asset, "textures", "must be an array");
    textures.forEach((texture, textureIndex) => {
      const prefix = `textures[${textureIndex}]`;
      if (typeof texture?.role !== "string" || !texture.role.trim()) report(index, asset, `${prefix}.role`, "must be set");
      if (!isSafeLocalPath(texture?.sourcePath, "assets/source/")) {
        report(index, asset, `${prefix}.sourcePath`, "must stay beneath assets/source");
      }
      if (asset?.published && !isSafeLocalPath(texture?.runtimePath, "assets/runtime/")) {
        report(index, asset, `${prefix}.runtimePath`, "must stay beneath assets/runtime for published assets");
      }
      if (!isPositiveInteger(texture?.width)) report(index, asset, `${prefix}.width`, "must be a positive integer");
      if (!isPositiveInteger(texture?.height)) report(index, asset, `${prefix}.height`, "must be a positive integer");
      if (!ALLOWED_COLOR_SPACES.has(texture?.colorSpace)) report(index, asset, `${prefix}.colorSpace`, "must be srgb or linear");
      if (!ALLOWED_TEXTURE_FORMATS.has(texture?.format)) report(index, asset, `${prefix}.format`, "is not supported");
      if (asset?.published && !isPositiveInteger(texture?.bytes)) report(index, asset, `${prefix}.bytes`, "must be positive when published");
      if (!asset?.published && (!Number.isInteger(texture?.bytes) || texture.bytes < 0)) report(index, asset, `${prefix}.bytes`, "must be a non-negative integer");
    });

    const animations = Array.isArray(asset?.animations) ? asset.animations : [];
    if (!Array.isArray(asset?.animations)) report(index, asset, "animations", "must be an array");
    if (animations.some((name) => typeof name !== "string" || !name.trim()) || new Set(animations).size !== animations.length) {
      report(index, asset, "animations", "must contain unique non-empty names");
    }

    items.push(Object.freeze({ ...asset, project }));
  });

  return Object.freeze({ project, items: Object.freeze(items), errors: Object.freeze(errors) });
}

export function summarizeAssetBudget(items = []) {
  const lods = {};
  let textureBytes = 0;
  for (const item of items) {
    for (const texture of item.textures ?? []) textureBytes += Number(texture.bytes) || 0;
    for (const lod of item.lods ?? []) {
      const summary = lods[lod.level] ?? { bytes: 0, triangles: 0 };
      summary.bytes += Number(lod.bytes) || 0;
      summary.triangles += Number(lod.triangles) || 0;
      lods[lod.level] = summary;
    }
  }
  return {
    project: items[0]?.project ?? null,
    assetCount: items.length,
    textureBytes,
    lods,
  };
}
