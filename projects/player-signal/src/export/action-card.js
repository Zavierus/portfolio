import { assertNoIdentityFields } from "../data/privacy.js";

function escapeHtml(value) { return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;"); }
function excerpt(review) { const text = String(review.text ?? "").replace(/\s+/g, " ").trim(); return Object.freeze({ reviewIdHash: review.reviewIdHash, excerpt: text.length > 240 ? `${text.slice(0, 237)}…` : text, createdAt: review.createdAt, playerSegment: review.playerSegment, recommended: review.recommended }); }
function slug(value) { return String(value).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 48) || "signal"; }

export function buildActionCard(topic, reviews, context) {
  const byId = new Map(reviews.map((review) => [review.reviewIdHash, review]));
  const evidence = topic.evidenceIds.map((id) => byId.get(id)).filter(Boolean).map(excerpt).slice(0, 4);
  const counterEvidence = topic.counterEvidenceIds.map((id) => byId.get(id)).filter(Boolean).map(excerpt).slice(0, 3);
  const nextSteps = { investigate: "在主要硬件分层复现问题，并核对客户端日志。", validate: "补充下一时间窗口样本并验证同类表达是否持续增长。", observe: "持续收集评论，在样本量达到门槛后重新评估。", "low-evidence": "扩大样本并人工检查待分类评论，暂不形成修复判断。" };
  const card = {
    schemaVersion: 1,
    id: `action:${context.game.appId}:${topic.id}`,
    generatedAt: context.generatedAt,
    game: { id: context.game.id, appId: context.game.appId, name: context.game.name },
    topic: { id: topic.id, label: topic.label, category: topic.category },
    observations: { sampleCount: topic.raw.count, currentWindowCount: topic.raw.currentCount, previousWindowCount: topic.raw.previousCount, negativeShare: topic.raw.count ? topic.raw.negativeCount / topic.raw.count : 0, corePlayerShare: topic.dimensions.coreImpact, velocity: topic.dimensions.velocity },
    inference: { workState: topic.workState, confidence: topic.confidence, priorityScore: topic.score, versionAssociation: topic.dimensions.versionProximity },
    evidence, counterEvidence,
    unknowns: ["评论证据不能证明程序根因、修复难度或开发工期。", "版本时间只表示相关性，不证明更新造成该反馈。", ...(topic.limitations ?? []).map((item) => `分析限制：${item}`)],
    nextValidationStep: nextSteps[topic.workState] ?? nextSteps.observe,
    source: { provider: context.source.provider, url: context.source.url, retrievedAt: context.source.retrievedAt },
  };
  assertNoIdentityFields(card);
  return Object.freeze(structuredClone(card));
}

function markdown(card) {
  const evidenceLines = card.evidence.map((item) => `> ${item.excerpt}\n> — ${item.createdAt.slice(0, 10)} · ${item.playerSegment} · ${item.reviewIdHash.slice(0, 10)}`).join("\n\n") || "No supporting excerpt met the evidence threshold.";
  const counterLines = card.counterEvidence.map((item) => `> ${item.excerpt}\n> — ${item.createdAt.slice(0, 10)} · ${item.playerSegment} · ${item.reviewIdHash.slice(0, 10)}`).join("\n\n") || "No counter-evidence matched the current topic.";
  return `# ${card.topic.label}\n\n**Game:** ${card.game.name} (AppID ${card.game.appId})  \n**Generated:** ${card.generatedAt}  \n**Source:** ${card.source.provider} · ${card.source.retrievedAt}\n\n## Observed evidence\n\n- Accepted topic sample: ${card.observations.sampleCount}\n- Current / previous window: ${card.observations.currentWindowCount} / ${card.observations.previousWindowCount}\n- Negative recommendation share: ${Math.round(card.observations.negativeShare * 100)}%\n- Core-player share: ${Math.round(card.observations.corePlayerShare * 100)}%\n\n## Analytic inference\n\n- Work state: ${card.inference.workState}\n- Confidence: ${Math.round(card.inference.confidence * 100)}%\n- Priority score: ${Math.round(card.inference.priorityScore * 100)}%\n- Correlation is not causation. Version proximity is a search clue, not a proven cause.\n\n## Supporting evidence\n\n${evidenceLines}\n\n## Counter-evidence\n\n${counterLines}\n\n## Unknowns\n\n${card.unknowns.map((item) => `- ${item}`).join("\n")}\n\n## Next validation step\n\n${card.nextValidationStep}\n\nSource: ${card.source.url}\n`;
}

