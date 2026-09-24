function copySnapshot(snapshot) {
  return {
    phaseIndex: snapshot.phaseIndex,
    objectiveIndex: snapshot.objectiveIndex,
    phaseId: snapshot.phaseId,
    objectiveId: snapshot.objectiveId,
    completedObjectives: [...snapshot.completedObjectives],
    checkpointId: snapshot.checkpointId,
    complete: snapshot.complete,
  };
}

export function createMissionDirector(config) {
  if (!config?.phases?.length) throw new Error("Mission requires at least one phase");

  let phaseIndex = 0;
  let objectiveIndex = 0;
  let completedObjectives = [];
  let checkpointId = null;
  let complete = false;
  let checkpointSnapshot = null;

  const snapshot = () => {
    const phase = config.phases[phaseIndex] ?? null;
    return {
      phaseIndex,
      objectiveIndex,
      phaseId: phase?.id ?? null,
      objectiveId: complete ? null : phase?.objectives[objectiveIndex] ?? null,
      completedObjectives: [...completedObjectives],
      checkpointId,
      complete,
    };
  };

  return {
    completeObjective(id) {
      if (complete) return { accepted: false, reason: "mission-complete", state: snapshot() };
      const phase = config.phases[phaseIndex];
      const expected = phase.objectives[objectiveIndex];
      if (id !== expected) return { accepted: false, reason: "out-of-order", expected, state: snapshot() };

      completedObjectives.push(id);
      objectiveIndex += 1;
      let checkpointReached = null;

      if (objectiveIndex >= phase.objectives.length) {
        checkpointReached = phase.checkpoint;
        phaseIndex += 1;
        objectiveIndex = 0;
        if (phaseIndex >= config.phases.length) {
          complete = true;
          phaseIndex = config.phases.length - 1;
          objectiveIndex = config.phases[phaseIndex].objectives.length;
        }

        if (checkpointReached) {
          checkpointId = checkpointReached;
          checkpointSnapshot = copySnapshot(snapshot());
        }
      }

      return { accepted: true, checkpointReached, state: snapshot() };
    },
    restartFromCheckpoint() {
      if (!checkpointSnapshot) return snapshot();
      phaseIndex = checkpointSnapshot.phaseIndex;
      objectiveIndex = checkpointSnapshot.objectiveIndex;
      completedObjectives = [...checkpointSnapshot.completedObjectives];
      checkpointId = checkpointSnapshot.checkpointId;
      complete = checkpointSnapshot.complete;
      return snapshot();
    },
    snapshot,
  };
}
