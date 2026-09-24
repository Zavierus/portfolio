import { createEmptyProject, createTransform } from "./project-schema.js";

function asset(id, type, name, dimensions, position, cost, overrides = {}) {
  return {
    id,
    type,
    name,
    dimensions,
    transform: createTransform(position, overrides.rotation),
    cost,
    locked: Boolean(overrides.locked),
    tags: [...(overrides.tags || [])],
  };
}

export function createExampleProject() {
  return createEmptyProject({
    id: "set-flow-garment-demo",
    name: "Garment studio / Working draft",
    updatedAt: "2026-08-11T00:00:00.000Z",
    room: { width: 3.8, depth: 5.6, height: 2.8, unit: "m" },
    brief: {
      category: "garment",
      presenterCount: 2,
      aspect: "9:16",
      needsMovement: true,
    },
    budget: { limit: 20_000, currency: "CNY" },
    assets: [
      asset("backdrop-1", "backdrop", "主背景板", { width: 2.8, depth: 0.12, height: 2.5 }, { x: 0.35, y: 1.25, z: -2.55 }, 2_600, { locked: true }),
      asset("rack-1", "garment-rack", "服装陈列架", { width: 1.5, depth: 0.52, height: 1.9 }, { x: 1.0, y: 0.95, z: -1.85 }, 1_200),
      asset("table-1", "live-table", "直播桌", { width: 1.4, depth: 0.62, height: 0.78 }, { x: 0.55, y: 0.39, z: -0.35 }, 1_800),
      asset("presenter-1", "presenter", "主播 A", { width: 0.65, depth: 0.65, height: 1.7 }, { x: -0.45, y: 0.85, z: -0.5 }, 0, { tags: ["clearance:0.6"] }),
      asset("presenter-2", "presenter", "主播 B", { width: 0.65, depth: 0.65, height: 1.72 }, { x: 0.45, y: 0.86, z: -0.55 }, 0, { tags: ["clearance:0.6"] }),
      asset("key-light-1", "key-light", "主面光", { width: 0.42, depth: 0.32, height: 1.9 }, { x: -1.15, y: 0.95, z: 0.35 }, 3_200, { rotation: { x: 0, y: 0.35, z: 0 } }),
      asset("light-stand-2", "light-stand", "右侧灯架", { width: 0.52, depth: 0.52, height: 2.1 }, { x: 0.62, y: 1.05, z: -0.48 }, 860),
      asset("monitor-1", "monitor", "返看屏", { width: 0.62, depth: 0.18, height: 0.42 }, { x: -1.25, y: 1.25, z: -1.7 }, 2_400, { rotation: { x: 0, y: 0.55, z: 0 } }),
    ],
    cameras: [
      {
        id: "camera-primary",
        name: "CAM A / 主机位",
        role: "primary",
        position: { x: 0, y: 1.42, z: 2.35 },
        target: { x: 0, y: 1.05, z: -0.55 },
        focalLength: 28,
        aspect: "9:16",
        safeZonePreset: "vertical-live",
      },
      {
        id: "camera-detail",
        name: "CAM B / 特写机位",
        role: "detail",
        position: { x: 1.45, y: 1.32, z: 1.2 },
        target: { x: 1.35, y: 1.05, z: -1.8 },
        focalLength: 50,
        aspect: "9:16",
        safeZonePreset: "vertical-live",
      },
    ],
  });
}
