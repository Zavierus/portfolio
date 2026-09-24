import { FILM_DURATION } from "../film/film-model.js";

const clamp01 = (value) => Math.min(1, Math.max(0, Number(value) || 0));
const smoothstep = (start, end, value) => {
  const amount = clamp01((value - start) / Math.max(0.0001, end - start));
  return amount * amount * (3 - 2 * amount);
};

export function sampleMemoryState(time) {
  const filmTime = Math.min(FILM_DURATION, Math.max(0, Number(time) || 0));
  let mode = "dormant";
  if (filmTime >= 46 && filmTime < 63) mode = "fragments";
  else if (filmTime >= 63 && filmTime < 80) mode = "dead-earth";
  else if (filmTime >= 80) mode = "body";
  return Object.freeze({
    time: filmTime,
    mode,
    fragmentMix: smoothstep(46, 54, filmTime) * (1 - smoothstep(61, 65, filmTime)),
    earthReveal: smoothstep(63, 72, filmTime) * (1 - smoothstep(79, 83, filmTime)),
    bodyCompletion: smoothstep(81, 94.5, filmTime),
    archiveFlux: smoothstep(80, 88, filmTime),
  });
}
