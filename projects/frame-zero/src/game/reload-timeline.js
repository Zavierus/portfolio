export const RELOAD_DURATION = 1.34;

const clamp01 = (value) => Math.min(1, Math.max(0, value));
const smoothstep = (value) => {
  const t = clamp01(value);
  return t * t * (3 - 2 * t);
};

function segment(progress, start, end) {
  return smoothstep((progress - start) / (end - start));
}

export function sampleReloadTimeline(elapsed, duration = RELOAD_DURATION) {
  const progress = clamp01(duration > 0 ? elapsed / duration : 1);
  const tiltIn = segment(progress, 0, 0.13);
  const settle = segment(progress, 0.84, 1);
  const pose = tiltIn * (1 - settle);
  const magazineOut = segment(progress, 0.14, 0.31);
  const magazineIn = segment(progress, 0.36, 0.66);
  const rackBack = segment(progress, 0.68, 0.76);
  const rackForward = segment(progress, 0.76, 0.84);

  let phase = "ready";
  if (progress < 0.14) phase = "tilt";
  else if (progress < 0.36) phase = "eject";
  else if (progress < 0.68) phase = "insert";
  else if (progress < 0.84) phase = "rack";
  else if (progress < 1) phase = "settle";
  else phase = "complete";

  return {
    progress,
    phase,
    complete: progress >= 1,
    weaponTilt: pose,
    weaponLower: pose * 0.11,
    magazineOut,
    magazineIn,
    oldMagazineVisible: progress < 0.38,
    newMagazineVisible: progress >= 0.31 && progress < 0.72,
    supportHandVisible: progress >= 0.08 && progress < 0.9,
    supportHandReach: segment(progress, 0.08, 0.27) * (1 - segment(progress, 0.71, 0.9)),
    slideOffset: 0.095 * rackBack * (1 - rackForward),
  };
}

export function crossedReloadCue(previousElapsed, elapsed, cueProgress, duration = RELOAD_DURATION) {
  const cueTime = cueProgress * duration;
  return previousElapsed < cueTime && elapsed >= cueTime;
}
