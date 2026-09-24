# PULSE ROOM Corresponding Source

The complete preferred source for modifying PULSE ROOM spans several
repository locations, not only `projects/pulse-room/` or the generated
JavaScript bundles:

- `projects/pulse-room/` contains the retained and modified Mineradio frontend,
  the committed pinned upstream snapshot, PULSE runtime, playback, analysis,
  worker, test, and generated source-map files;
- root `scripts/` contains the PULSE build, import, music-preparation,
  validation, analysis, and QA programs;
- `assets/source/pulse-room/` contains the local music sources and historical
  portfolio asset records under their recorded separate terms;
- `assets/runtime/pulse-room/` contains historical portfolio assets under
  their recorded separate terms; the local replica does not load or bundle
  those model assets;
- root `package.json` and `package-lock.json` freeze the build entry points and
  JavaScript dependency graph;
- root `requirements-qa.txt` freezes the Python browser-QA dependencies;
- source maps and provenance records;
- local media attribution and transformation records.

Run every command below from the repository root.

## Prerequisites

- Node.js and npm compatible with the checked-in `package-lock.json`
- FFmpeg and FFprobe available on `PATH`, or supplied through `FFMPEG_PATH`
  and `FFPROBE_PATH`
- Python 3 for the static preview server and permanent browser QA

Install the frozen JavaScript dependencies:

```powershell
npm ci
```

Install the frozen Python browser-QA dependencies and Chromium runtime:

```powershell
python -m pip install -r requirements-qa.txt
python -m playwright install chromium
```

## Build

Build the static PULSE ROOM distribution:

```powershell
npm run build:pulse-room
```

The build has two explicit browser stages: `src/pulse/runtime-bootstrap.js`
provides the local catalog, playback, and analysis adapters, while
the ordered files in `src/mineradio/module-order.json` provide the reduced
Mineradio-derived scene and control layer. `MINERADIO_UPSTREAM.json` is the
complete provenance record for every retained Mineradio JavaScript file.

The committed byte-identical upstream baseline is stored under
`upstream/mineradio-2.0.2/`. Its `SNAPSHOT.json` records the byte count and
SHA-256 of every retained upstream file, including all 100 browser modules.
Normal builds use this local snapshot and do not require GitHub or any other
network service.

The pre-fork independent prototype (`src/main.js`, `src/audio-player.js`,
`src/queue-state.js`, and `src/demo-track.js`) is intentionally not part of the
corresponding source because it has been retired rather than shipped as an
alternate player. The old visual-settings persistence module was also removed;
PULSE ROOM exposes no provider, account, desktop, lyrics, podcast, DJ AutoMix,
or Wallpaper Engine runtime boundary.

## Tests

Run the PULSE ROOM tests:

```powershell
node --test projects/pulse-room/test/*.test.js
```

Validate the local assets:

```powershell
npm run validate:pulse-assets
```

Run the permanent desktop/mobile browser suite against its managed no-Range
server fixture:

```powershell
npm run qa:pulse
```

The runner records screenshots, structured results, seek precision, WebGL
renderer identity, FPS, GPU resource counts, axe results, failure injection,
and browser events under `artifacts/pulse-room/playwright-qa/`.

## Music Acquisition and Preparation

Acquire or verify the four frozen Wikimedia Commons source objects, then
recreate the normalized 48 kHz stereo 192 kbps runtime audio:

```powershell
node scripts/acquire-pulse-music.mjs
node scripts/prepare-pulse-music.mjs
```

The acquisition script uses only `Special:Redirect/file` routes, follows
Wikimedia redirects, bounds download size, requires audio content, and rejects
any object whose frozen byte count or SHA-256 differs. Preparation performs
technical changes only: full decoding, objective invalid edge-silence
detection, loudness normalization, true-peak control, attribution-preserving
metadata, resampling, and web transcoding. It does not rearrange the recordings.

## Music Analysis

Regenerate the deterministic offline analysis data from the prepared runtime
audio:

```powershell
npm run analyze:pulse-tracks
```

## Static Hosting

After building, serve the application with a plain static server:

```powershell
python -m http.server 8000 --directory projects/pulse-room
```

Open `http://localhost:8000/`. PULSE ROOM does not require the Mineradio
Electron process, backend server, online music providers, accounts, service
credentials, or privileged desktop APIs.

## Upstream Reproduction

The Mineradio origin is pinned by `MINERADIO_UPSTREAM.json` to version 2.0.2,
commit `4abaa19`, from
`https://github.com/XxHuberrr/Mineradio`. The committed snapshot and retained
source records contain the exact upstream SHA-256 values.

To audit or recreate only the pinned snapshot from the upstream repository,
run:

```powershell
node scripts/import-mineradio-snapshot.mjs
```

This command is a provenance tool, not a build step. It requires network
access, refuses a tree that does not contain exactly 100 frontend modules, and
rewrites `SNAPSHOT.json` only after hashing every selected file. See
`NOTICE.md` for the modification summary and `LICENSE` for GPL-3.0-only.
