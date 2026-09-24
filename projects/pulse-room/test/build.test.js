import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { access, readFile, stat } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const projectDirectory = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const manifestPath = path.join(projectDirectory, "build-manifest.json");
const outputs = [
  "runtime-bootstrap.bundle.js",
  "runtime-bootstrap.bundle.js.map",
  "app.bundle.js",
  "app.bundle.js.map",
  "analysis-worker.bundle.js",
  "analysis-worker.bundle.js.map",
];

test("pulse-room publishes two source-mapped runtime stages", async () => {
  for (const output of outputs) {
    const outputPath = path.join(projectDirectory, output);
    await access(outputPath);
    assert.ok((await stat(outputPath)).size > 0, `${output} must not be empty`);
  }

  const [app, bootstrap, worker] = await Promise.all([
    readFile(path.join(projectDirectory, "app.bundle.js"), "utf8"),
    readFile(path.join(projectDirectory, "runtime-bootstrap.bundle.js"), "utf8"),
    readFile(path.join(projectDirectory, "analysis-worker.bundle.js"), "utf8"),
  ]);
  assert.match(app, /Derived from Mineradio 2\.0\.2/);
  assert.match(
    bootstrap,
    /PULSE ROOM browser runtime - GPL-3\.0-only/,
  );
  assert.match(worker, /PULSE ROOM browser runtime - GPL-3\.0-only/);
});

test("pulse-room manifest describes every hashed build artifact", async () => {
  const [manifestSource, classicSources, replicaModules] = await Promise.all([
    readFile(manifestPath, "utf8"),
    readFile(
      path.join(projectDirectory, "src/mineradio/module-order.json"),
      "utf8",
    ).then(JSON.parse),
    readFile(
      path.join(projectDirectory, "LOCAL_REPLICA_MODULES.json"),
      "utf8",
    ).then(JSON.parse),
  ]);
  const manifest = JSON.parse(manifestSource);

  assert.deepEqual(manifest.classicSources, classicSources);
  assert.equal(
    manifest.classicUpstreamCommit,
    "4abaa190de42c632365ae4244e041bad16443224",
  );
  assert.deepEqual(
    manifest.classicSourceRecords,
    replicaModules.map(({ target, upstreamPath, upstreamSha256, adapted }) => ({
      source: target,
      upstreamPath,
      upstreamSha256,
      adapted,
    })),
  );
  assert.equal(
    manifest.bootstrap.entry,
    "projects/pulse-room/src/pulse/runtime-bootstrap.js",
  );
  assert.equal(
    manifest.worker.entry,
    "projects/pulse-room/src/analysis/analysis-worker.js",
  );

  const artifactRecords = [
    manifest.bootstrap,
    manifest.classic,
    manifest.worker,
    ...Object.values(manifest.sourceMaps),
  ];
  assert.equal(artifactRecords.length, outputs.length);

  for (const artifact of artifactRecords) {
    assert.ok(outputs.includes(path.basename(artifact.output)));
    assert.match(artifact.sha256, /^[a-f0-9]{64}$/);
    const artifactPath = path.resolve(artifact.output);
    const bytes = await readFile(artifactPath);
    assert.equal(artifact.bytes, bytes.length);
    assert.equal(
      artifact.sha256,
      createHash("sha256").update(bytes).digest("hex"),
    );
  }

  assert.equal(Object.hasOwn(manifest, "builtAt"), false);
  assert.equal(Object.hasOwn(manifest, "buildDurationMs"), false);
});

