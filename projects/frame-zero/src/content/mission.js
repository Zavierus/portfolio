export const BLACKSITE_MISSION = Object.freeze({
  id: "blacksite",
  phases: Object.freeze([
    Object.freeze({
      id: "storm-approach",
      objectives: Object.freeze(["reach-entry"]),
      checkpoint: "gantry-entry",
    }),
    Object.freeze({
      id: "red-breach",
      objectives: Object.freeze(["restore-power-a", "restore-power-b"]),
      checkpoint: "auxiliary-power",
    }),
    Object.freeze({
      id: "reactor-white",
      objectives: Object.freeze(["unlock-reactor"]),
      checkpoint: "reactor-control",
    }),
    Object.freeze({
      id: "dawn-extraction",
      objectives: Object.freeze(["survive-final", "extract"]),
      checkpoint: null,
    }),
  ]),
});

