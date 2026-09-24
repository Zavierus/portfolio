export const WEAPON_PROFILES = Object.freeze({
  fz09: Object.freeze({
    id: "fz09",
    magazineSize: 24,
    reserveSize: 96,
    reloadDuration: 2.1,
    controlledShots: 4,
    baseSpread: 0.0015,
    controlledSpread: 0.004,
    spreadStep: 0.0017,
    maxSpread: 0.016,
  }),
  s2: Object.freeze({
    id: "s2",
    magazineSize: 12,
    reserveSize: 48,
    reloadDuration: 1.65,
    controlledShots: 6,
    baseSpread: 0.001,
    controlledSpread: 0.003,
    spreadStep: 0.0012,
    maxSpread: 0.009,
  }),
});

export function createWeaponState(id, overrides = {}) {
  const profile = WEAPON_PROFILES[id];
  if (!profile) throw new Error(`Unknown weapon profile: ${id}`);

  let rounds = Math.max(0, Math.min(profile.magazineSize, overrides.rounds ?? profile.magazineSize));
  let reserve = Math.max(0, overrides.reserve ?? profile.reserveSize);
  let reloadRemaining = 0;
  let shotIndex = 0;

  const snapshot = () => ({
    id,
    rounds,
    reserve,
    reloading: reloadRemaining > 0,
    reloadRemaining,
    shotIndex,
  });

  return {
    fire() {
      if (reloadRemaining > 0) return { accepted: false, reason: "reloading" };
      if (rounds <= 0) return { accepted: false, reason: "empty" };

      rounds -= 1;
      shotIndex += 1;
      const controlledProgress = Math.min(1, (shotIndex - 1) / Math.max(1, profile.controlledShots - 1));
      const controlled = profile.baseSpread
        + (profile.controlledSpread - profile.baseSpread) * controlledProgress;
      const spread = shotIndex <= profile.controlledShots
        ? controlled
        : Math.min(profile.maxSpread, profile.controlledSpread + (shotIndex - profile.controlledShots) * profile.spreadStep);
      return { accepted: true, rounds, shotIndex, spread };
    },
    beginReload() {
      if (reloadRemaining > 0 || rounds >= profile.magazineSize || reserve <= 0) return false;
      reloadRemaining = profile.reloadDuration;
      return true;
    },
    cancelReload() {
      reloadRemaining = 0;
    },
    update(delta) {
      if (reloadRemaining <= 0 || delta <= 0) return;
      reloadRemaining = Math.max(0, reloadRemaining - delta);
      if (reloadRemaining === 0) {
        const transferred = Math.min(profile.magazineSize - rounds, reserve);
        rounds += transferred;
        reserve -= transferred;
      }
    },
    resetBurst() {
      shotIndex = 0;
    },
    snapshot,
  };
}
