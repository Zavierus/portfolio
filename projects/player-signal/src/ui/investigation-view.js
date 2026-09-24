import { formatDate, formatInteger, formatPercent } from "./formatters.js";
import { getTopicCopy } from "./topic-copy.js";

const STATE_LABELS = Object.freeze({ investigate: "立即调查", validate: "需要验证", observe: "持续观察", "low-evidence": "证据不足" });
const SEGMENT_LABELS = Object.freeze({ new: "新玩家", mid: "中等时长", core: "核心玩家" });

function escapeHtml(value) {
  return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
}

function excerpt(review) {
  const text = String(review.text ?? review.normalizedText ?? "").replace(/\s+/g, " ").trim();
  return Object.freeze({ reviewIdHash: review.reviewIdHash, excerpt: text.length > 240 ? `${text.slice(0, 237)}…` : text, createdAt: review.createdAt, playerSegment: review.playerSegment, playtimeMinutes: review.playtimeMinutes, helpfulVotes: review.helpfulVotes ?? 0, recommended: review.recommended });
}

function nearestVersion(topic, versions) {
  if (!versions?.length || !Number.isFinite(topic.raw.nearestVersionDays)) return null;
  return [...versions].sort((left, right) => Date.parse(right.releasedAt) - Date.parse(left.releasedAt))[0];
}

export function createInvestigationModel(topic, reviews, options = {}) {
  const byId = new Map(reviews.map((review) => [review.reviewIdHash, review]));
  const evidence = topic.evidenceIds.map((id) => byId.get(id)).filter(Boolean).map(excerpt).slice(0, 3);
  const counterEvidence = topic.counterEvidenceIds.map((id) => byId.get(id)).filter(Boolean).map(excerpt).slice(0, 2);
  const allTopicReviews = [...topic.evidenceIds, ...topic.counterEvidenceIds].map((id) => byId.get(id)).filter(Boolean);
  const firstSeen = allTopicReviews.length ? allTopicReviews.reduce((earliest, review) => review.createdAt < earliest ? review.createdAt : earliest, allTopicReviews[0].createdAt) : null;
  const relatedVersion = nearestVersion(topic, options.versions);
  const unknowns = ["评论不能证明程序根因或修复成本。", "版本时间只表示接近，不代表更新导致该反馈。"];
  if ((topic.limitations ?? []).includes("sample-below-threshold")) unknowns.push("当前样本量低于强排序门槛。");
  if ((topic.limitations ?? []).includes("no-prior-window-baseline")) unknowns.push("缺少足够的前一窗口基线。");
  const copy = getTopicCopy(topic.id, topic.label);
  const corrected = (options.corrections ?? []).some((correction) => correction.topicId === topic.id || correction.sourceIds?.includes(topic.id));
  return Object.freeze({
    id: topic.id, label: topic.label, primary: copy.primary, secondary: copy.secondary, category: topic.category, workState: topic.workState, workStateLabel: STATE_LABELS[topic.workState] ?? topic.workState, corrected,
    observations: Object.freeze({ sampleCount: topic.raw.count, currentCount: topic.raw.currentCount, previousCount: topic.raw.previousCount, negativeShare: topic.raw.count ? topic.raw.negativeCount / topic.raw.count : 0, coreShare: topic.dimensions.coreImpact, firstSeen }),
    inference: Object.freeze({ score: topic.score, confidence: topic.confidence, relatedVersion: relatedVersion ? { id: relatedVersion.id, name: relatedVersion.name, releasedAt: relatedVersion.releasedAt } : null, statement: `${copy.primary}当前进入“${STATE_LABELS[topic.workState] ?? topic.workState}”队列。` }),
    evidence: Object.freeze(evidence), counterEvidence: Object.freeze(counterEvidence), unknowns: Object.freeze(unknowns),
    similarTopics: Object.freeze((options.topics ?? []).filter((candidate) => candidate.id !== topic.id && candidate.category === topic.category).slice(0, 3).map((candidate) => ({ id: candidate.id, label: candidate.label }))),
  });
}

function renderEvidence(items, emptyLabel) {
  if (items.length === 0) return `<p class="evidence-empty">${escapeHtml(emptyLabel)}</p>`;
  return items.map((item) => `<article class="evidence-quote"><p>${escapeHtml(item.excerpt)}</p><footer><span>${escapeHtml(formatDate(item.createdAt))}</span><span>${escapeHtml(SEGMENT_LABELS[item.playerSegment] ?? "时长未知")}</span><code>${escapeHtml(item.reviewIdHash.slice(0, 10))}</code></footer></article>`).join("");
}

export function renderInvestigation(model) {
  return `<section class="topic-brief">
    <p class="topic-brief__category">${escapeHtml(model.category)} / ${escapeHtml(model.workStateLabel)}${model.corrected ? " / 已人工校正" : ""}</p>
    <h3>${escapeHtml(model.primary)}</h3><p class="topic-brief__secondary">${escapeHtml(model.secondary)}</p>
    <div class="fact-block"><span>观察值</span><dl><div><dt>有效样本</dt><dd>${formatInteger(model.observations.sampleCount)}</dd></div><div><dt>当前 / 前一窗口</dt><dd>${formatInteger(model.observations.currentCount)} / ${formatInteger(model.observations.previousCount)}</dd></div><div><dt>负向推荐</dt><dd>${formatPercent(model.observations.negativeShare)}</dd></div><div><dt>核心玩家</dt><dd>${formatPercent(model.observations.coreShare)}</dd></div></dl></div>
    <div class="inference-block"><span>分析判断</span><p>${escapeHtml(model.inference.statement)}</p><small>置信度 ${formatPercent(model.inference.confidence)} · 版本关联不代表已证明因果。</small></div>
    <div class="evidence-block"><span>支持证据</span>${renderEvidence(model.evidence, "没有足够的支持证据。")}</div>
    <div class="evidence-block evidence-block--counter"><span>反例</span>${renderEvidence(model.counterEvidence, "当前样本中没有匹配的正向反例。")}</div>
    <div class="unknown-block"><span>未知项</span><ul>${model.unknowns.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul></div>
    <div class="correction-tools"><span>人工校正</span><button type="button" data-topic-correction="rename">重命名</button><button type="button" data-topic-correction="merge">合并主题</button>${model.corrected ? '<button type="button" data-topic-correction="undo">撤销校正</button>' : ""}</div>
  </section>`;
}

export function mountInvestigationView({ content, empty, exportButton, onCorrection }) {
  content.addEventListener("click", (event) => { const button = event.target.closest("[data-topic-correction]"); if (button) onCorrection?.(button.dataset.topicCorrection, button); });
  return Object.freeze({ render(topic, reviews, options) { if (!topic) { content.hidden = true; empty.hidden = false; exportButton.disabled = true; return; } content.innerHTML = renderInvestigation(createInvestigationModel(topic, reviews, options)); content.hidden = false; empty.hidden = true; exportButton.disabled = false; } });
}
