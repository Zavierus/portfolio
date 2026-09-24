import assert from "node:assert/strict";
import test from "node:test";
import { FilmDirector } from "../src/film/film-director.js";
import { CHAPTERS, FILM_DURATION } from "../src/film/film-model.js";

function createDirector() {
  const events = [];
  const director = new FilmDirector({
    duration: FILM_DURATION,
    chapters: CHAPTERS,
    onEvent: (event) => events.push(event),
  });
  return { director, events };
}

test("film model defines the fixed 95-second Listener timeline", () => {
  assert.equal(FILM_DURATION, 95);
  assert.deepEqual(CHAPTERS, [
    { id: "greeting", label: "问候", start: 0, end: 12 },
    { id: "misread-scale", label: "尺度误读", start: 12, end: 28 },
    { id: "wake", label: "苏醒", start: 28, end: 46 },
    { id: "recognition", label: "辨认", start: 46, end: 63 },
    { id: "extinction", label: "灭绝", start: 63, end: 80 },
    { id: "reconstruction", label: "重建", start: 80, end: 95 },
  ]);
});

test("director starts at the opening frame in a paused state", () => {
  const { director, events } = createDirector();

  assert.deepEqual(director.getState(), {
    time: 0,
    playing: false,
    chapterId: "greeting",
    completed: false,
  });
  assert.deepEqual(events, []);
});

test("play and pause are idempotent and emit state events", () => {
  const { director, events } = createDirector();

  assert.equal(director.play(), true);
  assert.equal(director.play(), false);
  assert.equal(director.pause(), true);
  assert.equal(director.pause(), false);

  assert.equal(director.getState().playing, false);
  assert.deepEqual(events.map(({ type }) => type), ["play", "pause"]);
});

test("tick advances only while playing", () => {
  const { director } = createDirector();

  director.tick(4);
  assert.equal(director.getState().time, 0);

  director.play();
  director.tick(4.25);
  director.pause();
  director.tick(3);
  assert.equal(director.getState().time, 4.25);
});

test("seek clamps to the film range and resolves the active chapter", () => {
  const { director, events } = createDirector();

  director.seek(-2);
  assert.equal(director.getState().time, 0);
  director.seek(100);
  assert.deepEqual(director.getState(), {
    time: 95,
    playing: false,
    chapterId: "reconstruction",
    completed: true,
  });
  assert.deepEqual(events.map(({ type }) => type), [
    "seek",
    "seek",
    "chapterchange",
  ]);
});

test("tick emits one chapter change for each crossed boundary", () => {
  const { director, events } = createDirector();

  director.play();
  director.tick(12);
  director.tick(16);
  director.tick(18);
  director.tick(17);
  director.tick(17);

  const changes = events.filter(({ type }) => type === "chapterchange");
  assert.deepEqual(changes.map(({ chapterId }) => chapterId), [
    "misread-scale",
    "wake",
    "recognition",
    "extinction",
    "reconstruction",
  ]);
});

test("visibility pause is explicit and leaves an already paused director unchanged", () => {
  const { director, events } = createDirector();

  director.play();
  assert.equal(director.setVisibility(false), true);
  assert.equal(director.getState().playing, false);
  assert.equal(director.setVisibility(false), false);
  assert.deepEqual(events.map(({ type, reason }) => [type, reason]), [
    ["play", undefined],
    ["pause", "visibility"],
  ]);
});

test("tick finishes once instead of looping", () => {
  const { director, events } = createDirector();

  director.play();
  director.tick(96);

  const state = director.getState();
  assert.deepEqual(state, { time: 95, playing: false, chapterId: "reconstruction", completed: true });
  assert.equal(events.filter(({ type }) => type === "finish").length, 1);
  director.tick(2);
  assert.equal(events.filter(({ type }) => type === "finish").length, 1);
});

test("replay resets completion and begins at the opening frame", () => {
  const { director } = createDirector();
  director.play();
  director.tick(95);
  director.replay();
  assert.deepEqual(director.state, { time: 0, playing: true, chapterId: "greeting", completed: false });
});
