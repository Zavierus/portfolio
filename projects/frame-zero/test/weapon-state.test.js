import test from "node:test";
import assert from "node:assert/strict";
import { WEAPON_PROFILES, createWeaponState } from "../src/game/weapon-state.js";
import { applyArmorImpact, resolveDamage } from "../src/game/damage-model.js";

test("weapon profiles expose the approved magazine capacities", () => {
  assert.equal(WEAPON_PROFILES.fz09.magazineSize, 24);
  assert.equal(WEAPON_PROFILES.s2.magazineSize, 12);
});

test("weapon cannot fire during reload and completes with elapsed real time", () => {
  const weapon = createWeaponState("fz09", { rounds: 3, reserve: 24 });
  assert.equal(weapon.beginReload(), true);
  assert.equal(weapon.fire().accepted, false);

  weapon.update(WEAPON_PROFILES.fz09.reloadDuration - 0.01);
  assert.equal(weapon.snapshot().rounds, 3);
  weapon.update(0.02);
  assert.equal(weapon.snapshot().rounds, 24);
  assert.equal(weapon.snapshot().reserve, 3);
});

test("first four FZ-09 shots remain in the controlled recoil band", () => {
  const weapon = createWeaponState("fz09");
  const spreads = Array.from({ length: 6 }, () => weapon.fire().spread);

  assert.ok(spreads.slice(0, 4).every((spread) => spread <= WEAPON_PROFILES.fz09.controlledSpread));
  assert.ok(spreads[5] > WEAPON_PROFILES.fz09.controlledSpread);
});

test("damage model distinguishes hit zones and materials", () => {
  const head = resolveDamage({ baseDamage: 40, zone: "head", surface: "body" });
  const torso = resolveDamage({ baseDamage: 40, zone: "torso", surface: "body" });
  const limb = resolveDamage({ baseDamage: 40, zone: "limb", surface: "body" });
  const glass = resolveDamage({ baseDamage: 40, zone: "torso", surface: "glass" });
  const wall = resolveDamage({ baseDamage: 40, zone: "torso", surface: "solid" });

  assert.ok(head.damage > torso.damage);
  assert.ok(torso.damage > limb.damage);
  assert.ok(glass.damage < torso.damage);
  assert.equal(glass.penetrated, true);
  assert.equal(wall.damage, 0);
  assert.equal(wall.blocked, true);
});

test("normal and heavy impacts consume the correct armor cells", () => {
  assert.equal(applyArmorImpact(3, "normal"), 2);
  assert.equal(applyArmorImpact(3, "heavy"), 1);
  assert.equal(applyArmorImpact(1, "heavy"), 0);
});
