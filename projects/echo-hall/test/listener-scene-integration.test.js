import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const projectDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

test("ListenerScene mounts the authored controller instead of constructing the proxy", async () => {
  const source = await readFile(path.join(projectDirectory, "src/render/listener-scene.js"), "utf8");

  assert.match(source, /mountListenerArtifact\s*\(asset\)/);
  assert.match(source, /new ListenerArtifactController\s*\(/);
  assert.doesNotMatch(source, /from\s+["']\.\.\/listener\/listener-artifact\.js["']/);
  assert.doesNotMatch(source, /new ListenerArtifact\s*\(/);
});

test("boot mounts the critical artifact before the film becomes ready", async () => {
  const source = await readFile(path.join(projectDirectory, "src/main.js"), "utf8");
  const mountIndex = source.indexOf('mountListenerArtifact(result.assets["listener-artifact"])');
  const directorIndex = source.indexOf("new FilmDirector");
  const readyIndex = source.indexOf('ui.dispatch({ type: "READY" })');

  assert.ok(mountIndex >= 0, "boot must mount listener-artifact");
  assert.ok(mountIndex < directorIndex, "artifact mounts before the film director is created");
  assert.ok(mountIndex < readyIndex, "artifact mounts before READY is dispatched");
});
