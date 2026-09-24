import { cloneProject, validateProject } from "../domain/project-schema.js";

function safeFilename(value) {
  const cleaned = String(value || "set-flow-project")
    .trim()
    .replace(/[^a-zA-Z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return cleaned || "set-flow-project";
}

export function serializeProject(project) {
  const validation = validateProject(project);
  if (!validation.valid) {
    return { ok: false, code: "invalid-project", errors: validation.errors };
  }
  return {
    ok: true,
    filename: `${safeFilename(project.id)}.setflow.json`,
    text: `${JSON.stringify(project, null, 2)}\n`,
  };
}

export function parseProjectFile(text) {
  let project;
  try {
    project = JSON.parse(text);
  } catch (error) {
    return {
      ok: false,
      code: "invalid-json",
      message: error instanceof Error ? `工程文件不是有效 JSON：${error.message}` : "工程文件不是有效 JSON",
    };
  }

  const validation = validateProject(project);
  if (!validation.valid) {
    return { ok: false, code: "invalid-project", message: "工程文件结构不完整", errors: validation.errors };
  }
  return { ok: true, project: cloneProject(project) };
}

export function createEquipmentRows(project) {
  return project.assets.map((asset) => ({
    id: asset.id,
    name: asset.name,
    type: asset.type,
    quantity: 1,
    unitCost: asset.cost,
    subtotal: asset.cost,
  }));
}

function escapeCsv(value) {
  const text = String(value ?? "");
  if (!/[",\r\n]/.test(text)) return text;
  return `"${text.replaceAll('"', '""')}"`;
}

export function equipmentRowsToCsv(rows) {
  const header = ["ID", "名称", "类型", "数量", "单价", "小计"];
  const body = rows.map((row) => [
    row.id,
    row.name,
    row.type,
    row.quantity,
    row.unitCost,
    row.subtotal,
  ]);
  return `${[header, ...body].map((cells) => cells.map(escapeCsv).join(",")).join("\r\n")}\r\n`;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function createPrintReport(project, { issues = [], captures = {} } = {}) {
  const total = project.assets.reduce((sum, asset) => sum + Number(asset.cost || 0), 0);
  const image = (key, label) => captures[key]
    ? `<figure><img src="${escapeHtml(captures[key])}" alt="${escapeHtml(label)}"><figcaption>${escapeHtml(label)}</figcaption></figure>`
    : `<figure class="missing"><div>未获取画面</div><figcaption>${escapeHtml(label)}</figcaption></figure>`;
  const issueRows = issues.length
    ? issues.map((issue) => `<tr><td>${escapeHtml(issue.severity)}</td><td>${escapeHtml(issue.message)}</td><td>${escapeHtml(issue.suggestion)}</td></tr>`).join("")
    : '<tr><td colspan="3">当前规则未发现问题</td></tr>';

  return `<!doctype html>
<html lang="zh-CN"><head><meta charset="UTF-8"><title>${escapeHtml(project.name)} / SET//FLOW 执行报告</title>
<style>
@page{size:A4 landscape;margin:12mm}*{box-sizing:border-box}body{margin:0;color:#172125;background:#fff;font:12px/1.55 "Microsoft YaHei UI",sans-serif}header{display:flex;justify-content:space-between;align-items:end;padding-bottom:12px;border-bottom:2px solid #172125}h1{margin:0;font-size:26px}header p{margin:0;color:#526165}.metrics{display:grid;grid-template-columns:repeat(4,1fr);margin:14px 0;border:1px solid #aab7b6}.metrics div{padding:9px 11px;border-right:1px solid #aab7b6}.metrics div:last-child{border:0}.metrics span,figcaption{display:block;color:#526165;font:9px/1.2 Consolas,monospace;letter-spacing:.08em;text-transform:uppercase}.metrics strong{display:block;margin-top:4px}.views{display:grid;grid-template-columns:2fr 1fr 1fr;gap:9px}figure{margin:0;padding:7px;border:1px solid #aab7b6;background:#eef2f1}figure img,figure>div{width:100%;height:220px;display:block;object-fit:contain;background:#0e1518}figcaption{padding-top:6px}h2{margin:16px 0 7px;font-size:15px}table{width:100%;border-collapse:collapse}th,td{padding:7px 8px;border:1px solid #c6cfcd;text-align:left;vertical-align:top}th{background:#eef2f1}.disclaimer{margin-top:12px;padding-top:8px;border-top:1px solid #aab7b6;color:#526165;font-size:10px}@media print{body{print-color-adjust:exact;-webkit-print-color-adjust:exact}}
</style></head><body>
<header><div><span>SET//FLOW / EXECUTION REPORT</span><h1>${escapeHtml(project.name)}</h1></div><p>工程更新时间 ${escapeHtml(project.updatedAt)}</p></header>
<section class="metrics"><div><span>房间</span><strong>${project.room.width.toFixed(2)} × ${project.room.depth.toFixed(2)} × ${project.room.height.toFixed(2)} m</strong></div><div><span>机位</span><strong>${project.cameras.length}</strong></div><div><span>设备</span><strong>${project.assets.length}</strong></div><div><span>设备预算</span><strong>¥${total.toLocaleString("zh-CN")} / ¥${project.budget.limit.toLocaleString("zh-CN")}</strong></div></section>
<section class="views">${image("top", "三维总览")}${image("camera-primary", "CAM A / 主机位")}${image("camera-detail", "CAM B / 特写机位")}</section>
<h2>检查结果 / ${issues.length} 项</h2><table><thead><tr><th>级别</th><th>证据结论</th><th>处理建议</th></tr></thead><tbody>${issueRows}</tbody></table>
<p class="disclaimer">本报告用于直播空间预演与沟通，几何规则和机位预览不能替代现场安全检查、结构承重确认、电气检查及专业施工复核。</p>
</body></html>`;
}

export function createExecutionPackage(project, { issues = [], captures = {} } = {}) {
  const serialized = serializeProject(project);
  if (!serialized.ok) return serialized;
  const base = safeFilename(project.id);
  const files = [
    { role: "project", filename: serialized.filename, mime: "application/json", text: serialized.text },
    { role: "equipment", filename: `${base}-equipment.csv`, mime: "text/csv;charset=utf-8", text: `\uFEFF${equipmentRowsToCsv(createEquipmentRows(project))}` },
    { role: "report", filename: `${base}-report.html`, mime: "text/html;charset=utf-8", text: createPrintReport(project, { issues, captures }) },
  ];
  const missingCaptures = [];
  for (const [role, key, suffix] of [
    ["top-view", "top", "top-view"],
    ["camera-primary", "camera-primary", "camera-a"],
    ["camera-detail", "camera-detail", "camera-b"],
  ]) {
    if (captures[key]) files.push({ role, filename: `${base}-${suffix}.png`, mime: "image/png", dataUrl: captures[key] });
    else missingCaptures.push(key);
  }
  return { ok: true, files, missingCaptures };
}
