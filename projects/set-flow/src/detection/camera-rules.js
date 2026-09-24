const SENSOR_HEIGHT_MM = 24;

function vector(from, to) {
  return { x: to.x - from.x, y: to.y - from.y, z: to.z - from.z };
}

function dot(a, b) { return a.x * b.x + a.y * b.y + a.z * b.z; }
function cross(a, b) { return { x: a.y * b.z - a.z * b.y, y: a.z * b.x - a.x * b.z, z: a.x * b.y - a.y * b.x }; }
function length(value) { return Math.hypot(value.x, value.y, value.z); }
function normalize(value) {
  const magnitude = length(value) || 1;
  return { x: value.x / magnitude, y: value.y / magnitude, z: value.z / magnitude };
}

function aspectNumber(aspect) {
  if (aspect === "16:9") return 16 / 9;
  if (aspect === "1:1") return 1;
  return 9 / 16;
}

function verticalFov(camera) {
  return 2 * Math.atan(SENSOR_HEIGHT_MM / (2 * camera.focalLength));
}

export function projectPointToCamera(point, camera) {
  const forward = normalize(vector(camera.position, camera.target));
  let right = normalize(cross(forward, { x: 0, y: 1, z: 0 }));
  if (length(right) < 1e-5) right = { x: 1, y: 0, z: 0 };
  const up = normalize(cross(right, forward));
  const relative = vector(camera.position, point);
  const depth = dot(relative, forward);
  if (depth <= 0) return { x: Infinity, y: Infinity, depth, visible: false };
  const halfHeight = depth * Math.tan(verticalFov(camera) / 2);
  const halfWidth = halfHeight * aspectNumber(camera.aspect);
  const x = dot(relative, right) / halfWidth;
  const y = dot(relative, up) / halfHeight;
  return { x, y, depth, visible: Math.abs(x) <= 1 && Math.abs(y) <= 1 };
}

function cameraCoverageIssues(project) {
  const subjects = project.assets.filter((asset) => asset.type === "presenter");
  const issues = [];
  for (const subject of subjects) {
    const point = subject.transform.position;
    const coveredBy = project.cameras.filter((camera) => projectPointToCamera(point, camera).visible).map((camera) => camera.id);
    if (coveredBy.length > 0) continue;
    issues.push({
      id: `camera-coverage:${subject.id}`,
      type: "camera-coverage",
      severity: "critical",
      assetIds: [subject.id],
      cameraId: null,
      evidence: { coveredBy, cameraCount: project.cameras.length },
      message: `${subject.name}没有进入任何机位的有效画面`,
      suggestion: "调整机位目标、焦距或主播站位，确保至少一个机位完整覆盖",
    });
  }
  return issues;
}

function platformOverlayIssues(project) {
  const subjects = project.assets.filter((asset) => asset.type === "presenter");
  const issues = [];
  for (const camera of project.cameras) {
    for (const subject of subjects) {
      const projection = projectPointToCamera(subject.transform.position, camera);
      if (!projection.visible || projection.x < 0.68) continue;
      issues.push({
        id: `platform-overlay:${camera.id}:${subject.id}`,
        type: "platform-overlay",
        severity: "warning",
        assetIds: [subject.id],
        cameraId: camera.id,
        evidence: { normalizedX: Number(projection.x.toFixed(3)), zoneStart: 0.68 },
        message: `${subject.name}进入${camera.name}右侧平台 UI 安全区`,
        suggestion: "向画面中心调整站位或重新构图，为评论和互动控件留出空间",
      });
    }
  }
  return issues;
}

function distanceToSegment(point, start, end) {
  const segment = vector(start, end);
  const relative = vector(start, point);
  const denominator = dot(segment, segment) || 1;
  const t = Math.max(0, Math.min(1, dot(relative, segment) / denominator));
  const nearest = { x: start.x + segment.x * t, y: start.y + segment.y * t, z: start.z + segment.z * t };
  return { distance: length(vector(nearest, point)), t };
}

function obstructionIssues(project) {
  const issues = [];
  for (const camera of project.cameras) {
    const candidate = project.assets
      .filter((asset) => !["presenter", "backdrop"].includes(asset.type))
      .map((asset) => ({ asset, ...distanceToSegment(asset.transform.position, camera.position, camera.target) }))
      .filter(({ asset, distance, t }) => t > 0.08 && t < 0.92 && distance < Math.max(asset.dimensions.width, asset.dimensions.depth, asset.dimensions.height) * 0.38)
      .sort((a, b) => a.distance - b.distance)[0];
    if (!candidate) continue;
    issues.push({
      id: `camera-obstruction:${camera.id}:${candidate.asset.id}`,
      type: "camera-obstruction",
      severity: "warning",
      assetIds: [candidate.asset.id],
      cameraId: camera.id,
      evidence: { lineDistance: Number(candidate.distance.toFixed(3)), lineProgress: Number(candidate.t.toFixed(3)) },
      message: `${candidate.asset.name}靠近${camera.name}的视线中心`,
      suggestion: "检查实机画面中的遮挡；必要时移动设备或抬高机位",
    });
  }
  return issues;
}

export function detectCameraIssues(project) {
  return [
    ...cameraCoverageIssues(project),
    ...platformOverlayIssues(project),
    ...obstructionIssues(project),
  ];
}
