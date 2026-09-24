const RESTORE_VALUES = Object.freeze({
  kill: 25,
  headshot: 10,
  evade: 8,
  objective: 80,
});

function requirePositiveFinite(name, value) {
  if (!Number.isFinite(value) || value <= 0) {
    throw new RangeError(`${name} must be a positive finite number`);
  }
}

function requireScale(name, value) {
  if (!Number.isFinite(value) || value < 0 || value > 1) {
    throw new RangeError(`${name} must be between 0 and 1`);
  }
}

export function createTimeSystem({
  maxEnergy = 200,
  initialEnergy = maxEnergy,
  fractureDuration = 2.5,
  drainPerSecond = 40,
  worldScale = 0.28,
  playerScale = 0.72,
} = {}) {
  requirePositiveFinite("maxEnergy", maxEnergy);
  requirePositiveFinite("fractureDuration", fractureDuration);
  requirePositiveFinite("drainPerSecond", drainPerSecond);
  requireScale("worldScale", worldScale);
  requireScale("playerScale", playerScale);
  if (!Number.isFinite(initialEnergy)) throw new RangeError("initialEnergy must be finite");

  let energy = Math.min(maxEnergy, Math.max(0, initialEnergy));
  let remaining = 0;
  let active = false;
  let paused = false;

  const snapshot = () => ({
    active,
    paused,
    energy,
    maxEnergy,
    remaining,
    worldScale: active ? worldScale : 1,
    playerScale: active ? playerScale : 1,
  });

  return {
    beginFracture() {
      if (paused || active || energy <= 0) return false;
      active = true;
      remaining = Math.min(fractureDuration, energy / drainPerSecond);
      return true;
    },
    stopFracture() {
      active = false;
      remaining = 0;
    },
    update(delta) {
      if (paused || delta <= 0) {
        return { realDelta: 0, worldDelta: 0, playerDelta: 0 };
      }

      let fracturedDelta = 0;
      if (active) {
        fracturedDelta = Math.min(delta, remaining, energy / drainPerSecond);
        energy = Math.max(0, energy - fracturedDelta * drainPerSecond);
        remaining = Math.max(0, remaining - fracturedDelta);
        if (remaining <= 1e-8 || energy <= 1e-8) {
          active = false;
          remaining = 0;
        }
      }

      const normalDelta = delta - fracturedDelta;
      return {
        realDelta: delta,
        worldDelta: fracturedDelta * worldScale + normalDelta,
        playerDelta: fracturedDelta * playerScale + normalDelta,
      };
    },
    restore(reason) {
      const amount = RESTORE_VALUES[reason] ?? 0;
      energy = Math.min(maxEnergy, energy + amount);
      return energy;
    },
    setPaused(value) {
      paused = Boolean(value);
    },
    snapshot,
  };
}
