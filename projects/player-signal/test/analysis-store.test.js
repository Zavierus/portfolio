import assert from "node:assert/strict";
import test from "node:test";

import { compileCorrections, createAnalysisStore } from "../src/state/analysis-store.js";

function deferred() {
  let resolve;
  let reject;
  const promise = new Promise((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, resolve, reject };
}

test("only the latest dataset request may commit", async () => {
  const store = createAnalysisStore();
  const first = deferred();
  const second = deferred();
  const firstLoad = store.loadDataset(() => first.promise, { sourceMode: "live" });
  const secondLoad = store.loadDataset(() => second.promise, { sourceMode: "offline-demo" });

  second.resolve({ mode: "offline-demo", game: { id: "steam:second" }, reviews: [], versions: [] });
  await secondLoad;
  first.resolve({ mode: "live", game: { id: "steam:first" }, reviews: [], versions: [] });
  assert.equal(await firstLoad, false);
  assert.equal(store.getState().dataset.game.id, "steam:second");
  assert.equal(store.getState().sourceMode, "offline-demo");
});

test("analysis progress and success publish immutable snapshots", async () => {
  const store = createAnalysisStore();
  await store.loadDataset(async () => ({ mode: "offline-demo", game: { id: "steam:275850" }, reviews: [], versions: [] }));
  const snapshots = [];
  const unsubscribe = store.subscribe((state) => snapshots.push(state));
  const result = await store.runAnalysis(async (_dataset, onProgress) => {
    onProgress({ progress: 0.4, stage: "cleaning" });
    return { topics: [{ id: "performance", score: 0.7 }], cleaning: { sampleAccounting: { fetched: 10, accepted: 8, excluded: 2 } } };
  });
  unsubscribe();

  assert.equal(result, true);
  assert.equal(store.getState().status, "ready");
  assert.equal(store.getState().analysis.topics[0].id, "performance");
  assert.ok(snapshots.some((state) => state.progress.stage === "cleaning"));
  assert.ok(Object.isFrozen(store.getState()));
});

test("weights, selection, corrections and comparisons are explicit state commands", () => {
  const store = createAnalysisStore();
  store.setWeights({ volume: 0.5, coreImpact: 0.5 });
  store.selectTopic("performance");
  store.recordCorrection({ type: "rename", topicId: "performance", label: "Frame pacing" });
  store.saveComparison({ id: "before-after", before: "2026-05-01", after: "2026-06-01" });
  const state = store.getState();

  assert.deepEqual(state.weights, { volume: 0.5, coreImpact: 0.5 });
  assert.equal(state.selectedTopicId, "performance");
  assert.equal(state.corrections.length, 1);
  assert.equal(state.savedComparisons[0].id, "before-after");
});

test("renaming a topic changes the active analysis and records the correction", async () => {
  const store = createAnalysisStore();
  await store.loadDataset(async () => ({ mode: "offline-demo", game: { id: "steam:275850" }, reviews: [], versions: [] }));
  await store.runAnalysis(async () => ({ topics: [{ id: "performance", label: "Performance" }], cleaning: { sampleAccounting: { fetched: 0, accepted: 0, excluded: 0 } } }));
  assert.equal(store.renameTopic("performance", "Frame pacing"), true);
  assert.equal(store.getState().analysis.topics[0].label, "Frame pacing");
  assert.deepEqual(store.getState().corrections.at(-1), { type: "rename", topicId: "performance", label: "Frame pacing" });
});

test("corrections are updated by identity and duplicate merge candidates are ignored", async () => {
  const store = createAnalysisStore();
  await store.loadDataset(async () => ({ mode: "offline-demo", game: { id: "steam:275850" }, reviews: [], versions: [] }));
  await store.runAnalysis(async () => ({ topics: [{ id: "performance", label: "Performance" }], cleaning: { sampleAccounting: { fetched: 0, accepted: 0, excluded: 0 } } }));

  store.renameTopic("performance", "Frame pacing");
  store.renameTopic("performance", "Rendering performance");
  store.recordCorrection({ type: "merge-candidate", topicId: "performance", label: "Rendering performance" });
  store.recordCorrection({ type: "merge-candidate", topicId: "performance", label: "Rendering performance" });

  assert.deepEqual(store.getState().corrections, [
    { type: "rename", topicId: "performance", label: "Rendering performance" },
    { type: "merge-candidate", topicId: "performance", label: "Rendering performance" },
  ]);
  assert.equal(store.removeCorrection("rename", "performance"), true);
  assert.equal(store.removeCorrection("rename", "performance"), false);
  assert.equal(store.getState().corrections.length, 1);
});

test("stored correction records compile into deterministic topic engine options", () => {
  const options = compileCorrections([
    { type: "rename", topicId: "performance", label: "Frame pacing" },
    { type: "rename", topicId: "performance", label: "Rendering performance" },
    {
      type: "merge",
      sourceIds: ["stability", "performance"],
      into: { id: "technical-health", label: "Technical health", category: "technical" },
    },
    { type: "merge-candidate", topicId: "controls", label: "Controls" },
  ]);

  assert.deepEqual(options.renames, { performance: "Rendering performance" });
  assert.deepEqual(options.merges, [{
    from: ["stability", "performance"],
    into: { id: "technical-health", label: "Technical health", category: "technical" },
  }]);
});

test("recoverable analysis errors preserve the current dataset", async () => {
  const store = createAnalysisStore();
  const dataset = { mode: "offline-demo", game: { id: "steam:275850" }, reviews: [], versions: [] };
  await store.loadDataset(async () => dataset);
  const result = await store.runAnalysis(async () => { throw new Error("worker unavailable"); });

  assert.equal(result, false);
  assert.equal(store.getState().status, "error");
  assert.equal(store.getState().dataset.game.id, "steam:275850");
  assert.match(store.getState().error.message, /worker unavailable/);
  assert.equal(store.getState().error.recoverable, true);
});

test("storage failures never make the analysis store unusable", () => {
  const storage = {
    getItem() { throw new Error("blocked"); },
    setItem() { throw new Error("blocked"); },
  };
  const store = createAnalysisStore({ storage });
  assert.doesNotThrow(() => store.setWeights({ volume: 1 }));
  assert.equal(store.getState().weights.volume, 1);
});
