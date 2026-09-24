import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { resolvePerformanceQuality } from "../src/performance/quality-policy.js";

const project = "projects/pulse-room";

test("reduced motion keeps every music-space layer alive", () => {
  const quality = resolvePerformanceQuality({
    deviceMemory: 16,
    hardwareConcurrency: 12,
    devicePixelRatio: 1,
    reducedMotion: true,
  });
  assert.deepEqual(Object.keys(quality.space), ["haze", "ribbons", "flow", "glints", "total"]);
  assert.ok(Object.values(quality.space).every((count) => count > 0));
  assert.equal(quality.idleMotion, true);
  assert.equal(quality.cameraTravel, false);
  assert.equal(quality.impactShake, false);
});

test("reduced motion removes impact shake and rapid camera travel", async () => {
  const [freeCamera, beatCamera, cinemaCamera] = await Promise.all([
    readFile(`${project}/src/mineradio/01-scene/01-orbit-free-camera.js`, "utf8"),
    readFile(`${project}/src/mineradio/01-scene/02-beat-camera-runtime.js`, "utf8"),
    readFile(`${project}/src/mineradio/01-scene/03-focus-cinema-camera.js`, "utf8"),
  ]);
  assert.match(freeCamera, /quality\.impactShake\s*===\s*false/);
  assert.match(freeCamera, /quality\.cameraTravel\s*===\s*false/);
  assert.match(beatCamera, /quality\.impactShake\s*===\s*false/);
  assert.match(cinemaCamera, /quality\.impactShake\s*===\s*false/);
  assert.match(cinemaCamera, /quality\.cameraTravel\s*===\s*false/);
});

test("reduced motion keeps all layers visible while suppressing impulses and long transitions", async () => {
  const [particles, depth, loop, queue, css] = await Promise.all([
    readFile(`${project}/src/mineradio/02-visual/00-pointer-cover-particles.js`, "utf8"),
    readFile(`${project}/src/mineradio/02-visual/15-ripples-cover-depth.js`, "utf8"),
    readFile(`${project}/src/mineradio/11-main-loop.js`, "utf8"),
    readFile(`${project}/src/mineradio/05-playback/18-playlist-panel-shell.js`, "utf8"),
    readFile(`${project}/styles/local.css`, "utf8"),
  ]);
  assert.match(particles, /uReducedMotion/);
  assert.match(particles, /mix\(1\.0,\s*0\.28,\s*uReducedMotion\)/);
  assert.match(loop, /updateUnifiedMusicSpace\(dt,\s*pulseAnalysisFrame/);
  assert.match(depth, /function pulseVisualMotionDuration\s*\(/);
  assert.match(depth, /function pulseVisualMotionIsReduced\s*\(/);
  assert.match(depth, /quality\.reducedMotion/);
  assert.match(depth, /if \(!reducedMotion && impulse > 0\.58/);
  assert.match(depth, /pulseVisualMotionIsReduced\(\)[\s\S]*spaceUniforms\.uAlpha\.value\s*=\s*targetValue/);
  for (const layer of ["spatialHaze", "spectralRibbons", "driftingFlow", "transientGlints"]) {
    assert.match(depth, new RegExp(`${layer}\\.visible = true`));
  }
  assert.match(depth, /Math\.max\(0,\s*Math\.min\(1,/);
  assert.match(queue, /function pulseMotionIsReduced\s*\(/);
  assert.match(css, /@media\s*\(prefers-reduced-motion:\s*reduce\)[\s\S]*transition:\s*none\s*!important/);
});
