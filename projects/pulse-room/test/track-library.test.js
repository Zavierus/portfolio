import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { access, readFile, stat } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  BUILT_IN_TRACKS,
  validateTrackLibrary,
} from "../src/track-library.js";

const projectDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const repositoryDirectory = path.resolve(projectDirectory, "../..");
const manifestPath = path.join(projectDirectory, "assets/music/track-manifest.json");
const attributionPath = path.join(projectDirectory, "assets/music/ATTRIBUTIONS.md");
const expected = [
  ["kai-engel-anxiety", "CC-BY-4.0"],
  ["epsilon-not-other-side-of-the-wave", "CC-BY-4.0"],
  ["graham-bole-kirigami", "CC-BY-4.0"],
  ["revolution-void-effects-of-elevation", "CC-BY-3.0"],
];
const expectedPlayback = [
  ["graham-bole-kirigami", "CC-BY-4.0"],
  ["revolution-void-effects-of-elevation", "CC-BY-3.0"],
  ["epsilon-not-other-side-of-the-wave", "CC-BY-4.0"],
  ["kai-engel-anxiety", "CC-BY-4.0"],
];
const expectedSourceFiles = new Map([
  ["kai-engel-anxiety", "Kai_Engel_-_02_-_Anxiety.ogg"],
  ["epsilon-not-other-side-of-the-wave", "Epsilon_not_-_01_-_other_side_of_the_wave.ogg"],
  ["graham-bole-kirigami", "Graham_Bole_-_Kirigami.ogg"],
  ["revolution-void-effects-of-elevation", "Revolution_Void_-_02_-_Effects_of_Elevation_Citizen.ogg"],
]);
const expectedPerformers = new Map([
  ["kai-engel-anxiety", "Kai Engel"],
  ["epsilon-not-other-side-of-the-wave", "epsilon not"],
  ["graham-bole-kirigami", "Graham Bole"],
  ["revolution-void-effects-of-elevation", "Revolution Void"],
]);
const hashPattern = /^[a-f0-9]{64}$/;

async function fileHash(filePath) {
  return createHash("sha256").update(await readFile(filePath)).digest("hex");
}

function embeddedTags(filePath) {
  const result = spawnSync(process.env.FFPROBE_PATH ?? "ffprobe", [
    "-v", "error", "-show_entries", "format_tags", "-of", "json", filePath,
  ], { encoding: "utf8" });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(result.stderr || `ffprobe failed for ${filePath}`);
  return JSON.parse(result.stdout).format.tags;
}

