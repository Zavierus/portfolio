import assert from "node:assert/strict";
import { access, readFile, stat } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const projectDirectory = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const bundlePath = path.join(projectDirectory, "game.bundle.js");
const manifestPath = path.join(projectDirectory, "build-manifest.json");

test("production bundle exists without a source-map reference", async () => {
  const [bundle, bundleStats] = await Promise.all([
    readFile(bundlePath, "utf8"),
    stat(bundlePath),
  ]);

  assert.ok(bundleStats.size > 0, "game.bundle.js must not be empty");
  assert.doesNotMatch(bundle, /[#@]\s*sourceMappingURL=/);
});

test("build manifest describes the generated production bundle", async () => {
  const [manifestSource, bundleStats] = await Promise.all([
    readFile(manifestPath, "utf8"),
    stat(bundlePath),
  ]);
  const manifest = JSON.parse(manifestSource);

  assert.equal(manifest.sourceEntry, "projects/frame-zero/src/main.js");
  assert.equal(manifest.output, "projects/frame-zero/game.bundle.js");
  assert.equal(manifest.bytes, bundleStats.size);
  assert.equal(new Date(manifest.builtAt).toISOString(), manifest.builtAt);
});

test("index local asset URLs stay inside the frame-zero project", async () => {
  const html = await readFile(path.join(projectDirectory, "index.html"), "utf8");
  const resourceTags = html.match(/<(?:link|script|img|audio|video|source)\b[^>]*>/gi) ?? [];
  const localUrls = resourceTags.flatMap((tag) =>
    [...tag.matchAll(/\b(?:href|src)\s*=\s*["']([^"']+)["']/gi)]
      .map((match) => match[1])
      .filter((url) => !/^(?:data:|https?:|\/\/|#)/i.test(url)),
  );

  assert.ok(localUrls.length > 0, "index.html must load at least one local asset");

  for (const url of localUrls) {
    const baseDirectory = url === "../../assets/project-entry-transition.js"
      ? path.resolve(projectDirectory, "../..")
      : projectDirectory;
    const resolvedPath = path.resolve(projectDirectory, url);
    const relativePath = path.relative(baseDirectory, resolvedPath);
    assert.ok(
      relativePath && !relativePath.startsWith("..") && !path.isAbsolute(relativePath),
      `${url} must resolve beneath its declared local asset boundary`,
    );
    await access(resolvedPath);
  }
});
