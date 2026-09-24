import assert from "node:assert/strict";
import test from "node:test";

import { getTopicCopy, TOPIC_COPY } from "../src/ui/topic-copy.js";

test("all production topic IDs have Chinese primary and English secondary labels", () => {
  const expected = ["performance", "stability", "controls", "multiplayer", "balance", "content", "onboarding", "monetization", "base-building", "interface"];
  assert.deepEqual(Object.keys(TOPIC_COPY).sort(), expected.sort());
  for (const id of expected) {
    const copy = getTopicCopy(id, "Fallback");
    assert.match(copy.primary, /[\u3400-\u9fff]/u);
    assert.match(copy.secondary, /[A-Za-z]/);
  }
});

test("unknown and renamed topics fall back without losing their label", () => {
  assert.deepEqual(getTopicCopy("custom", "Frame pacing"), { primary: "Frame pacing", secondary: "自定义主题" });
  assert.deepEqual(getTopicCopy("performance", "Frame pacing"), { primary: "性能与帧率", secondary: "Frame pacing" });
});
