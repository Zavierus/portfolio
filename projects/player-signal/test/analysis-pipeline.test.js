import assert from "node:assert/strict";
import test from "node:test";

import { analyzeDataset } from "../src/analysis/pipeline.js";

function review(index, text) {
  return {
    reviewIdHash: index.toString(16).padStart(64, "0"),
    text,
    createdAt: `2026-08-${String(1 + index).padStart(2, "0")}T00:00:00.000Z`,
    recommended: false,
    playtimeMinutes: 7200,
    helpfulVotes: 0,
    language: "english",
    source: { provider: "test", url: "https://example.com/reviews", retrievedAt: "2026-08-12T00:00:00.000Z" },
  };
}

test("analysis pipeline reapplies manual corrections before scoring", () => {
  const dataset = {
    reviews: [
      review(1, "Performance stutter makes the frame rate unstable during base building."),
      review(2, "The game has terrible performance and frame pacing after the update."),
    ],
    versions: [],
    source: { retrievedAt: "2026-08-12T00:00:00.000Z" },
  };

  const result = analyzeDataset(dataset, {
    corrections: { renames: { performance: "Frame pacing" }, merges: [] },
  });

  assert.equal(result.topics.find((topic) => topic.id === "performance")?.label, "Frame pacing");
  assert.ok(result.corrections.some((item) => item.type === "rename" && item.topicId === "performance"));
});