test("PULSE ROOM publishes the exact four approved electronic recordings", async () => {
  const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
  assert.equal(validateTrackLibrary(manifest), true);
  assert.equal(manifest.contractVersion, 2);
  assert.deepEqual(
    manifest.tracks.map(({ id, license }) => [id, license.id]),
    expected,
  );
  assert.deepEqual(
    BUILT_IN_TRACKS.map(({ id, license }) => [id, license.id]),
    expectedPlayback,
  );
  assert.equal(new Set(BUILT_IN_TRACKS.map(({ id }) => id)).size, 4);
  assert.deepEqual(
    manifest.tracks.map(({ catalogRole }) => catalogRole).sort(),
    ["atmospheric-trip-hop", "atmospheric-trip-hop", "industrial-breakbeat", "industrial-breakbeat"],
  );
  assert.ok(BUILT_IN_TRACKS.every((track) => !Object.hasOwn(track, "catalogRole")));

  const attributions = await readFile(attributionPath, "utf8");
  for (const track of manifest.tracks) {
    assert.match(track.source.page, /^https:\/\/commons\.wikimedia\.org\/wiki\/File:/);
    assert.match(track.source.download, /^https:\/\/commons\.wikimedia\.org\/wiki\/Special:Redirect\/file\//);
    assert.equal(track.source.originalFilename, expectedSourceFiles.get(track.id));
    assert.equal(track.source.performer, expectedPerformers.get(track.id));
    assert.ok(track.attribution.includes(track.source.performer));
    assert.ok(attributions.includes(track.source.page));
    assert.ok(attributions.includes(track.attribution));
    assert.match(track.source.sha256, hashPattern);
    assert.match(track.runtime.sha256, hashPattern);
    assert.equal(Object.hasOwn(track, "worldId"), false);
    assert.equal(Object.hasOwn(track, "style"), false);
    assert.equal(Object.hasOwn(track, "theme"), false);
    assert.deepEqual(
      {
        path: track.cover.path,
        url: track.cover.url,
        width: track.cover.width,
        height: track.cover.height,
      },
      {
        path: `projects/pulse-room/assets/covers/${track.id}.png`,
        url: `./assets/covers/${track.id}.png`,
        width: 1600,
        height: 1600,
      },
    );
    assert.match(track.cover.sha256, hashPattern);
    assert.ok(Number.isFinite(track.cover.bytes) && track.cover.bytes > 100_000);
    assert.ok(Array.isArray(track.transformations) && track.transformations.length >= 4);
    assert.deepEqual(
      track.transformations.map(({ operation }) => operation),
      ["edge-silence-check", "loudness-normalize", "true-peak-limit", "transcode-and-tag"],
    );
    assert.ok(Number.isFinite(track.duration) && track.duration >= 90);
    assert.match(track.runtime.path, /^projects\/pulse-room\/assets\/music\/runtime\/[a-z0-9-]+\.mp3$/);
    assert.match(track.runtime.url, /^\.\/assets\/music\/runtime\/[a-z0-9-]+\.mp3$/);
    assert.match(track.analysis.path, /^projects\/pulse-room\/assets\/music\/analysis\/[a-z0-9-]+\.json$/);
    assert.match(track.analysis.url, /^\.\/assets\/music\/analysis\/[a-z0-9-]+\.json$/);
    assert.equal(track.runtime.sampleRate, 48000);
    assert.equal(track.runtime.channels, 2);
    assert.equal(track.runtime.bitRateKbps, 192);
    assert.ok(track.runtime.integratedLufs >= -14.6 && track.runtime.integratedLufs <= -13.4);
    assert.ok(track.runtime.truePeakDb <= -1);
    assert.equal(track.source.identityVerified, true);
    assert.equal(track.runtime.qa.integrity, "pass");
    assert.equal(track.runtime.qa.fullDecode, true);
    assert.equal(track.runtime.qa.clipping, "pass");
    assert.equal(track.runtime.qa.edgeSilence, "pass");
    assert.equal(track.runtime.qa.channelBalance, "pass");
    const comment = track.runtime.metadata.comment;
    assert.ok(comment.includes(track.attribution));
    assert.ok(comment.includes(track.license.url));
    assert.ok(comment.includes(track.source.page));
    assert.ok(comment.includes("loudness-normalized"));
    assert.ok(comment.includes("true-peak limited"));
    assert.ok(comment.includes("resampled to 48 kHz stereo"));
    assert.ok(comment.includes("transcoded to 192 kbps MP3"));
    assert.ok(comment.includes("attribution metadata added"));
    assert.ok(comment.includes("No musical changes."));
    assert.ok(comment.includes(track.transformations[0].applied
      ? "objectively detected invalid edge silence was trimmed"
      : "No edge silence was trimmed"));

    const sourcePath = path.join(repositoryDirectory, track.source.localPath);
    const runtimePath = path.join(repositoryDirectory, track.runtime.path);
    const analysisPath = path.join(repositoryDirectory, track.analysis.path);
    const coverPath = path.join(repositoryDirectory, track.cover.path);
    await Promise.all([access(sourcePath), access(runtimePath), access(analysisPath), access(coverPath)]);
    const [sourceFile, runtimeFile, analysisFile, coverFile] = await Promise.all([
      stat(sourcePath),
      stat(runtimePath),
      stat(analysisPath),
      stat(coverPath),
    ]);
    assert.equal(sourceFile.size, track.source.bytes);
    assert.equal(runtimeFile.size, track.runtime.bytes);
    assert.ok(runtimeFile.size > 1_000_000);
    assert.equal(await fileHash(sourcePath), track.source.sha256);
    assert.equal(await fileHash(runtimePath), track.runtime.sha256);
    assert.equal(await fileHash(analysisPath), track.analysis.sha256);
    assert.equal(coverFile.size, track.cover.bytes);
    assert.equal(await fileHash(coverPath), track.cover.sha256);
    assert.ok(analysisFile.size > 1_000);
    assert.equal(embeddedTags(runtimePath).comment, comment);
  }
});

test("PULSE ROOM queue entries expose local media, covers, and analysis without world metadata", () => {
  for (const track of BUILT_IN_TRACKS) {
    assert.match(track.url, /^\.\/assets\/music\/runtime\//);
    assert.match(track.analysisUrl, /^\.\/assets\/music\/analysis\//);
    assert.match(track.cover, /^\.\/assets\/covers\//);
    assert.equal(track.source, "local");
    assert.equal(track.local, false);
    assert.equal(Object.hasOwn(track, "worldId"), false);
    assert.equal(Object.hasOwn(track, "style"), false);
    assert.equal(Object.hasOwn(track, "theme"), false);
    assert.equal(track.revoke, false);
  }
});

test("track validation rejects identity, rights, timing, level, and byte-contract violations", () => {
  const baseTrack = {
    id: "valid-track",
    title: "Valid",
    artist: "Artist",
    duration: 180,
    bpm: 120,
    bpmSource: "estimated",
    attribution: "Valid by Artist, Public Domain Mark 1.0.",
    cover: {
      path: "projects/pulse-room/assets/covers/valid-track.png",
      url: "./assets/covers/valid-track.png",
      bytes: 320_000,
      sha256: "d".repeat(64),
      width: 1600,
      height: 1600,
    },
    license: {
      id: "Public-Domain-Mark-1.0",
      url: "https://creativecommons.org/publicdomain/mark/1.0/",
    },
    source: {
      page: "https://commons.wikimedia.org/wiki/File:Valid.ogg",
      download: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Valid.ogg",
      originalFilename: "Valid.ogg",
      performer: "Artist",
      localPath: "assets/source/pulse-room/music/original/valid-original.ogg",
      bytes: 2_000_000,
      sha256: "a".repeat(64),
      identityVerified: true,
    },
    transformations: [
      { operation: "edge-silence-check" },
      { operation: "loudness-normalize" },
      { operation: "true-peak-limit" },
      { operation: "transcode-and-tag" },
    ],
    runtime: {
      path: "projects/pulse-room/assets/music/runtime/valid.mp3",
      url: "./assets/music/runtime/valid.mp3",
      sha256: "b".repeat(64),
      bytes: 1_200_000,
      sampleRate: 48000,
      channels: 2,
      bitRateKbps: 192,
      integratedLufs: -14,
      truePeakDb: -1.2,
      metadata: {
        comment: [
          "Attribution: Valid by Artist, Public Domain Mark 1.0.",
          "License: https://creativecommons.org/publicdomain/mark/1.0/.",
          "Source: https://commons.wikimedia.org/wiki/File:Valid.ogg.",
          "PULSE ROOM technical changes: No edge silence was trimmed; loudness-normalized;",
          "true-peak limited; resampled to 48 kHz stereo; transcoded to 192 kbps MP3;",
          "attribution metadata added. No musical changes.",
        ].join(" "),
      },
      qa: {
        integrity: "pass",
        fullDecode: true,
        clipping: "pass",
        edgeSilence: "pass",
        channelBalance: "pass",
      },
    },
    analysis: {
      path: "projects/pulse-room/assets/music/analysis/valid.json",
      url: "./assets/music/analysis/valid.json",
      bytes: 2_000,
      sha256: "c".repeat(64),
    },
  };
  const base = { contractVersion: 2, tracks: [baseTrack] };

  assert.throws(() => validateTrackLibrary({ ...base, tracks: [baseTrack, baseTrack] }), /Duplicate track id/);
  assert.throws(
    () => validateTrackLibrary({ ...base, tracks: [{ ...baseTrack, runtime: { ...baseTrack.runtime, path: "../escape.mp3" } }] }),
    /runtime path/,
  );
  assert.throws(
    () => validateTrackLibrary({ ...base, tracks: [{ ...baseTrack, license: { id: "UNKNOWN", url: "https://example.com" } }] }),
    /license/,
  );
  for (const integratedLufs of [-14.61, -13.39]) {
    assert.throws(
      () => validateTrackLibrary({
        ...base,
        tracks: [{ ...baseTrack, runtime: { ...baseTrack.runtime, integratedLufs } }],
      }),
      /loudness/,
    );
  }
  assert.throws(
    () => validateTrackLibrary({
      ...base,
      tracks: [{ ...baseTrack, runtime: { ...baseTrack.runtime, truePeakDb: -0.99 } }],
    }),
    /true peak/,
  );
  for (const forbidden of ["worldId", "style", "theme"]) {
    assert.throws(
      () => validateTrackLibrary({ ...base, tracks: [{ ...baseTrack, [forbidden]: "removed" }] }),
      new RegExp(forbidden),
    );
  }
  assert.throws(
    () => validateTrackLibrary({ ...base, tracks: [{ ...baseTrack, cover: { ...baseTrack.cover, width: 1024 } }] }),
    /cover dimensions/,
  );
  for (const location of ["source", "runtime", "analysis"]) {
    assert.throws(
      () => validateTrackLibrary({
        ...base,
        tracks: [{ ...baseTrack, [location]: { ...baseTrack[location], bytes: 0 } }],
      }),
      /bytes/,
    );
  }
});
