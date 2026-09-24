import assert from "node:assert/strict";
import test from "node:test";

import { LOOK_SETTING_KEY, createLookSettings } from "../src/input/look-settings.js";

function createStorage(initial = {}) {
  const values = new Map(Object.entries(initial));
  return {
    getItem(key) { return values.get(key) ?? null; },
    setItem(key, value) { values.set(key, String(value)); },
  };
}

test("look settings default to medium and persist approved levels", () => {
  const storage = createStorage();
  const settings = createLookSettings({ storage });

  assert.equal(settings.load(), "medium");
  assert.equal(settings.save("low"), "low");
  assert.equal(storage.getItem(LOOK_SETTING_KEY), "low");
  assert.equal(settings.load(), "low");
});

test("look settings reject invalid stored and requested values", () => {
  const storage = createStorage({ [LOOK_SETTING_KEY]: "extreme" });
  const settings = createLookSettings({ storage });

  assert.equal(settings.load(), "medium");
  assert.throws(() => settings.save("extreme"), /Unknown look sensitivity/);
});

test("look settings remain usable when storage access fails", () => {
  const storage = {
    getItem() { throw new Error("blocked"); },
    setItem() { throw new Error("blocked"); },
  };
  const settings = createLookSettings({ storage });

  assert.equal(settings.load(), "medium");
  assert.equal(settings.save("high"), "high");
  assert.equal(settings.load(), "high");
});
