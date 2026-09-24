import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SAMPLE_RATE = 22_050;
const outputDirectory = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../projects/echo-hall/assets/audio",
);

function createNoise(seed) {
  let state = seed >>> 0;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 0xffffffff * 2 - 1;
  };
}

function encodeWav(duration, renderSample) {
  const sampleCount = Math.round(duration * SAMPLE_RATE);
  const buffer = Buffer.alloc(44 + sampleCount * 2);
  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(36 + sampleCount * 2, 4);
  buffer.write("WAVE", 8);
  buffer.write("fmt ", 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(1, 22);
  buffer.writeUInt32LE(SAMPLE_RATE, 24);
  buffer.writeUInt32LE(SAMPLE_RATE * 2, 28);
  buffer.writeUInt16LE(2, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write("data", 36);
  buffer.writeUInt32LE(sampleCount * 2, 40);
  for (let index = 0; index < sampleCount; index += 1) {
    const sample = Math.max(-1, Math.min(1, renderSample(index / SAMPLE_RATE, index)));
    buffer.writeInt16LE(Math.round(sample * 32767), 44 + index * 2);
  }
  return buffer;
}

function synthesizeFootsteps() {
  const noise = createNoise(0xe0c401);
  return encodeWav(2, (time) => {
    const stepPhase = time % 0.5;
    if (stepPhase > 0.18) return 0;
    const envelope = Math.exp(-28 * stepPhase);
    return envelope * (Math.sin(2 * Math.PI * 68 * stepPhase) * 0.55 + noise() * 0.22);
  });
}

function synthesizeBreathing() {
  const noise = createNoise(0xb3ea7e);
  let filteredNoise = 0;
  return encodeWav(4, (time) => {
    filteredNoise += (noise() - filteredNoise) * 0.018;
    const cycle = Math.max(0, Math.sin(2 * Math.PI * 0.25 * time));
    return filteredNoise * cycle * 0.32 + Math.sin(2 * Math.PI * 92 * time) * cycle * 0.015;
  });
}

function synthesizeFacilityAmbience() {
  const noise = createNoise(0xfac117);
  let filteredNoise = 0;
  return encodeWav(8, (time) => {
    filteredNoise += (noise() - filteredNoise) * 0.006;
    const hum = Math.sin(2 * Math.PI * 55 * time) * 0.11 + Math.sin(2 * Math.PI * 110 * time) * 0.025;
    const ventilation = filteredNoise * (0.08 + 0.025 * Math.sin(2 * Math.PI * 0.125 * time));
    return hum + ventilation;
  });
}

function synthesizeResonanceScore() {
  return encodeWav(8, (time) => {
    const pulse = 0.65 + 0.35 * Math.sin(2 * Math.PI * 0.25 * time - Math.PI / 2);
    const fundamental = Math.sin(2 * Math.PI * 110 * time) * 0.12;
    const fifth = Math.sin(2 * Math.PI * 165 * time) * 0.065;
    const shimmer = Math.sin(2 * Math.PI * 440 * time + Math.sin(2 * Math.PI * 0.125 * time)) * 0.018;
    return (fundamental + fifth) * pulse + shimmer;
  });
}

await mkdir(outputDirectory, { recursive: true });
const layers = [
  ["footsteps.wav", synthesizeFootsteps()],
  ["breathing.wav", synthesizeBreathing()],
  ["facility-ambience.wav", synthesizeFacilityAmbience()],
  ["resonance-score.wav", synthesizeResonanceScore()],
];
await Promise.all(layers.map(([file, bytes]) => writeFile(path.join(outputDirectory, file), bytes)));
console.log(`${layers.length} deterministic Echo Run audio layers generated at ${SAMPLE_RATE} Hz`);
