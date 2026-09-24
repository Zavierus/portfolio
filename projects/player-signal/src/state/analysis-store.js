const STORAGE_KEY = "player-signal:analysis-state:v1";

function correctionKey(correction) {
  if (!correction || typeof correction !== "object") return null;
  if (correction.type === "rename" || correction.type === "merge-candidate") {
    return `${correction.type}:${String(correction.topicId ?? "")}`;
  }
  if (correction.type === "merge") {
    const sourceIds = [...(correction.sourceIds ?? [])].map(String).sort();
    return `merge:${sourceIds.join("+")}:${String(correction.into?.id ?? "")}`;
  }
  return null;
}

function upsertCorrections(corrections, correction) {
  const key = correctionKey(correction);
  if (!key) return corrections;
  const index = corrections.findIndex((item) => correctionKey(item) === key);
  if (index < 0) return [...corrections, structuredClone(correction)];
  if (JSON.stringify(corrections[index]) === JSON.stringify(correction)) return corrections;
  return corrections.map((item, itemIndex) => itemIndex === index ? structuredClone(correction) : item);
}

export function compileCorrections(corrections = []) {
  const renames = {};
  const merges = [];
  for (const correction of corrections) {
    if (correction?.type === "rename" && correction.topicId && String(correction.label ?? "").trim()) {
      renames[String(correction.topicId)] = String(correction.label).trim();
    }
    if (correction?.type === "merge" && Array.isArray(correction.sourceIds) && correction.sourceIds.length > 1 && correction.into) {
      merges.push({
        from: correction.sourceIds.map(String),
        into: {
          id: String(correction.into.id),
          label: String(correction.into.label),
          category: String(correction.into.category),
        },
      });
    }
  }
  return Object.freeze({ renames: Object.freeze(renames), merges: Object.freeze(merges.map(Object.freeze)) });
}

function freeze(value) {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const nested of Object.values(value)) freeze(nested);
  }
  return value;
}

function snapshot(value) {
  return freeze(structuredClone(value));
}

function initialState(storage) {
  const base = {
    status: "idle",
    sourceMode: null,
    dataset: null,
    analysis: null,
    progress: { progress: 0, stage: "idle" },
    error: null,
    weights: {},
    selectedTopicId: null,
    corrections: [],
    savedComparisons: [],
  };
  try {
    const saved = storage?.getItem?.(STORAGE_KEY);
    if (!saved) return base;
    const parsed = JSON.parse(saved);
    return { ...base, weights: parsed.weights ?? {}, corrections: parsed.corrections ?? [], savedComparisons: parsed.savedComparisons ?? [] };
  } catch {
    return base;
  }
}

export function createAnalysisStore(options = {}) {
  let defaultStorage = null;
  try {
    defaultStorage = globalThis.localStorage ?? null;
  } catch {
    defaultStorage = null;
  }
  const storage = options.storage ?? defaultStorage;
  const listeners = new Set();
  let state = snapshot(initialState(storage));
  let datasetSerial = 0;
  let analysisSerial = 0;

  function persist(nextState) {
    try {
      storage?.setItem?.(STORAGE_KEY, JSON.stringify({
        weights: nextState.weights,
        corrections: nextState.corrections,
        savedComparisons: nextState.savedComparisons,
      }));
    } catch {
      // Persistence is an enhancement; a blocked storage API must not break analysis.
    }
  }

  function setState(patch, shouldPersist = false) {
    state = snapshot({ ...state, ...patch });
    if (shouldPersist) persist(state);
    for (const listener of listeners) listener(state);
  }

  return Object.freeze({
    getState: () => state,
    subscribe(listener) {
      if (typeof listener !== "function") throw new TypeError("A state listener is required");
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    async loadDataset(loader, metadata = {}) {
      const serial = ++datasetSerial;
      setState({ status: "loading", sourceMode: metadata.sourceMode ?? null, error: null, progress: { progress: 0, stage: "source" } });
      try {
        const dataset = await loader();
        if (serial !== datasetSerial) return false;
        setState({
          status: "loaded",
          sourceMode: metadata.sourceMode ?? dataset.mode ?? null,
          dataset,
          analysis: null,
          progress: { progress: 1, stage: "source-ready" },
        });
        return true;
      } catch (error) {
        if (serial !== datasetSerial) return false;
        setState({ status: "error", error: { message: error instanceof Error ? error.message : String(error), recoverable: true } });
        return false;
      }
    },
    async runAnalysis(analyzer) {
      if (!state.dataset) throw new Error("Load a dataset before analysis");
      const serial = ++analysisSerial;
      setState({ status: "analyzing", error: null, progress: { progress: 0, stage: "queued" } });
      try {
        const analysis = await analyzer(state.dataset, (progress) => {
          if (serial === analysisSerial) setState({ progress });
        });
        if (serial !== analysisSerial) return false;
        setState({ status: "ready", analysis, progress: { progress: 1, stage: "complete" } });
        return true;
      } catch (error) {
        if (serial !== analysisSerial) return false;
        setState({ status: "error", error: { message: error instanceof Error ? error.message : String(error), recoverable: true } });
        return false;
      }
    },
    setWeights(weights) {
      const normalized = Object.fromEntries(
        Object.entries(weights ?? {}).map(([key, value]) => [key, Math.max(0, Number(value) || 0)]),
      );
      setState({ weights: normalized }, true);
    },
    selectTopic(topicId) {
      setState({ selectedTopicId: topicId ?? null });
    },
    recordCorrection(correction) {
      const corrections = upsertCorrections(state.corrections, correction);
      if (corrections === state.corrections) return false;
      setState({ corrections }, true);
      return true;
    },
    renameTopic(topicId, label) {
      const normalized = String(label ?? "").trim();
      if (!state.analysis || normalized.length < 2) return false;
      let found = false;
      const topics = state.analysis.topics.map((topic) => {
        if (topic.id !== topicId) return topic;
        found = true;
        return { ...topic, label: normalized };
      });
      if (!found) return false;
      const correction = { type: "rename", topicId, label: normalized };
      setState({ analysis: { ...state.analysis, topics }, corrections: upsertCorrections(state.corrections, correction) }, true);
      return true;
    },
    removeCorrection(type, topicId) {
      const key = `${String(type)}:${String(topicId)}`;
      const corrections = state.corrections.filter((item) => correctionKey(item) !== key);
      if (corrections.length === state.corrections.length) return false;
      setState({ corrections }, true);
      return true;
    },
    removeCorrectionsForTopic(topicId) {
      const normalized = String(topicId);
      const corrections = state.corrections.filter((item) => item.topicId !== normalized && !item.sourceIds?.includes(normalized) && item.into?.id !== normalized);
      if (corrections.length === state.corrections.length) return false;
      setState({ corrections }, true);
      return true;
    },
    correctionOptions() {
      return compileCorrections(state.corrections);
    },
    saveComparison(comparison) {
      const remaining = state.savedComparisons.filter((item) => item.id !== comparison.id);
      setState({ savedComparisons: [...remaining, structuredClone(comparison)] }, true);
    },
  });
}
