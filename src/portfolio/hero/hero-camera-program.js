const LOOP_DURATION = 22;
const TAU = Math.PI * 2;

const clamp = (value, minimum, maximum) => Math.min(maximum, Math.max(minimum, Number(value) || 0));
const roundVector = (values) => values.map((value) => Math.abs(value) < 1e-12 ? 0 : value);

export function sampleHeroCamera(time, { pointer = [0, 0], scrollProgress = 0 } = {}) {
  const wrappedTime = ((Number(time) || 0) % LOOP_DURATION + LOOP_DURATION) % LOOP_DURATION;
  const loopProgress = wrappedTime / LOOP_DURATION;
  const angle = loopProgress * TAU;
  const pointerX = clamp(pointer[0], -1, 1);
  const pointerY = clamp(pointer[1], -1, 1);
  const exit = clamp(scrollProgress, 0, 1);

  const position = roundVector([
    -1.05 + Math.sin(angle) * 0.86 + pointerX * 0.15,
    -2.05 + Math.sin(angle * 2) * 0.14 + pointerY * 0.09 + exit * 0.7,
    14.2 + Math.cos(angle) * 0.82 - exit * 9.8,
  ]);
  const target = roundVector([
    0.42 + Math.sin(angle) * 0.08 + pointerX * 0.04,
    0.05 + Math.cos(angle) * 0.06 + pointerY * 0.025,
    -3.5 - exit * 3.2,
  ]);

  return Object.freeze({
    shotId: "fracture-orbit",
    position,
    target,
    focalLength: 39 + Math.sin(angle) * 1.4,
    loopProgress,
  });
}

export const HERO_LOOP_DURATION = LOOP_DURATION;
