import test from "node:test";
import assert from "node:assert/strict";
import { BLACKSITE_MISSION } from "../src/content/mission.js";
import { createMissionDirector } from "../src/game/mission-director.js";

test("blacksite campaign contains four phases and three checkpoints", () => {
  assert.deepEqual(
    BLACKSITE_MISSION.phases.map((phase) => phase.id),
    ["storm-approach", "red-breach", "reactor-white", "dawn-extraction"],
  );
  assert.equal(BLACKSITE_MISSION.phases.filter((phase) => phase.checkpoint).length, 3);
});

test("mission objectives cannot be completed out of order", () => {
  const mission = createMissionDirector(BLACKSITE_MISSION);

  assert.equal(mission.completeObjective("restore-power-a").accepted, false);
  assert.equal(mission.completeObjective("reach-entry").accepted, true);
  assert.equal(mission.snapshot().phaseId, "red-breach");
  assert.equal(mission.completeObjective("restore-power-b").accepted, false);
  assert.equal(mission.completeObjective("restore-power-a").accepted, true);
  assert.equal(mission.completeObjective("restore-power-b").accepted, true);
  assert.equal(mission.snapshot().phaseId, "reactor-white");
});

test("restart restores the latest checkpoint snapshot", () => {
  const mission = createMissionDirector(BLACKSITE_MISSION);
  mission.completeObjective("reach-entry");
  mission.completeObjective("restore-power-a");
  mission.completeObjective("restore-power-b");
  mission.completeObjective("unlock-reactor");
  mission.completeObjective("survive-final");

  assert.equal(mission.snapshot().phaseId, "dawn-extraction");
  const restored = mission.restartFromCheckpoint();
  assert.equal(restored.phaseId, "dawn-extraction");
  assert.deepEqual(restored.completedObjectives, [
    "reach-entry",
    "restore-power-a",
    "restore-power-b",
    "unlock-reactor",
  ]);
});

test("checkpoint restoration uses saved position when objective ids repeat", () => {
  const mission = createMissionDirector({
    phases: [
      { id: "one", objectives: ["secure"], checkpoint: "one-complete" },
      { id: "two", objectives: ["secure", "leave"], checkpoint: null },
    ],
  });

  mission.completeObjective("secure");
  mission.completeObjective("secure");
  assert.equal(mission.snapshot().objectiveId, "leave");

  const restored = mission.restartFromCheckpoint();
  assert.equal(restored.phaseId, "two");
  assert.equal(restored.objectiveId, "secure");
});
