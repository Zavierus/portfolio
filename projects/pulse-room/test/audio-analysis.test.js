import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  createFrequencyBands,
  formatTime,
  summarizeBands,
  waveformLevel,
} from "../src/audio-analysis.js";

test("formatTime handles normal and invalid durations", () => {
  assert.equal(formatTime(0), "0:00");
  assert.equal(formatTime(65.9), "1:05");
  assert.equal(formatTime(Infinity), "0:00");
});

test("frequency compression preserves output shape and energy", () => {
  const data = new Uint8Array(512);
  data.fill(32);
  data[4] = 255;
  const bands = createFrequencyBands(data, 32);
  assert.equal(bands.length, 32);
  assert.ok(bands.every((value) => value >= 0 && value <= 1));
  assert.ok(Math.max(...bands) > Math.min(...bands));
});

test("band summary and waveform report silence safely", () => {
  assert.deepEqual(summarizeBands([]), { low: 0, mid: 0, high: 0, peak: 0, energy: 0 });
  assert.equal(waveformLevel(new Uint8Array(32).fill(128)), 0);
  assert.ok(waveformLevel(Uint8Array.from([0, 255, 0, 255])) > 0.9);
});

test("offline analysis publishes one track-neutral event schema", async () => {
  const source = await readFile("scripts/analyze-pulse-tracks.mjs", "utf8");
  assert.match(source, /function buildCameraEvents\(sections\)/);
  assert.match(source, /gesture:\s*"section-drift"/);
  assert.match(source, /cameraEvents:\s*buildCameraEvents\(analysis\.sections\)/);
  assert.doesNotMatch(source, /track\.style|track\.theme|track\.worldId|worldId:/);
});

test("all generated analyses share normalized frames and bounded generic events", async () => {
  const manifest = JSON.parse(await readFile(
    "projects/pulse-room/assets/music/track-manifest.json",
    "utf8",
  ));
  let expectedKeys = null;
  for (const track of manifest.tracks) {
    const analysis = JSON.parse(await readFile(track.analysis.path, "utf8"));
    const keys = Object.keys(analysis).sort();
    expectedKeys ??= keys;
    assert.deepEqual(keys, expectedKeys);
    for (const forbidden of ["worldId", "style", "theme", "visualPreset", "catalogRole"]) {
      assert.equal(Object.hasOwn(analysis, forbidden), false);
    }
    assert.ok(Array.isArray(analysis.frames) && analysis.frames.length > 0);
    for (const frame of analysis.frames) {
      for (const field of ["energy", "low", "mid", "high", "onset", "spectralCentroid"]) {
        assert.ok(frame[field] >= 0 && frame[field] <= 1, `${track.id} ${field} must be normalized`);
      }
    }
    assert.ok(analysis.cameraEvents.every(({ gesture }) => gesture === "section-drift"));
    assert.ok(analysis.particleEvents.length <= analysis.frames.length + analysis.sections.length);
  }
});
