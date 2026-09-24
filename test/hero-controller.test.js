import assert from "node:assert/strict";
import test from "node:test";

import { HeroController } from "../src/portfolio/hero/hero-controller.js";

test("hero renders only while visible and disposes once", () => {
  const calls = [];
  const scene = {
    render: (frame) => calls.push(["render", frame]),
    resize: () => calls.push(["resize"]),
    setQuality: (level) => calls.push(["quality", level]),
    dispose: () => calls.push(["dispose"]),
  };
  const hero = new HeroController({
    scene,
    requestFrame: () => 7,
    cancelFrame: (id) => calls.push(["cancel", id]),
  });
  hero.start();
  hero.setVisible(false);
  hero.dispose();
  hero.dispose();
  assert.equal(calls.filter(([type]) => type === "dispose").length, 1);
  assert.ok(calls.some(([type, id]) => type === "cancel" && id === 7));
});

test("pointer and scroll inputs are bounded before rendering", () => {
  let scheduled;
  let frame;
  const hero = new HeroController({
    scene: {
      render: (value) => { frame = value; },
      resize() {}, setQuality() {}, dispose() {},
    },
    requestFrame: (callback) => { scheduled = callback; return 4; },
    cancelFrame() {},
  });
  hero.setPointer(8, -9);
  hero.setScrollProgress(4);
  hero.start();
  scheduled(100);
  assert.deepEqual(frame.pointer, [1, -1]);
  assert.equal(frame.scrollProgress, 1);
  hero.dispose();
});
