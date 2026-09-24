
function updateProgressBar(progressVal, label) {
  if (!refs.progress) return;
  if (progressVal >= 1) {
    refs.progress.hidden = true;
    if (refs.progressBar) refs.progressBar.style.width = "0%";
  } else {
    refs.progress.hidden = false;
    if (refs.progressBar) refs.progressBar.style.width = Math.round(progressVal * 100) + "%";
    if (refs.progressText) refs.progressText.textContent = label || "正在聚合玩家信号...";
  }
}
import { analyzeDataset } from "./analysis/pipeline.js";
import { loadDemoDataset } from "./data/demo-adapter.js";
import { loadLiveSteamDataset } from "./data/live-dataset.js";
import { createSteamClient } from "./data/steam-client.js";
import { createActionCardPackage } from "./export/action-card.js";
import { createAnalysisStore } from "./state/analysis-store.js";
import { parseWorkspaceState, serializeWorkspaceState } from "./state/url-state.js";
import { mountAppShell } from "./ui/app-shell.js";
import { mountComparisonView } from "./ui/comparison-view.js";
import { createCoverageModel } from "./ui/coverage-model.js";
import { formatDate, formatInteger, formatPercent } from "./ui/formatters.js";
import { mountInvestigationView } from "./ui/investigation-view.js";
import {
  createQueueEmptyModel,
  createUnclassifiedModel,
  mountSignalOverview,
  renderUnclassifiedItems,
} from "./ui/overview-view.js";

const EXCLUSION_LABELS = Object.freeze({
  "exact-duplicate": "完全重复",
  "near-duplicate": "高度相似",
  "unsupported-language": "暂不支持的语言",
  "low-information": "信息量不足",
});

const root = document.querySelector("#player-signal-root");
const refs = mountAppShell(root);
const store = createAnalysisStore();
const steamClient = createSteamClient({ baseUrl: window.location.origin });
const initialUrlState = parseWorkspaceState(window.location.search);
let activeQueue = initialUrlState.queue;
let activeView = initialUrlState.view;
let pendingTopicId = initialUrlState.topic;
let connectorAvailable = false;
let reviewLanguage = "schinese";
let correctionContext = null;
let weightUpdateTimer = 0;

function replaceWorkspaceUrl() {
  const state = store.getState();
  const workspaceSearch = new URLSearchParams(serializeWorkspaceState({
    view: activeView,
    queue: activeQueue,
    topic: activeQueue === "unclassified" ? null : state.selectedTopicId,
  }).replace(/^\?/, ""));
  const url = new URL(window.location.href);
  for (const key of ["view", "queue", "topic"]) url.searchParams.delete(key);
  for (const [key, value] of workspaceSearch) url.searchParams.set(key, value);
  window.history.replaceState(null, "", url);
}

function selectTopic(topicId, synchronize = true) {
  store.selectTopic(topicId);
  if (synchronize) replaceWorkspaceUrl();
}

const overview = mountSignalOverview({
  canvas: refs.canvas,
  tableBody: refs.tableBody,
  onSelect: (topicId) => selectTopic(topicId),
});
const comparison = mountComparisonView(refs.comparisonContent);
const investigation = mountInvestigationView({
  content: refs.investigationContent,
  empty: refs.investigationEmpty,
  exportButton: refs.exportAction,
  onCorrection(action) {
    if (action === "undo") {
      const topicId = store.getState().selectedTopicId;
      if (topicId && store.removeCorrectionsForTopic(topicId)) rerunAnalysis(topicId);
      return;
    }
    openCorrectionDialog(action);
  },
});

function currentAnalysisOptions(dataset) {
  return {
    now: dataset.source.retrievedAt,
    weights: store.getState().weights,
    corrections: store.correctionOptions(),
    supportedLanguages: dataset.mode === "offline-demo"
      ? ["english"]
      : reviewLanguage === "all" ? ["english", "schinese"] : [reviewLanguage],
  };
}

function localAnalysis(dataset, onProgress) {
  updateProgressBar(0.2, "正在清洗匿名文本...");
  setTimeout(() => updateProgressBar(0.6, "正在提取高频主题..."), 40);
  setTimeout(() => updateProgressBar(1.0, "分析完成"), 120);
  return analyzeDataset(dataset, currentAnalysisOptions(dataset), onProgress);
}

