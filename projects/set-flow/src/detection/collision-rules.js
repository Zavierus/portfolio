import { createAssetDefinition } from "../assets/asset-catalog.js";

function definitionFor(asset) {
  try { return createAssetDefinition(asset.type); } catch {
    return { collisionBox: asset.dimensions, clearance: 0, tags: [] };
  }
}

function bounds(asset) {
  const definition = definitionFor(asset);
  const box = definition.collisionBox || asset.dimensions;
  const presenterClearance = asset.type === "presenter" ? Number(definition.clearance || 0) / 2 : 0;
  const angle = asset.transform.rotation.y || 0;
  const cosine = Math.abs(Math.cos(angle));
  const sine = Math.abs(Math.sin(angle));
  const halfX = cosine * box.width / 2 + sine * box.depth / 2 + presenterClearance;
  const halfZ = sine * box.width / 2 + cosine * box.depth / 2 + presenterClearance;
  const halfY = box.height / 2;
  const position = asset.transform.position;
  return {
    minX: position.x - halfX, maxX: position.x + halfX,
    minY: position.y - halfY, maxY: position.y + halfY,
    minZ: position.z - halfZ, maxZ: position.z + halfZ,
    tags: definition.tags || [],
  };
}

function overlap(a, b) {
  return {
    x: Math.min(a.maxX, b.maxX) - Math.max(a.minX, b.minX),
    y: Math.min(a.maxY, b.maxY) - Math.max(a.minY, b.minY),
    z: Math.min(a.maxZ, b.maxZ) - Math.max(a.minZ, b.minZ),
  };
}

export function detectCollisionIssues(project) {
  const issues = [];
  for (let leftIndex = 0; leftIndex < project.assets.length; leftIndex += 1) {
    const left = project.assets[leftIndex];
    const leftBounds = bounds(left);
    if (leftBounds.tags.includes("non-physical")) continue;
    for (let rightIndex = leftIndex + 1; rightIndex < project.assets.length; rightIndex += 1) {
      const right = project.assets[rightIndex];
      if (left.type === "presenter" && right.type === "presenter") continue;
      if ([left.type, right.type].includes("presenter") && [left.type, right.type].some((type) => ["table", "live-table"].includes(type))) continue;
      const rightBounds = bounds(right);
      if (rightBounds.tags.includes("non-physical")) continue;
      const measured = overlap(leftBounds, rightBounds);
      if (measured.x <= 0.05 || measured.y <= 0 || measured.z <= 0.05) continue;
      const overlapDepth = Number(Math.min(measured.x, measured.z).toFixed(3));
      const ids = [left.id, right.id].sort();
      const involvesPresenter = left.type === "presenter" || right.type === "presenter";
      issues.push({
        id: `collision:${ids.join(":")}`,
        type: "collision",
        severity: involvesPresenter ? "critical" : "warning",
        assetIds: ids,
        cameraId: null,
        evidence: { overlapDepth, overlap: measured },
        message: `${left.name}与${right.name}的${involvesPresenter ? "活动净空" : "碰撞盒"}重叠 ${Math.round(overlapDepth * 100)} cm`,
        suggestion: involvesPresenter ? "移动设备或缩小活动区域后重新检查" : "调整对象位置，避免安装和使用空间互相占用",
      });
    }
  }
  return issues;
}
