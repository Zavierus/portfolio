import test from "node:test";
import assert from "node:assert/strict";
import { RAIN_LAYER_CONFIG } from "../src/render/weather-system.js";

test("rain uses distinct far, middle, and foreground layers", () => {
  assert.deepEqual(RAIN_LAYER_CONFIG.map((layer) => layer.id), ["far", "middle", "foreground"]);
  assert.equal(new Set(RAIN_LAYER_CONFIG.map((layer) => layer.opacity)).size, 3);
  assert.ok(RAIN_LAYER_CONFIG[0].length[1] < RAIN_LAYER_CONFIG[1].length[1]);
  assert.ok(RAIN_LAYER_CONFIG[1].length[1] < RAIN_LAYER_CONFIG[2].length[1]);
  assert.ok(RAIN_LAYER_CONFIG[0].count > RAIN_LAYER_CONFIG[2].count);
});
