const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

export function killCueProfile({ combo = 1, headshot = false, source = "shot" } = {}) {
  const streak = clamp(combo, 1, 5);
  return {
    streak,
    fundamental: (headshot ? 540 : 420) * (1 + (streak - 1) * 0.085),
    glint: headshot ? 1840 + streak * 115 : 0,
    impact: source === "throw" ? 0.16 : 0.115,
  };
}

function connectWithPan(context, source, destination, pan = 0) {
  if (!context.createStereoPanner) {
    source.connect(destination);
    return;
  }
  const panner = context.createStereoPanner();
  panner.pan.value = clamp(pan, -1, 1);
  source.connect(panner).connect(destination);
}

export function createGameAudio(context) {
  const master = context.createGain();
  const compressor = context.createDynamicsCompressor();
  compressor.threshold.value = -18;
  compressor.knee.value = 15;
  compressor.ratio.value = 5;
  compressor.attack.value = 0.003;
  compressor.release.value = 0.16;
  master.gain.value = 0.72;
  master.connect(compressor).connect(context.destination);

  const buses = Object.fromEntries(["weapon", "feedback", "world", "ui"].map((name) => {
    const gain = context.createGain();
    gain.gain.value = name === "world" ? 0.62 : 1;
    gain.connect(master);
    return [name, gain];
  }));

  const noiseBuffer = context.createBuffer(1, context.sampleRate * 2, context.sampleRate);
  const noiseData = noiseBuffer.getChannelData(0);
  for (let index = 0; index < noiseData.length; index += 1) noiseData[index] = Math.random() * 2 - 1;

  function tone({ start, end = start, duration, volume, type = "sine", offset = 0, pan = 0, bus = "world", attack = 0.002 }) {
    const now = context.currentTime + offset;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(Math.max(20, start), now);
    oscillator.frequency.exponentialRampToValueAtTime(Math.max(20, end), now + duration);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(Math.max(0.0001, volume), now + Math.min(attack, duration * 0.25));
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    oscillator.connect(gain);
    connectWithPan(context, gain, buses[bus], pan);
    oscillator.start(now);
    oscillator.stop(now + duration + 0.01);
  }

  function noise({ duration, volume, cutoff, offset = 0, pan = 0, bus = "world", filterType = "lowpass", q = 0.8, attack = 0.001 }) {
    const now = context.currentTime + offset;
    const source = context.createBufferSource();
    const filter = context.createBiquadFilter();
    const gain = context.createGain();
    source.buffer = noiseBuffer;
    filter.type = filterType;
    filter.frequency.value = cutoff;
    filter.Q.value = q;
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(Math.max(0.0001, volume), now + Math.min(attack, duration * 0.25));
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    source.connect(filter).connect(gain);
    connectWithPan(context, gain, buses[bus], pan);
    source.start(now, Math.random() * Math.max(0.01, noiseBuffer.duration - duration));
    source.stop(now + duration + 0.01);
  }

  function playKill(options = {}) {
    const cue = killCueProfile(options);
    tone({ start: 102, end: 46, duration: 0.17, volume: cue.impact, bus: "feedback" });
    tone({ start: cue.fundamental, end: cue.fundamental * 1.08, duration: 0.115, volume: 0.055, type: "triangle", offset: 0.028, bus: "feedback" });
    tone({ start: cue.fundamental * 1.5, end: cue.fundamental * 1.62, duration: 0.16, volume: 0.035, type: "sine", offset: 0.07, bus: "feedback" });
    if (cue.glint) {
      noise({ duration: 0.045, volume: 0.038, cutoff: 5200, filterType: "highpass", bus: "feedback" });
      tone({ start: cue.glint, end: cue.glint * 1.22, duration: 0.1, volume: 0.032, type: "sine", offset: 0.02, bus: "feedback" });
    }
  }

  function play(type, options = {}) {
    const recipes = {
      start() {
        noise({ duration: 0.72, volume: 0.07, cutoff: 420 });
        tone({ start: 52, end: 34, duration: 0.78, volume: 0.13 });
        tone({ start: 330, end: 495, duration: 0.16, volume: 0.032, type: "triangle", offset: 0.42, bus: "ui" });
      },
      shot() {
        noise({ duration: 0.018, volume: 0.3, cutoff: 4300, filterType: "highpass", bus: "weapon" });
        noise({ duration: 0.095, volume: 0.34, cutoff: 980, bus: "weapon" });
        noise({ duration: 0.24, volume: 0.055, cutoff: 1800, filterType: "bandpass", q: 1.4, offset: 0.025, bus: "weapon" });
        tone({ start: 112, end: 42, duration: 0.15, volume: 0.19, bus: "weapon" });
      },
      enemy() {
        noise({ duration: 0.055, volume: 0.1, cutoff: 3200 });
        tone({ start: 210, end: 92, duration: 0.1, volume: 0.06, type: "triangle" });
      },
      warning() {
        tone({ start: 520, end: 760, duration: 0.085, volume: 0.018, type: "sine", bus: "ui" });
      },
      shatter() {
        noise({ duration: 0.08, volume: 0.09, cutoff: 4200, bus: "feedback" });
        tone({ start: 112, end: 72, duration: 0.18, volume: 0.07, bus: "feedback" });
      },
      glass() {
        noise({ duration: 0.48, volume: 0.16, cutoff: 6500 });
        [1150, 1620, 2240].forEach((frequency, index) => tone({ start: frequency, end: frequency * 0.55, duration: 0.28, volume: 0.03, type: "triangle", offset: index * 0.025 }));
      },
      reload() {
        noise({ duration: 0.12, volume: 0.035, cutoff: 1250, filterType: "bandpass", q: 0.9, bus: "weapon" });
      },
      magOut() {
        noise({ duration: 0.045, volume: 0.04, cutoff: 2600, filterType: "bandpass", bus: "weapon" });
        tone({ start: 190, end: 105, duration: 0.055, volume: 0.045, type: "triangle", bus: "weapon" });
      },
      magIn() {
        noise({ duration: 0.035, volume: 0.055, cutoff: 3600, filterType: "highpass", bus: "weapon" });
        tone({ start: 255, end: 160, duration: 0.06, volume: 0.055, type: "triangle", bus: "weapon" });
        tone({ start: 940, end: 710, duration: 0.04, volume: 0.028, offset: 0.012, bus: "weapon" });
      },
      slide() {
        noise({ duration: 0.085, volume: 0.07, cutoff: 2400, filterType: "bandpass", q: 0.7, bus: "weapon" });
        tone({ start: 720, end: 235, duration: 0.075, volume: 0.05, type: "triangle", bus: "weapon" });
      },
      throw() {
        noise({ duration: 0.14, volume: 0.075, cutoff: 1100 });
        tone({ start: 280, end: 62, duration: 0.2, volume: 0.09, type: "triangle" });
      },
      wave() {
        tone({ start: 58, end: 174, duration: 0.5, volume: 0.1 });
        noise({ duration: 0.28, volume: 0.035, cutoff: 1100, offset: 0.08 });
      },
      fail() {
        noise({ duration: 0.72, volume: 0.12, cutoff: 500 });
        tone({ start: 145, end: 24, duration: 0.9, volume: 0.16, type: "sawtooth" });
      },
      complete() {
        [110, 165, 220, 330].forEach((frequency, index) => tone({ start: frequency, end: frequency * 2, duration: 1.2, volume: 0.055, type: "triangle", offset: index * 0.08 }));
      },
    };
    (recipes[type] || recipes.enemy)();
  }

  function whiz(pan) {
    noise({ duration: 0.28, volume: 0.095, cutoff: 5200, pan, filterType: "highpass" });
    tone({ start: 1250, end: 180, duration: 0.3, volume: 0.065, pan });
  }

  return { play, playKill, whiz };
}
