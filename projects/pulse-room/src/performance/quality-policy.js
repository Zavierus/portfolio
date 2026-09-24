function musicSpaceTier({ haze, ribbons, flow, glints }) {
  return Object.freeze({ haze, ribbons, flow, glints, total: haze + ribbons + flow + glints });
}

export const PARTICLE_TIERS = Object.freeze({
  high: musicSpaceTier({
    haze: 4800,
    ribbons: 11520,
    flow: 9600,
    glints: 256,
  }),
  balanced: musicSpaceTier({
    haze: 3000,
    ribbons: 7680,
    flow: 5600,
    glints: 160,
  }),
  mobile: musicSpaceTier({
    haze: 1800,
    ribbons: 3840,
    flow: 2800,
    glints: 96,
  }),
});

const HIGH_PRESET = Object.freeze({
  id: "high",
  lod: "high",
  pixelRatioCap: 1.6,
  shadows: true,
  bloom: true,
  depthOfField: false,
  space: PARTICLE_TIERS.high,
  particleBudget: PARTICLE_TIERS.high.total,
});

const BALANCED_PRESET = Object.freeze({
  id: "balanced",
  lod: "balanced",
  pixelRatioCap: 1.25,
  shadows: false,
  bloom: true,
  depthOfField: false,
  space: PARTICLE_TIERS.balanced,
  particleBudget: PARTICLE_TIERS.balanced.total,
});

const MOBILE_PRESET = Object.freeze({
  id: "mobile",
  lod: "low",
  pixelRatioCap: 1,
  shadows: false,
  bloom: false,
  depthOfField: false,
  space: PARTICLE_TIERS.mobile,
  particleBudget: PARTICLE_TIERS.mobile.total,
});

function positiveFinite(value, fallback = 1) {
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

export function resolvePerformanceQuality(environment = {}) {
  const constrained = Boolean(
    environment.isCoarse
    || environment.saveData
    || positiveFinite(environment.deviceMemory, 8) < 6
    || positiveFinite(environment.hardwareConcurrency, 8) < 6
  );
  const balanced = !constrained && (
    positiveFinite(environment.deviceMemory, 8) < 12
    && positiveFinite(environment.hardwareConcurrency, 8) < 8
  );
  const preset = constrained ? MOBILE_PRESET : balanced ? BALANCED_PRESET : HIGH_PRESET;
  const devicePixelRatio = positiveFinite(environment.devicePixelRatio, 1);
  const reducedMotion = Boolean(environment.reducedMotion);

  return Object.freeze({
    ...preset,
    pixelRatio: Math.min(devicePixelRatio, preset.pixelRatioCap),
    idleMotion: true,
    cameraTravel: !reducedMotion,
    impactShake: !reducedMotion,
    reducedMotion,
  });
}

export function particleTierSnapshot(tierId) {
  return PARTICLE_TIERS[tierId] ?? PARTICLE_TIERS.high;
}

export function detectPerformanceEnvironment({ windowRef = globalThis.window, navigatorRef = globalThis.navigator } = {}) {
  const compactViewport = Number.isFinite(Number(windowRef?.innerWidth))
    && Number(windowRef.innerWidth) <= 600;
  return Object.freeze({
    devicePixelRatio: windowRef?.devicePixelRatio,
    isCoarse: Boolean(
      windowRef?.matchMedia?.("(pointer: coarse)")?.matches
      || compactViewport
    ),
    reducedMotion: windowRef?.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false,
    saveData: navigatorRef?.connection?.saveData ?? false,
    deviceMemory: navigatorRef?.deviceMemory,
    hardwareConcurrency: navigatorRef?.hardwareConcurrency,
  });
}
