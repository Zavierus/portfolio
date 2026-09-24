function issueFor(asset, outsideDistance, axes) {
  const centimeters = Math.round(outsideDistance * 100);
  return {
    id: `boundary:${asset.id}`,
    type: "boundary",
    severity: outsideDistance >= 0.3 ? "critical" : "warning",
    assetIds: [asset.id],
    cameraId: null,
    evidence: { outsideDistance, axes },
    message: `${asset.name} 超出房间边界 ${centimeters} cm`,
    suggestion: "将对象移回房间轮廓内，并为现场安装保留额外净空",
  };
}

function rotatedHalfExtents(asset) {
  const angle = asset.transform.rotation.y || 0;
  const cosine = Math.abs(Math.cos(angle));
  const sine = Math.abs(Math.sin(angle));
  return {
    x: cosine * asset.dimensions.width / 2 + sine * asset.dimensions.depth / 2,
    z: sine * asset.dimensions.width / 2 + cosine * asset.dimensions.depth / 2,
    y: asset.dimensions.height / 2,
  };
}

export function detectBoundaryIssues(project) {
  const roomHalfWidth = project.room.width / 2;
  const roomHalfDepth = project.room.depth / 2;
  const issues = [];

  for (const asset of project.assets) {
    const half = rotatedHalfExtents(asset);
    const position = asset.transform.position;
    const distances = {
      left: Math.max(0, -roomHalfWidth - (position.x - half.x)),
      right: Math.max(0, position.x + half.x - roomHalfWidth),
      back: Math.max(0, -roomHalfDepth - (position.z - half.z)),
      front: Math.max(0, position.z + half.z - roomHalfDepth),
      floor: Math.max(0, -(position.y - half.y)),
      ceiling: Math.max(0, position.y + half.y - project.room.height),
    };
    const axes = Object.entries(distances).filter(([, value]) => value > 1e-6).map(([axis]) => axis);
    const outsideDistance = Math.max(...Object.values(distances));
    if (outsideDistance > 1e-6) issues.push(issueFor(asset, Number(outsideDistance.toFixed(3)), axes));
  }
  return issues;
}
