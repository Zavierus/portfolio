export function derivePowerRail(restoredCircuitIds) {
  const restored = new Set(restoredCircuitIds);
  const auxiliaryCount = Number(restored.has("auxiliary-a")) + Number(restored.has("auxiliary-b"));

  return {
    external: restored.has("external-link") ? "live" : "off",
    auxiliary: auxiliaryCount === 2 ? "live" : auxiliaryCount === 1 ? "partial" : "off",
    reactor: restored.has("reactor") ? "live" : "off",
    extraction: restored.has("extraction") ? "live" : "off",
  };
}

