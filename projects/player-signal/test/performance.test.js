import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { cleanReviewSample } from "../src/analysis/normalize.js";
import { scoreTopics } from "../src/analysis/signal-score.js";
import { deriveTopics } from "../src/analysis/topic-engine.js";

test("5,000 review analysis stays inside the desktop interaction budget", async () => {
  const document = JSON.parse(await readFile(new URL("../data/demo-reviews.json", import.meta.url), "utf8"));
  const source = document.source;
  const reviews = Array.from({ length: 5_000 }, (_, index) => ({
    ...document.reviews[index % document.reviews.length],
    reviewIdHash: index.toString(16).padStart(64, "0"),
    source,
  }));
  const startedAt = performance.now();
  const cleaning = cleanReviewSample(reviews);
  const topics = deriveTopics(cleaning.acceptedReviews);
  const scored = scoreTopics(topics.topics, cleaning.acceptedReviews, { now: source.retrievedAt });
  const elapsed = performance.now() - startedAt;

  assert.ok(elapsed < 2_500, `analysis took ${Math.round(elapsed)}ms`);
  assert.equal(cleaning.sampleAccounting.fetched, 5_000);
  assert.ok(cleaning.sampleAccounting.accepted > 0);
  assert.ok(scored.length > 0);
});
