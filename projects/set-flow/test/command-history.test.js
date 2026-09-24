import assert from "node:assert/strict";
import test from "node:test";

import { createCommandHistory } from "../src/state/command-history.js";

function commandThatSets(state, value) {
  const previous = state.value;
  return {
    label: `Set ${value}`,
    do() { state.value = value; },
    undo() { state.value = previous; },
  };
}

test("history executes, undoes and redoes commands", () => {
  const state = { value: 0 };
  const history = createCommandHistory({ limit: 20 });

  history.execute(commandThatSets(state, 1));
  assert.equal(state.value, 1);
  assert.equal(history.canUndo(), true);

  history.undo();
  assert.equal(state.value, 0);
  assert.equal(history.canRedo(), true);

  history.redo();
  assert.equal(state.value, 1);
});

test("executing after undo discards the redo branch", () => {
  const state = { value: 0 };
  const history = createCommandHistory({ limit: 20 });

  history.execute(commandThatSets(state, 1));
  history.execute(commandThatSets(state, 2));
  history.undo();
  history.execute(commandThatSets(state, 3));

  assert.equal(state.value, 3);
  assert.equal(history.canRedo(), false);
  assert.deepEqual(history.snapshot(), {
    undoDepth: 2,
    redoDepth: 0,
    undoLabel: "Set 3",
    redoLabel: null,
  });
});

test("failed commands are not recorded and history respects its limit", () => {
  const state = { value: 0 };
  const history = createCommandHistory({ limit: 2 });

  assert.throws(() => history.execute({
    label: "Broken",
    do() { throw new Error("failed"); },
    undo() {},
  }), /failed/);
  assert.equal(history.canUndo(), false);

  history.execute(commandThatSets(state, 1));
  history.execute(commandThatSets(state, 2));
  history.execute(commandThatSets(state, 3));
  history.undo();
  history.undo();
  assert.equal(state.value, 1);
  assert.equal(history.undo(), false);
});
