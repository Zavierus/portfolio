const SIZE = 512;

export function hashMusicSpaceSeed(value) {
  let hash = 2166136261;
  const text = String(value || "pulse-room");
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function createMusicSpaceSequence(seed) {
  let state = seed || 0x9e3779b9;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 0x100000000;
  };
}

export function musicSpacePalette(seed) {
  const phase = (seed >>> 8) % 17;
  return Object.freeze({
    background: `rgb(${3 + phase % 3}, ${5 + phase % 4}, ${7 + phase % 5})`,
    neutral: "rgba(183, 207, 214, 0.5)",
    cyan: "rgba(43, 207, 222, 0.58)",
    magenta: "rgba(224, 72, 145, 0.38)",
  });
}

function bandValue(value, fallback) {
  return Number.isFinite(value) ? Math.max(0, Math.min(1, value)) : fallback;
}

export function createCoverFallback(trackId, bands = {}, documentRef = globalThis.document) {
  if (!documentRef?.createElement) throw new TypeError("Cover fallback requires a document");
  const canvas = documentRef.createElement("canvas");
  canvas.width = SIZE;
  canvas.height = SIZE;
  const context = canvas.getContext("2d");
  if (!context) throw new TypeError("Cover fallback requires a 2D canvas context");

  const seed = hashMusicSpaceSeed(trackId);
  const next = createMusicSpaceSequence(seed);
  const palette = musicSpacePalette(seed);
  const low = bandValue(bands.low, 0.54);
  const mid = bandValue(bands.mid, 0.46);
  const high = bandValue(bands.high, 0.62);
  context.fillStyle = palette.background;
  context.fillRect(0, 0, SIZE, SIZE);

  context.save();
  context.translate(SIZE / 2, SIZE / 2);
  context.rotate((next() - 0.5) * 0.22);
  context.lineCap = "round";
  for (let index = 0; index < 10; index += 1) {
    const phase = index / 9;
    const span = 150 + phase * 390;
    const offset = (phase - 0.5) * 300 + (next() - 0.5) * 22;
    context.beginPath();
    context.moveTo(-span * 0.55, offset * 0.42);
    context.bezierCurveTo(
      -span * 0.2,
      offset - 84 - low * 36,
      span * 0.18,
      offset + 76 + mid * 42,
      span * 0.55,
      offset * 0.34,
    );
    context.strokeStyle = index % 5 === 4 ? palette.magenta : index % 2 ? palette.cyan : palette.neutral;
    context.globalAlpha = 0.22 + high * 0.24;
    context.lineWidth = 0.8 + (1 - phase) * 1.8;
    context.stroke();
  }

  context.globalCompositeOperation = "screen";
  for (let index = 0; index < 78; index += 1) {
    const angle = next() * Math.PI * 2;
    const radius = 24 + Math.pow(next(), 0.72) * 330;
    const size = 0.5 + next() * (1.8 + high * 2.2);
    context.beginPath();
    context.arc(Math.cos(angle) * radius, Math.sin(angle) * radius * 0.66, size, 0, Math.PI * 2);
    context.fillStyle = index % 13 === 0 ? palette.magenta : index % 3 ? palette.neutral : palette.cyan;
    context.globalAlpha = 0.18 + next() * 0.52;
    context.fill();
  }
  context.restore();
  context.globalAlpha = 1;
  return canvas;
}
