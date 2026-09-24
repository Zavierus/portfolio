import { chapterAtTime, CHAPTERS, FILM_DURATION } from "../film/film-model.js";

const clamp01 = (value) => Math.min(1, Math.max(0, Number(value) || 0));
const clampTime = (value) => Math.min(FILM_DURATION, Math.max(0, Number(value) || 0));

function smoothstep(start, end, value) {
  const amount = clamp01((value - start) / Math.max(0.0001, end - start));
  return amount * amount * (3 - 2 * amount);
}

export const AUDIO_BUSES = Object.freeze(["field", "signal", "structure", "memory"]);

export function sampleAudioMix(time, { muted = false } = {}) {
  const filmTime = clampTime(time);
  const greeting = smoothstep(1, 8, filmTime) * (1 - smoothstep(11, 16, filmTime));
  const structure = smoothstep(26, 39, filmTime) * (1 - smoothstep(74, 81, filmTime));
  const memory = smoothstep(45, 58, filmTime);
  const extinction = smoothstep(63, 74, filmTime);
  const reconstruction = smoothstep(80, 93, filmTime);
  const ending = 1 - smoothstep(94.2, 95, filmTime);

  return Object.freeze({
    time: filmTime,
    chapterId: chapterAtTime(CHAPTERS, filmTime)?.id ?? "sync",
    master: muted ? 0 : 0.8,
    buses: Object.freeze({
      field: (0.32 + structure * 0.16 - extinction * 0.14) * ending,
      signal: (0.08 + greeting * 0.52 + reconstruction * 0.16) * ending,
      structure: (0.02 + structure * 0.56) * ending,
      memory: (memory * 0.32 * (1 - extinction * 0.72) + reconstruction * 0.5) * ending,
    }),
  });
}
