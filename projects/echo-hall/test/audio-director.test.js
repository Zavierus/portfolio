import assert from "node:assert/strict";
import test from "node:test";

import { AudioDirector } from "../src/audio/audio-director.js";
import { sampleAudioMix } from "../src/audio/audio-mix.js";

function createAdapter() {
  const calls = [];
  return {
    calls,
    async unlock() { calls.push(["unlock"]); },
    startLoop(value) { calls.push(["loop", value]); },
    playOneShot(value) { calls.push(["one-shot", value]); },
    stopAll(reason) { calls.push(["stop", reason]); },
    setBusGain(bus, gain, time) { calls.push(["bus", bus, gain, time]); },
    setMasterGain(gain, time) { calls.push(["master", gain, time]); },
    dispose() { calls.push(["dispose"]); },
  };
}

const buffers = {
  "facility-ambience": { duration: 8 },
  breathing: { duration: 4 },
  "resonance-score": { duration: 8 },
};

test("visual playback can begin before audio unlock", () => {
  const adapter = createAdapter();
  const audio = new AudioDirector({ adapter, buffers, muted: false });
  assert.equal(audio.start(3), true);
  assert.equal(audio.state.playing, true);
  assert.equal(adapter.calls.some(([type]) => type === "loop"), false);
});

test("one gesture unlock schedules four narrative layers", async () => {
  const adapter = createAdapter();
  const audio = new AudioDirector({ adapter, buffers, muted: false });
  audio.start(12);
  await Promise.all([audio.unlock(), audio.unlock()]);
  assert.equal(adapter.calls.filter(([type]) => type === "unlock").length, 1);
  assert.equal(adapter.calls.filter(([type]) => type === "loop").length, 4);
});

test("audio mix follows wake, memory, extinction, and reconstruction", () => {
  assert.equal(sampleAudioMix(5).chapterId, "greeting");
  assert.ok(sampleAudioMix(38).buses.structure > sampleAudioMix(15).buses.structure);
  assert.ok(sampleAudioMix(56).buses.memory > sampleAudioMix(38).buses.memory);
  assert.ok(sampleAudioMix(72).buses.signal < 0.2);
  assert.ok(sampleAudioMix(92).buses.memory > sampleAudioMix(72).buses.memory);
});

test("finish stops layers without rescheduling a loop", async () => {
  const adapter = createAdapter();
  const audio = new AudioDirector({ adapter, buffers, muted: false });
  audio.start(0);
  await audio.unlock();
  const loops = adapter.calls.filter(([type]) => type === "loop").length;
  audio.finish();
  assert.ok(adapter.calls.some(([type, reason]) => type === "stop" && reason === "finish"));
  assert.equal(adapter.calls.filter(([type]) => type === "loop").length, loops);
  assert.equal(audio.state.playing, false);
});

test("visibility pause resumes prior playback intent", async () => {
  const adapter = createAdapter();
  const audio = new AudioDirector({ adapter, buffers });
  audio.start(24);
  await audio.unlock();
  audio.setVisibility(false);
  assert.equal(audio.state.playing, false);
  audio.setVisibility(true);
  assert.equal(audio.state.playing, true);
});

test("dispose stops sources once and rejects later updates", () => {
  const adapter = createAdapter();
  const audio = new AudioDirector({ adapter, buffers });
  assert.equal(audio.dispose(), true);
  assert.equal(audio.dispose(), false);
  assert.throws(() => audio.update(1), /disposed/);
});