test("pulse-room source maps contain only portable source paths", async () => {
  const mapNames = [
    "runtime-bootstrap.bundle.js.map",
    "app.bundle.js.map",
    "analysis-worker.bundle.js.map",
  ];

  for (const mapName of mapNames) {
    const serialized = await readFile(
      path.join(projectDirectory, mapName),
      "utf8",
    );
    const sourceMap = JSON.parse(serialized);
    assert.ok(sourceMap.sources.length > 0, `${mapName} must list sources`);
    assert.equal(sourceMap.sourcesContent.length, sourceMap.sources.length);

    for (const source of sourceMap.sources) {
      assert.equal(path.isAbsolute(source), false, `${source} must be relative`);
    }

    assert.doesNotMatch(
      serialized,
      /(?:^|[^a-z0-9])[a-z]:(?:\/|\\\\)/i,
    );
    assert.doesNotMatch(
      serialized,
      /ai-entertainment-strategy-workbench-worktrees/i,
    );
    assert.doesNotMatch(
      serialized,
      /ai-entertainment-strategy-workbench(?!-worktrees)/i,
    );
  }
});

test("pulse-room local asset URLs resolve inside the project", async () => {
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

test("pulse-room publishes the local Essentia worker runtime", async () => {
  await Promise.all([
    access(path.join(projectDirectory, "assets/essentia/essentia-wasm.umd.js")),
    access(path.join(projectDirectory, "assets/essentia/essentia-wasm.web.js")),
    access(path.join(projectDirectory, "assets/essentia/essentia-wasm.web.wasm")),
    access(path.join(projectDirectory, "assets/essentia/essentia.js-core.umd.min.js")),
  ]);
});

test("pulse-room does not publish the retired KTX2 transcoder", async () => {
  for (const relative of [
    "assets/basis/basis_transcoder.js",
    "assets/basis/basis_transcoder.wasm",
  ]) {
    await assert.rejects(() => access(path.join(projectDirectory, relative)));
  }
});

test("the independent pre-fork player and its tests are retired", async () => {
  const retired = [
    "src/main.js",
    "src/audio-player.js",
    "src/queue-state.js",
    "src/demo-track.js",
    "test/demo-track.test.js",
    "test/visualizer-integration.test.js",
  ];
  for (const relative of retired) {
    await assert.rejects(
      () => access(path.join(projectDirectory, relative)),
      `${relative} must not remain in the reduced fork`,
    );
  }

  const published = await Promise.all([
    readFile(path.join(projectDirectory, "index.html"), "utf8"),
    readFile(path.join(projectDirectory, "app.bundle.js"), "utf8"),
    readFile(path.join(projectDirectory, "runtime-bootstrap.bundle.js"), "utf8"),
    readFile(manifestPath, "utf8"),
  ]).then((parts) => parts.join("\n"));
  assert.doesNotMatch(
    published,
    /src\/main\.js|audio-player\.js|queue-state\.js|demo-track\.js|visualizer\.js|vj-stage\.js/i,
  );
});

test("published runtime contains no removed service or desktop UI boundary", async () => {
  const published = await Promise.all([
    readFile(path.join(projectDirectory, "index.html"), "utf8"),
    readFile(path.join(projectDirectory, "app.bundle.js"), "utf8"),
    readFile(path.join(projectDirectory, "runtime-bootstrap.bundle.js"), "utf8"),
  ]).then((parts) => parts.join("\n"));

  assert.doesNotMatch(
    published,
    /music\.163\.com|y\.qq\.com|kugou\.com|qishui|electronAPI|ipcRenderer|checkForUpdates|wallpaperPropertyListener/i,
  );
  assert.doesNotMatch(
    published,
    /account-panel|login-panel|provider-panel|podcast-panel|lyrics-panel|desktop-lyrics|cuefield|automix/i,
  );
  assert.doesNotMatch(published, /reportRemovedFeature|removedFeatureShims/i);
});

test("source and built-in media attribution are reachable from the shell", async () => {
  const html = await readFile(path.join(projectDirectory, "index.html"), "utf8");
  const documents = [
    "NOTICE.md",
    "SOURCE.md",
    "assets/music/ATTRIBUTIONS.md",
  ];
  for (const relative of documents) {
    assert.match(html, new RegExp(`href=["']\\./${relative.replaceAll("/", "\\/")}["']`, "i"));
    await access(path.join(projectDirectory, relative));
  }
});
