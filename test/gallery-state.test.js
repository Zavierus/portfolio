import assert from "node:assert/strict";
import test from "node:test";

import {
  createGalleryState,
  galleryReducer,
} from "../src/portfolio/gallery/gallery-state.js";

const items = [
  { id: "p-01", title: "First" },
  { id: "p-02", title: "Second" },
  { id: "p-03", title: "Third" },
];

test("creates a closed gallery with the first item selected", () => {
  const state = createGalleryState(items);

  assert.deepEqual(state, {
    items,
    selectedIndex: 0,
    viewerOpen: false,
    returnFocusId: null,
  });
});

test("selects an item by ID without mutating the prior state", () => {
  const initial = createGalleryState(items);
  const selected = galleryReducer(initial, { type: "SELECT", id: "p-02" });

  assert.equal(selected.selectedIndex, 1);
  assert.equal(initial.selectedIndex, 0);
  assert.equal(selected.items, initial.items);
});

test("opens the viewer and captures the selected thumbnail for focus return", () => {
  const selected = galleryReducer(createGalleryState(items), {
    type: "SELECT",
    id: "p-02",
  });
  const opened = galleryReducer(selected, { type: "OPEN" });

  assert.equal(opened.viewerOpen, true);
  assert.equal(opened.selectedIndex, 1);
  assert.equal(opened.returnFocusId, "p-02");
});

test("can select by ID while opening and ignores an unknown open ID", () => {
  const initial = createGalleryState(items);
  const opened = galleryReducer(initial, { type: "OPEN", id: "p-03" });

  assert.equal(opened.selectedIndex, 2);
  assert.equal(opened.viewerOpen, true);
  assert.equal(opened.returnFocusId, "p-03");
  assert.equal(
    galleryReducer(initial, { type: "OPEN", id: "not-present" }),
    initial,
  );
});

test("closes the viewer while preserving selection and focus return ID", () => {
  const selected = galleryReducer(createGalleryState(items), {
    type: "SELECT",
    id: "p-02",
  });
  const opened = galleryReducer(selected, { type: "OPEN" });
  const navigated = galleryReducer(opened, { type: "NEXT" });
  const closed = galleryReducer(navigated, { type: "CLOSE" });

  assert.equal(closed.viewerOpen, false);
  assert.equal(closed.selectedIndex, 2);
  assert.equal(closed.returnFocusId, "p-02");
});

test("previous and next navigation wrap deterministically", () => {
  const initial = createGalleryState(items);
  const previous = galleryReducer(initial, { type: "PREVIOUS" });
  const next = galleryReducer(previous, { type: "NEXT" });
  const wrappedNext = galleryReducer(
    galleryReducer(
      galleryReducer(initial, { type: "NEXT" }),
      { type: "NEXT" },
    ),
    { type: "NEXT" },
  );

  assert.equal(previous.selectedIndex, 2);
  assert.equal(next.selectedIndex, 0);
  assert.equal(wrappedNext.selectedIndex, 0);
});

test("all transitions are no-ops for an empty gallery", () => {
  const empty = createGalleryState([]);

  assert.deepEqual(empty, {
    items: [],
    selectedIndex: -1,
    viewerOpen: false,
    returnFocusId: null,
  });

  for (const action of [
    { type: "SELECT", id: "p-01" },
    { type: "OPEN" },
    { type: "CLOSE" },
    { type: "PREVIOUS" },
    { type: "NEXT" },
  ]) {
    assert.equal(galleryReducer(empty, action), empty);
  }
});

test("ignores unknown item IDs and action types", () => {
  const initial = createGalleryState(items);

  assert.equal(
    galleryReducer(initial, { type: "SELECT", id: "not-present" }),
    initial,
  );
  assert.equal(galleryReducer(initial, { type: "UNKNOWN" }), initial);
});
