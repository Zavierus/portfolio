import test from "node:test";
import assert from "node:assert/strict";
import { createDemoWavBytes } from "../src/demo-track.js";

const ascii = (bytes, start, length) => String.fromCharCode(...bytes.slice(start, start + length));

test("generated demo is a stereo PCM WAV with audio data", () => {
  const bytes = createDemoWavBytes({ bars: 1, sampleRate: 8000 });
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  assert.equal(ascii(bytes, 0, 4), "RIFF");
  assert.equal(ascii(bytes, 8, 4), "WAVE");
  assert.equal(view.getUint16(22, true), 2);
  assert.equal(view.getUint32(24, true), 8000);
  assert.ok(view.getUint32(40, true) > 1000);
  assert.equal(bytes.byteLength, view.getUint32(40, true) + 44);
});
