import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { createPortfolioAdapter } from "../src/pulse/portfolio-adapter.js";

class FakeElement extends EventTarget {
  constructor() {
    super();
    this.dataset = {};
    this.attributes = new Map();
    this.showCalls = 0;
    this.closeCalls = 0;
  }

  showModal() {
    this.showCalls += 1;
  }

  close() {
    this.closeCalls += 1;
  }

  getAttribute(name) {
    return this.attributes.get(name) ?? null;
  }

  setAttribute(name, value) {
    this.attributes.set(name, value);
  }
}

test("portfolio actions open source and navigate back without playback authority", () => {
  const source = new FakeElement();
  const dialog = new FakeElement();
  const back = new FakeElement();
  back.setAttribute("href", "../../index.html");
  const assigned = [];
  const documentRef = {
    getElementById(id) {
      return { "source-license": source, "source-license-dialog": dialog, "portfolio-back": back }[id] ?? null;
    },
  };
  const adapter = createPortfolioAdapter({
    documentRef,
    locationRef: { assign: (url) => assigned.push(url) },
  });

  assert.equal(adapter.openSource(), true);
  assert.equal(dialog.showCalls, 1);
  assert.equal(adapter.back(), true);
  assert.deepEqual(assigned, ["../../index.html"]);
  assert.equal(Object.hasOwn(adapter, "playback"), false);
  adapter.dispose();
});

test("runtime publishes only local adapters and no world program surface", async () => {
  const source = await readFile("projects/pulse-room/src/pulse/runtime-bootstrap.js", "utf8");
  assert.match(source, /catalog/);
  assert.match(source, /localMedia/);
  assert.match(source, /media/);
  assert.match(source, /portfolio/);
  assert.doesNotMatch(source, /createWorldBridge|particlePrograms|PARTICLE_PROGRAMS/);
});
