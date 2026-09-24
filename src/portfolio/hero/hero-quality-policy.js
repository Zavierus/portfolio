export const HERO_QUALITY_PRESETS = Object.freeze({
  high: Object.freeze({ pixelRatioCap: 1.5, shadows: true, bloom: true }),
  low: Object.freeze({ pixelRatioCap: 1, shadows: false, bloom: false }),
});

export function chooseHeroMode({
  webgl = true,
  reducedMotion = false,
  saveData = false,
  desktop = true,
} = {}) {
  if (reducedMotion || saveData || !desktop) return "poster";
  return webgl ? "realtime" : "poster";
}

export class HeroFrameBudget {
  constructor({ slowFrameCount = 90, slowFrameThresholdMs = 26 } = {}) {
    if (!Number.isInteger(slowFrameCount) || slowFrameCount <= 0) {
      throw new TypeError("slowFrameCount must be a positive integer");
    }
    this.slowFrameCount = slowFrameCount;
    this.slowFrameThresholdMs = slowFrameThresholdMs;
    this.level = "high";
    this._slowFrames = 0;
  }

  record(frameTimeMs) {
    if (!Number.isFinite(frameTimeMs) || frameTimeMs <= 0) return null;
    this._slowFrames = frameTimeMs >= this.slowFrameThresholdMs ? this._slowFrames + 1 : 0;
    if (this._slowFrames < this.slowFrameCount) return null;
    this._slowFrames = 0;
    if (this.level === "high") this.level = "low";
    else if (this.level === "low") this.level = "poster";
    else return null;
    return Object.freeze({ level: this.level, reason: "sustained-slow-frames" });
  }
}
