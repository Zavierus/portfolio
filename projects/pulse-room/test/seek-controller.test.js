import assert from "node:assert/strict";
import test from "node:test";

import { createSeekController } from "../src/pulse/seek-controller.js";

class FakeMedia extends EventTarget {
  constructor({ duration = 120, paused = true } = {}) {
    super();
    this.duration = duration;
    this.paused = paused;
    this.ended = false;
    this.readyState = 4;
    this.seeking = false;
    this.playCalls = 0;
    this.pauseCalls = 0;
    this.seekWrites = [];
    this._currentTime = 0;
  }

  get currentTime() {
    return this._currentTime;
  }

  set currentTime(value) {
    this._currentTime = Number(value);
    this.seeking = true;
    this.seekWrites.push(this._currentTime);
  }

  async play() {
    this.playCalls += 1;
    this.paused = false;
    this.dispatchEvent(new Event("play"));
  }

  pause() {
    this.pauseCalls += 1;
    this.paused = true;
    this.dispatchEvent(new Event("pause"));
  }

  settle(name = "seeked") {
    this.seeking = false;
    this.dispatchEvent(new Event(name));
  }
}

function createFakeClock() {
  let time = 0;
  let sequence = 0;
  const timers = new Map();
  const now = () => time;
  now.setTimeout = (callback, delay = 0) => {
    const id = ++sequence;
    timers.set(id, { callback, at: time + Math.max(0, Number(delay) || 0) });
    return id;
  };
  now.clearTimeout = (id) => timers.delete(id);
  now.tick = (milliseconds) => {
    const end = time + milliseconds;
    while (true) {
      const next = [...timers.entries()]
        .filter(([, timer]) => timer.at <= end)
        .sort((a, b) => a[1].at - b[1].at || a[0] - b[0])[0];
      if (!next) break;
      const [id, timer] = next;
      timers.delete(id);
      time = timer.at;
      timer.callback();
    }
    time = end;
  };
  now.pending = () => timers.size;
  return now;
}

function pointerAt(percent) {
  return {
    clientX: percent,
    currentTarget: {
      getBoundingClientRect: () => ({ left: 0, width: 100 }),
    },
  };
}

function rangeAt(value) {
  return {
    currentTarget: {
      value: String(value),
      min: "0",
      max: "1000",
    },
  };
}

function fixture({
  media = new FakeMedia(),
  clock = createFakeClock(),
  source = { serial: 1 },
} = {}) {
  const previews = [];
  const lives = [];
  const commits = [];
  const state = { media };
  const seek = createSeekController({
    getMedia: () => state.media,
    getSourceSerial: () => source.serial,
    renderPreview: (time, duration) => previews.push({ time, duration }),
    renderLive: (time, duration) => lives.push({ time, duration }),
    onCommit: (time) => commits.push(time),
    now: clock,
  });
  return { seek, media, clock, source, state, previews, lives, commits };
}

async function commitAndSettle(context, percent, eventName = "seeked") {
  context.seek.begin(pointerAt(percent));
  const completion = context.seek.commit(pointerAt(percent));
  context.media.settle(eventName);
  assert.equal(await completion, true);
}

test("pointer clicks commit exact 25%, 50%, and 75% targets", async () => {
  for (const percent of [25, 50, 75]) {
    const context = fixture();
    assert.deepEqual(
      Object.keys(context.seek),
      ["begin", "preview", "commit", "cancel", "dispose"],
    );
    await commitAndSettle(context, percent);
    assert.equal(context.media.currentTime, 120 * percent / 100);
    assert.deepEqual(context.commits, [120 * percent / 100]);
    context.seek.dispose();
  }
});

test("drag preview is not overwritten by a live timeupdate", () => {
  const context = fixture();
  context.seek.begin(pointerAt(25));
  context.seek.preview(pointerAt(75));
  context.media._currentTime = 10;
  context.media.dispatchEvent(new Event("timeupdate"));

  assert.equal(context.previews.at(-1).time, 90);
  assert.deepEqual(context.lives, []);
  context.seek.cancel();
  assert.equal(context.lives.at(-1).time, 10);
  context.seek.dispose();
});

test("pointer cancel restores the live display and preserves paused playback", () => {
  const context = fixture();
  context.media._currentTime = 14;
  context.seek.begin(pointerAt(75));
  context.seek.cancel();

  assert.equal(context.media.playCalls, 0);
  assert.equal(context.media.paused, true);
  assert.deepEqual(context.lives.at(-1), { time: 14, duration: 120 });
  context.seek.dispose();
});

