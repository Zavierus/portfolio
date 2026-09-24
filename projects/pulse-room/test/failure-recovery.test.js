import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { createRuntimeStatus } from "../src/pulse/runtime-status.js";

const project = "projects/pulse-room";

test("audio failures expose retry, another track, and local import without blocking playback", () => {
  const status = createRuntimeStatus();
  const state = status.report("audio", { trackId: "track-a", error: new Error("offline") });
  assert.equal(state.level, "error");
  assert.deepEqual(state.actions, ["retry", "choose-track", "import-local"]);
  assert.equal(state.blocking, false);
});

test("visual and analysis failures use bounded world-free recovery states", () => {
  const status = createRuntimeStatus();
  const expected = new Map([
    ["cover", ["retry", "choose-track", "import-local"]],
    ["analysis", []],
    ["postprocessing", []],
    ["shader", ["retry"]],
    ["context-lost", ["retry"]],
    ["context-restored", []],
  ]);
  for (const [kind, actions] of expected) {
    const state = status.report(kind, { trackId: "track-a" });
    assert.equal(state.kind, kind);
    assert.deepEqual(state.actions, actions);
    assert.equal(state.blocking, false);
  }
  assert.equal(status.report("world").kind, "ready");
});

test("runtime status subscriptions are isolated and clear returns ready state", () => {
  const status = createRuntimeStatus();
  const events = [];
  status.subscribe((state) => events.push(state.kind));
  status.subscribe(() => { throw new Error("observer failure"); });
  status.report("analysis");
  status.clear();
  assert.deepEqual(events, ["ready", "analysis", "ready"]);
  assert.equal(status.current.kind, "ready");
});

test("runtime status reaches every retained recovery boundary", async () => {
  const [bootstrap, renderer, analysis, playback, cover, musicSpace] = await Promise.all([
    readFile(`${project}/src/pulse/runtime-bootstrap.js`, "utf8"),
    readFile(`${project}/src/mineradio/01-scene/00-renderer-quality.js`, "utf8"),
    readFile(`${project}/src/pulse/analysis-bridge.js`, "utf8"),
    readFile(`${project}/src/pulse/playback-bridge.js`, "utf8"),
    readFile(`${project}/src/mineradio/03-beat/05-cover-loading-crop.js`, "utf8"),
    readFile(`${project}/src/mineradio/02-visual/15-ripples-cover-depth.js`, "utf8"),
  ]);
  assert.match(bootstrap, /createRuntimeStatus/);
  assert.match(bootstrap, /createCoverFallback/);
  assert.match(renderer, /webglcontextlost/);
  assert.match(renderer, /status\.report\(['"]context-lost['"]/);
  assert.match(renderer, /webglcontextrestored/);
  assert.match(renderer, /status\.report\(['"]context-restored['"]/);
  assert.match(analysis, /status:\s*["']fallback["']/);
  assert.match(playback, /Audio decode failed/);
  assert.match(cover, /status\.report\(['"]cover['"]/);
  assert.match(cover, /createCoverFallback/);
  assert.match(musicSpace, /updateUnifiedMusicSpace/);
  assert.doesNotMatch(musicSpace, /status\.report\(['"]depth['"]|neutralCoverEdgeCanvas/);
});

test("browser status renderer publishes the required recovery actions", async () => {
  const statusUi = await readFile(
    `${project}/src/mineradio/09-idle-toast-libraries.js`,
    "utf8",
  );
  assert.match(statusUi, /data-runtime-action/);
  assert.match(statusUi, /retry/);
  assert.match(statusUi, /choose-track/);
  assert.match(statusUi, /import-local/);
  assert.match(statusUi, /setMiniQueueOpen\(true\)/);
  assert.match(statusUi, /setAttribute\(['"]role['"]/);
  assert.match(statusUi, /['"]alert['"]/);
});
