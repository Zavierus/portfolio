import assert from "node:assert/strict";
import test from "node:test";

import {
  createActionCardRecord,
  createAnalysisRecord,
  createGameRecord,
  createReviewRecord,
  createTopicRecord,
  createVersionRecord,
} from "../src/domain/schemas.js";
import { validateDataset } from "../src/domain/validators.js";

const source = {
  provider: "steam",
  url: "https://store.steampowered.com/app/275850",
  retrievedAt: "2026-08-11T08:00:00.000Z",
};

test("domain constructors create isolated immutable records", () => {
  const input = {
    id: "steam:275850",
    appId: 275850,
    name: "No Man's Sky",
    storeUrl: source.url,
    source: { ...source },
  };
  const game = createGameRecord(input);

  input.name = "mutated";
  input.source.provider = "mutated";
  assert.equal(game.name, "No Man's Sky");
  assert.equal(game.source.provider, "steam");
  assert.ok(Object.isFrozen(game));
  assert.ok(Object.isFrozen(game.source));
});

test("review records preserve evidence while rejecting identity data", () => {
  const review = createReviewRecord({
    reviewIdHash: "a".repeat(64),
    text: "Performance drops whenever I enter a settlement.",
    createdAt: "2026-08-10T12:00:00.000Z",
    recommended: false,
    playtimeMinutes: 7200,
    helpfulVotes: 14,
    language: "english",
    source,
  });

  assert.equal(review.playtimeMinutes, 7200);
  assert.throws(
    () => createReviewRecord({ ...review, steamid: "76561198000000000" }),
    /identity field/i,
  );
});

test("version, topic, analysis and action-card records retain traceability", () => {
  const version = createVersionRecord({
    id: "worlds-part-ii",
    name: "Worlds Part II",
    releasedAt: "2025-01-29T00:00:00.000Z",
    sourceUrl: "https://www.nomanssky.com/worlds-part-ii-update/",
  });
  const topic = createTopicRecord({
    id: "topic:performance:stutter",
    label: "Settlement frame pacing",
    category: "performance",
    evidenceIds: ["a".repeat(64)],
    counterEvidenceIds: ["b".repeat(64)],
    metrics: { volume: 18, velocity: 0.42 },
    confidence: 0.76,
    workState: "investigate",
  });
  const analysis = createAnalysisRecord({
    id: "analysis:275850:2026-08-11",
    gameId: "steam:275850",
    generatedAt: "2026-08-11T09:00:00.000Z",
    sample: { fetched: 120, accepted: 96, excluded: 24 },
    versionIds: [version.id],
    topics: [topic],
    source,
  });
  const card = createActionCardRecord({
    id: "card:performance:stutter",
    analysisId: analysis.id,
    topicId: topic.id,
    createdAt: "2026-08-11T09:05:00.000Z",
    title: topic.label,
    observation: "18 accepted reviews mention unstable frame pacing.",
    unknowns: ["Hardware distribution is incomplete."],
    nextStep: "Reproduce on the two most common GPU tiers.",
    evidenceIds: topic.evidenceIds,
  });

  assert.equal(analysis.topics[0].id, topic.id);
  assert.equal(card.evidenceIds[0], topic.evidenceIds[0]);
  assert.ok(Object.isFrozen(analysis.topics));
});

test("dataset validation reports precise paths without mutating input", () => {
  const dataset = {
    game: {
      id: "steam:275850",
      appId: 275850,
      name: "No Man's Sky",
      storeUrl: source.url,
      source,
    },
    reviews: [
      {
        reviewIdHash: "short",
        text: "",
        createdAt: "not-a-date",
        recommended: "no",
        playtimeMinutes: -1,
        helpfulVotes: 0,
        language: "english",
        source,
      },
    ],
    versions: [],
  };
  const original = structuredClone(dataset);
  const result = validateDataset(dataset);

  assert.equal(result.ok, false);
  assert.deepEqual(dataset, original);
  assert.ok(result.errors.some((error) => error.path === "reviews[0].reviewIdHash"));
  assert.ok(result.errors.some((error) => error.path === "reviews[0].createdAt"));
  assert.ok(result.errors.some((error) => error.path === "reviews[0].playtimeMinutes"));
});

test("dataset validation rejects duplicate review and version identifiers", () => {
  const review = {
    reviewIdHash: "c".repeat(64),
    text: "A sufficiently descriptive player review.",
    createdAt: "2026-08-10T12:00:00.000Z",
    recommended: true,
    playtimeMinutes: 60,
    helpfulVotes: 0,
    language: "english",
    source,
  };
  const version = {
    id: "v1",
    name: "Version 1",
    releasedAt: "2026-08-01T00:00:00.000Z",
    sourceUrl: "https://example.com/version-1",
  };
  const result = validateDataset({
    game: { id: "steam:275850", appId: 275850, name: "No Man's Sky", storeUrl: source.url, source },
    reviews: [review, review],
    versions: [version, version],
  });

  assert.equal(result.ok, false);
  assert.ok(result.errors.some((error) => error.code === "duplicate-review-id"));
  assert.ok(result.errors.some((error) => error.code === "duplicate-version-id"));
});