function printHtml(card) {
  const renderQuotes = (items) => items.map((item) => `<blockquote><p>${escapeHtml(item.excerpt)}</p><footer>${escapeHtml(item.createdAt.slice(0, 10))} · ${escapeHtml(item.playerSegment)} · ${escapeHtml(item.reviewIdHash.slice(0, 10))}</footer></blockquote>`).join("") || "<p>没有满足门槛的证据摘录。</p>";
  return `<!doctype html><html lang="zh-CN"><head><meta charset="UTF-8"><title>${escapeHtml(card.topic.label)} — PLAYER SIGNAL</title><style>body{max-width:820px;margin:40px auto;padding:0 24px;color:#17232a;font:14px/1.7 system-ui,sans-serif}h1{font-size:38px;line-height:1.05}small,footer{color:#667982}dl{display:grid;grid-template-columns:repeat(4,1fr);gap:12px}dl div{border-top:2px solid #17232a;padding-top:8px}dt{font-size:11px;color:#667982}dd{margin:4px 0;font-size:20px;font-weight:700}blockquote{margin:12px 0;padding:12px 16px;background:#eef4f5;border-left:3px solid #ef6b5e}button{padding:10px 14px}@media print{button{display:none}}</style></head><body><button onclick="print()">打印行动卡</button><small>PLAYER SIGNAL / EVIDENCE-BACKED ACTION CARD</small><h1>${escapeHtml(card.topic.label)}</h1><p>${escapeHtml(card.game.name)} · AppID ${card.game.appId} · ${escapeHtml(card.generatedAt)}</p><h2>观察值</h2><dl><div><dt>样本</dt><dd>${card.observations.sampleCount}</dd></div><div><dt>当前 / 前一</dt><dd>${card.observations.currentWindowCount} / ${card.observations.previousWindowCount}</dd></div><div><dt>负向</dt><dd>${Math.round(card.observations.negativeShare * 100)}%</dd></div><div><dt>核心玩家</dt><dd>${Math.round(card.observations.corePlayerShare * 100)}%</dd></div></dl><h2>分析判断</h2><p>工作状态：${escapeHtml(card.inference.workState)} · 置信度 ${Math.round(card.inference.confidence * 100)}%。版本关联不等于因果。</p><h2>支持证据</h2>${renderQuotes(card.evidence)}<h2>反例</h2>${renderQuotes(card.counterEvidence)}<h2>未知项</h2><ul>${card.unknowns.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul><h2>下一步验证</h2><p>${escapeHtml(card.nextValidationStep)}</p><footer>Source: ${escapeHtml(card.source.url)} · Snapshot ${escapeHtml(card.source.retrievedAt)}</footer></body></html>`;
}

export function createActionCardPackage(topic, reviews, context) {
  const card = buildActionCard(topic, reviews, context); const baseName = `player-signal-${slug(topic.label)}`;
  return Object.freeze({ card, files: Object.freeze([
    Object.freeze({ name: `${baseName}.md`, extension: "md", type: "text/markdown;charset=utf-8", content: markdown(card) }),
    Object.freeze({ name: `${baseName}.json`, extension: "json", type: "application/json;charset=utf-8", content: `${JSON.stringify(card, null, 2)}\n` }),
    Object.freeze({ name: `${baseName}.html`, extension: "html", type: "text/html;charset=utf-8", content: printHtml(card) }),
  ]) });
}
