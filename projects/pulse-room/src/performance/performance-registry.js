const TRACK_PERFORMANCE_IDS = Object.freeze({
  "acid-action": "signal-chrysalis",
  cerberus: "triune-gate",
  "beyond-the-stars": "null-cathedral",
  "i-plus-plus": "packet-bloom",
});

const descriptor = (id, label, authored) => Object.freeze({ id, label, authored });

export const PERFORMANCE_DESCRIPTORS = Object.freeze({
  "signal-chrysalis": descriptor("signal-chrysalis", "SIGNAL CHRYSALIS", true),
  "triune-gate": descriptor("triune-gate", "TRIUNE GATE", true),
  "null-cathedral": descriptor("null-cathedral", "NULL CATHEDRAL", true),
  "packet-bloom": descriptor("packet-bloom", "PACKET BLOOM", true),
  "signal-field": descriptor("signal-field", "SIGNAL FIELD", false),
});

export function performanceIdForTrack(track) {
  return TRACK_PERFORMANCE_IDS[track?.id] ?? "signal-field";
}

export function performanceDescriptorForTrack(track) {
  return PERFORMANCE_DESCRIPTORS[performanceIdForTrack(track)];
}

export function createPerformanceModuleLoader(loaders) {
  return async function loadPerformanceModule(track) {
    const descriptorForTrack = performanceDescriptorForTrack(track);
    const load = loaders?.[descriptorForTrack.id];
    if (typeof load !== "function") {
      throw new TypeError(`No performance loader registered for ${descriptorForTrack.id}`);
    }
    return { descriptor: descriptorForTrack, module: await load() };
  };
}
