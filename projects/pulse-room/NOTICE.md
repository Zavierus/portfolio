# PULSE ROOM Notices

## Mineradio Derivative

PULSE ROOM includes a modified browser-frontend derivative of:

- Project: [XxHuberrr/Mineradio](https://github.com/XxHuberrr/Mineradio)
- Upstream version: `2.0.2`
- Pinned upstream commit: `4abaa19`
- Upstream frontend root: `public/`
- Upstream license: `GPL-3.0-only`
- Upstream maintainer and pinned commit author: XxHuberrr
- Upstream `package.json` author field: `Mineradio`

The complete corresponding PULSE ROOM source locations are documented in
`SOURCE.md`; they span `projects/pulse-room/`, the root `scripts/` build tools,
and the separately licensed PULSE paths under `assets/source/` and
`assets/runtime/`. The exact retained-file provenance will be maintained in
`MINERADIO_UPSTREAM.json`.

PULSE ROOM modifications began on 2026-07-28. They replace Mineradio's product
identity and service-oriented desktop shell with a static, local-first PULSE
ROOM soundstage; use a local licensed music catalog and local file import;
adapt playback, particle, camera, shelf, and analysis behavior; and add source,
build, test, and attribution records. The independent pre-fork player and its
generated demo track were retired on 2026-07-29. The distributed application
now has one audio element, one renderer, one catalog-selection path, and no
alternate player entry point.

The 2026-07-29 browser-QA hardening added a traversal-safe no-Range server,
real-GPU desktop/mobile performance evidence, optimized repeated Canvas
readback, inert hidden-drawer focus management, and reproducible Python QA
dependency records. Platform shader optimizer messages and requests cancelled
by the explicit rapid-switch stress test remain recorded separately from
application failures.

The 2026-07-29 Mineradio-first visual revision restored the upstream particle
reveal lifecycle, added track-authored particle programs, returned playback
camera ownership to the Mineradio frontend, and moved the authored GLB worlds
into a dim ambient presentation behind the particle subject. World-cover
capture now isolates existing particle layers, and browser evidence records
the final committed cover identity, particle alpha and visibility, and ambient
presentation for every built-in track.

The 2026-07-31 faithful-local-replica revision superseded that hybrid stage.
It removed the authored GLB world, world-capture, track particle-program, and
Basis/KTX2 runtime paths. Mineradio now owns the visible cover particles,
depth, transitions, camera, shelf, playback, and settings without a second
PULSE world layer.

The derivative does not copy the Mineradio name as a product name, the MR logo,
upstream splash art, service credentials, or provider endpoints. It removes
the Electron application and backend, account and login flows, online search
and recommendations, NetEase Cloud Music, QQ Music, Kugou Music, Qishui Music,
Spotify and other provider integrations, podcasts and DJ-specific modes,
lyrics, weather, update delivery, privileged desktop integration, and
Wallpaper Engine support.

## Retained Runtime Libraries

The application also uses these independently licensed components. Their
copyright and license notices remain effective:

- GSAP 3.15.0, Copyright 2026 GreenSock, under the GSAP Standard License
  identified in the distributed `gsap.min.js` banner.
- music-tempo, Copyright (c) 2017 killercrush, under the MIT License; its
  license text is distributed alongside the runtime file.
- Three.js 0.178.0 under the MIT License.
- postprocessing 6.39.3 under the zlib License.
- Essentia.js 0.1.3 under AGPL-3.0; it is distributed as a separately
  identified analysis dependency and is not relicensed by this notice.

Package versions and transitive dependency records are frozen in the root
`package-lock.json`. Music, models, textures, and other non-code assets retain
the terms documented in `assets/ATTRIBUTIONS.md` and
`assets/music/ATTRIBUTIONS.md`.

## Warranty

PULSE ROOM is provided without warranty, as described by the applicable
licenses. See `LICENSE` for the GNU General Public License version 3 terms.