function analyzeWithWorker(dataset, onProgress) {
  if (typeof Worker !== "function" || window.location.protocol === "file:") {
    return Promise.resolve(localAnalysis(dataset, onProgress));
  }
  return new Promise((resolve, reject) => {
    let worker;
    try {
      worker = new Worker("./analysis.worker.bundle.js?v=2026-08-12-refinement");
    } catch {
      resolve(localAnalysis(dataset, onProgress));
      return;
    }
    const requestId = `analysis:${Date.now()}`;
    const timeout = window.setTimeout(() => {
      worker.terminate();
      resolve(localAnalysis(dataset, onProgress));
    }, 12_000);
    worker.addEventListener("message", (event) => {
      if (event.data?.requestId !== requestId) return;
      if (event.data.type === "progress") onProgress(event.data);
      if (event.data.type === "complete") {
        window.clearTimeout(timeout);
        worker.terminate();
        resolve(event.data.result);
      }
      if (event.data.type === "error") {
        window.clearTimeout(timeout);
        worker.terminate();
        reject(new Error(event.data.error));
      }
    });
    worker.addEventListener("error", () => {
      window.clearTimeout(timeout);
      worker.terminate();
      resolve(localAnalysis(dataset, onProgress));
    }, { once: true });
    worker.postMessage({ type: "analyze", requestId, dataset, options: currentAnalysisOptions(dataset) });
  });
}

function setSourceReadout(title, detail) {
  refs.sourceStatus.querySelector("strong").textContent = title;
  refs.sourceStatus.querySelector("small").textContent = detail;
}

function setConnectorState(state, detail) {
  refs.connectorStatus.textContent = detail;
  refs.connectorStatus.dataset.state = state;
  const enabled = state === "available";
  connectorAvailable = enabled;
  refs.searchInput.disabled = !enabled;
  refs.searchSubmit.disabled = !enabled;
}

function updateQueueCounts(analysis) {
  const topics = analysis?.topics ?? [];
  const counts = {
    new: topics.filter((topic) => topic.raw.previousCount === 0 && topic.raw.currentCount > 0).length,
    growing: topics.filter((topic) => topic.dimensions.velocity >= 0.2).length,
    largest: Math.min(5, topics.length),
    core: topics.filter((topic) => topic.dimensions.coreImpact >= 0.5).length,
    persistent: topics.filter((topic) => topic.raw.previousCount > 0 && topic.raw.currentCount > 0).length,
    unclassified: analysis?.unclassified?.length ?? 0,
  };
  for (const button of refs.queueButtons) {
    button.querySelector("[data-topic-count]").textContent = formatInteger(counts[button.dataset.queue] ?? 0);
    button.setAttribute("aria-pressed", String(button.dataset.queue === activeQueue));
  }
}

function topicsForQueue(topics, queue) {
  if (queue === "new") return topics.filter((topic) => topic.raw.previousCount === 0 && topic.raw.currentCount > 0);
  if (queue === "growing") return topics.filter((topic) => topic.dimensions.velocity >= 0.2);
  if (queue === "largest") return [...topics].sort((left, right) => right.raw.count - left.raw.count).slice(0, 5);
  if (queue === "core") return topics.filter((topic) => topic.dimensions.coreImpact >= 0.5);
  if (queue === "persistent") return topics.filter((topic) => topic.raw.previousCount > 0 && topic.raw.currentCount > 0);
  if (queue === "unclassified") return [];
  return topics;
}

function renderCoverage(analysis) {
  const coverage = createCoverageModel(analysis);
  refs.fetchedCount.textContent = formatInteger(coverage.counts.fetched);
  refs.acceptedCount.textContent = formatInteger(coverage.counts.accepted);
  refs.classifiedCount.textContent = formatInteger(coverage.counts.classified);
  refs.unclassifiedCount.textContent = formatInteger(coverage.counts.unclassified);
  refs.excludedCount.textContent = formatInteger(coverage.counts.excluded);
  refs.sampleSummary.textContent = `${formatInteger(coverage.counts.accepted)} 条有效`;
  refs.coverageRate.textContent = formatPercent(coverage.classificationRate);
  refs.coverageBar.style.width = formatPercent(coverage.classificationRate);
  const rangeLabel = `${formatDate(coverage.range.start)} — ${formatDate(coverage.range.end)}`;
  refs.sampleRange.textContent = `采样范围 ${rangeLabel}`;
  refs.lensRange.textContent = `匿名评论采样：${rangeLabel}`;
  refs.exclusionReasons.replaceChildren(...coverage.exclusionReasons.map((item) => {
    const row = document.createElement("p");
    row.textContent = `${EXCLUSION_LABELS[item.reason] ?? item.reason}：${formatInteger(item.count)}`;
    return row;
  }));
  return coverage;
}

