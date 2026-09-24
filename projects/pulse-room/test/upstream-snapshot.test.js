import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = "projects/pulse-room/upstream/mineradio-2.0.2";

test("the local Mineradio snapshot is pinned and complete", async () => {
  const manifest = JSON.parse(
    await readFile(`${root}/SNAPSHOT.json`, "utf8"),
  );
  assert.equal(manifest.repository, "https://github.com/XxHuberrr/Mineradio");
  assert.equal(manifest.version, "2.0.2");
  assert.equal(
    manifest.commit,
    "4abaa190de42c632365ae4244e041bad16443224",
  );
  assert.equal(
    manifest.files.filter(({ path }) =>
      /^public\/js\/modules\/.+\.js$/.test(path),
    ).length,
    100,
  );
  assert.ok(manifest.files.some(({ path }) => path === "public/index.html"));
  assert.ok(
    manifest.files.some(({ path }) => path === "public/css/index.css"),
  );
  for (const entry of manifest.files) {
    const bytes = await readFile(`${root}/${entry.path}`);
    assert.equal(bytes.length, entry.bytes, entry.path);
    assert.equal(
      createHash("sha256").update(bytes).digest("hex"),
      entry.sha256,
      entry.path,
    );
  }
});
