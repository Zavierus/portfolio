import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  PARTICLE_TIERS,
  particleTierSnapshot,
} from "../src/performance/quality-policy.js";

const EXPECTED = Object.freeze({
  high: Object.freeze({
    haze: 4800,
    ribbons: 11520,
    flow: 9600,
    glints: 256,
    total: 26176,
  }),
  balanced: Object.freeze({
    haze: 3000,
    ribbons: 7680,
    flow: 5600,
    glints: 160,
    total: 16440,
  }),
  mobile: Object.freeze({
    haze: 1800,
    ribbons: 3840,
    flow: 2800,
    glints: 96,
    total: 8536,
  }),
});

test("particle tiers match the approved layer contract and arithmetic", () => {
  assert.deepEqual(PARTICLE_TIERS, EXPECTED);
  for (const [id, tier] of Object.entries(PARTICLE_TIERS)) {
    assert.equal(
      tier.total,
      tier.haze + tier.ribbons + tier.flow + tier.glints,
      `${id} total must include every permanent music-space layer`,
    );
    assert.deepEqual(particleTierSnapshot(id), tier);
    assert.ok(Object.isFrozen(tier));
  }
  assert.ok(Object.isFrozen(PARTICLE_TIERS));
});

test("the current particle stage exposes every music-space tier and live QA count", async () => {
  const [ribbonSource, flowSource, hazeSource, mainLoop] = await Promise.all([
    readFile("projects/pulse-room/src/mineradio/02-visual/00-pointer-cover-particles.js", "utf8"),
    readFile("projects/pulse-room/src/mineradio/02-visual/01-float-skull-backcover.js", "utf8"),
    readFile("projects/pulse-room/src/mineradio/02-visual/03-background-star-river.js", "utf8"),
    readFile("projects/pulse-room/src/mineradio/11-main-loop.js", "utf8"),
  ]);

  assert.match(ribbonSource, /PulseRuntime\.quality\.space\.ribbons/);
  assert.match(ribbonSource, /geometry\.userData\.layer\s*=\s*['"]spectralRibbons['"]/);
  assert.match(flowSource, /PulseRuntime\.quality\.space\.flow/);
  assert.match(flowSource, /PulseRuntime\.quality\.space\.glints/);
  assert.match(hazeSource, /PulseRuntime\.quality\.space\.haze/);
  assert.match(mainLoop, /__PULSE_ROOM_QA__\.musicSpace/);
  assert.match(mainLoop, /__PULSE_ROOM_QA__\.analysis/);
  assert.match(mainLoop, /PulseRuntime\.quality\.space/);
  for (const layer of ["spatialHaze", "spectralRibbons", "driftingFlow", "transientGlints"]) {
    assert.match(mainLoop, new RegExp(`${layer}:`));
  }
  assert.match(mainLoop, /cameraMode:/);
  assert.doesNotMatch(mainLoop, /worldId|presentationMode/);
});

test("lyric and skull identities are absent from reachable particle identifiers", async () => {
  const [backgroundSource, depthSource] = await Promise.all([
    readFile("projects/pulse-room/src/mineradio/02-visual/03-background-star-river.js", "utf8"),
    readFile("projects/pulse-room/src/mineradio/02-visual/01-float-skull-backcover.js", "utf8"),
  ]);
  assert.doesNotMatch(backgroundSource, /\b(?:lyricsParticles|lyricsGeo|lyricsAttr|createLyricsParticles|ensureLyricStarRiver|updateLyricStarRiver|disposeLyricStarRiver)\b/i);
  assert.doesNotMatch(depthSource.replace(/^.*\r?\n.*\r?\n.*\r?\n/, ""), /\bskull(?:Particle|Model|Camera|Jaw|Asset|Preset)\w*/i);
});

test("playback restores the unified music-space reveal lifecycle", async () => {
  const [playbackSource, mainLoopSource] = await Promise.all([
    readFile("projects/pulse-room/src/mineradio/05-playback/13-playback-start-audio.js", "utf8"),
    readFile("projects/pulse-room/src/mineradio/11-main-loop.js", "utf8"),
  ]);

  assert.match(
    playbackSource,
    /tweenParticleAlpha\(uniforms\.uAlpha\.value \|\| 0, 1\.0, 220\)/,
  );
  assert.match(mainLoopSource, /alpha:\s*Number\(uniforms\.uAlpha\.value\)/);
  assert.match(mainLoopSource, /rootUuid:\s*musicSpace\.uuid/);
  assert.match(mainLoopSource, /visible:\s*!!musicSpace\.visible/);
  assert.doesNotMatch(mainLoopSource, /hasCover|coverKey|uHasCover/);
});
