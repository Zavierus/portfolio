import test from "node:test";
import assert from "node:assert/strict";
import { BLACKSITE_ZONES } from "../src/world/blacksite-layout.js";
import { POWER_CIRCUITS, createPowerGrid } from "../src/world/power-grid.js";

test("every blacksite combat zone has two routes, a shortcut, and an interaction", () => {
  assert.equal(BLACKSITE_ZONES.length, 4);
  for (const zone of BLACKSITE_ZONES) {
    assert.ok(zone.routes.length >= 2, `${zone.id} needs two authored routes`);
    assert.ok(zone.routes.some((route) => route.risk === "high"), `${zone.id} needs a risky shortcut`);
    assert.ok(zone.interactionId, `${zone.id} needs an environmental interaction`);
    assert.ok(zone.routes.every((route) => route.reachesExit), `${zone.id} routes must reach the exit`);
  }
});

test("power circuits enforce prerequisites and apply effects once", () => {
  const events = [];
  const power = createPowerGrid(POWER_CIRCUITS, (event) => events.push(event));

  assert.equal(power.restore("auxiliary-b").accepted, false);
  assert.equal(power.restore("auxiliary-a").accepted, true);
  assert.equal(power.restore("auxiliary-a").accepted, false);
  assert.equal(power.restore("auxiliary-b").accepted, true);
  assert.equal(power.restore("reactor").accepted, true);

  assert.deepEqual(power.snapshot().restored, ["external-link", "auxiliary-a", "auxiliary-b", "reactor"]);
  assert.equal(events.filter((event) => event.circuitId === "auxiliary-a").length, 1);
  assert.ok(events.every((event) => event.effects.lights.length > 0));
});

test("power snapshot can be restored at a checkpoint without replaying events", () => {
  const events = [];
  const power = createPowerGrid(POWER_CIRCUITS, (event) => events.push(event));
  power.restore("auxiliary-a");
  const checkpoint = power.snapshot();
  power.restore("auxiliary-b");

  power.restoreSnapshot(checkpoint);
  assert.deepEqual(power.snapshot(), checkpoint);
  assert.equal(events.length, 2);
});

