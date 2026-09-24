import assert from "node:assert/strict";
import test from "node:test";

import { DEFAULT_TOPIC_DICTIONARY } from "../src/analysis/topic-dictionary.js";
import { applyTopicCorrections, deriveTopics } from "../src/analysis/topic-engine.js";

function id(character) {
  return character.repeat(64);
}

function review(character, text, recommended = false) {
  return {
    reviewIdHash: id(character),
    normalizedText: text,
    text,
    recommended,
    createdAt: "2026-08-10T12:00:00.000Z",
    playtimeMinutes: 7200,
    playerSegment: "core",
    analysisWeight: 1,
  };
}

test("the approved topic dictionary has stable explainable production categories", () => {
  const ids = DEFAULT_TOPIC_DICTIONARY.map((topic) => topic.id);
  assert.deepEqual(ids, [...new Set(ids)]);
  assert.ok(ids.includes("performance"));
  assert.ok(ids.includes("stability"));
  assert.ok(ids.includes("controls"));
  assert.ok(ids.includes("multiplayer"));
  assert.ok(ids.includes("balance"));
  assert.ok(ids.includes("content"));
  assert.ok(ids.includes("onboarding"));
  assert.ok(ids.includes("monetization"));
  assert.ok(DEFAULT_TOPIC_DICTIONARY.every((topic) => topic.terms.length >= 3));
});

test("topic derivation supports multi-label evidence and positive counter-evidence", () => {
  const result = deriveTopics([
    review("a", "The game crashes and the frame rate stutters after this update."),
    review("b", "Frame rate is smooth now and performance is much better.", true),
    review("c", "Matchmaking cannot find my friends in multiplayer."),
  ]);
  const performance = result.topics.find((topic) => topic.id === "performance");
  const stability = result.topics.find((topic) => topic.id === "stability");

  assert.deepEqual(performance.evidenceIds, [id("a")]);
  assert.deepEqual(performance.counterEvidenceIds, [id("b")]);
  assert.deepEqual(stability.evidenceIds, [id("a")]);
  assert.ok(result.assignments.find((assignment) => assignment.reviewIdHash === id("a")).topicIds.length >= 2);
});

test("unmatched reviews remain visible in the unclassified queue", () => {
  const result = deriveTopics([review("d", "I named my ship after my cat and took a screenshot.", true)]);
  assert.equal(result.unclassified.length, 1);
  assert.equal(result.unclassified[0].reviewIdHash, id("d"));
});

test("manual rename, merge and split preserve source review evidence", () => {
  const reviews = [
    review("a", "Controller input delay makes flying difficult."),
    review("b", "Key binding resets after every launch."),
    review("c", "Mouse sensitivity feels inconsistent."),
  ];
  const derived = deriveTopics(reviews);
  const corrected = applyTopicCorrections(derived, reviews, {
    renames: { controls: "Input and remapping" },
    splits: [
      {
        sourceId: "controls",
        groups: [
          { id: "input-latency", label: "Input latency", terms: ["delay", "sensitivity"] },
          { id: "key-remapping", label: "Key remapping", terms: ["binding", "resets"] },
        ],
      },
    ],
    merges: [
      {
        from: ["input-latency", "key-remapping"],
        into: { id: "control-usability", label: "Control usability", category: "controls" },
      },
    ],
  });
  const topic = corrected.topics.find((candidate) => candidate.id === "control-usability");

  assert.ok(topic);
  assert.deepEqual(new Set([...topic.evidenceIds, ...topic.counterEvidenceIds]), new Set(reviews.map((item) => item.reviewIdHash)));
  assert.ok(corrected.corrections.some((item) => item.type === "split"));
  assert.ok(corrected.corrections.some((item) => item.type === "merge"));
});

test("topic derivation is deterministic and never mutates review input", () => {
  const reviews = [review("a", "Performance and stutter are worse."), review("b", "The tutorial is confusing.")];
  const original = structuredClone(reviews);
  assert.deepEqual(deriveTopics(reviews), deriveTopics(structuredClone(reviews)));
  assert.deepEqual(reviews, original);
});
