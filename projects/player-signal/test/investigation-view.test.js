import assert from "node:assert/strict";
import test from "node:test";

import {
  createInvestigationModel,
  renderInvestigation,
} from "../src/ui/investigation-view.js";
import {
  createVersionCoverageModel,
  compareTopicAroundVersion,
  renderVersionComparison,
} from "../src/ui/comparison-view.js";

function review(index, overrides = {}) {
  return {
    reviewIdHash: index.toString(16).padStart(64, "0"),
    text: `Evidence review ${index} describes unstable frame pacing in settlements.`,
    normalizedText: `Evidence review ${index} describes unstable frame pacing in settlements.`,
    createdAt: `2026-05-${String(10 + index).padStart(2, "0")}T12:00:00.000Z`,
    recommended: false,
    playtimeMinutes: 7200,
    helpfulVotes: index,
    playerSegment: "core",
    ...overrides,
  };
}

const reviews = [
  review(1),
  review(2),
  review(3, { recommended: true, text: "Performance is smooth after the update.", playerSegment: "new" }),
  review(4, { createdAt: "2026-06-02T12:00:00.000Z" }),
  review(5, { createdAt: "2026-06-05T12:00:00.000Z", playerSegment: "mid" }),
];

const topic = {
  id: "performance",
  label: "Settlement frame pacing",
  category: "performance",
  evidenceIds: [reviews[0].reviewIdHash, reviews[1].reviewIdHash, reviews[3].reviewIdHash, reviews[4].reviewIdHash],
  counterEvidenceIds: [reviews[2].reviewIdHash],
  dimensions: { volume: 0.7, velocity: 0.6, baselineDeviation: 0.5, negativeIntensity: 0.8, coreImpact: 0.6, versionProximity: 0.9 },
  raw: { count: 5, currentCount: 3, previousCount: 2, negativeCount: 4, coreCount: 3, nearestVersionDays: 2 },
  confidence: 0.78,
  score: 0.68,
  workState: "investigate",
  limitations: ["correlation-not-causation"],
};

const versions = [
  { id: "swarm", name: "The Swarm", releasedAt: "2026-05-27T00:00:00.000Z", sourceUrl: "https://www.nomanssky.com/2026/05/no-mans-sky-the-swarm/" },
];

test("investigation separates observations, inference, evidence and unknowns", () => {
  const model = createInvestigationModel(topic, reviews, { versions, topics: [topic] });
  const html = renderInvestigation(model);

  assert.equal(model.observations.sampleCount, 5);
  assert.equal(model.evidence.length, 3);
  assert.equal(model.counterEvidence.length, 1);
  assert.match(html, /观察值/);
  assert.match(html, /分析判断/);
  assert.match(html, /支持证据/);
  assert.match(html, /反例/);
  assert.match(html, /未知项/);
  assert.match(html, new RegExp(reviews[0].reviewIdHash.slice(0, 10)));
  assert.match(html, /2026[/-]05/);
  assert.match(html, /版本关联不代表已证明因果/);
});

test("evidence excerpts stay anonymous and traceable", () => {
  const model = createInvestigationModel(topic, reviews, { versions });
  for (const item of [...model.evidence, ...model.counterEvidence]) {
    assert.match(item.reviewIdHash, /^[a-f0-9]{64}$/);
    assert.ok(Number.isFinite(Date.parse(item.createdAt)));
    assert.equal("steamid" in item, false);
    assert.ok(item.excerpt.length <= 240);
  }
});

test("version comparison reports explicit windows and never claims causality", () => {
  const comparison = compareTopicAroundVersion(topic, reviews, versions[0], { windowDays: 20, minimumPerWindow: 1 });
  const html = renderVersionComparison([comparison]);

  assert.equal(comparison.before.count, 3);
  assert.equal(comparison.after.count, 2);
  assert.equal(comparison.state, "persistent");
  assert.match(html, /版本前/);
  assert.match(html, /版本后/);
  assert.match(html, /关联不等于因果/);
  assert.doesNotMatch(html, /caused by|导致了|造成了/i);
});

test("insufficient comparison windows remain explicitly inconclusive", () => {
  const comparison = compareTopicAroundVersion(topic, reviews.slice(0, 1), versions[0], { windowDays: 10, minimumPerWindow: 2 });
  assert.equal(comparison.state, "insufficient-evidence");
  assert.ok(comparison.limitations.includes("insufficient-window-sample"));
});

test("version coverage distinguishes comparable, after-only and outside-range nodes", () => {
  const coverage = createVersionCoverageModel(topic, reviews, [
    { id: "old", name: "Old update", releasedAt: "2026-01-01T00:00:00.000Z" },
    { id: "near", name: "Nearby update", releasedAt: "2026-05-09T00:00:00.000Z" },
    versions[0],
  ], { windowDays: 20, minimumPerWindow: 1 });

  assert.equal(coverage.state, "version-nodes");
  assert.equal(coverage.items.find((item) => item.version.id === "old").coverage, "outside-range");
  assert.equal(coverage.items.find((item) => item.version.id === "near").coverage, "after-only");
  assert.equal(coverage.items.find((item) => item.version.id === "swarm").coverage, "comparable");
  assert.match(renderVersionComparison(coverage), /不能进行前后比较/);
  assert.match(renderVersionComparison(coverage), /不在当前采样窗口/);
});

test("missing version nodes produce an explicit product state", () => {
  const coverage = createVersionCoverageModel(topic, reviews, []);
  assert.equal(coverage.state, "no-version-nodes");
  assert.match(renderVersionComparison(coverage), /尚未添加可信版本节点/);
});