function setInvestigationEmpty(label, title, detail) {
  refs.investigationEmptyLabel.textContent = label;
  refs.investigationEmptyTitle.textContent = title;
  refs.investigationEmptyDetail.textContent = detail;
}

function applyViewState(unclassified = false) {
  for (const button of refs.viewButtons) {
    button.disabled = unclassified;
    button.setAttribute("aria-pressed", String(!unclassified && button.dataset.view === activeView));
  }
  refs.table.hidden = unclassified || activeView !== "table";
}

function renderAnalysis(state) {
  const analysis = state.analysis;
  renderCoverage(analysis);
  updateQueueCounts(analysis);
  refs.lensEmpty.hidden = true;

  if (activeQueue === "unclassified") {
    applyViewState(true);
    refs.filterEmpty.hidden = true;
    refs.unclassifiedView.hidden = false;
    const model = createUnclassifiedModel(analysis.unclassified, analysis.cleaning.acceptedReviews);
    refs.unclassifiedSummary.textContent = `${formatInteger(model.count)} 条评论未被强制归类；显示前 ${formatInteger(model.items.length)} 条`;
    refs.unclassifiedList.innerHTML = renderUnclassifiedItems(model.items);
    overview.render([], null);
    investigation.render(null, [], {});
    setInvestigationEmpty("待分类说明", "没有匹配，不代表没有价值。", "这些评论未达到现有规则主题的匹配条件，应当先扩充词典或进行人工研究。 ");
    comparison.render(null, [], []);
    if (state.selectedTopicId) queueMicrotask(() => selectTopic(null));
    return;
  }

  applyViewState(false);
  refs.unclassifiedView.hidden = true;
  const visibleTopics = topicsForQueue(analysis.topics, activeQueue);
  const emptyModel = visibleTopics.length === 0 ? createQueueEmptyModel(activeQueue) : null;
  refs.filterEmpty.hidden = !emptyModel;
  if (emptyModel) {
    refs.filterEmptyTitle.textContent = emptyModel.title;
    refs.filterEmptyDetail.textContent = emptyModel.detail;
    overview.render([], null);
    investigation.render(null, [], {});
    setInvestigationEmpty("当前筛选为空", "这个视图暂时没有信号。", "清除筛选后可以继续检查全部主题与证据。 ");
    comparison.render(null, [], []);
    if (state.selectedTopicId) queueMicrotask(() => selectTopic(null));
    return;
  }

  const requestedId = pendingTopicId ?? state.selectedTopicId;
  const selectedTopic = visibleTopics.find((topic) => topic.id === requestedId) ?? visibleTopics[0] ?? null;
  pendingTopicId = null;
  overview.render(visibleTopics, selectedTopic?.id ?? null);
  investigation.render(selectedTopic, analysis.cleaning.acceptedReviews, {
    versions: state.dataset.versions,
    topics: analysis.topics,
    corrections: state.corrections,
  });
  comparison.render(selectedTopic, analysis.cleaning.acceptedReviews, state.dataset.versions);
  if (selectedTopic?.id !== state.selectedTopicId) queueMicrotask(() => selectTopic(selectedTopic?.id ?? null));
}

function renderState(state) {
  const progress = Math.max(0, Math.min(1, state.progress?.progress ?? 0));
  refs.progressBar.style.width = `${progress * 100}%`;
  const stageLabels = {
    idle: "等待数据",
    source: "读取评论来源…",
    "source-ready": "评论来源已就绪",
    queued: "分析已排队…",
    cleaning: "清洗与去重…",
    topics: "识别问题主题…",
    complete: "分析完成",
  };
  refs.progressText.textContent = stageLabels[state.progress?.stage] ?? state.progress?.stage ?? "等待数据";
  const productStates = { idle: "正在准备案例…", loading: "正在读取数据…", loaded: "数据已载入", analyzing: "正在分析…", ready: "分析就绪", error: "分析受阻" };
  refs.productState.textContent = productStates[state.status] ?? state.status;

  if (state.dataset) {
    const partial = state.dataset.partial ? " · 分页中断，已分析完整获取页" : "";
    setSourceReadout(
      state.dataset.game.name,
      `${state.sourceMode === "offline-demo" ? "离线公开快照" : "在线 Steam 匿名评论"} · ${formatDate(state.dataset.source.retrievedAt)}${partial}`,
    );
  }
  if (state.analysis) renderAnalysis(state);
  if (state.error) setSourceReadout("当前分析未完成", `${state.error.message} · 已有案例数据仍保留`);
}

store.subscribe(renderState);
renderState(store.getState());

