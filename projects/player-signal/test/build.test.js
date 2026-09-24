import assert from "node:assert/strict";
import { access, readFile, stat } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = new URL("../", import.meta.url);
const repositoryRoot = new URL("../../../", import.meta.url);

test("PLAYER SIGNAL ships independent app and worker bundles", async () => {
  const [html, manifest, appBundle, workerBundle] = await Promise.all([
    readFile(new URL("index.html", root), "utf8"),
    readFile(new URL("build-manifest.json", root), "utf8").then(JSON.parse),
    stat(new URL("app.bundle.js", root)),
    stat(new URL("analysis.worker.bundle.js", root)),
  ]);

  assert.match(html, /PLAYER SIGNAL/);
  assert.match(html, /src="\.\/app\.bundle\.js/);
  assert.equal(manifest.product, "PLAYER SIGNAL");
  assert.equal(manifest.outputs.app.bytes, appBundle.size);
  assert.equal(manifest.outputs.worker.bytes, workerBundle.size);
  assert.equal(manifest.outputs.app.sourceEntry, "projects/player-signal/src/main.js");
  assert.equal(manifest.outputs.worker.sourceEntry, "projects/player-signal/src/analysis/worker.js");
  assert.doesNotMatch(await readFile(new URL("app.bundle.js", root), "utf8"), /sourceMappingURL/);
  assert.doesNotMatch(await readFile(new URL("analysis.worker.bundle.js", root), "utf8"), /sourceMappingURL/);
  await access(new URL("styles.css", root));
});

test("PLAYER SIGNAL index references only local existing resources", async () => {
  const html = await readFile(new URL("index.html", root), "utf8");
  const resources = [...html.matchAll(/(?:src|href)="([^"]+)"/g)].map((match) => match[1]);
  const projectDirectory = path.resolve(fileURLToPath(root));
  const repositoryDirectory = path.resolve(fileURLToPath(repositoryRoot));

  for (const resource of resources) {
    if (/^(?:https?:|#|mailto:)/.test(resource)) continue;
    const resolved = path.resolve(projectDirectory, resource.split("?")[0]);
    const relativeToRepository = path.relative(repositoryDirectory, resolved);
    assert.ok(relativeToRepository && !relativeToRepository.startsWith("..") && !path.isAbsolute(relativeToRepository));
    await access(resolved);
  }
});
