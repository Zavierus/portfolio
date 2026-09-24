import assert from "node:assert/strict";
import test from "node:test";

import {
  activateIntersectingThumbnails,
  createContactSheetController,
  createContactSheetModel,
  getGalleryVisibility,
} from "../src/portfolio/gallery/contact-sheet.js";
import { createLightboxController } from "../src/portfolio/gallery/lightbox.js";
import { createSwipeTracker, getSwipeDirection } from "../src/portfolio/gallery/swipe.js";

const items = [
  {
    id: "p-01",
    src: "./assets/photography/full/p-01.jpg",
    thumbnail: "./assets/photography/thumbs/p-01.jpg",
    title: "Night Platform",
    year: 2026,
    category: "Street",
    description: "A platform between the last two trains.",
    equipment: "35mm",
    width: 2400,
    height: 1600,
    weight: 10,
  },
  {
    id: "p-02",
    src: "./assets/photography/full/p-02.jpg",
    thumbnail: "./assets/photography/thumbs/p-02.jpg",
    title: "Blue Hour",
    year: 2025,
    category: "Portrait",
    description: "A portrait made at the edge of daylight.",
    width: 1600,
    height: 2400,
    weight: 9,
  },
  {
    id: "p-03",
    src: "./assets/photography/full/p-03.jpg",
    thumbnail: "./assets/photography/thumbs/p-03.jpg",
    title: "Concrete Tide",
    year: 2024,
    category: "Architecture",
    description: "Late light moving across an unfinished wall.",
    width: 2000,
    height: 2000,
    weight: 8,
  },
];

test("empty production data hides the photography section and navigation", () => {
  assert.deepEqual(getGalleryVisibility([]), {
    sectionVisible: false,
    navigationVisible: false,
  });
});

test("contact sheet model exposes sequence, useful alt text, metadata, and stable ratio", () => {
  const [first] = createContactSheetModel(items);

  assert.equal(first.number, "001");
  assert.match(first.alt, /Night Platform/);
  assert.match(first.alt, /platform between the last two trains/i);
  assert.deepEqual(first.metadata, {
    year: "2026",
    category: "Street",
    equipment: "35mm",
  });
  assert.equal(first.aspectRatio, "2400 / 1600");
  assert.equal(first.thumbnail.src, null);
  assert.equal(first.thumbnail.pendingSrc, items[0].thumbnail);
});

test("click and Enter activation open the selected photograph", () => {
  const opened = [];
  const controller = createContactSheetController({
    items,
    viewer: { open: (id) => opened.push(id) },
    view: { setVisibility() {}, render() {}, select() {} },
  });

  controller.activate("p-02");
  assert.equal(controller.handleItemKey("p-03", "Enter"), true);
  assert.equal(controller.handleItemKey("p-01", "ArrowRight"), false);
  assert.deepEqual(opened, ["p-02", "p-03"]);
});

test("lightbox keyboard navigation wraps and closing restores originating focus", () => {
  const rendered = [];
  const restored = [];
  const view = {
    open() {},
    close() {},
    render(payload) { rendered.push(payload); },
    restoreFocus(id) { restored.push(id); },
  };
  const controller = createLightboxController({ items, view, prefetch() {} });

  controller.open("p-01");
  assert.equal(controller.handleKey("ArrowLeft"), true);
  assert.equal(rendered.at(-1).item.id, "p-03");
  assert.equal(controller.handleKey("ArrowRight"), true);
  assert.equal(rendered.at(-1).item.id, "p-01");
  assert.equal(controller.handleKey("Escape"), true);
  assert.equal(controller.getState().viewerOpen, false);
  assert.deepEqual(restored, ["p-01"]);
});

test("high-resolution source is assigned only after open and adjacent sources are prefetched", () => {
  const rendered = [];
  const prefetched = [];
  const controller = createLightboxController({
    items,
    view: {
      open() {}, close() {}, restoreFocus() {},
      render(payload) { rendered.push(payload); },
    },
    prefetch: (src) => prefetched.push(src),
  });

  assert.deepEqual(rendered, []);
  assert.ok(createContactSheetModel(items).every(({ thumbnail }) => thumbnail.src === null));

  controller.open("p-02");

  assert.equal(rendered[0].src, items[1].src);
  assert.deepEqual(prefetched.sort(), [items[0].src, items[2].src].sort());
});

test("IntersectionObserver activation assigns only thumbnails near the sheet", () => {
  const near = { dataset: { thumbnailSrc: items[0].thumbnail }, src: "" };
  const far = { dataset: { thumbnailSrc: items[1].thumbnail }, src: "" };
  const unobserved = [];

  activateIntersectingThumbnails(
    [
      { target: near, isIntersecting: true },
      { target: far, isIntersecting: false },
    ],
    { unobserve: (target) => unobserved.push(target) },
  );

  assert.equal(near.src, items[0].thumbnail);
  assert.equal(far.src, "");
  assert.deepEqual(unobserved, [near]);
});

test("horizontal swipe must exceed 48px and dominate vertical movement", () => {
  assert.equal(getSwipeDirection({ startX: 100, startY: 10, endX: 51, endY: 16 }), "next");
  assert.equal(getSwipeDirection({ startX: 10, startY: 10, endX: 59, endY: 14 }), "previous");
  assert.equal(getSwipeDirection({ startX: 10, startY: 10, endX: 58, endY: 12 }), null);
  assert.equal(getSwipeDirection({ startX: 10, startY: 10, endX: 80, endY: 100 }), null);

  const moves = [];
  const tracker = createSwipeTracker({
    onPrevious: () => moves.push("previous"),
    onNext: () => moves.push("next"),
  });
  tracker.start({ clientX: 100, clientY: 20 });
  tracker.end({ clientX: 40, clientY: 24 });
  tracker.start({ clientX: 40, clientY: 20 });
  tracker.end({ clientX: 110, clientY: 22 });

  assert.deepEqual(moves, ["next", "previous"]);
});
