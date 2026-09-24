export const MIN_UPGRADE_COOLDOWN_MS = 10_000;

export const QUALITY_PRESETS = Object.freeze({
  high: Object.freeze({
    level: "high",
    targetFps: 60,
    pixelRatioCap: 2,
    particleLimit: 1400,
    shadowMapSize: 2048,
    historyLayers: 4,
    postprocessing: true,
  }),
  medium: Object.freeze({
    level: "medium",
    targetFps: 45,
    pixelRatioCap: 1.5,
    particleLimit: 760,
    shadowMapSize: 1024,
    historyLayers: 2,
    postprocessing: true,
  }),
  low: Object.freeze({
    level: "low",
    targetFps: 30,
    pixelRatioCap: 1,
    particleLimit: 280,
    shadowMapSize: 512,
    historyLayers: 0,
    postprocessing: false,
  }),
});

const LEVELS = Object.freeze(Object.keys(QUALITY_PRESETS));

function finitePositive(value, fallback) {
  const numeric = Number(value);
  return Number.isFinite(numeric) && numeric > 0 ? numeric : fallback;
}

function resolveLevel(level) {
  return Object.hasOwn(QUALITY_PRESETS, level) ? level : null;
}

export function getQualityPreset(level) {
  const resolved = resolveLevel(level);
  if (!resolved) throw new RangeError(`Unknown quality level: ${level}`);
  return QUALITY_PRESETS[resolved];
}

export function capPixelRatio(devicePixelRatio, level = "high") {
  const ratio = finitePositive(devicePixelRatio, 1);
  return Math.min(ratio, getQualityPreset(level).pixelRatioCap);
}

export function selectInitialQuality({
  mobile = false,
  deviceMemory = Number.POSITIVE_INFINITY,
  hardwareConcurrency = Number.POSITIVE_INFINITY,
  saveData = false,
} = {}) {
  if (mobile || saveData || deviceMemory < 4 || hardwareConcurrency < 4) return "low";
  if (deviceMemory < 8 || hardwareConcurrency < 8) return "medium";
  return "high";
}

export const resolveInitialQuality = selectInitialQuality;
export const resolvePixelRatio = capPixelRatio;

export class QualityPolicy {
  constructor({
    initialQuality = "high",
    downgradeThresholdMs = 25,
    upgradeThresholdMs = 14,
    downgradeFrameCount = 90,
    upgradeFrameCount = 240,
    upgradeCooldownMs = MIN_UPGRADE_COOLDOWN_MS,
    onChange = () => {},
  } = {}) {
    if (!resolveLevel(initialQuality)) throw new RangeError(`Unknown quality level: ${initialQuality}`);
    if (!Number.isInteger(downgradeFrameCount) || downgradeFrameCount <= 0) {
      throw new TypeError("downgradeFrameCount must be a positive integer");
    }
    if (!Number.isInteger(upgradeFrameCount) || upgradeFrameCount <= 0) {
      throw new TypeError("upgradeFrameCount must be a positive integer");
    }
    if (!Number.isFinite(upgradeCooldownMs) || upgradeCooldownMs < MIN_UPGRADE_COOLDOWN_MS) {
      throw new RangeError(`Automatic quality upgrade cooldown must be at least ${MIN_UPGRADE_COOLDOWN_MS}ms`);
    }
    if (typeof onChange !== "function") throw new TypeError("Quality onChange must be a function");

    this.level = initialQuality;
    this.downgradeThresholdMs = finitePositive(downgradeThresholdMs, 25);
    this.upgradeThresholdMs = finitePositive(upgradeThresholdMs, 14);
    this.downgradeFrameCount = downgradeFrameCount;
    this.upgradeFrameCount = upgradeFrameCount;
    this.upgradeCooldownMs = upgradeCooldownMs;
    this._onChange = onChange;
    this._slowFrames = 0;
    this._fastFrames = 0;
    this._lastAutomaticUpgradeAt = Number.NEGATIVE_INFINITY;
    this._upgradeBlockedUntil = Number.NEGATIVE_INFINITY;
  }

  get preset() {
    return QUALITY_PRESETS[this.level];
  }

  get state() {
    return Object.freeze({ level: this.level, preset: this.preset });
  }

  recordFrame(frameTimeMs, nowMs = Date.now()) {
    const frameTime = Number(frameTimeMs);
    const timestamp = Number(nowMs);
    if (!Number.isFinite(frameTime) || frameTime <= 0 || !Number.isFinite(timestamp)) return false;

    this._slowFrames = frameTime >= this.downgradeThresholdMs ? this._slowFrames + 1 : 0;
    this._fastFrames = frameTime <= this.upgradeThresholdMs ? this._fastFrames + 1 : 0;

    if (this._slowFrames >= this.downgradeFrameCount) {
      const downgraded = this._changeBy(1, "sustained-slow-frames", timestamp);
      if (downgraded) {
        this._upgradeBlockedUntil = timestamp + this.upgradeCooldownMs;
        return downgraded;
      }
      this._slowFrames = 0;
    }

    const upgradeReady = timestamp >= this._upgradeBlockedUntil
      && timestamp - this._lastAutomaticUpgradeAt >= this.upgradeCooldownMs;
    if (this._fastFrames >= this.upgradeFrameCount && upgradeReady) {
      const upgraded = this._changeBy(-1, "sustained-fast-frames", timestamp);
      if (upgraded) {
        this._lastAutomaticUpgradeAt = timestamp;
        return upgraded;
      }
      this._fastFrames = 0;
    }
    return false;
  }

  update(frameTimeMs, nowMs) {
    return this.recordFrame(frameTimeMs, nowMs);
  }

  setLevel(level, reason = "manual") {
    if (!resolveLevel(level) || level === this.level) return false;
    return this._applyLevel(level, reason, null);
  }

  resetSampling() {
    this._slowFrames = 0;
    this._fastFrames = 0;
  }

  _changeBy(offset, reason, timestamp) {
    const index = LEVELS.indexOf(this.level);
    const next = LEVELS[Math.min(LEVELS.length - 1, Math.max(0, index + offset))];
    if (next === this.level) return false;
    return this._applyLevel(next, reason, timestamp);
  }

  _applyLevel(level, reason, timestamp) {
    const previousLevel = this.level;
    this.level = level;
    this.resetSampling();
    const event = Object.freeze({
      level,
      previousLevel,
      reason,
      timestamp,
      preset: this.preset,
    });
    this._onChange(event);
    return event;
  }
}

export function createQualityPolicy(options) {
  return new QualityPolicy(options);
}
