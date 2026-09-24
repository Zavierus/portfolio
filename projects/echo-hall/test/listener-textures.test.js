import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

import sharp from "sharp";

const textureRoot = path.resolve(
  "assets/source/echo-hall/textures/listener-artifact",
);
const materialIds = ["ceramic", "titanium", "membrane", "core"];
const roles = ["basecolor", "normal", "orm"];

test("Listener artifact textures publish a complete 2048px RGBA PBR set", async () => {
  for (const material of materialIds) {
    for (const role of roles) {
      const file = path.join(textureRoot, `${material}-${role}.png`);
      const metadata = await sharp(file).metadata();

      assert.equal(metadata.width, 2048, `${material}-${role} width`);
      assert.equal(metadata.height, 2048, `${material}-${role} height`);
      assert.equal(metadata.format, "png", `${material}-${role} format`);
      assert.equal(metadata.channels, 4, `${material}-${role} channels`);
      assert.equal(metadata.hasAlpha, true, `${material}-${role} alpha`);
    }
  }
});

test("Listener artifact materials have distinct base-color fields", async () => {
  const hashes = await Promise.all(
    materialIds.map(async (material) => {
      const bytes = await readFile(
        path.join(textureRoot, `${material}-basecolor.png`),
      );
      return createHash("sha256").update(bytes).digest("hex");
    }),
  );

  assert.equal(new Set(hashes).size, materialIds.length);
});

test("Listener artifact normal maps preserve a positive blue normal", async () => {
  for (const material of materialIds) {
    const { channels } = await sharp(
      path.join(textureRoot, `${material}-normal.png`),
    ).stats();

    assert.ok(
      channels[2].mean > 200,
      `${material} normal blue mean was ${channels[2].mean}`,
    );
  }
});
