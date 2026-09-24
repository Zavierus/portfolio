import { formatDate, formatInteger, formatPercent } from "./formatters.js";

const DAY_MS = 86_400_000;
const STATE_LABELS = Object.freeze({
  added: "版本后新增",
  improved: "版本后改善",
  persistent: "前后持续",
  "insufficient-evidence": "样本不足",
});

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character]);
}

function ratio(part, total) {
  return total > 0 ? part / total : 0;
}

function windowMetrics(reviews) {
  const segments = { new: 0, mid: 0, core: 0 };
  for (const review of reviews) if (Object.hasOwn(segments, review.playerSegment)) segments[review.playerSegment] += 1;
  return Object.freeze({
    count: reviews.length,
    negativeShare: ratio(reviews.filter((review) => !review.recommended).length, reviews.length),
    segments: Object.freeze(segments),
  });
}

export function compareTopicAroundVersion(topic, reviews, version, options = {}) {
  const windowDays = options.windowDays ?? 30;
  const minimumPerWindow = options.minimumPerWindow ?? 3;
  const versionTime = Date.parse(version.releasedAt);
  const windowMs = windowDays * DAY_MS;
  const ids = new Set([...topic.evidenceIds, ...topic.counterEvidenceIds]);
  const relevant = reviews.filter((review) => ids.has(review.reviewIdHash));
  const before = windowMetrics(relevant.filter((review) => {
    const time = Date.parse(review.createdAt);
    return time >= versionTime - windowMs && time < versionTime;
  }));
  const after = windowMetrics(relevant.filter((review) => {
    const time = Date.parse(review.createdAt);
    return time >= versionTime && time < versionTime + windowMs;
  }));
  let state = "persistent";
  const limitations = [];
  if (before.count < minimumPerWindow || after.count < minimumPerWindow) {
    state = "insufficient-evidence";
    limitations.push("insufficient-window-sample");
  } else if (before.count === 0 && after.count >= minimumPerWindow) {
    state = "added";
  } else if (after.count < before.count * 0.65 || after.negativeShare < before.negativeShare - 0.2) {
    state = "improved";
  }
  return Object.freeze({
    topicId: topic.id,
    version: Object.freeze({ id: version.id, name: version.name, releasedAt: version.releasedAt, sourceUrl: version.sourceUrl }),
    windowDays,
    before,
    after,
    state,
    limitations: Object.freeze(limitations),
  });
}

function reviewRange(reviews) {
  const timestamps = reviews.map((review) => Date.parse(review.createdAt)).filter(Number.isFinite).sort((left, right) => left - right);
  return timestamps.length ? { start: timestamps[0], end: timestamps.at(-1) } : { start: null, end: null };
}

export function createVersionCoverageModel(topic, reviews, versions, options = {}) {
  if (!Array.isArray(versions) || versions.length === 0) {
    return Object.freeze({ state: "no-version-nodes", items: Object.freeze([]), range: Object.freeze(reviewRange(reviews)) });
  }
  const windowDays = options.windowDays ?? 30;
  const range = reviewRange(reviews);
  const items = versions.map((version) => {
    const versionTime = Date.parse(version.releasedAt);
    if (range.start === null || !Number.isFinite(versionTime)) {
      return Object.freeze({ version, coverage: "outside-range", distanceDays: null, comparison: null });
    }
    if (versionTime < range.start) {
      const distanceDays = Math.ceil((range.start - versionTime) / DAY_MS);
      return Object.freeze({
        version,
        coverage: distanceDays <= windowDays ? "after-only" : "outside-range",
        distanceDays,
        comparison: null,
      });
    }
    if (versionTime > range.end) {
      return Object.freeze({
        version,
        coverage: "outside-range",
        distanceDays: Math.ceil((versionTime - range.end) / DAY_MS),
        comparison: null,
      });
    }
    return Object.freeze({
      version,
      coverage: "comparable",
      distanceDays: 0,
      comparison: compareTopicAroundVersion(topic, reviews, version, options),
    });
  });
  return Object.freeze({ state: "version-nodes", items: Object.freeze(items), range: Object.freeze(range) });
}

function renderComparable(comparison) {
  return `<article class="comparison-card" data-comparison-state="${comparison.state}">
    <header><strong>${escapeHtml(comparison.version.name)}</strong><span>${escapeHtml(formatDate(comparison.version.releasedAt))}</span></header>
    <div><span>版本前</span><b>${formatInteger(comparison.before.count)}</b><small>负向 ${formatPercent(comparison.before.negativeShare)}</small></div>
    <i aria-hidden="true">→</i>
    <div><span>版本后</span><b>${formatInteger(comparison.after.count)}</b><small>负向 ${formatPercent(comparison.after.negativeShare)}</small></div>
    <footer>${STATE_LABELS[comparison.state]}</footer>
  </article>`;
}

function renderCoverageItem(item) {
  if (item.coverage === "comparable") return renderComparable(item.comparison);
  const message = item.coverage === "after-only"
    ? `样本始于版本发布后 ${formatInteger(item.distanceDays)} 天，不能进行前后比较。`
    : "版本不在当前采样窗口。";
  return `<article class="comparison-card comparison-card--coverage" data-coverage-state="${item.coverage}">
    <header><strong>${escapeHtml(item.version.name)}</strong><span>${escapeHtml(formatDate(item.version.releasedAt))}</span></header>
    <p>${message}</p>
  </article>`;
}

export function renderVersionComparison(input) {
  if (Array.isArray(input)) {
    return `<div class="comparison-list">${input.map(renderComparable).join("")}</div><p class="causality-note">版本时间用于寻找关联；关联不等于因果。</p>`;
  }
  if (input.state === "no-version-nodes") {
    return `<div class="version-empty"><strong>尚未添加可信版本节点</strong><p>当前分析仍可查看主题与证据，但不会生成没有来源的版本比较。</p></div>`;
  }
  return `<div class="comparison-list">${input.items.map(renderCoverageItem).join("")}</div><p class="causality-note">只有样本同时覆盖版本前后窗口时才比较；时间关联不等于因果。</p>`;
}

export function mountComparisonView(container) {
  return Object.freeze({
    render(topic, reviews, versions) {
      if (!topic) {
        container.innerHTML = "";
        return;
      }
      container.innerHTML = renderVersionComparison(createVersionCoverageModel(topic, reviews, versions));
    },
  });
}
