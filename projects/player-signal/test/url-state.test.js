import assert from "node:assert/strict";
import test from "node:test";

import { parseWorkspaceState, serializeWorkspaceState } from "../src/state/url-state.js";
import { nextSignalId } from "../src/visualization/signal-field.js";

test("workspace URL state accepts only known views and queues", () => {
  assert.deepEqual(parseWorkspaceState("?view=table&queue=unclassified&topic=performance"), {
    view: "table",
    queue: "unclassified",
    topic: "performance",
  });
  assert.deepEqual(parseWorkspaceState("?view=unknown&queue=wrong&topic=%3Cscript%3E"), {
    view: "field",
    queue: null,
    topic: null,
  });
});

test("workspace URL state omits default and empty values", () => {
  assert.equal(serializeWorkspaceState({ view: "field", queue: null, topic: null }), "");
  assert.equal(serializeWorkspaceState({ view: "table", queue: "growing", topic: "performance" }), "?view=table&queue=growing&topic=performance");
});

test("keyboard signal navigation wraps and survives an unknown selection", () => {
  const topics = [{ id: "a" }, { id: "b" }, { id: "c" }];
  assert.equal(nextSignalId(topics, "a", -1), "c");
  assert.equal(nextSignalId(topics, "c", 1), "a");
  assert.equal(nextSignalId(topics, "missing", 1), "a");
  assert.equal(nextSignalId([], "missing", 1), null);
});
