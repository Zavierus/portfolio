import assert from "node:assert/strict";
import test from "node:test";

import {
  photography,
  sortPhotography,
  validatePhotography,
  videos,
} from "../src/portfolio/data/photography.js";

const requiredFields = [
  "id",
  "src",
  "thumbnail",
  "title",
  "year",
  "category",
  "description",
  "width",
  "height",
  "weight",
];

function fixture(overrides = {}) {
  return {
    id: "p-01",
    src: "./assets/photography/full/p-01.jpg",
    thumbnail: "./assets/photography/thumbs/p-01.jpg",
    title: "Night Platform",
    year: 2026,
    category: "Street",
    description: "A platform between the last two trains.",
    width: 2400,
    height: 1600,
    weight: 10,
    ...overrides,
  };
}

test("production photography manifest publishes 24 curated single images", () => {
  assert.equal(photography.length, 24);
  assert.deepEqual(videos, []);

  const result = validatePhotography(photography);
  assert.equal(result.valid, true);
  assert.deepEqual(result.errors, []);
  assert.equal(result.items.length, 24);
  assert.ok(result.items.every(({ src }) => /\/original-\d{2}\.webp$/.test(src)));
});

test("valid photography entries preserve declared data and optional equipment", () => {
  const item = fixture({ equipment: "35mm" });
  const result = validatePhotography([item]);

  assert.equal(result.valid, true);
  assert.deepEqual(result.errors, []);
  assert.deepEqual(result.items, [item]);
  assert.equal(result.items[0].equipment, "35mm");
});

test("validator reports every missing required field without throwing", () => {
  const item = fixture();
  for (const field of requiredFields) delete item[field];

  const result = validatePhotography([item]);

  assert.equal(result.valid, false);
  assert.deepEqual(result.items, []);
  assert.deepEqual(
    result.errors.map(({ field }) => field),
    requiredFields,
  );
  assert.ok(result.errors.every(({ index }) => index === 0));
});

test("validator rejects duplicate IDs but retains valid neighbors", () => {
  const first = fixture();
  const duplicate = fixture({ title: "Duplicate" });
  const neighbor = fixture({ id: "p-02", weight: 5 });

  const result = validatePhotography([first, duplicate, neighbor]);

  assert.equal(result.valid, false);
  assert.deepEqual(result.items, [first, neighbor]);
  assert.deepEqual(
    result.errors.map(({ index, field }) => [index, field]),
    [[1, "id"]],
  );
});

test("validator rejects remote, malformed, and escaping photography paths", () => {
  const invalidPaths = [
    "https://example.com/photo.jpg",
    "http://example.com/photo.jpg",
    "./assets/photography/../secret.jpg",
    "./assets/photography/full/../../secret.jpg",
    "./assets/photography\\full\\photo.jpg",
    "/assets/photography/full/photo.jpg",
  ];

  for (const [index, path] of invalidPaths.entries()) {
    const result = validatePhotography([
      fixture({
        id: `invalid-${index}`,
        src: path,
        thumbnail: path,
      }),
    ]);

    assert.equal(result.valid, false, path);
    assert.deepEqual(result.items, [], path);
    assert.deepEqual(
      result.errors.map(({ field }) => field),
      ["src", "thumbnail"],
      path,
    );
  }
});

test("validator requires positive integer dimensions and finite weights", () => {
  const cases = [
    ["width", 0],
    ["width", 12.5],
    ["height", -1],
    ["height", "1600"],
    ["weight", Number.NaN],
    ["weight", Number.POSITIVE_INFINITY],
    ["weight", "10"],
  ];

  for (const [field, value] of cases) {
    const result = validatePhotography([fixture({ [field]: value })]);
    assert.equal(result.valid, false, `${field}: ${String(value)}`);
    assert.deepEqual(result.items, []);
    assert.ok(result.errors.some((error) => error.field === field));
  }
});

test("validator collects item-level errors and keeps valid neighbors", () => {
  const before = fixture({ id: "before", weight: 1 });
  const invalid = fixture({ id: "invalid", width: 0, weight: Number.NaN });
  const after = fixture({ id: "after", weight: 2 });

  const result = validatePhotography([before, invalid, after]);

  assert.equal(result.valid, false);
  assert.deepEqual(result.items, [before, after]);
  assert.deepEqual(
    result.errors.map(({ index, id, field }) => ({ index, id, field })),
    [
      { index: 1, id: "invalid", field: "width" },
      { index: 1, id: "invalid", field: "weight" },
    ],
  );
});

test("photography sorting is descending by weight and stable for ties", () => {
  const items = [
    fixture({ id: "first", weight: 3 }),
    fixture({ id: "second", weight: 8 }),
    fixture({ id: "third", weight: 8 }),
    fixture({ id: "fourth", weight: -2 }),
  ];

  const sorted = sortPhotography(items);

  assert.deepEqual(sorted.map(({ id }) => id), ["second", "third", "first", "fourth"]);
  assert.deepEqual(items.map(({ id }) => id), ["first", "second", "third", "fourth"]);
});

test("non-array input is reported instead of throwing", () => {
  const result = validatePhotography(null);

  assert.equal(result.valid, false);
  assert.deepEqual(result.items, []);
  assert.equal(result.errors.length, 1);
  assert.equal(result.errors[0].field, "manifest");
});
