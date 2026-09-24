import { FILM_DURATION } from "../film/film-model.js";

const clamp01 = (value) => Math.min(1, Math.max(0, Number(value) || 0));
const clampTime = (value) => Math.min(FILM_DURATION, Math.max(0, Number(value) || 0));
const smoothstep = (start, end, value) => {
  const amount = clamp01((value - start) / Math.max(0.0001, end - start));
  return amount * amount * (3 - 2 * amount);
};

export function sampleListenerState(time) {
  const filmTime = clampTime(time);
  const arrival = smoothstep(0, 10, filmTime);
  const listening = smoothstep(28, 41, filmTime) * (1 - smoothstep(57, 64, filmTime));
  const recognition = smoothstep(46, 58, filmTime);
  const extinction = smoothstep(63, 76, filmTime);
  const archiveOpen = smoothstep(80, 94, filmTime);
  const narrativeOffset = smoothstep(46, 56, filmTime) * (1 - smoothstep(80, 86, filmTime));
  const coreExposure = Math.max(recognition * 0.3, archiveOpen);

  return Object.freeze({
    time: filmTime,
    position: Object.freeze([
      -2.4 + arrival * 1.6 - narrativeOffset * 3.1 - archiveOpen * 1.55,
      0.35 + Math.sin(filmTime * 0.16) * 0.08 * (1 - archiveOpen),
      1.1 - arrival * 1.3,
    ]),
    rotationY: -0.42 + listening * 0.38 - extinction * 0.16,
    balanceOffset: listening * 0.78 + archiveOpen * 0.22,
    shellSeparation: listening * 0.22 + archiveOpen * 1.35,
    membraneTension: 0.12 + listening * 0.78 + archiveOpen * 0.1,
    scanResponse: smoothstep(10, 22, filmTime) * (1 - smoothstep(61, 68, filmTime)),
    coreExposure,
    archiveOpen,
    signalColor: extinction > 0.45 ? "warning" : archiveOpen > 0.2 ? "memory" : "acid",
  });
}