async function analyzeLoadedDataset(preferredTopicId = null) {
  const analyzed = await store.runAnalysis(analyzeWithWorker);
  if (!analyzed) return false;
  const state = store.getState();
  const nextTopicId = state.analysis.topics.some((topic) => topic.id === preferredTopicId)
    ? preferredTopicId
    : state.analysis.topics[0]?.id ?? null;
  if (activeQueue !== "unclassified") selectTopic(nextTopicId);
  return true;
}

async function rerunAnalysis(preferredTopicId = store.getState().selectedTopicId) {
  if (!store.getState().dataset) return false;
  return analyzeLoadedDataset(preferredTopicId);
}

async function openDemo() {
  refs.openDemo.disabled = true;
  const loaded = await store.loadDataset(() => loadDemoDataset(), { sourceMode: "offline-demo" });
  if (loaded) await analyzeLoadedDataset(pendingTopicId);
  refs.openDemo.disabled = false;
}

async function probeConnector() {
  setConnectorState("checking", "连接器检测中…");
  const capability = await steamClient.checkAvailability();
  if (capability.available) {
    setConnectorState("available", "已连接，可分析其他游戏");
  } else {
    setConnectorState("not-deployed", "当前未部署 · 离线案例可完整体验");
  }
}

function renderSearchResults(games) {
  refs.searchResults.replaceChildren();
  if (!games.length) {
    const message = document.createElement("p");
    message.textContent = "没有找到匹配的公开游戏。";
    refs.searchResults.append(message);
  } else {
    for (const game of games) {
      const button = document.createElement("button");
      button.type = "button";
      button.dataset.gameAppId = String(game.appId);
      button.setAttribute("role", "option");
      button.textContent = `${game.name} · AppID ${game.appId}`;
      button.addEventListener("click", () => loadLiveGame(game));
      refs.searchResults.append(button);
    }
  }
  refs.searchResults.hidden = false;
}

async function loadLiveGame(game) {
  refs.searchResults.hidden = true;
  setConnectorState("checking", `正在获取 ${game.name} 的匿名评论…`);
  const loaded = await store.loadDataset(() => loadLiveSteamDataset(steamClient, game, { language: reviewLanguage }), { sourceMode: "live" });
  if (loaded) {
    await analyzeLoadedDataset(null);
    setConnectorState("available", `已连接 · ${game.name}`);
  } else {
    setConnectorState("available", "获取失败，可重试；离线案例仍可用");
  }
}

refs.openDemo.addEventListener("click", openDemo);
refs.reviewLanguage.addEventListener("change", () => {
  reviewLanguage = refs.reviewLanguage.value;
  setConnectorState("available", reviewLanguage === "schinese" ? "中文评论优先，选择游戏后开始分析" : "语言偏好已更新，选择游戏后开始分析");
});
refs.searchForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!connectorAvailable) return;
  const query = refs.searchInput.value.trim();
  if (query.length < 2) {
    setConnectorState("available", "请输入至少 2 个字符");
    refs.searchInput.focus();
    return;
  }
  refs.searchSubmit.disabled = true;
  setConnectorState("checking", `正在搜索“${query}”…`);
  try {
    const result = await steamClient.searchGames(query);
    renderSearchResults(result.games);
    setConnectorState("available", result.games.length ? `找到 ${formatInteger(result.games.length)} 个结果` : "没有匹配结果");
  } catch (error) {
    setConnectorState("available", `${error instanceof Error ? error.message : String(error)} · 可以重试`);
  } finally {
    refs.searchSubmit.disabled = false;
  }
});

for (const button of refs.viewButtons) {
  button.addEventListener("click", () => {
    activeView = button.dataset.view;
    applyViewState(activeQueue === "unclassified");
    replaceWorkspaceUrl();
  });
}

function setQueue(queue) {
  activeQueue = queue;
  for (const button of refs.queueButtons) button.setAttribute("aria-pressed", String(button.dataset.queue === activeQueue));
  const state = store.getState();
  if (state.analysis) renderAnalysis(state);
  replaceWorkspaceUrl();
}

for (const button of refs.queueButtons) {
  button.addEventListener("click", () => setQueue(activeQueue === button.dataset.queue ? null : button.dataset.queue));
}
refs.clearQueue.addEventListener("click", () => setQueue(null));

