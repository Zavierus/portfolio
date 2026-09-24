import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const project = "projects/pulse-room";

test("PULSE ROOM publishes the complete GPL source boundary", async () => {
  await Promise.all([
    access("LICENSES.md"),
    access(`${project}/LICENSE`),
    access(`${project}/NOTICE.md`),
    access(`${project}/SOURCE.md`),
  ]);
  const license = await readFile(`${project}/LICENSE`, "utf8");
  const boundaries = await readFile("LICENSES.md", "utf8");
  const notice = await readFile(`${project}/NOTICE.md`, "utf8");
  const source = await readFile(`${project}/SOURCE.md`, "utf8");
  assert.match(license, /GNU GENERAL PUBLIC LICENSE/);
  assert.match(license, /Version 3, 29 June 2007/);
  assert.match(boundaries, /assets\/source\/pulse-room\//);
  assert.match(boundaries, /assets\/runtime\/pulse-room\//);
  assert.match(boundaries, /separate terms/);
  assert.match(notice, /XxHuberrr\/Mineradio/);
  assert.match(notice, /4abaa19/);
  assert.match(notice, /pinned commit author: XxHuberrr/i);
  assert.match(notice, /package\.json.*author field: `Mineradio`/);
  assert.doesNotMatch(notice, /Copyright \(C\) 2026 XxHuberrr/);
  assert.match(source, /projects\/pulse-room\//);
  assert.match(source, /root `scripts\/`/);
  assert.match(source, /assets\/source\/pulse-room\//);
  assert.match(source, /assets\/runtime\/pulse-room\//);
  assert.match(source, /npm run build:pulse-room/);
  assert.match(notice, /removed the authored GLB world/);
  assert.match(source, /local catalog, playback, and analysis adapters/);
  assert.doesNotMatch(source, /authored-world runtime/);
});

test("the pinned upstream record is exact", async () => {
  const record = JSON.parse(
    await readFile(`${project}/MINERADIO_UPSTREAM.json`, "utf8"),
  );
  assert.equal(record.repository, "https://github.com/XxHuberrr/Mineradio");
  assert.equal(record.version, "2.0.2");
  assert.equal(record.commit, "4abaa19");
  assert.equal(record.license, "GPL-3.0-only");
  assert.equal(record.frontendRoot, "public");
});
