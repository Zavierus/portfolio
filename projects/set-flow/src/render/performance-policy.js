const PRESETS = {
  low: { pixelRatioCap: 1, shadows: false, shadowMapSize: 0, monitorFps: 20, radialSegments: 8, visibleLightCones: "selected" },
  balanced: { pixelRatioCap: 1.5, shadows: true, shadowMapSize: 1024, monitorFps: 30, radialSegments: 14, visibleLightCones: "selected" },
  high: { pixelRatioCap: 2, shadows: true, shadowMapSize: 2048, monitorFps: 30, radialSegments: 20, visibleLightCones: "all" },
};

export function createPerformancePolicy({
  quality = "balanced",
  devicePixelRatio = 1,
  hardwareConcurrency = 8,
  reducedMotion = false,
  assetCount = 0,
} = {}) {
  const preset = PRESETS[quality] || PRESETS.balanced;
  const constrained = Number(hardwareConcurrency || 4) < 4;
  const pixelRatioCap = constrained ? 1 : preset.pixelRatioCap;
  return Object.freeze({
    quality: PRESETS[quality] ? quality : "balanced",
    pixelRatio: Math.min(Math.max(1, Number(devicePixelRatio) || 1), pixelRatioCap),
    shadows: constrained ? false : preset.shadows,
    shadowMapSize: constrained ? 0 : preset.shadowMapSize,
    monitorFps: reducedMotion ? 15 : constrained ? 20 : preset.monitorFps,
    cameraTransitions: !reducedMotion,
    reducedMotion: Boolean(reducedMotion),
    geometryDetection: true,
    assetCountWarning: assetCount > 72,
    recommendedAssetLimit: 72,
    geometry: Object.freeze({
      radialSegments: constrained ? 8 : preset.radialSegments,
      castShadows: constrained ? false : preset.shadows,
      visibleLightCones: preset.visibleLightCones,
    }),
  });
}