for (const input of refs.priorityWeights) {
  const persisted = store.getState().weights[input.dataset.priorityWeight];
  if (Number.isFinite(persisted)) input.value = String(Math.round(persisted * 100));
  input.parentElement.querySelector("output").value = input.value;
  input.addEventListener("input", () => {
    input.parentElement.querySelector("output").value = input.value;
    const weights = Object.fromEntries(refs.priorityWeights.map((control) => [control.dataset.priorityWeight, Number(control.value) / 100]));
    store.setWeights(weights);
    window.clearTimeout(weightUpdateTimer);
    weightUpdateTimer = window.setTimeout(() => rerunAnalysis(), 180);
  });
}

function openCorrectionDialog(action) {
  const state = store.getState();
  const topic = state.analysis?.topics.find((candidate) => candidate.id === state.selectedTopicId);
  if (!topic) return;
  correctionContext = { action, topicId: topic.id };
  refs.correctionError.textContent = "";
  refs.renameField.hidden = action !== "rename";
  refs.mergeField.hidden = action !== "merge";
  if (action === "rename") {
    refs.correctionTitle.textContent = "重命名主题";
    refs.correctionDescription.textContent = `当前名称：${topic.label}`;
    refs.correctionForm.elements.label.value = topic.label;
    refs.correctionPreview.textContent = "只改变主题名称，不改变评论证据和评分。";
  } else {
    refs.correctionTitle.textContent = "合并主题";
    refs.correctionDescription.textContent = `选择与“${topic.label}”指向同一问题的主题。`;
    const select = refs.correctionForm.elements.target;
    select.replaceChildren(...state.analysis.topics.filter((candidate) => candidate.id !== topic.id).map((candidate) => {
      const option = document.createElement("option");
      option.value = candidate.id;
      option.textContent = `${candidate.label} · ${formatInteger(candidate.raw.count)} 条`;
      return option;
    }));
    refs.correctionPreview.textContent = "合并后会保留两个主题的全部支持证据与反例。";
  }
  refs.correctionDialog.showModal();
  queueMicrotask(() => (action === "rename" ? refs.correctionForm.elements.label : refs.correctionForm.elements.target).focus());
}

refs.correctionCancel.addEventListener("click", () => refs.correctionDialog.close());
refs.correctionForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!correctionContext) return;
  const state = store.getState();
  const source = state.analysis?.topics.find((topic) => topic.id === correctionContext.topicId);
  if (!source) {
    refs.correctionError.textContent = "原主题已不存在，请关闭后重新选择。";
    return;
  }
  if (correctionContext.action === "rename") {
    const label = refs.correctionForm.elements.label.value.trim();
    if (label.length < 2) {
      refs.correctionError.textContent = "主题名称至少需要 2 个字符。";
      return;
    }
    store.renameTopic(source.id, label);
    refs.correctionDialog.close();
    correctionContext = null;
    return;
  }
  const targetId = refs.correctionForm.elements.target.value;
  const target = state.analysis.topics.find((topic) => topic.id === targetId);
  if (!target || target.id === source.id) {
    refs.correctionError.textContent = "请选择另一个有效主题。";
    return;
  }
  const sourceIds = [source.id, target.id].sort();
  const mergedId = `merged-${sourceIds.join("-")}`.slice(0, 80);
  store.recordCorrection({
    type: "merge",
    sourceIds,
    into: { id: mergedId, label: `${source.label} + ${target.label}`, category: source.category },
  });
  refs.correctionDialog.close();
  correctionContext = null;
  await rerunAnalysis(mergedId);
});

refs.exportAction.addEventListener("click", () => {
  const state = store.getState();
  const topic = state.analysis?.topics.find((candidate) => candidate.id === state.selectedTopicId);
  if (!topic || !state.dataset) return;
  const output = createActionCardPackage(topic, state.analysis.cleaning.acceptedReviews, {
    game: state.dataset.game,
    source: state.dataset.source,
    versions: state.dataset.versions,
    generatedAt: new Date().toISOString(),
  });
  for (const file of output.files) {
    const url = URL.createObjectURL(new Blob([file.content], { type: file.type }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = file.name;
    anchor.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 2_000);
  }
  refs.exportAction.querySelector("strong").textContent = "已导出 Markdown、JSON、打印版";
});

window.addEventListener("popstate", () => {
  const urlState = parseWorkspaceState(window.location.search);
  activeQueue = urlState.queue;
  activeView = urlState.view;
  pendingTopicId = urlState.topic;
  if (store.getState().analysis) renderAnalysis(store.getState());
});

document.documentElement.dataset.playerSignal = "workspace";
window.dispatchEvent(new CustomEvent("player-signal:ready", { detail: { stage: "workspace" } }));
queueMicrotask(() => {
  openDemo();
  probeConnector();
});
