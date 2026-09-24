import assert from "node:assert/strict";
import test from "node:test";

import { scoreTopic, scoreTopics } from "../src/analysis/signal-score.js";

function review(index, overrides = {}) {
  return {
    reviewIdHash: index.toString(16).padStart(64, "0"),
    createdAt: `2026-08-${String(1 + (index % 10)).padStart(2, "0")}T12:00:00.000Z`,
    recommended: false,
    playerSegment: index % 2 ? "core" : "mid",
    analysisWeight: 1,
    ...overrides,
  };
}

test("signal scoring exposes finite independent dimensions", () => {
  const reviews = Array.from({ length: 20 }, (_, index) => review(index));
  const topic = {
    id: "performance",
    evidenceIds: reviews.map((item) => item.reviewIdHash),
    counterEvidenceIds: [],
  };
  const result = scoreTopic(topic, reviews, {
    now: "2026-08-11T00:00:00.000Z",
    versions: [{ id: "patch", releasedAt: "2026-08-01T00:00:00.000Z" }],
  });

  assert.deepEqual(Object.keys(result.dimensions).sort(), [
    "baselineDeviation",
    "coreImpact",
    "negativeIntensity",
    "velocity",
    "versionProximity",
    "volume",
  ]);
  assert.ok(Object.values(result.dimensions).every((value) => Number.isFinite(value) && value >= 0 && value <= 1));
  assert.ok(result.confidence > 0 && result.confidence <= 1);
  assert.ok(["investigate", "validate", "observe"].includes(result.workState));
});

test("low sample topics cannot be promoted to investigate", () => {
  const reviews = [review(1), review(2)];
  const result = scoreTopic(
    { id: "small", evidenceIds: reviews.map((item) => item.reviewIdHash), counterEvidenceIds: [] },
    reviews,
    { now: "2026-08-11T00:00:00.000Z", minimumEvidence: 5 },
  );
  assert.equal(result.workState, "low-evidence");
  assert.ok(result.limitations.includes("sample-below-threshold"));
});

test("zero denominators and empty topics stay finite", () => {
  const result = scoreTopic({ id: "empty", evidenceIds: [], counterEvidenceIds: [] }, [], {
    now: "2026-08-11T00:00:00.000Z",
  });
  assert.ok(Object.values(result.dimensions).every(Number.isFinite));
  assert.equal(result.confidence, 0);
  assert.equal(result.workState, "low-evidence");
});

test("weights change priority order without mutating raw dimensions", () => {
  const reviews = [
    ...Array.from({ length: 12 }, (_, index) => review(index)),
    ...Array.from({ length: 8 }, (_, index) => review(index + 20, { playerSegment: "new" })),
  ];
  const topics = [
    { id: "core-heavy", evidenceIds: reviews.slice(0, 12).map((item) => item.reviewIdHash), counterEvidenceIds: [] },
    { id: "volume-heavy", evidenceIds: reviews.slice(4).map((item) => item.reviewIdHash), counterEvidenceIds: [] },
  ];
  const volumeFirst = scoreTopics(topics, reviews, {
    now: "2026-08-11T00:00:00.000Z",
    weights: { volume: 1, coreImpact: 0, velocity: 0, baselineDeviation: 0, negativeIntensity: 0, versionProximity: 0 },
  });
  const coreFirst = scoreTopics(topics, reviews, {
    now: "2026-08-11T00:00:00.000Z",
    weights: { volume: 0, coreImpact: 1, velocity: 0, baselineDeviation: 0, negativeIntensity: 0, versionProximity: 0 },
  });

  assert.equal(volumeFirst[0].id, "volume-heavy");
  assert.equal(coreFirst[0].id, "core-heavy");
  const volumeTopicInCoreResult = coreFirst.find((item) => item.id === volumeFirst[0].id);
  assert.deepEqual(volumeFirst[0].dimensions, volumeTopicInCoreResult.dimensions);
});
