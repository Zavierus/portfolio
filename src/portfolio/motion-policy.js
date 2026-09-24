const MIN_DEVICE_MEMORY_GB = 4;
const MIN_HARDWARE_CONCURRENCY = 4;

function hasLimitedHardware(value, minimum) {
  return Number.isFinite(value) && value < minimum;
}

export function evaluateMotionPolicy({
  reducedMotion = false,
  saveData = false,
  deviceMemory,
  hardwareConcurrency,
  desktop = true,
} = {}) {
  let reason = null;

  if (reducedMotion) reason = "reduced-motion";
  else if (saveData) reason = "save-data";
  else if (hasLimitedHardware(deviceMemory, MIN_DEVICE_MEMORY_GB)) reason = "low-memory";
  else if (hasLimitedHardware(hardwareConcurrency, MIN_HARDWARE_CONCURRENCY)) reason = "low-concurrency";
  else if (!desktop) reason = "compact-viewport";

  const enabled = reason === null;
  return {
    enabled,
    reason,
    effects: {
      hero: enabled,
      realtimeHero: enabled,
      projectMedia: enabled,
    },
  };
}

export function readMotionSignals({ windowRef = window, navigatorRef = windowRef.navigator } = {}) {
  const reducedMotion = windowRef.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
  const desktopQuery = windowRef.matchMedia?.("(min-width: 901px) and (hover: hover) and (pointer: fine)");

  return {
    reducedMotion,
    saveData: navigatorRef.connection?.saveData === true,
    deviceMemory: navigatorRef.deviceMemory,
    hardwareConcurrency: navigatorRef.hardwareConcurrency,
    desktop: desktopQuery ? desktopQuery.matches : windowRef.innerWidth > 900,
  };
}

export function getMotionPolicy(environment) {
  return evaluateMotionPolicy(readMotionSignals(environment));
}
