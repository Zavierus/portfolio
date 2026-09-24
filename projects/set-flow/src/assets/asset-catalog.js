function definition(type, displayName, dimensions, cost, {
  collisionBox = dimensions,
  clearance = 0,
  tags = [],
  visual = {},
} = {}) {
  return Object.freeze({
    type,
    displayName,
    dimensions: Object.freeze({ ...dimensions }),
    cost,
    collisionBox: Object.freeze({ ...collisionBox }),
    clearance,
    tags: Object.freeze([...tags]),
    visual: Object.freeze({ ...visual }),
  });
}

export const ASSET_CATALOG = Object.freeze({
  "ambient-light": definition("ambient-light", "环境补光", { width: 0.18, depth: 0.18, height: 0.18 }, 680, {
    tags: ["lighting", "overhead"], visual: { primitive: "orb", color: "#83aeb5" },
  }),
  backdrop: definition("backdrop", "背景板", { width: 2.8, depth: 0.12, height: 2.5 }, 2600, {
    clearance: 0.2, tags: ["set", "surface", "locked-candidate"], visual: { primitive: "wall", color: "#809193" },
  }),
  camera: definition("camera", "摄影机", { width: 0.34, depth: 0.54, height: 0.34 }, 7200, {
    clearance: 0.65, tags: ["camera", "operator-zone"], visual: { primitive: "camera", color: "#d9b85d" },
  }),
  "changing-zone-marker": definition("changing-zone-marker", "换装区标记", { width: 1.1, depth: 1.1, height: 0.04 }, 0, {
    clearance: 0.35, tags: ["marker", "clearance", "non-physical"], visual: { primitive: "marker", color: "#748485" },
  }),
  "garment-rack": definition("garment-rack", "服装陈列架", { width: 1.5, depth: 0.52, height: 1.9 }, 1200, {
    clearance: 0.55, tags: ["set", "wardrobe", "clearance"], visual: { primitive: "rack", color: "#aab7b6" },
  }),
  "key-light": definition("key-light", "主面光", { width: 0.42, depth: 0.32, height: 1.9 }, 3200, {
    collisionBox: { width: 0.65, depth: 0.65, height: 1.9 }, clearance: 0.45, tags: ["lighting", "stand"], visual: { primitive: "light", color: "#ffd4a8" },
  }),
  "light-stand": definition("light-stand", "灯架", { width: 0.52, depth: 0.52, height: 2.1 }, 860, {
    clearance: 0.35, tags: ["lighting", "stand", "tripod"], visual: { primitive: "stand", color: "#748485" },
  }),
  "live-table": definition("live-table", "直播桌", { width: 1.4, depth: 0.62, height: 0.78 }, 1800, {
    clearance: 0.45, tags: ["furniture", "product-surface"], visual: { primitive: "table", color: "#7d8a8b" },
  }),
  monitor: definition("monitor", "返看屏", { width: 0.62, depth: 0.18, height: 0.42 }, 2400, {
    clearance: 0.25, tags: ["display", "power"], visual: { primitive: "monitor", color: "#5eb8c2" },
  }),
  presenter: definition("presenter", "主播活动区", { width: 0.65, depth: 0.65, height: 1.7 }, 0, {
    collisionBox: { width: 0.78, depth: 0.78, height: 1.7 }, clearance: 0.6, tags: ["person", "clearance", "camera-subject"], visual: { primitive: "presenter", color: "#ffd4a8" },
  }),
  "rim-light": definition("rim-light", "轮廓光", { width: 0.32, depth: 0.26, height: 1.85 }, 2200, {
    collisionBox: { width: 0.55, depth: 0.55, height: 1.85 }, clearance: 0.4, tags: ["lighting", "stand"], visual: { primitive: "light", color: "#b7d9dc" },
  }),
  table: definition("table", "工作台", { width: 1.4, depth: 0.62, height: 0.78 }, 1800, {
    clearance: 0.45, tags: ["furniture", "product-surface"], visual: { primitive: "table", color: "#7d8a8b" },
  }),
});

function clone(value) {
  return typeof structuredClone === "function"
    ? structuredClone(value)
    : JSON.parse(JSON.stringify(value));
}

export function createAssetDefinition(type) {
  const item = ASSET_CATALOG[type];
  if (!item) throw new RangeError(`未知资产类型：${type}`);
  return clone(item);
}

export function createAssetFromCatalog(type, options = {}) {
  const item = createAssetDefinition(type);
  const id = String(options.id || "").trim();
  if (!id) throw new TypeError("新增资产需要唯一标识");
  const suppliedPosition = options.position || {};
  return {
    id,
    type: item.type,
    name: String(options.name || item.displayName),
    dimensions: clone(item.dimensions),
    transform: {
      position: {
        x: Number.isFinite(suppliedPosition.x) ? suppliedPosition.x : 0,
        y: Number.isFinite(suppliedPosition.y) ? suppliedPosition.y : item.dimensions.height / 2,
        z: Number.isFinite(suppliedPosition.z) ? suppliedPosition.z : 0,
      },
      rotation: {
        x: Number.isFinite(options.rotation?.x) ? options.rotation.x : 0,
        y: Number.isFinite(options.rotation?.y) ? options.rotation.y : 0,
        z: Number.isFinite(options.rotation?.z) ? options.rotation.z : 0,
      },
    },
    cost: item.cost,
    locked: Boolean(options.locked),
    tags: clone(item.tags),
  };
}

export function listAssetDefinitions() {
  return Object.keys(ASSET_CATALOG).sort().map(createAssetDefinition);
}
