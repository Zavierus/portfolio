import test from "node:test";
import assert from "node:assert/strict";
import { derivePowerRail } from "../src/ui/power-rail.js";

test("power rail summarizes circuit progress into four readable stages", () => {
  assert.deepEqual(derivePowerRail(["external-link"]), {
    external: "live",
    auxiliary: "off",
    reactor: "off",
    extraction: "off",
  });
  assert.equal(derivePowerRail(["external-link", "auxiliary-a"]).auxiliary, "partial");
  assert.equal(derivePowerRail(["external-link", "auxiliary-a", "auxiliary-b"]).auxiliary, "live");
  assert.equal(derivePowerRail(["external-link", "auxiliary-a", "auxiliary-b", "reactor"]).reactor, "live");
});
