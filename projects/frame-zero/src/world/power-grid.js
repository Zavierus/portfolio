export const POWER_CIRCUITS = Object.freeze([
  Object.freeze({
    id: "external-link",
    initial: true,
    requires: Object.freeze([]),
    effects: Object.freeze({
      lights: Object.freeze(["gantry-marker-lights"]),
      doors: Object.freeze([]),
      routeNodes: Object.freeze(["gantry-center"]),
      encounterId: "gantry-contact",
      checkpointId: null,
    }),
  }),
  Object.freeze({
    id: "auxiliary-a",
    initial: false,
    requires: Object.freeze(["external-link"]),
    effects: Object.freeze({
      lights: Object.freeze(["breach-west-white", "generator-a-practicals"]),
      doors: Object.freeze(["generator-cross-door"]),
      routeNodes: Object.freeze(["breach-generator-floor", "breach-maintenance-loop"]),
      encounterId: "breach-crossfire",
      checkpointId: null,
    }),
  }),
  Object.freeze({
    id: "auxiliary-b",
    initial: false,
    requires: Object.freeze(["auxiliary-a"]),
    effects: Object.freeze({
      lights: Object.freeze(["breach-east-white", "turbine-entry-practicals"]),
      doors: Object.freeze(["turbine-blast-door"]),
      routeNodes: Object.freeze(["breach-live-bus", "reactor-upper-catwalk"]),
      encounterId: "auxiliary-defense",
      checkpointId: "auxiliary-power",
    }),
  }),
  Object.freeze({
    id: "reactor",
    initial: false,
    requires: Object.freeze(["auxiliary-b"]),
    effects: Object.freeze({
      lights: Object.freeze(["turbine-white-sequence", "reactor-core-rim"]),
      doors: Object.freeze(["reactor-control-door", "freight-access-door"]),
      routeNodes: Object.freeze(["reactor-turbine-floor", "reactor-steam-duct"]),
      encounterId: "reactor-lock",
      checkpointId: "reactor-control",
    }),
  }),
  Object.freeze({
    id: "extraction",
    initial: false,
    requires: Object.freeze(["reactor"]),
    effects: Object.freeze({
      lights: Object.freeze(["freight-deck-lights", "extraction-beacon"]),
      doors: Object.freeze(["freight-platform-gate"]),
      routeNodes: Object.freeze(["extraction-control-walkway", "extraction-open-deck"]),
      encounterId: "extraction-hold",
      checkpointId: null,
    }),
  }),
]);

function cloneEffects(effects) {
  return {
    lights: [...effects.lights],
    doors: [...effects.doors],
    routeNodes: [...effects.routeNodes],
    encounterId: effects.encounterId,
    checkpointId: effects.checkpointId,
  };
}

export function createPowerGrid(circuits, publish = () => {}) {
  const ordered = [...circuits];
  const byId = new Map(ordered.map((circuit) => [circuit.id, circuit]));
  if (byId.size !== ordered.length) throw new Error("Power circuit ids must be unique");
  let restored = new Set(ordered.filter((circuit) => circuit.initial).map((circuit) => circuit.id));

  const snapshot = () => ({
    restored: ordered.filter((circuit) => restored.has(circuit.id)).map((circuit) => circuit.id),
  });

  return {
    restore(id) {
      const circuit = byId.get(id);
      if (!circuit) return { accepted: false, reason: "unknown-circuit" };
      if (restored.has(id)) return { accepted: false, reason: "already-restored" };
      const missing = circuit.requires.filter((requiredId) => !restored.has(requiredId));
      if (missing.length > 0) return { accepted: false, reason: "missing-prerequisite", missing };

      restored.add(id);
      const event = { type: "power:restored", circuitId: id, effects: cloneEffects(circuit.effects) };
      publish(event);
      return { accepted: true, event, state: snapshot() };
    },
    restoreSnapshot(saved) {
      const ids = saved?.restored ?? [];
      if (ids.some((id) => !byId.has(id))) throw new Error("Power snapshot contains an unknown circuit");
      restored = new Set(ids);
      return snapshot();
    },
    snapshot,
  };
}

