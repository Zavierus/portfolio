import manifest from "../assets/music/track-manifest.json" with { type: "json" };
import { adaptCatalogTrack } from "./pulse/catalog-adapter.js";

const ALLOWED_LICENSES = new Set([
  "Public-Domain-Mark-1.0",
  "CC-BY-3.0",
  "CC-BY-4.0",
  "CC-BY-SA-3.0-DE",
]);
const ALLOWED_TRACK_FIELDS = new Set([
  "analysis",
  "artist",
  "attribution",
  "bpm",
  "bpmSource",
  "catalogRole",
  "composer",
  "cover",
  "duration",
  "id",
  "license",
  "runtime",
  "source",
  "title",
  "transformations",
]);
const HASH_PATTERN = /^[a-f0-9]{64}$/;
const REQUIRED_TRANSFORMATIONS = [
  "edge-silence-check",
  "loudness-normalize",
  "true-peak-limit",
  "transcode-and-tag",
];
const PLAYBACK_ORDER = Object.freeze([
  "graham-bole-kirigami",
  "revolution-void-effects-of-elevation",
  "epsilon-not-other-side-of-the-wave",
  "kai-engel-anxiety",
]);
const PLAYBACK_RANK = new Map(PLAYBACK_ORDER.map((id, index) => [id, index]));

function orderTracksForPlayback(tracks) {
  return tracks
    .map((track, index) => ({ track, index }))
    .sort((left, right) => {
      const leftRank = PLAYBACK_RANK.get(left.track.id) ?? PLAYBACK_ORDER.length;
      const rightRank = PLAYBACK_RANK.get(right.track.id) ?? PLAYBACK_ORDER.length;
      return leftRank - rightRank || left.index - right.index;
    })
    .map(({ track }) => track);
}

function assertLocalPath(value, label, prefix) {
  if (typeof value !== "string" || !value.startsWith(prefix) || value.includes("..") || value.includes("\\")) {
    throw new TypeError(`${label} must be a safe local ${label}`);
  }
}

function assertFinite(value, label, predicate = (number) => number > 0) {
  if (!Number.isFinite(value) || !predicate(value)) throw new TypeError(`${label} must be finite`);
}

function assertSelfContainedRuntimeComment(track) {
  const comment = track.runtime?.metadata?.comment;
  const required = [
    track.attribution,
    track.license.url,
    track.source.page,
    "loudness-normalized",
    "true-peak limited",
    "resampled to 48 kHz stereo",
    "transcoded to 192 kbps MP3",
    "attribution metadata added",
    "No musical changes.",
    track.transformations[0].applied
      ? "objectively detected invalid edge silence was trimmed"
      : "No edge silence was trimmed",
  ];
  if (typeof comment !== "string" || required.some((value) => !comment.includes(value))) {
    throw new TypeError(`${track.id} runtime metadata comment is incomplete`);
  }
}

