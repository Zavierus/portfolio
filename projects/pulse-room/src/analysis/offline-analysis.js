const TARGET_SAMPLE_RATE = 44100;
const FRAME_SIZE = 4096;
const HOP_SIZE = 11025;

const finite = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
const clamp01 = (value) => Math.min(1, Math.max(0, finite(value)));
const round = (value, digits = 4) => Number(finite(value).toFixed(digits));

function resampleLinear(pcm, sourceRate, targetRate) {
  if (sourceRate === targetRate) return pcm;
  const length = Math.max(1, Math.round(pcm.length * targetRate / sourceRate));
  const output = new Float32Array(length);
  const ratio = sourceRate / targetRate;
  for (let index = 0; index < length; index += 1) {
    const source = index * ratio;
    const left = Math.min(pcm.length - 1, Math.floor(source));
    const right = Math.min(pcm.length - 1, left + 1);
    const amount = source - left;
    output[index] = pcm[left] + (pcm[right] - pcm[left]) * amount;
  }
  return output;
}

function takeVector(essentia, vector) {
  if (!vector || typeof vector.delete !== "function") return [];
  const values = Array.from(essentia.vectorToArray(vector), Number);
  vector.delete();
  return values;
}

function releaseVectors(result, consumed) {
  for (const value of Object.values(result ?? {})) {
    if (!consumed.has(value) && typeof value?.delete === "function") value.delete();
  }
}

function percentile(values, amount = 0.95) {
  const finiteValues = values.filter((value) => Number.isFinite(value) && value >= 0).sort((a, b) => a - b);
  if (finiteValues.length === 0) return 1;
  return Math.max(0.000001, finiteValues[Math.min(finiteValues.length - 1, Math.floor(finiteValues.length * amount))]);
}

function buildSections(frames, duration, bpm) {
  const sectionDuration = Math.max(12, 16 * 4 * 60 / Math.max(40, bpm));
  const sections = [];
  const globalEnergy = frames.length
    ? frames.reduce((sum, frame) => sum + frame.energy, 0) / frames.length
    : 0;
  for (let start = 0, index = 0; start < duration; start += sectionDuration, index += 1) {
    const end = Math.min(duration, start + sectionDuration);
    const sectionFrames = frames.filter((frame) => frame.time >= start && frame.time < end);
    const energy = sectionFrames.length
      ? sectionFrames.reduce((sum, frame) => sum + frame.energy, 0) / sectionFrames.length
      : 0;
    const final = end >= duration - 0.001;
    const label = index === 0
      ? "intro"
      : final
        ? "release"
        : energy > globalEnergy * 1.12
          ? "peak"
          : energy < globalEnergy * 0.76
            ? "break"
            : "body";
    sections.push(Object.freeze({ id: `${label}-${index + 1}`, start: round(start, 3), end: round(end, 3), energy: round(energy) }));
  }
  return sections;
}

function normalizeTempoOctave(bpm, style) {
  const highEnergyStyle = ["acid-techno", "industrial-breakbeat", "glitch-bass"].includes(style);
  if (highEnergyStyle && bpm < 110) return Math.min(208, bpm * 2);
  return bpm;
}

export function analyzeAudioPcm({ essentia, pcm, sampleRate, style = null, onProgress = () => {} } = {}) {
  if (!essentia || typeof essentia.arrayToVector !== "function") throw new TypeError("Essentia instance is required");
  if (!(pcm instanceof Float32Array) || pcm.length === 0) throw new TypeError("PCM must be a non-empty Float32Array");
  const sourceRate = Number(sampleRate);
  if (!Number.isFinite(sourceRate) || sourceRate <= 0) throw new TypeError("Sample rate must be positive");
  const signal = resampleLinear(pcm, sourceRate, TARGET_SAMPLE_RATE);
  const duration = signal.length / TARGET_SAMPLE_RATE;
  const vector = essentia.arrayToVector(signal);
  onProgress(0.08);

  let rhythm;
  let spectral;
  try {
    rhythm = essentia.RhythmExtractor2013(vector, 208, "multifeature", 40);
    onProgress(0.34);
    spectral = essentia.LowLevelSpectralExtractor(vector, FRAME_SIZE, HOP_SIZE, TARGET_SAMPLE_RATE);
    onProgress(0.72);
  } finally {
    vector.delete();
  }

  const rhythmConsumed = new Set();
  const ticksVector = rhythm.ticks;
  rhythmConsumed.add(ticksVector);
  const ticks = takeVector(essentia, ticksVector).filter(Number.isFinite);
  releaseVectors(rhythm, rhythmConsumed);

  const spectralKeys = [
    "spectral_rms",
    "spectral_flux",
    "spectral_energyband_low",
    "spectral_energyband_middle_low",
    "spectral_energyband_middle_high",
    "spectral_energyband_high",
  ];
  const arrays = {};
  const spectralConsumed = new Set();
  for (const key of spectralKeys) {
    spectralConsumed.add(spectral[key]);
    arrays[key] = takeVector(essentia, spectral[key]);
  }
  releaseVectors(spectral, spectralConsumed);

  const frameCount = Math.min(...spectralKeys.map((key) => arrays[key].length));
  const energyScale = percentile(arrays.spectral_rms);
  const onsetScale = percentile(arrays.spectral_flux);
  const frames = [];
  for (let index = 0; index < frameCount; index += 1) {
    const lowEnergy = Math.max(0, finite(arrays.spectral_energyband_low[index]));
    const lowMidEnergy = Math.max(0, finite(arrays.spectral_energyband_middle_low[index]));
    const highMidEnergy = Math.max(0, finite(arrays.spectral_energyband_middle_high[index]));
    const highEnergy = Math.max(0, finite(arrays.spectral_energyband_high[index]));
    const total = Math.max(0.000001, lowEnergy + lowMidEnergy + highMidEnergy + highEnergy);
    const centroid = (lowEnergy * 85 + lowMidEnergy * 475 + highMidEnergy * 2400 + highEnergy * 10000) / total / 12000;
    frames.push(Object.freeze({
      time: round(index * HOP_SIZE / TARGET_SAMPLE_RATE, 3),
      energy: round(clamp01(arrays.spectral_rms[index] / energyScale)),
      low: round(clamp01((lowEnergy + lowMidEnergy * 0.35) / total)),
      mid: round(clamp01((lowMidEnergy * 0.65 + highMidEnergy * 0.72) / total)),
      high: round(clamp01((highEnergy + highMidEnergy * 0.28) / total)),
      onset: round(clamp01(arrays.spectral_flux[index] / onsetScale)),
      spectralCentroid: round(clamp01(centroid)),
    }));
  }

  const rawBpm = Math.min(208, Math.max(40, finite(rhythm.bpm, 120)));
  const bpm = normalizeTempoOctave(rawBpm, style);
  const sections = buildSections(frames, duration, bpm);
  onProgress(1);
  return Object.freeze({
    contractVersion: 2,
    duration: round(duration, 3),
    sampleRate: TARGET_SAMPLE_RATE,
    bpm: round(bpm, 3),
    bpmConfidence: round(Math.max(0, finite(rhythm.confidence))),
    bpmSource: bpm === rawBpm
      ? "essentia-rhythm-extractor-2013"
      : "essentia-rhythm-extractor-2013+style-octave-normalization",
    beatOffset: round(Math.max(0, ticks[0] ?? 0), 4),
    beats: Object.freeze(ticks.map((tick) => round(tick, 4))),
    sections: Object.freeze(sections),
    frames: Object.freeze(frames),
  });
}
