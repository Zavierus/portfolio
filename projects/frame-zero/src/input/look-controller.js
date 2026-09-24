export const LOOK_LEVELS = Object.freeze({
  low: 0.00055,
  medium: 0.0008,
  high: 0.00115,
});

const clamp = (value, minimum, maximum) => Math.min(maximum, Math.max(minimum, value));
const finite = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;

export function resolveLookSensitivity(level) {
  if (!Object.hasOwn(LOOK_LEVELS, level)) throw new RangeError(`Unknown look sensitivity: ${level}`);
  return LOOK_LEVELS[level];
}

export function createLookController({
  level = "medium",
  warmupMs = 150,
  maxSample = 180,
  pitchLimit = 1.08,
  smoothing = 22,
} = {}) {
  let resolvedLevel = level;
  let sensitivity = resolveLookSensitivity(resolvedLevel);
  let yaw = 0;
  let pitch = 0;
  let pendingYaw = 0;
  let pendingPitch = 0;
  let locked = false;
  let lockedAt = Number.POSITIVE_INFINITY;

  const orientation = () => ({ yaw, pitch });
  const state = () => Object.freeze({ yaw, pitch, level: resolvedLevel, locked });
  const clearPending = () => {
    pendingYaw = 0;
    pendingPitch = 0;
  };

  return {
    lock(now = 0) {
      locked = true;
      lockedAt = finite(now);
      clearPending();
      return state();
    },
    unlock() {
      locked = false;
      lockedAt = Number.POSITIVE_INFINITY;
      clearPending();
      return state();
    },
    ingest({ movementX = 0, movementY = 0, now = 0 } = {}) {
      const timestamp = finite(now);
      if (!locked || timestamp - lockedAt < Math.max(0, finite(warmupMs))) return orientation();
      const maximum = Math.max(1, finite(maxSample, 180));
      const horizontal = clamp(finite(movementX), -maximum, maximum);
      const vertical = clamp(finite(movementY), -maximum, maximum);
      pendingYaw -= horizontal * sensitivity;
      pendingPitch -= vertical * sensitivity;
      return orientation();
    },
    update(deltaSeconds = 1 / 60) {
      if (!locked) return orientation();
      const delta = clamp(finite(deltaSeconds, 1 / 60), 0, 0.05);
      const amount = 1 - Math.exp(-Math.max(1, finite(smoothing, 22)) * delta);
      const yawStep = pendingYaw * amount;
      const pitchStep = pendingPitch * amount;
      pendingYaw -= yawStep;
      pendingPitch -= pitchStep;
      yaw += yawStep;
      const limit = Math.max(0.1, finite(pitchLimit, 1.08));
      const nextPitch = clamp(pitch + pitchStep, -limit, limit);
      if (nextPitch !== pitch + pitchStep) pendingPitch = 0;
      pitch = nextPitch;
      if (Math.abs(pendingYaw) < 1e-7) pendingYaw = 0;
      if (Math.abs(pendingPitch) < 1e-7) pendingPitch = 0;
      return orientation();
    },
    setLevel(nextLevel) {
      sensitivity = resolveLookSensitivity(nextLevel);
      resolvedLevel = nextLevel;
      return state();
    },
    reset(next = {}) {
      yaw = finite(next.yaw);
      const limit = Math.max(0.1, finite(pitchLimit, 1.08));
      pitch = clamp(finite(next.pitch), -limit, limit);
      clearPending();
      return state();
    },
    state,
  };
}
