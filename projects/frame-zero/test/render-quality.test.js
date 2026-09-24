import test from "node:test";
import assert from "node:assert/strict";
import { createAdaptiveResolution, selectRenderQuality } from "../src/render/render-quality.js";

test("desktop quality caps high-density rendering before bloom", () => {
  const quality = selectRenderQuality({ devicePixelRatio: 2, hardwareConcurrency: 12, deviceMemory: 16 });
  assert.equal(quality.initialPixelRatio, 1.35);
  assert.equal(quality.minimumPixelRatio, 0.9);
  assert.equal(quality.constrained, false);
});

test("coarse and constrained devices start at a lighter render scale", () => {
  assert.equal(selectRenderQuality({ devicePixelRatio: 3, isCoarse: true }).initialPixelRatio, 1);
  assert.equal(selectRenderQuality({ devicePixelRatio: 2, hardwareConcurrency: 4 }).initialPixelRatio, 1);
  assert.equal(selectRenderQuality({ devicePixelRatio: 1 }).maximumPixelRatio, 1);
});

test("adaptive resolution lowers scale after a sustained slow window", () => {
  const changes = [];
  const controller = createAdaptiveResolution({
    initialPixelRatio: 1.35,
    minimumPixelRatio: 0.9,
    maximumPixelRatio: 1.35,
    sampleWindow: 1,
    onChange: (pixelRatio) => changes.push(pixelRatio),
  });
  for (let index = 0; index < 40; index += 1) controller.sample(1 / 40);
  assert.deepEqual(changes, [1.25]);
  assert.equal(controller.pixelRatio(), 1.25);
});

test("adaptive resolution ignores background-tab sized frame gaps", () => {
  const changes = [];
  const controller = createAdaptiveResolution({
    initialPixelRatio: 1.2,
    minimumPixelRatio: 0.9,
    maximumPixelRatio: 1.35,
    sampleWindow: 1,
    onChange: (pixelRatio) => changes.push(pixelRatio),
  });
  for (let index = 0; index < 10; index += 1) controller.sample(1);
  assert.deepEqual(changes, []);
});
