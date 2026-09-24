import assert from "node:assert/strict";
import test from "node:test";

import {
  cleanReviewSample,
  normalizeReviewText,
  resolvePlayerSegment,
} from "../src/analysis/normalize.js";
import { jaccardSimilarity } from "../src/analysis/deduplicate.js";
import { createDailySeries } from "../src/analysis/time-series.js";

const baseReview = Object.freeze({
  reviewIdHash: "a".repeat(64),
  text: "The frame pacing is unstable after the update.",
  createdAt: "2026-08-10T12:00:00.000Z",
  recommended: false,
  playtimeMinutes: 7200,
  helpfulVotes: 3,
  language: "english",
  source: {
    provider: "steam-public-reviews",
    url: "https://store.steampowered.com/appreviews/275850",
    retrievedAt: "2026-08-11T00:00:00.000Z",
  },
});

function review(overrides = {}) {
  return { ...baseReview, ...overrides };
}

test("text normalization removes markup, controls and unstable whitespace", () => {
  assert.equal(
    normalizeReviewText("  <b>Frame\u0000 pacing</b>\n\t is   rough.  "),
    "Frame pacing is rough.",
  );
  assert.equal(normalizeReviewText("Fish &amp; ships &lt;3"), "Fish & ships <3");
});

test("Jaccard similarity is finite and symmetric", () => {
  const left = new Set(["frame", "pacing", "stutter"]);
  const right = new Set(["frame", "pacing", "hitch"]);
  assert.equal(jaccardSimilarity(left, right), jaccardSimilarity(right, left));
  assert.equal(jaccardSimilarity(new Set(), new Set()), 1);
  assert.equal(jaccardSimilarity(left, new Set()), 0);
});

test("cleaning explains exact, near, unsupported and low-information exclusions", () => {
  const input = [
    review(),
    review({ reviewIdHash: "b".repeat(64) }),
    review({
      reviewIdHash: "c".repeat(64),
      text: "Frame pacing is unstable after the update!",
    }),
    review({ reviewIdHash: "d".repeat(64), language: "schinese", text: "更新后性能很差" }),
    review({ reviewIdHash: "e".repeat(64), text: "👍👍👍" }),
    review({
      reviewIdHash: "f".repeat(64),
      text: "Base building snapping is much easier now.",
      recommended: true,
      playtimeMinutes: 300,
    }),
  ];
  const original = structuredClone(input);
  const result = cleanReviewSample(input, { supportedLanguages: ["english"], nearDuplicateThreshold: 0.78 });

  assert.deepEqual(input, original);
  assert.equal(result.acceptedReviews.length, 2);
  assert.deepEqual(result.exclusionCounts, {
    "exact-duplicate": 1,
    "near-duplicate": 1,
    "unsupported-language": 1,
    "low-information": 1,
  });
  assert.ok(result.excludedReviews.every((item) => item.reason));
  assert.equal(result.duplicateGroups.length, 1);
  assert.equal(result.sampleAccounting.fetched, 6);
  assert.equal(result.sampleAccounting.accepted, 2);
  assert.equal(result.sampleAccounting.excluded, 4);
});

test("player segments use visible configurable minute thresholds", () => {
  const thresholds = { newMaxMinutes: 600, coreMinMinutes: 6000 };
  assert.equal(resolvePlayerSegment(599, thresholds), "new");
  assert.equal(resolvePlayerSegment(600, thresholds), "mid");
  assert.equal(resolvePlayerSegment(5999, thresholds), "mid");
  assert.equal(resolvePlayerSegment(6000, thresholds), "core");
});

test("daily series is chronological, deterministic and segment-aware", () => {
  const reviews = [
    { ...review(), normalizedText: baseReview.text, playerSegment: "core" },
    {
      ...review({ reviewIdHash: "b".repeat(64), createdAt: "2026-08-09T03:00:00.000Z", recommended: true }),
      normalizedText: "Base building is easier.",
      playerSegment: "new",
    },
    {
      ...review({ reviewIdHash: "c".repeat(64), createdAt: "2026-08-10T20:00:00.000Z" }),
      normalizedText: "Stutter remains.",
      playerSegment: "mid",
    },
  ];
  const first = createDailySeries(reviews);
  const second = createDailySeries(structuredClone(reviews));

  assert.deepEqual(first, second);
  assert.deepEqual(first.map((bucket) => bucket.date), ["2026-08-09", "2026-08-10"]);
  assert.equal(first[1].total, 2);
  assert.equal(first[1].negative, 2);
  assert.deepEqual(first[1].segments, { new: 0, mid: 1, core: 1 });
});

test("cleaning produces a stable result for the same input", () => {
  const input = [
    review(),
    review({ reviewIdHash: "b".repeat(64), text: "Base building works well now.", recommended: true }),
  ];
  assert.deepEqual(cleanReviewSample(input), cleanReviewSample(structuredClone(input)));
});
