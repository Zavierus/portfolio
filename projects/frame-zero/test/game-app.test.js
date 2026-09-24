import test from "node:test";
import assert from "node:assert/strict";
import { createGameApp } from "../src/app/game-app.js";

function createHarness({ loadFails = false } = {}) {
  const calls = [];
  let pointerLockLost = null;
  const adapter = (name) => ({
    async boot() { calls.push(`${name}:boot`); },
    async resume() { calls.push(`${name}:resume`); },
    start() { calls.push(`${name}:start`); },
    pause() { calls.push(`${name}:pause`); },
    enable() { calls.push(`${name}:enable`); },
    disable() { calls.push(`${name}:disable`); },
    attach() { calls.push(`${name}:attach`); },
    detach() { calls.push(`${name}:detach`); },
    dispose() { calls.push(`${name}:dispose`); },
  });

  const renderer = adapter("renderer");
  const audio = adapter("audio");
  const input = {
    ...adapter("input"),
    onPointerLockLost(callback) {
      pointerLockLost = callback;
      return () => { pointerLockLost = null; };
    },
  };
  const ui = {
    renderState(state) { calls.push(`ui:${state}`); },
    renderProgress(progress) { calls.push(`progress:${progress.stage}`); },
    renderError(error) { calls.push(`error:${error.message}`); },
  };
  const loader = {
    async loadAll(onProgress) {
      onProgress({ stage: "runtime", completed: 1, total: 2 });
      if (loadFails) throw new Error("environment failed");
      onProgress({ stage: "environment", completed: 2, total: 2 });
    },
  };

  return {
    app: createGameApp({ renderer, audio, input, ui, loader }),
    calls,
    losePointerLock: () => pointerLockLost?.(),
  };
}

test("game app follows the boot, play, pause, resume, dispose lifecycle", async () => {
  const harness = createHarness();

  await harness.app.boot();
  assert.equal(harness.app.state(), "ready");
  await harness.app.start();
  await harness.app.start();
  assert.equal(harness.calls.filter((call) => call === "renderer:start").length, 1);

  harness.losePointerLock();
  assert.equal(harness.app.state(), "paused");
  await harness.app.start();
  assert.equal(harness.app.state(), "playing");

  harness.app.dispose();
  assert.equal(harness.app.state(), "disposed");
  assert.ok(harness.calls.includes("input:detach"));
  assert.ok(harness.calls.includes("renderer:dispose"));
});

test("boot failure presents a retryable error state", async () => {
  const harness = createHarness({ loadFails: true });

  await assert.rejects(harness.app.boot(), /environment failed/);
  assert.equal(harness.app.state(), "error");
  assert.ok(harness.calls.includes("error:environment failed"));
  assert.ok(harness.calls.includes("input:detach"));
  assert.ok(harness.calls.includes("renderer:dispose"));
  assert.ok(harness.calls.includes("audio:dispose"));
});
