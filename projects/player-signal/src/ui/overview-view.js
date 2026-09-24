import { mountSignalField } from "../visualization/signal-field.js";
import { formatDate, formatInteger } from "./formatters.js";
import { getTopicCopy } from "./topic-copy.js";

const STATE_LABELS = Object.freeze({
  investigate: "立即调查",
  validate: "需要验证",
  observe: "持续观察",
  "low-evidence": "证据不足",
});

const QUEUE_LABELS = Object.freeze({
  new: "新出现",
  growing: "增长最快",
  largest: "反馈最多",
  core: "核心玩家集中",
  persistent: "持续存在",
});

const SEGMENT_LABELS = Object.freeze({ new: "新玩家", mid: "中等时长", core: "核心玩家" });

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function createSignalTableModel(topics) {
  return topics.map((topic) => Object.freeze({
    id: topic.id,
    ...getTopicCopy(topic.id, topic.label),
    count: topic.raw.count,
    velocity: topic.dimensions.velocity,
    coreImpact: topic.dimensions.coreImpact,
    workState: topic.workState,
    workStateLabel: STATE_LABELS[topic.workState] ?? topic.workState,
  }));
}

export function renderSignalTableRows(rows) {
  return rows.map((row) => `
    <tr>
      <td><button type="button" data-select-topic="${escapeHtml(row.id)}"><strong>${escapeHtml(row.primary)}</strong><small>${escapeHtml(row.secondary)}</small></button></td>
      <td>${row.count}</td>
      <td>${Math.round(row.velocity * 100)}%</td>
      <td>${Math.round(row.coreImpact * 100)}%</td>
      <td><span data-work-state="${escapeHtml(row.workState)}">${escapeHtml(row.workStateLabel)}</span></td>
    </tr>`).join("");
}

export function createQueueEmptyModel(queue) {
  if (!queue || !QUEUE_LABELS[queue]) return null;
  return Object.freeze({
    queue,
    title: `“${QUEUE_LABELS[queue]}”当前没有符合条件的主题`,
    detail: "这不是分析失败。查看全部信号，或选择另一个调查视图。",
  });
}

export function createUnclassifiedModel(unclassified, reviews, limit = 24) {
  const reviewById = new Map((reviews ?? []).map((review) => [review.reviewIdHash, review]));
  const items = (unclassified ?? []).map((entry) => {
    const review = reviewById.get(entry.reviewIdHash);
    if (!review) return null;
    const text = String(review.text ?? review.normalizedText ?? "").replace(/\s+/g, " ").trim();
    return Object.freeze({
      reviewIdHash: review.reviewIdHash,
      excerpt: text.length > 300 ? `${text.slice(0, 297)}…` : text,
      createdAt: review.createdAt,
      playerSegment: review.playerSegment ?? "unknown",
      reason: entry.reason,
    });
  }).filter(Boolean);
  return Object.freeze({ count: items.length, items: Object.freeze(items.slice(0, limit)) });
}

export function renderUnclassifiedItems(items) {
  if (!items.length) return `<div class="unclassified-empty">当前没有待分类评论。</div>`;
  return items.map((item) => `<article class="unclassified-item">
    <p>${escapeHtml(item.excerpt)}</p>
    <footer><span>${escapeHtml(formatDate(item.createdAt))}</span><span>${escapeHtml(SEGMENT_LABELS[item.playerSegment] ?? "时长未知")}</span><code>${escapeHtml(item.reviewIdHash.slice(0, 10))}</code></footer>
  </article>`).join("");
}

export function mountSignalOverview({ canvas, tableBody, onSelect }) {
  const field = mountSignalField(canvas, { onSelect });
  let topics = [];
  let selectedId = null;

  tableBody.addEventListener("click", (event) => {
    const button = event.target.closest("[data-select-topic]");
    if (button) onSelect?.(button.dataset.selectTopic);
  });

  return Object.freeze({
    render(nextTopics, nextSelectedId = null) {
      topics = [...nextTopics];
      selectedId = nextSelectedId;
      field.render(topics.map((topic) => ({ ...topic, label: getTopicCopy(topic.id, topic.label).primary })), selectedId);
      canvas.setAttribute("aria-label", topics.length
        ? `玩家问题信号场，共 ${formatInteger(topics.length)} 个主题。使用左右方向键选择主题，按 Enter 打开证据。`
        : "玩家问题信号场，当前视图没有主题。");
      tableBody.innerHTML = renderSignalTableRows(createSignalTableModel(topics));
      for (const button of tableBody.querySelectorAll("[data-select-topic]")) {
        button.setAttribute("aria-pressed", String(button.dataset.selectTopic === selectedId));
      }
    },
    dispose: field.dispose,
  });
}
