import test from "node:test";
import assert from "node:assert/strict";
import { BLACKSITE_ENCOUNTERS } from "../src/content/encounters.js";

test("blacksite encounters are finite, uniquely identified, and use readable archetypes", () => {
  const ids = new Set();
  const allowedArchetypes = new Set(["rifleman", "breacher", "heavy"]);

  for (const encounter of BLACKSITE_ENCOUNTERS) {
    assert.equal(ids.has(encounter.id), false, `duplicate encounter ${encounter.id}`);
    ids.add(encounter.id);
    assert.ok(encounter.groups.length > 0);
    assert.equal(encounter.repeat, false);
    for (const group of encounter.groups) {
      assert.ok(group.count > 0);
      assert.ok(allowedArchetypes.has(group.archetype));
      assert.ok(group.routeId);
    }
  }
});
