import { FILM_DURATION } from "../film/film-model.js";

const clamp01 = (value) => Math.min(1, Math.max(0, Number(value) || 0));
const smoothstep = (start, end, value) => {
  const amount = clamp01((value - start) / Math.max(0.0001, end - start));
  return amount * amount * (3 - 2 * amount);
};

export function sampleMegastructureState(time) {
  const filmTime = Math.min(FILM_DURATION, Math.max(0, Number(time) || 0));
  const reveal = smoothstep(12, 27, filmTime);
  const fold = smoothstep(28, 43, filmTime);
  const awake = fold * (1 - smoothstep(42, 52, filmTime));
  const reconstruction = smoothstep(80, 93, filmTime);
  return Object.freeze({
    time: filmTime,
    classification: filmTime < 12 ? "void" : filmTime < 28 ? "surface" : "awake",
    reveal,
    fold,
    membranePulse: awake * (0.72 + Math.sin(filmTime * 0.7) * 0.12),
    aperture: fold * 0.82 + smoothstep(80, 91, filmTime) * 0.18,
    reconstruction,
    scanDepth: smoothstep(14, 24, filmTime) * (1 - smoothstep(45, 51, filmTime)),
  });
}
