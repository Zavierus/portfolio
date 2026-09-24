import assert from "node:assert/strict";
import test from "node:test";

import { chooseHeroMode, HeroFrameBudget } from "../src/portfolio/hero/hero-quality-policy.js";

test("capable desktop starts with the realtime hero", () => {
  assert.equal(chooseHeroMode({ webgl: true, reducedMotion: false, saveData: false, desktop: true }), "realtime");
});

test("reduced motion, save data, and compact screens use a stable poster", () => {
  for (const input of [
    { webgl: true, reducedMotion: true, desktop: true },
    { webgl: true, saveData: true, desktop: true },
    { webgl: true, desktop: false },
  ]) assert.equal(chooseHeroMode(input), "poster");
});

test("a capable desktop without WebGL uses the local keyframe", () => {
  assert.equal(chooseHeroMode({ webgl: false, reducedMotion: false, saveData: false, desktop: true }), "poster");
});

test("sustained slow frames step realtime down before requesting fallback", () => {
  const budget = new HeroFrameBudget({ slowFrameCount: 3 });
  assert.equal(budget.record(30), null);
  assert.equal(budget.record(30), null);
  assert.deepEqual(budget.record(30), { level: "low", reason: "sustained-slow-frames" });
  budget.record(35);
  budget.record(35);
  assert.deepEqual(budget.record(35), { level: "poster", reason: "sustained-slow-frames" });
});
