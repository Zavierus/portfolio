import assert from "node:assert/strict";
import { access, readFile, stat } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const projectDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const bundlePath = path.join(projectDirectory, "app.bundle.js");
const manifestPath = path.join(projectDirectory, "build-manifest.json");

test("The Listener production bundle exists without a source map", async () => {
  const [bundle, stats] = await Promise.all([readFile(bundlePath, "utf8"), stat(bundlePath)]);
  assert.ok(stats.size > 0);
  assert.doesNotMatch(bundle, /[#@]\s*sourceMappingURL=/);
});

test("The Listener build publishes the KTX2 transcoder", async () => {
  await Promise.all([
    access(path.join(projectDirectory, "assets", "basis", "basis_transcoder.js")),
    access(path.join(projectDirectory, "assets", "basis", "basis_transcoder.wasm")),
  ]);
});

test("The Listener build manifest matches the generated bundle", async () => {
  const [manifestSource, stats] = await Promise.all([readFile(manifestPath, "utf8"), stat(bundlePath)]);
  const manifest = JSON.parse(manifestSource);
  assert.equal(manifest.product, "THE LISTENER");
  assert.equal(manifest.sourceEntry, "projects/echo-hall/src/main.js");
  assert.equal(manifest.output, "projects/echo-hall/app.bundle.js");
  assert.equal(manifest.bytes, stats.size);
  assert.equal(new Date(manifest.builtAt).toISOString(), manifest.builtAt);
});

test("The Listener index loads only existing project-local resources", async () => {
  const html = await readFile(path.join(projectDirectory, "index.html"), "utf8");
  const resourceTags = html.match(/<(?:link|script|img|audio|video|source)\b[^>]*>/gi) ?? [];
  const localUrls = resourceTags.flatMap((tag) =>
    [...tag.matchAll(/\b(?:href|src)\s*=\s*["']([^"']+)["']/gi)]
      .map((match) => match[1])
      .filter((url) => !/^(?:data:|https?:|\/\/|#)/i.test(url)),
  );
  assert.ok(localUrls.length > 0);
  for (const url of localUrls) {
    const baseDirectory = url === "../../assets/project-entry-transition.js"
      ? path.resolve(projectDirectory, "../..")
      : projectDirectory;
    const resolved = path.resolve(projectDirectory, url);
    const relative = path.relative(baseDirectory, resolved);
    assert.ok(relative && !relative.startsWith("..") && !path.isAbsolute(relative));
    await access(resolved);
  }
});

test("The Listener index exposes the finished film contract", async () => {
  const html = await readFile(path.join(projectDirectory, "index.html"), "utf8");
  assert.match(html, /THE LISTENER/);
  assert.match(html, /HUMAN ARCHIVE \/ 01:35/);
  assert.match(html, /id="playButton"/);
  assert.match(html, /id="soundButton"/);
  assert.match(html, /id="exitButton"/);
  assert.match(html, /id="replayButton"/);
  assert.doesNotMatch(html, /data-chapter=|chapter-rail|ECHO RUN|60 SEC LOOP/i);
});
