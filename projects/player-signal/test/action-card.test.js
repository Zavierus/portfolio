import assert from "node:assert/strict";
import test from "node:test";

import { buildActionCard, createActionCardPackage } from "../src/export/action-card.js";

const source = { provider: "steam-public-reviews", url: "https://store.steampowered.com/appreviews/275850", retrievedAt: "2026-08-11T00:00:00.000Z" };
const reviews = [
  { reviewIdHash: "a".repeat(64), text: "Frame pacing becomes unstable in settlements.", createdAt: "2026-08-10T12:00:00.000Z", recommended: false, playerSegment: "core", playtimeMinutes: 7200 },
  { reviewIdHash: "b".repeat(64), text: "Performance is smooth on my system.", createdAt: "2026-08-10T13:00:00.000Z", recommended: true, playerSegment: "new", playtimeMinutes: 300 },
];
const topic = {
  id: "performance",
  label: "Settlement frame pacing",
  category: "performance",
  evidenceIds: [reviews[0].reviewIdHash],
  counterEvidenceIds: [reviews[1].reviewIdHash],
  dimensions: { volume: 0.6, velocity: 0.7, baselineDeviation: 0.5, negativeIntensity: 0.5, coreImpact: 0.5, versionProximity: 0.8 },
  raw: { count: 2, currentCount: 2, previousCount: 0, negativeCount: 1, coreCount: 1, nearestVersionDays: 3 },
  confidence: 0.62,
  score: 0.7,
  workState: "validate",
  limitations: ["no-prior-window-baseline"],
};
const context = {
  game: { id: "steam:275850", appId: 275850, name: "No Man's Sky" },
  source,
  versions: [{ id: "swarm", name: "The Swarm", releasedAt: "2026-05-27T00:00:00.000Z" }],
  generatedAt: "2026-08-11T10:00:00.000Z",
};

test("action card keeps observed metrics, inference, evidence and unknowns separate", () => {
  const card = buildActionCard(topic, reviews, context);
  assert.equal(card.topic.id, "performance");
  assert.equal(card.observations.sampleCount, 2);
  assert.equal(card.inference.workState, "validate");
  assert.equal(card.inference.confidence, 0.62);
  assert.equal(card.evidence.length, 1);
  assert.equal(card.counterEvidence.length, 1);
  assert.ok(card.unknowns.length >= 2);
  assert.match(card.nextValidationStep, /复现|验证|收集/);
  assert.equal(card.source.url, source.url);
});

test("action card package is deterministic and contains Markdown, JSON and print HTML", () => {
  const first = createActionCardPackage(topic, reviews, context);
  const second = createActionCardPackage(structuredClone(topic), structuredClone(reviews), structuredClone(context));
  assert.deepEqual(first, second);
  assert.equal(first.files.length, 3);
  assert.deepEqual(first.files.map((file) => file.extension), ["md", "json", "html"]);
  assert.match(first.files[0].content, /Observed evidence/);
  assert.match(first.files[0].content, /Counter-evidence/);
  assert.match(first.files[0].content, /Correlation is not causation/);
  assert.equal(JSON.parse(first.files[1].content).topic.id, "performance");
  assert.match(first.files[2].content, /<!doctype html>/i);
  assert.match(first.files[2].content, /打印行动卡/);
});

test("exports escape markup and never include identity-like fields", () => {
  const unsafeTextReviews = [{ ...reviews[0], text: "<script>alert('x')</script> frame pacing issue" }, reviews[1]];
  const packageFiles = createActionCardPackage(topic, unsafeTextReviews, context).files;
  const html = packageFiles.find((file) => file.extension === "html").content;
  const json = packageFiles.find((file) => file.extension === "json").content;
  assert.doesNotMatch(html, /<script>/);
  assert.match(html, /&lt;script&gt;/);
  assert.doesNotMatch(json, /steamid|personaName|profileUrl|avatar/i);
  assert.doesNotMatch(json, /7656119\d{10}/);
});