test("a paused seek stays paused after settlement", async () => {
  const context = fixture();
  await commitAndSettle(context, 50);

  assert.equal(context.media.playCalls, 0);
  assert.equal(context.media.paused, true);
  context.seek.dispose();
});

test("a playing seek pauses at begin and resumes only after settlement", async () => {
  const media = new FakeMedia({ paused: false });
  const context = fixture({ media });
  context.seek.begin(pointerAt(50));
  const completion = context.seek.commit(pointerAt(50));

  assert.equal(media.pauseCalls, 1);
  assert.equal(media.playCalls, 0);
  media.settle("seeked");
  assert.equal(await completion, true);
  assert.equal(media.playCalls, 1);
  assert.equal(media.paused, false);
  context.seek.dispose();
});

test("seeked, timeupdate, canplay, and loadeddata each settle a reached target", async () => {
  for (const eventName of ["seeked", "timeupdate", "canplay", "loadeddata"]) {
    const context = fixture();
    await commitAndSettle(context, 50, eventName);
    context.seek.dispose();
  }
});

test("an unsettled target is retried exactly once before a later event settles it", async () => {
  const context = fixture();
  context.seek.begin(pointerAt(50));
  const completion = context.seek.commit(pointerAt(50));

  assert.deepEqual(context.media.seekWrites, [60]);
  context.clock.tick(1_799);
  assert.deepEqual(context.media.seekWrites, [60]);
  context.clock.tick(1);
  assert.deepEqual(context.media.seekWrites, [60, 60]);
  context.clock.tick(3_399);
  assert.deepEqual(context.media.seekWrites, [60, 60]);
  context.media.settle("timeupdate");
  assert.equal(await completion, true);
  context.seek.dispose();
});

test("the settlement hold has a 5.2 second hard timeout", async () => {
  const media = new FakeMedia({ paused: false });
  const context = fixture({ media });
  context.seek.begin(pointerAt(50));
  const completion = context.seek.commit(pointerAt(50));
  let result = "pending";
  void completion.then((value) => {
    result = value;
  });

  context.clock.tick(5_199);
  await Promise.resolve();
  assert.equal(result, "pending");
  context.clock.tick(1);
  assert.equal(await completion, false);
  assert.equal(media.playCalls, 0);
  assert.equal(context.clock.pending(), 0);
  context.seek.dispose();
});

test("three rapid seeks resolve stale commits false and settle at the last target", async () => {
  const media = new FakeMedia({ paused: false });
  const context = fixture({ media });
  const completions = [];
  for (const percent of [25, 50, 75]) {
    context.seek.begin(pointerAt(percent));
    completions.push(context.seek.commit(pointerAt(percent)));
  }
  media.settle("seeked");

  assert.deepEqual(await Promise.all(completions), [false, false, true]);
  assert.equal(media.currentTime, 90);
  assert.equal(media.playCalls, 1);
  context.seek.dispose();
});

test("a source serial change invalidates stale completion and prevents resume", async () => {
  const media = new FakeMedia({ paused: false });
  const context = fixture({ media });
  context.seek.begin(pointerAt(50));
  const completion = context.seek.commit(pointerAt(50));
  context.source.serial += 1;
  media.settle("seeked");

  assert.equal(await completion, false);
  assert.equal(media.playCalls, 0);
  assert.deepEqual(context.lives, []);
  context.seek.dispose();
});

test("a replacement media element invalidates the captured seek target", async () => {
  const media = new FakeMedia({ paused: false });
  const context = fixture({ media });
  context.seek.begin(pointerAt(50));
  const completion = context.seek.commit(pointerAt(50));
  context.state.media = new FakeMedia({ paused: true });
  media.settle("seeked");

  assert.equal(await completion, false);
  assert.equal(media.playCalls, 0);
  assert.deepEqual(context.lives, []);
  context.seek.dispose();
});

test("onCommit receives the exact time used by offline section state", async () => {
  const context = fixture();
  context.seek.begin(pointerAt(62.5));
  const completion = context.seek.commit(pointerAt(62.5));
  assert.deepEqual(context.commits, [75]);
  context.media.settle("loadeddata");
  assert.equal(await completion, true);
  context.seek.dispose();
});

test("keyboard range values commit through the same controller", async () => {
  const context = fixture();
  context.seek.begin(rangeAt(500));
  const completion = context.seek.commit(rangeAt(500));
  context.media.settle("canplay");

  assert.equal(await completion, true);
  assert.equal(context.media.currentTime, 60);
  context.seek.dispose();
});
