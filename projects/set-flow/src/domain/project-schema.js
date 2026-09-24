export const PROJECT_SCHEMA_VERSION = 1;

const ASPECT_RATIOS = new Set(["9:16", "16:9", "1:1"]);
const SAFE_ZONE_PRESETS = new Set(["vertical-live", "broadcast", "product"]);

function createId() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return `set-flow-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function clone(value) {
  return structuredClone(value);
}

function createVector3(x = 0, y = 0, z = 0) {
  return { x, y, z };
}

export function createEmptyProject(overrides = {}) {
  const timestamp = new Date().toISOString();
  const base = {
    id: createId(),
    name: "Untitled live studio",
    schemaVersion: PROJECT_SCHEMA_VERSION,
    updatedAt: timestamp,
    room: {
      width: 3.8,
      depth: 5.6,
      height: 2.8,
      unit: "m",
    },
    brief: {
      category: "garment",
      presenterCount: 1,
      aspect: "9:16",
      needsMovement: true,
    },
    assets: [],
    cameras: [],
    budget: {
      limit: 20_000,
      currency: "CNY",
    },
    versions: [],
    settings: {
      gridStep: 0.1,
      measurementUnit: "m",
      quality: "balanced",
    },
  };

  return {
    ...base,
    ...clone(overrides),
    room: { ...base.room, ...clone(overrides.room || {}) },
    brief: { ...base.brief, ...clone(overrides.brief || {}) },
    budget: { ...base.budget, ...clone(overrides.budget || {}) },
    settings: { ...base.settings, ...clone(overrides.settings || {}) },
    assets: clone(overrides.assets || base.assets),
    cameras: clone(overrides.cameras || base.cameras),
    versions: clone(overrides.versions || base.versions),
  };
}

export function cloneProject(project) {
  return clone(project);
}

function pushError(errors, path, code, message) {
  errors.push({ path, code, message });
}

function requirePositiveNumber(errors, value, path) {
  if (!Number.isFinite(value) || value <= 0) {
    pushError(errors, path, "positive-number-required", "请输入大于 0 的有效数值");
  }
}

function requireFiniteVector(errors, value, path) {
  if (!value || typeof value !== "object") {
    pushError(errors, path, "vector-required", "缺少三维坐标");
    return;
  }
  for (const axis of ["x", "y", "z"]) {
    if (!Number.isFinite(value[axis])) {
      pushError(errors, `${path}.${axis}`, "finite-number-required", "坐标必须是有效数值");
    }
  }
}

function validateAssets(project, errors) {
  if (!Array.isArray(project.assets)) {
    pushError(errors, "assets", "array-required", "资产列表格式无效");
    return;
  }

  const identifiers = new Set();
  project.assets.forEach((asset, index) => {
    const path = `assets[${index}]`;
    if (!asset?.id || typeof asset.id !== "string") {
      pushError(errors, `${path}.id`, "id-required", "资产缺少唯一标识");
    } else if (identifiers.has(asset.id)) {
      pushError(errors, `${path}.id`, "duplicate-id", "资产标识不能重复");
    } else {
      identifiers.add(asset.id);
    }

    if (!asset?.type || typeof asset.type !== "string") {
      pushError(errors, `${path}.type`, "type-required", "资产缺少类型");
    }
    for (const dimension of ["width", "depth", "height"]) {
      requirePositiveNumber(errors, asset?.dimensions?.[dimension], `${path}.dimensions.${dimension}`);
    }
    requireFiniteVector(errors, asset?.transform?.position, `${path}.transform.position`);
    requireFiniteVector(errors, asset?.transform?.rotation, `${path}.transform.rotation`);
    if (!Number.isFinite(asset?.cost) || asset.cost < 0) {
      pushError(errors, `${path}.cost`, "non-negative-number-required", "资产价格不能为负数");
    }
  });
}

function validateCameras(project, errors) {
  if (!Array.isArray(project.cameras)) {
    pushError(errors, "cameras", "array-required", "机位列表格式无效");
    return;
  }

  const identifiers = new Set();
  project.cameras.forEach((camera, index) => {
    const path = `cameras[${index}]`;
    if (!camera?.id || typeof camera.id !== "string") {
      pushError(errors, `${path}.id`, "id-required", "机位缺少唯一标识");
    } else if (identifiers.has(camera.id)) {
      pushError(errors, `${path}.id`, "duplicate-id", "机位标识不能重复");
    } else {
      identifiers.add(camera.id);
    }
    if (!Number.isFinite(camera?.focalLength) || camera.focalLength < 12 || camera.focalLength > 200) {
      pushError(errors, `${path}.focalLength`, "focal-length-out-of-range", "等效焦距应在 12 至 200 mm 之间");
    }
    if (!ASPECT_RATIOS.has(camera?.aspect)) {
      pushError(errors, `${path}.aspect`, "unsupported-aspect", "机位画幅仅支持 9:16、16:9 或 1:1");
    }
    if (!SAFE_ZONE_PRESETS.has(camera?.safeZonePreset)) {
      pushError(errors, `${path}.safeZonePreset`, "unsupported-safe-zone", "机位安全区预设无效");
    }
    requireFiniteVector(errors, camera?.position, `${path}.position`);
    requireFiniteVector(errors, camera?.target, `${path}.target`);
  });
}

export function validateProject(project) {
  const errors = [];
  if (!project || typeof project !== "object") {
    pushError(errors, "project", "object-required", "工程文件格式无效");
    return { valid: false, errors };
  }

  if (project.schemaVersion !== PROJECT_SCHEMA_VERSION) {
    pushError(errors, "schemaVersion", "unsupported-schema", `仅支持工程版本 ${PROJECT_SCHEMA_VERSION}`);
  }
  if (!project.id || typeof project.id !== "string") {
    pushError(errors, "id", "id-required", "工程缺少唯一标识");
  }
  if (!project.name || typeof project.name !== "string") {
    pushError(errors, "name", "name-required", "工程名称不能为空");
  }

  requirePositiveNumber(errors, project.room?.width, "room.width");
  requirePositiveNumber(errors, project.room?.depth, "room.depth");
  requirePositiveNumber(errors, project.room?.height, "room.height");
  if (project.room?.unit !== "m") {
    pushError(errors, "room.unit", "unsupported-unit", "第一版仅支持米制单位");
  }

  if (!Number.isInteger(project.brief?.presenterCount) || project.brief.presenterCount < 1 || project.brief.presenterCount > 2) {
    pushError(errors, "brief.presenterCount", "presenter-count-out-of-range", "第一版支持一至两名主播");
  }
  if (!ASPECT_RATIOS.has(project.brief?.aspect)) {
    pushError(errors, "brief.aspect", "unsupported-aspect", "直播画幅仅支持 9:16、16:9 或 1:1");
  }

  if (!Number.isFinite(project.budget?.limit) || project.budget.limit < 0) {
    pushError(errors, "budget.limit", "non-negative-number-required", "预算不能为负数");
  }
  if (project.budget?.currency !== "CNY") {
    pushError(errors, "budget.currency", "unsupported-currency", "第一版预算仅支持人民币");
  }

  validateAssets(project, errors);
  validateCameras(project, errors);

  return { valid: errors.length === 0, errors };
}

export function createTransform(position = createVector3(), rotation = createVector3()) {
  return { position: clone(position), rotation: clone(rotation) };
}
