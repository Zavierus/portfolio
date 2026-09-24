const HIT_MULTIPLIERS = Object.freeze({
  head: 2.5,
  torso: 1,
  limb: 0.65,
});

const SURFACE_MULTIPLIERS = Object.freeze({
  body: 1,
  glass: 0.72,
  solid: 0,
});

export function resolveDamage({ baseDamage, zone = "torso", surface = "body" }) {
  const hitMultiplier = HIT_MULTIPLIERS[zone] ?? HIT_MULTIPLIERS.torso;
  const surfaceMultiplier = SURFACE_MULTIPLIERS[surface] ?? 0;
  const blocked = surfaceMultiplier === 0;

  return {
    blocked,
    penetrated: surface === "glass",
    damage: blocked ? 0 : baseDamage * hitMultiplier * surfaceMultiplier,
    zone,
    surface,
  };
}

export function applyArmorImpact(armorCells, impact = "normal") {
  const loss = impact === "heavy" ? 2 : 1;
  return Math.max(0, armorCells - loss);
}