export function validateTrackLibrary(candidate) {
  if (!candidate || candidate.contractVersion !== 2 || !Array.isArray(candidate.tracks)) {
    throw new TypeError("Track library must use contract version 2");
  }

  const ids = new Set();
  for (const track of candidate.tracks) {
    if (!track || typeof track.id !== "string" || !track.id) throw new TypeError("Every track requires an id");
    if (ids.has(track.id)) throw new TypeError(`Duplicate track id: ${track.id}`);
    ids.add(track.id);
    for (const field of Object.keys(track)) {
      if (!ALLOWED_TRACK_FIELDS.has(field)) {
        throw new TypeError(`${track.id} includes unsupported field ${field}`);
      }
    }
    assertFinite(track.duration, `${track.id} duration`);
    assertFinite(track.bpm, `${track.id} BPM`);
    if (!ALLOWED_LICENSES.has(track.license?.id)) throw new TypeError(`${track.id} license is not allowed`);
    if (typeof track.license?.url !== "string" || !track.license.url.startsWith("https://creativecommons.org/")) {
      throw new TypeError(`${track.id} license URL is invalid`);
    }
    if (typeof track.attribution !== "string" || !track.attribution.includes(track.source?.performer ?? "\0")) {
      throw new TypeError(`${track.id} attribution is incomplete`);
    }
    if (!track.source?.page?.startsWith("https://commons.wikimedia.org/wiki/File:")) {
      throw new TypeError(`${track.id} source page is invalid`);
    }
    if (!track.source?.download?.startsWith("https://commons.wikimedia.org/wiki/Special:Redirect/file/")) {
      throw new TypeError(`${track.id} source download is invalid`);
    }
    if (typeof track.source?.originalFilename !== "string" || !track.source.originalFilename) {
      throw new TypeError(`${track.id} original filename is required`);
    }
    if (!HASH_PATTERN.test(track.source?.sha256 ?? "")) throw new TypeError(`${track.id} source hash is invalid`);
    if (!HASH_PATTERN.test(track.runtime?.sha256 ?? "")) throw new TypeError(`${track.id} runtime hash is invalid`);
    if (!HASH_PATTERN.test(track.analysis?.sha256 ?? "")) throw new TypeError(`${track.id} analysis hash is invalid`);
    if (!HASH_PATTERN.test(track.cover?.sha256 ?? "")) throw new TypeError(`${track.id} cover hash is invalid`);
    if (track.source.identityVerified !== true) throw new TypeError(`${track.id} source identity is not verified`);
    assertFinite(track.source.bytes, `${track.id} source bytes`);
    assertFinite(track.runtime.bytes, `${track.id} runtime bytes`);
    assertFinite(track.analysis.bytes, `${track.id} analysis bytes`);
    assertFinite(track.cover?.bytes, `${track.id} cover bytes`);
    assertLocalPath(track.source.localPath, `${track.id} source path`, "assets/source/pulse-room/music/original/");
    assertLocalPath(track.runtime?.path, `${track.id} runtime path`, "projects/pulse-room/assets/music/runtime/");
    assertLocalPath(track.runtime?.url, `${track.id} runtime URL`, "./assets/music/runtime/");
    assertLocalPath(track.analysis?.path, `${track.id} analysis path`, "projects/pulse-room/assets/music/analysis/");
    assertLocalPath(track.analysis?.url, `${track.id} analysis URL`, "./assets/music/analysis/");
    assertLocalPath(track.cover?.path, `${track.id} cover path`, "projects/pulse-room/assets/covers/");
    assertLocalPath(track.cover?.url, `${track.id} cover URL`, "./assets/covers/");
    if (track.cover.width !== 1600 || track.cover.height !== 1600) {
      throw new TypeError(`${track.id} cover dimensions must be 1600 by 1600`);
    }
    if (track.runtime.sampleRate !== 48000 || track.runtime.channels !== 2 || track.runtime.bitRateKbps !== 192) {
      throw new TypeError(`${track.id} runtime encoding does not match the catalog contract`);
    }
    assertFinite(
      track.runtime.integratedLufs,
      `${track.id} integrated loudness`,
      (value) => value >= -14.6 && value <= -13.4,
    );
    assertFinite(track.runtime.truePeakDb, `${track.id} true peak`, (value) => value <= -1);
    if (!Array.isArray(track.transformations)
      || track.transformations.map(({ operation }) => operation).join(",") !== REQUIRED_TRANSFORMATIONS.join(",")) {
      throw new TypeError(`${track.id} transformation log is incomplete`);
    }
    assertSelfContainedRuntimeComment(track);
  }
  return true;
}

validateTrackLibrary(manifest);

export const BUILT_IN_TRACKS = Object.freeze(orderTracksForPlayback(manifest.tracks).map(adaptCatalogTrack));

export function getBuiltInTracks() {
  return [...BUILT_IN_TRACKS];
}
