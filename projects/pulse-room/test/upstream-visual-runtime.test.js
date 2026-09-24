import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = "projects/pulse-room/src/mineradio";

test("the core visual runtime retains shader, shared-field, camera, and loop responsibilities", async () => {
  const [ribbons, field, camera, mainLoop] = await Promise.all([
    readFile(`${root}/02-visual/00-pointer-cover-particles.js`, "utf8"),
    readFile(`${root}/02-visual/15-ripples-cover-depth.js`, "utf8"),
    readFile(`${root}/01-scene/02-beat-camera-runtime.js`, "utf8"),
    readFile(`${root}/11-main-loop.js`, "utf8"),
  ]);

  assert.match(ribbons, /new THREE\.ShaderMaterial/);
  assert.match(ribbons, /spectralRibbons/);
  assert.match(field, /updateUnifiedMusicSpace/);
  assert.match(camera, /updateBeatCamera/);
  assert.match(mainLoop, /requestAnimationFrame/);
  assert.match(mainLoop, /renderer\.render\(scene, camera\)/);
  assert.doesNotMatch(mainLoop, /PulseRuntime\.worlds|updatePulsePerformance/);
  assert.doesNotMatch(`${ribbons}\n${field}`, /uCoverTex|uPrevCoverTex|uHasCover/);
});

test("the core runtime is free of PULSE world and track-grammar branches", async () => {
  const sources = await Promise.all([
    "00-state/00-core-stores.js",
    "01-scene/00-renderer-quality.js",
    "01-scene/02-beat-camera-runtime.js",
    "02-visual/00-pointer-cover-particles.js",
    "02-visual/15-ripples-cover-depth.js",
    "03-beat/05-cover-loading-crop.js",
    "10-shell/01-viewport-resize-shortcuts.js",
    "11-main-loop.js",
  ].map((path) => readFile(`${root}/${path}`, "utf8")));
  const runtime = sources.join("\n");

  assert.doesNotMatch(
    runtime,
    /PulseRuntime\.worlds|worldCover|particleProgram|presentationMode|updatePulsePerformance/,
  );
});

test("visual persistence and sonic monitoring dependencies are active", async () => {
  const [order, settings, monitor] = await Promise.all([
    readFile(`${root}/module-order.json`, "utf8").then(JSON.parse),
    readFile(`${root}/02-visual/04-visual-settings-persistence.js`, "utf8"),
    readFile(`${root}/03-beat/06-sonic-audio-monitor.js`, "utf8"),
  ]);

  assert.ok(order.includes("00-state/05-packaged-fx-archive.js"));
  assert.ok(order.includes("02-visual/04-visual-settings-persistence.js"));
  assert.ok(order.includes("03-beat/06-sonic-audio-monitor.js"));
  assert.match(settings, /localStorage/);
  assert.match(monitor, /audio/);
});
