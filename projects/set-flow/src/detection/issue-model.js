import { detectBoundaryIssues } from "./boundary-rules.js";
import { detectCameraIssues } from "./camera-rules.js";
import { detectCollisionIssues } from "./collision-rules.js";

const SEVERITY_ORDER = { critical: 0, warning: 1, info: 2 };

function budgetIssues(project) {
  const total = project.assets.reduce((sum, asset) => sum + Number(asset.cost || 0), 0);
  if (total <= project.budget.limit) return [];
  const overBy = total - project.budget.limit;
  return [{
    id: "budget:equipment",
    type: "budget",
    severity: overBy > project.budget.limit * 0.2 ? "critical" : "warning",
    assetIds: project.assets.filter((asset) => asset.cost > 0).map((asset) => asset.id),
    cameraId: null,
    evidence: { total, limit: project.budget.limit, overBy },
    message: `设备预算超出 ¥${overBy.toLocaleString("zh-CN")}`,
    suggestion: "替换高成本设备或提高预算上限，并保留安装与耗材余量",
  }];
}

export function evaluateProject(project) {
  const byId = new Map();
  for (const issue of [
    ...detectBoundaryIssues(project),
    ...detectCollisionIssues(project),
    ...detectCameraIssues(project),
    ...budgetIssues(project),
  ]) byId.set(issue.id, issue);

  return [...byId.values()].sort((left, right) =>
    SEVERITY_ORDER[left.severity] - SEVERITY_ORDER[right.severity]
      || left.type.localeCompare(right.type)
      || left.id.localeCompare(right.id));
}
