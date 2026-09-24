import assert from "node:assert/strict";
import { access, readFile, stat } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

test("SET//FLOW ships an independent production bundle", async () => {
  const [html, manifest, bundle] = await Promise.all([
    readFile(new URL("index.html", root), "utf8"),
    readFile(new URL("build-manifest.json", root), "utf8").then(JSON.parse),
    stat(new URL("app.bundle.js", root)),
  ]);

  assert.match(html, /SET\/\/FLOW/);
  assert.match(html, /src="\.\/app\.bundle\.js/);
  assert.equal(manifest.sourceEntry, "projects/set-flow/src/main.js");
  assert.equal(manifest.output, "projects/set-flow/app.bundle.js");
  assert.equal(manifest.bytes, bundle.size);
  await access(new URL("styles.css", root));
});
