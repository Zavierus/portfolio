import assert from "node:assert/strict";
import test from "node:test";

import { createSignalFieldModel } from "../src/visualization/signal-field.js";
import {
  createQueueEmptyModel,
  createSignalTableModel,
  createUnclassifiedModel,
  renderSignalTableRows,
  renderUnclassifiedItems,
} from "../src/ui/overview-view.js";

function topic(index, overrides = {}) {
  return {
    id: `topic-${index}`,
    label: `Topic ${index}`,
    category: index % 2 ? "performance" : "content",
    dimensions: {
      volume: 0.3 + index * 0.05,
      velocity: index * 0.08,
      baselineDeviation: index * 0.06,
      negativeIntensity: 0.6,
      coreImpact: 0.4,
      versionProximity: 0.5,
    },
    raw: { count: 10 + index, currentCount: 4 + index, previousCount: 3 },
    confidence: 0.5 + index * 0.04,
    score: 0.4 + index * 0.03,
    workState: index > 5 ? "investigate" : "validate",
    ...overrides,
  };
}

test("signal field positions are deterministic, bounded and readable", () => {
  const topics = Array.from({ length: 10 }, (_, index) => topic(index));
  const first = createSignalFieldModel(topics, { width: 760, height: 470 });
  const second = createSignalFieldModel(structuredClone(topics), { width: 760, height: 470 });

  assert.deepEqual(first, second);
  assert.equal(first.nodes.length, topics.length);
  for (const node of first.nodes) {
    assert.ok(node.x - node.radius >= 0 && node.x + node.radius <= 760);
    assert.ok(node.y - node.radius >= 0 && node.y + node.radius <= 470);
    assert.ok(node.labelX >= 0 && node.labelX <= 760);
    assert.ok(node.labelY >= 0 && node.labelY <= 470);
  }
  for (let leftIndex = 0; leftIndex < first.nodes.length; leftIndex += 1) {
    for (let rightIndex = leftIndex + 1; rightIndex < first.nodes.length; rightIndex += 1) {
      const left = first.nodes[leftIndex];
      const right = first.nodes[rightIndex];
      const distance = Math.hypot(left.x - right.x, left.y - right.y);
      assert.ok(distance >= (left.radius + right.radius) * 0.78);
    }
  }
});

test("visual encoding maps only declared data dimensions", () => {
  const model = createSignalFieldModel([
    topic(1, { id: "stable", category: "performance", dimensions: { ...topic(1).dimensions, baselineDeviation: 0.1, velocity: 0.1 }, confidence: 0.8 }),
    topic(2, { id: "anomaly", category: "performance", dimensions: { ...topic(2).dimensions, baselineDeviation: 0.8, velocity: 0.9 }, confidence: 0.8 }),
  ], { width: 600, height: 400 });
  const stable = model.nodes.find((node) => node.id === "stable");
  const anomaly = model.nodes.find((node) => node.id === "anomaly");

  assert.equal(stable.color, anomaly.color);
  assert.ok(anomaly.brightness > stable.brightness);
  assert.equal(stable.pulse, false);
  assert.equal(anomaly.pulse, true);
  assert.ok(anomaly.radius > stable.radius);
});

test("table model exposes every signal with the same metrics", () => {
  const topics = [topic(1), topic(2), topic(3)];
  const rows = createSignalTableModel(topics);
  const html = renderSignalTableRows(rows);

  assert.equal(rows.length, topics.length);
  assert.ok(rows.every((row) => Number.isFinite(row.count)));
  assert.match(html, /data-select-topic="topic-1"/);
  assert.match(html, /Topic 1/);
  assert.match(html, /需要验证|立即调查/);
  assert.equal((html.match(/<tr/g) ?? []).length, topics.length);
});

test("topic category colors remain stable across order changes", () => {
  const original = createSignalFieldModel([topic(1), topic(2)], { width: 600, height: 400 });
  const reversed = createSignalFieldModel([topic(2), topic(1)], { width: 600, height: 400 });
  for (const node of original.nodes) {
    assert.equal(node.color, reversed.nodes.find((candidate) => candidate.id === node.id).color);
  }
});

test("zero-result queues explain the active filter and provide a clear action", () => {
  const model = createQueueEmptyModel("new");
  assert.match(model.title, /新出现/);
  assert.match(model.detail, /查看全部/);
  assert.equal(createQueueEmptyModel(null), null);
});

test("unclassified view preserves anonymous evidence without inventing topics", () => {
  const reviews = [
    { reviewIdHash: "a".repeat(64), text: "An unusual comment that does not match a topic.", createdAt: "2026-08-11T00:00:00.000Z", playerSegment: "mid" },
    { reviewIdHash: "b".repeat(64), text: "Another unclassified but still useful observation.", createdAt: "2026-08-12T00:00:00.000Z", playerSegment: "core" },
  ];
  const model = createUnclassifiedModel([
    { reviewIdHash: reviews[0].reviewIdHash, reason: "no-dictionary-match" },
    { reviewIdHash: reviews[1].reviewIdHash, reason: "no-dictionary-match" },
  ], reviews);
  const html = renderUnclassifiedItems(model.items);

  assert.equal(model.count, 2);
  assert.equal(model.items[0].reviewIdHash.length, 64);
  assert.match(html, /does not match a topic/);
  assert.doesNotMatch(html, /steamid|profile/i);
});
