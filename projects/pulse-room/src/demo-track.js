const writeAscii = (view, offset, value) => {
  for (let index = 0; index < value.length; index += 1) view.setUint8(offset + index, value.charCodeAt(index));
};

function createRandom(seed = 0x504c5345) {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0xffffffff;
  };
}

export function createDemoWavBytes({ bars = 8, bpm = 112, sampleRate = 22050 } = {}) {
  const beats = bars * 4;
  const beatDuration = 60 / bpm;
  const duration = beats * beatDuration;
  const sampleCount = Math.floor(duration * sampleRate);
  const channels = 2;
  const bytesPerSample = 2;
  const dataSize = sampleCount * channels * bytesPerSample;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);
  writeAscii(view, 0, "RIFF");
  view.setUint32(4, 36 + dataSize, true);
  writeAscii(view, 8, "WAVE");
  writeAscii(view, 12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, channels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * channels * bytesPerSample, true);
  view.setUint16(32, channels * bytesPerSample, true);
  view.setUint16(34, 16, true);
  writeAscii(view, 36, "data");
  view.setUint32(40, dataSize, true);

  const random = createRandom();
  const bassNotes = [55, 55, 65.41, 55, 73.42, 65.41, 49, 55];
  const padRoots = [110, 130.81, 146.83, 98];
  for (let sample = 0; sample < sampleCount; sample += 1) {
    const time = sample / sampleRate;
    const beatPosition = time / beatDuration;
    const beatIndex = Math.floor(beatPosition);
    const beatPhase = beatPosition - beatIndex;
    const eighthPhase = (beatPosition * 2) % 1;
    const barPosition = beatPosition / 4;
    const chordRoot = padRoots[Math.floor(barPosition) % padRoots.length];

    const kickEnvelope = Math.exp(-beatPhase * 18);
    const kickFrequency = 43 + 78 * Math.exp(-beatPhase * 24);
    const kick = Math.sin(2 * Math.PI * kickFrequency * time) * kickEnvelope * 0.72;

    const snareBeat = beatIndex % 4 === 1 || beatIndex % 4 === 3;
    const snareEnvelope = snareBeat ? Math.exp(-beatPhase * 25) : 0;
    const snare = ((random() * 2 - 1) * 0.68 + Math.sin(2 * Math.PI * 184 * time) * 0.25) * snareEnvelope;

    const hatEnvelope = Math.exp(-eighthPhase * 54);
    const hat = (random() * 2 - 1) * hatEnvelope * 0.11;

    const bassFrequency = bassNotes[Math.floor(beatPosition / 2) % bassNotes.length];
    const bassEnvelope = Math.min(1, beatPhase * 12) * Math.exp(-beatPhase * 1.15);
    const bass = (
      Math.sin(2 * Math.PI * bassFrequency * time) * 0.34
      + Math.sin(2 * Math.PI * bassFrequency * 2 * time) * 0.1
      + Math.sin(2 * Math.PI * bassFrequency * 3 * time) * 0.04
    ) * bassEnvelope;

    const padPulse = 0.52 + Math.sin(2 * Math.PI * time / (beatDuration * 4)) * 0.18;
    const pad = [1, 1.25, 1.5].reduce((sum, ratio) => (
      sum + Math.sin(2 * Math.PI * chordRoot * ratio * time) * 0.034
    ), 0) * padPulse;

    const mix = Math.max(-1, Math.min(1, kick + snare * 0.34 + hat + bass + pad));
    const pan = Math.sin(time * 0.37) * 0.06;
    const left = Math.max(-1, Math.min(1, mix * (1 - pan)));
    const right = Math.max(-1, Math.min(1, mix * (1 + pan)));
    const offset = 44 + sample * 4;
    view.setInt16(offset, Math.round(left * 32767), true);
    view.setInt16(offset + 2, Math.round(right * 32767), true);
  }
  return new Uint8Array(buffer);
}

export function createDemoTrack() {
  const bytes = createDemoWavBytes();
  const url = URL.createObjectURL(new Blob([bytes], { type: "audio/wav" }));
  return {
    id: "pulse-room-demo",
    title: "Signal Fracture",
    artist: "PULSE ROOM / LOCAL SIGNAL STUDY",
    url,
    revoke: true,
  };
}
