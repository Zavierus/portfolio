import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import test from "node:test";

const project = "projects/pulse-room";
const upstreamRoot = `${project}/upstream/mineradio-2.0.2`;
const upstreamCommit = "4abaa190de42c632365ae4244e041bad16443224";

function normalizeNewlines(source) {
  return source.replace(/\r\n/g, "\n");
}

test("every retained Mineradio source matches the pinned local replica contract", async () => {
  const [targets, record, order] = await Promise.all([
    readFile(`${project}/LOCAL_REPLICA_MODULES.json`, "utf8").then(JSON.parse),
    readFile(`${project}/MINERADIO_UPSTREAM.json`, "utf8").then(JSON.parse),
    readFile(`${project}/src/mineradio/module-order.json`, "utf8").then(JSON.parse),
  ]);

  assert.deepEqual(order, targets.map(({ target }) => target));
  assert.deepEqual(
    record.files.map(({ target }) => target),
    targets.map(({ target }) => target),
  );

  for (const target of targets) {
    const entry = record.files.find(({ target: value }) => value === target.target);
    assert.ok(entry, `missing provenance for ${target.target}`);
    assert.equal(entry.upstreamPath, target.upstreamPath);
    assert.equal(entry.upstreamSha256, target.upstreamSha256);
    assert.equal(entry.modified, target.adapted);

    const [source, upstream] = await Promise.all([
      readFile(`${project}/src/mineradio/${target.target}`, "utf8"),
      readFile(`${upstreamRoot}/${target.upstreamPath}`, "utf8"),
    ]);

    if (!target.adapted) {
      assert.equal(
        normalizeNewlines(source),
        normalizeNewlines(upstream),
        `${target.target} must stay byte-equivalent after newline normalization`,
      );
      assert.equal("modifiedAt" in entry, false);
      assert.equal("modificationSummary" in entry, false);
      continue;
    }

    const lines = normalizeNewlines(source).split("\n");
    assert.equal(
      lines[0],
      "/* Derived from Mineradio 2.0.2 (4abaa19), GPL-3.0-only. */",
      target.target,
    );
    assert.equal(
      lines[1],
      `/* Upstream: https://github.com/XxHuberrr/Mineradio/blob/${upstreamCommit}/${target.upstreamPath} */`,
      target.target,
    );
    assert.equal(
      lines[2],
      `/* Modified for PULSE ROOM on ${entry.modifiedAt}. */`,
      target.target,
    );
    assert.match(entry.modifiedAt, /^2026-\d{2}-\d{2}$/);
    assert.ok(entry.modificationSummary?.trim().length >= 12, target.target);
  }
});

test("the live Mineradio tree contains only contracted JavaScript modules", async () => {
  const [targets, record] = await Promise.all([
    readFile(`${project}/LOCAL_REPLICA_MODULES.json`, "utf8").then(JSON.parse),
    readFile(`${project}/MINERADIO_UPSTREAM.json`, "utf8").then(JSON.parse),
  ]);
  const discovered = [];

  async function visit(directory, prefix = "") {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const relative = prefix ? `${prefix}/${entry.name}` : entry.name;
      if (entry.isDirectory()) await visit(`${directory}/${entry.name}`, relative);
      else if (entry.isFile() && entry.name.endsWith(".js")) discovered.push(relative);
    }
  }

  await visit(`${project}/src/mineradio`);
  const expected = targets.map(({ target }) => target).sort();
  assert.deepEqual(discovered.sort(), expected);
  assert.deepEqual(record.files.map(({ target }) => target).sort(), expected);
});
