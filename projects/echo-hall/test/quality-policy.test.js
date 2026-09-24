import assert from "node:assert/strict";
import test from "node:test";
import {
  MIN_UPGRADE_COOLDOWN_MS,
  QUALITY_PRESETS,
  QualityPolicy,
  capPixelRatio,
  selectInitialQuality,
} from "../src/render/quality-policy.js";

test("quality presets progressively cap render cost", () => {
  assert.deepEqual(Object.keys(QUALITY_PRESETS), ["high", "medium", "low"]);
  const high = QUALITY_PRESETS.high;
  const medium = QUALITY_PRESETS.medium;
  const low = QUALITY_PRESETS.low;

  assert.ok(high.pixelRatioCap > medium.pixelRatioCap);
  assert.ok(medium.pixelRatioCap > low.pixelRatioCap);
  assert.ok(high.particleLimit > medium.particleLimit);
  assert.ok(medium.particleLimit > low.particleLimit);
  assert.ok(high.shadowMapSize > medium.shadowMapSize);
  assert.ok(medium.shadowMapSize > low.shadowMapSize);
  assert.ok(high.historyLayers > medium.historyLayers);
  assert.equal(low.historyLayers, 0);
});

test("pixel ratio is finite, positive, and capped by the selected preset", () => {
  assert.equal(capPixelRatio(3, "high"), QUALITY_PRESETS.high.pixelRatioCap);
  assert.equal(capPixelRatio(3, "medium"), QUALITY_PRESETS.medium.pixelRatioCap);
  assert.equal(capPixelRatio(3, "low"), QUALITY_PRESETS.low.pixelRatioCap);
  assert.equal(capPixelRatio(0, "high"), 1);
  assert.equal(capPixelRatio(Number.NaN, "high"), 1);
});

test("capable desktop defaults high while mobile defaults low", () => {
  assert.equal(selectInitialQuality({ mobile: false }), "high");
  assert.equal(selectInitialQuality({ mobile: true }), "low");
  assert.equal(selectInitialQuality({ mobile: false, deviceMemory: 2 }), "low");
  assert.equal(selectInitialQuality({ mobile: false, hardwareConcurrency: 3 }), "low");
});

test("sustained slow frames downgrade one level without reacting to a spike", () => {
  const changes = [];
  const policy = new QualityPolicy({
    initialQuality: "high",
    downgradeFrameCount: 4,
    upgradeFrameCount: 4,
    onChange: (event) => changes.push(event),
  });

  policy.recordFrame(40, 0);
  policy.recordFrame(12, 16);
  assert.equal(policy.level, "high");

  for (let index = 0; index < 4; index += 1) policy.recordFrame(30, 100 + index * 30);
  assert.equal(policy.level, "medium");
  assert.equal(changes.length, 1);
  assert.equal(changes[0].reason, "sustained-slow-frames");
});

test("automatic upgrades respect a cooldown of at least ten seconds", () => {
  assert.ok(MIN_UPGRADE_COOLDOWN_MS >= 10_000);
  assert.throws(
    () => new QualityPolicy({ upgradeCooldownMs: 9_999 }),
    /at least 10000/i,
  );

  const policy = new QualityPolicy({
    initialQuality: "low",
    downgradeFrameCount: 3,
    upgradeFrameCount: 3,
    upgradeCooldownMs: 10_000,
  });
  for (let index = 0; index < 3; index += 1) policy.recordFrame(8, index * 8);
  assert.equal(policy.level, "medium");

  for (let index = 0; index < 20; index += 1) policy.recordFrame(8, 100 + index * 8);
  assert.equal(policy.level, "medium");

  for (let index = 0; index < 3; index += 1) policy.recordFrame(8, 10_100 + index * 8);
  assert.equal(policy.level, "high");
});

test("manual quality changes expose the matching immutable preset", () => {
  const policy = new QualityPolicy({ initialQuality: "high" });
  assert.equal(policy.setLevel("low", "user").level, "low");
  assert.equal(policy.preset, QUALITY_PRESETS.low);
  assert.equal(policy.setLevel("missing"), false);
  assert.equal(policy.level, "low");
});
