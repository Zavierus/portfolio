const clamp = (value, minimum, maximum) => Math.min(maximum, Math.max(minimum, value));

export function selectRenderQuality({
  devicePixelRatio = 1,
  isCoarse = false,
  hardwareConcurrency = 8,
  deviceMemory = 8,
} = {}) {
  const constrained = isCoarse || hardwareConcurrency <= 4 || deviceMemory <= 4;
  const qualityCap = constrained ? 1 : 1.35;
  const minimumCap = constrained ? 0.72 : 0.9;
  const maximumPixelRatio = Math.max(minimumCap, Math.min(devicePixelRatio, qualityCap));
  const minimumPixelRatio = Math.min(minimumCap, maximumPixelRatio);
  return {
    constrained,
    initialPixelRatio: clamp(devicePixelRatio, minimumPixelRatio, maximumPixelRatio),
    minimumPixelRatio,
    maximumPixelRatio,
  };
}

export function createAdaptiveResolution({
  initialPixelRatio,
  minimumPixelRatio,
  maximumPixelRatio,
  sampleWindow = 2,
  onChange = () => {},
}) {
  let pixelRatio = initialPixelRatio;
  let elapsed = 0;
  let frames = 0;
  let healthyWindows = 0;

  return {
    sample(delta) {
      if (!Number.isFinite(delta) || delta <= 0 || delta > 0.25) return null;
      elapsed += delta;
      frames += 1;
      if (elapsed < sampleWindow) return null;

      const fps = frames / elapsed;
      let nextPixelRatio = pixelRatio;
      if (fps < 48) {
        nextPixelRatio -= 0.1;
        healthyWindows = 0;
      } else if (fps < 55) {
        nextPixelRatio -= 0.05;
        healthyWindows = 0;
      } else if (fps >= 58.5) {
        healthyWindows += 1;
        if (healthyWindows >= 3) {
          nextPixelRatio += 0.05;
          healthyWindows = 0;
        }
      } else {
        healthyWindows = 0;
      }

      nextPixelRatio = Math.round(clamp(nextPixelRatio, minimumPixelRatio, maximumPixelRatio) * 100) / 100;
      const changed = nextPixelRatio !== pixelRatio;
      pixelRatio = nextPixelRatio;
      elapsed = 0;
      frames = 0;
      if (changed) onChange(pixelRatio, fps);
      return { fps, pixelRatio, changed };
    },
    pixelRatio() {
      return pixelRatio;
    },
  };
}
