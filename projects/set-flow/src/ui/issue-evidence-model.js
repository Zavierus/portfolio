function measurement(label, value, unit) {
  return Number.isFinite(value) ? Object.freeze({ label, value, unit }) : null;
}

function baseModel(issue, kind, nextMeasurement, visual) {
  if (!issue?.id) throw new TypeError("问题证据缺少唯一标识");
  return Object.freeze({
    id: issue.id,
    type: issue.type,
    kind,
    assetIds: Object.freeze([...(issue.assetIds || [])]),
    cameraId: issue.cameraId || null,
    message: String(issue.message || "需要检查工程问题"),
    suggestion: String(issue.suggestion || "检查关联对象与工程参数"),
    evidence: Object.freeze({ ...(issue.evidence || {}) }),
    measurement: nextMeasurement,
    visual: Object.freeze({
      showInScene: true,
      showCollisionBoxes: false,
      showBoundaryMeasure: false,
      showLineOfSight: false,
      safeZone: null,
      ...visual,
    }),
  });
}

export function createIssueEvidenceModel(issue) {
  const evidence = issue?.evidence || {};
  switch (issue?.type) {
    case "collision":
      return baseModel(issue, "collision", measurement("重叠", evidence.overlapDepth, "m"), { showCollisionBoxes: true });
    case "boundary":
      return baseModel(issue, "boundary", measurement("越界", evidence.outsideDistance, "m"), { showBoundaryMeasure: true });
    case "camera-obstruction":
      return baseModel(issue, "line-of-sight", measurement("距视线中心", evidence.lineDistance, "m"), { showLineOfSight: true });
    case "platform-overlay":
      return baseModel(issue, "safe-zone", measurement("画面横向位置", evidence.normalizedX, "normalized"), { showInScene: false, safeZone: "platform" });
    case "camera-coverage":
      return baseModel(issue, "camera-coverage", null, { showLineOfSight: true });
    case "budget":
      return baseModel(issue, "budget", measurement("超出预算", evidence.overBy, "CNY"), { showInScene: false });
    default:
      return baseModel(issue, "neutral", null, {});
  }
}
