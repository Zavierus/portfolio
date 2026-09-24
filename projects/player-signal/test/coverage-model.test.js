import assert from "node:assert/strict";
import test from "node:test";

import { createCoverageModel } from "../src/ui/coverage-model.js";
import { formatDate, formatInteger, formatPercent } from "../src/ui/formatters.js";

const acceptedReviews = [
  { reviewIdHash: "a".repeat(64), createdAt: "2026-05-28T12:00:00.000Z" },
  { reviewIdHash: "b".repeat(64), createdAt: "2026-06-01T12:00:00.000Z" },
  { reviewIdHash: "c".repeat(64), createdAt: "2026-08-11T12:00:00.000Z" },
];

test("coverage model separates accepted, classified and unclassified reviews", () => {
  const analysis = {
    cleaning: {
      acceptedReviews,
      excludedReviews: [
        { reason: "low-information" },
        { reason: "low-information" },
        { reason: "near-duplicate" },
      ],
      exclusionCounts: { "low-information": 2, "near-duplicate": 1 },
      sampleAccounting: { fetched: 6, accepted: 3, excluded: 3 },
    },
    topics: [
      { evidenceIds: [acceptedReviews[0].reviewIdHash], counterEvidenceIds: [acceptedReviews[1].reviewIdHash] },
      { evidenceIds: [acceptedReviews[0].reviewIdHash], counterEvidenceIds: [] },
    ],
    unclassified: [{ reviewIdHash: acceptedReviews[2].reviewIdHash, reason: "no-dictionary-match" }],
  };

  const model = createCoverageModel(analysis);

  assert.deepEqual(model.counts, { fetched: 6, accepted: 3, classified: 2, unclassified: 1, excluded: 3 });
  assert.equal(model.classificationRate, 2 / 3);
  assert.deepEqual(model.exclusionReasons, [
    { reason: "low-information", count: 2 },
    { reason: "near-duplicate", count: 1 },
  ]);
  assert.equal(model.range.start, "2026-05-28T12:00:00.000Z");
  assert.equal(model.range.end, "2026-08-11T12:00:00.000Z");
});

test("coverage model stays finite for empty analysis", () => {
  const model = createCoverageModel({
    cleaning: { acceptedReviews: [], excludedReviews: [], sampleAccounting: { fetched: 0, accepted: 0, excluded: 0 } },
    topics: [],
    unclassified: [],
  });

  assert.equal(model.classificationRate, 0);
  assert.deepEqual(model.range, { start: null, end: null });
});

test("locale formatters produce stable human-readable values", () => {
  assert.equal(formatInteger(2589), "2,589");
  assert.equal(formatPercent(574 / 2589), "22%");
  assert.match(formatDate("2026-08-11T00:00:00.000Z"), /2026.*08.*11/);
  assert.equal(formatDate(null), "—");
});
