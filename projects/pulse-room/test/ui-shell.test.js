import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const project = "projects/pulse-room";
const requiredIds = [
  "album-bg",
  "canvas-container",
  "splash",
  "splash-canvas",
  "splash-wordmark",
  "top-right",
  "view-mode-btn",
  "classic-home",
  "classic-track-list",
  "classic-hero-play",
  "classic-open-queue",
  "classic-progress-bar",
  "classic-progress-fill",
  "classic-progress-thumb",
  "classic-progress-current",
  "classic-progress-duration",
  "fx-fab",
  "fx-panel",
  "preset-grid",
  "playlist-panel",
  "queue-pane",
  "queue-list",
  "thumb-wrap",
  "bottom-bar",
  "progress-bar",
  "progress-fill",
  "progress-thumb",
  "controls",
  "control-cover",
  "control-title-text",
  "control-artist",
  "prev-btn",
  "play-btn",
  "next-btn",
  "mini-queue-btn",
  "volume-slider",
  "time-display",
  "file-input",
  "folder-input",
  "drop-overlay",
  "toast",
  "source-license",
  "portfolio-back",
];
const prohibitedIds = [
  "search-area",
  "user-btn",
  "login-modal",
  "home-platform-recommend-mask",
  "stage-lyrics",
  "wallpaper-engine-layer",
  "update-modal",
  "desktop-titlebar",
];

function visibleButtonRecords(html) {
  const visible = html.split('<div id="pulse-legacy-adapter"', 1)[0];
  return [...visible.matchAll(/<button\b([^>]*)>([\s\S]*?)<\/button>/gi)].map((match) => ({
    attributes: match[1],
    content: match[2],
  }));
}

test("the shell exposes the faithful local Mineradio surface", async () => {
  const html = await readFile(`${project}/index.html`, "utf8");
  for (const id of requiredIds) {
    assert.match(html, new RegExp(`\\bid=["']${id}["']`), `missing #${id}`);
  }
  for (const id of prohibitedIds) {
    assert.doesNotMatch(
      html,
      new RegExp(`\\bid=["']${id}["']`),
      `removed #${id} must not be present`,
    );
  }
  assert.match(html, /<body\b[^>]*data-product=["']pulse-room["']/i);
  assert.match(html, /<audio\b[^>]*id=["']audio["'][^>]*preload=["']metadata["']/i);
  assert.match(html, /Based on Mineradio 2\.0\.2/);
  assert.match(html, /href=["']\.\/NOTICE\.md["']/i);
  assert.match(html, /href=["']\.\/SOURCE\.md["']/i);
  assert.match(html, /href=["']\.\/assets\/music\/ATTRIBUTIONS\.md["']/i);
  assert.match(html, /id=["']top-right["'][^>]*role=["']group["'][^>]*aria-label=/i);
  assert.match(html, /id=["']view-mode-btn["'][^>]*aria-pressed=["']false["']/i);
  assert.match(html, /id=["']classic-home["'][^>]*aria-hidden=["']true["'][^>]*\binert\b/i);
  assert.match(html, /id=["']splash-wordmark["'][^>]*role=["']img["'][^>]*aria-label=["']PULSE ROOM["']/i);
  assert.match(html, /id=["']custom-bg-video["'][^>]*aria-hidden=["']true["'][^>]*tabindex=["']-1["']/i);
});

test("every visible button has a stable accessible name", async () => {
  const html = await readFile(`${project}/index.html`, "utf8");
  for (const button of visibleButtonRecords(html)) {
    const ariaLabel = button.attributes.match(/\baria-label=["']([^"']+)["']/i)?.[1]?.trim();
    const text = button.content.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    assert.ok(ariaLabel || text, `unnamed button: <button${button.attributes}>`);
  }
  assert.match(html, /id=["']fx-fab["'][^>]*aria-controls=["']fx-panel["']/i);
  assert.match(html, /id=["']mini-queue-btn["'][^>]*aria-controls=["']mini-queue-popover["']/i);
  assert.match(html, /id=["']bottom-handle["'][^>]*aria-controls=["']bottom-bar["']/i);
});

test("the shell loads pinned styles and the four runtime scripts", async () => {
  const html = await readFile(`${project}/index.html`, "utf8");
  const styles = [
    ...html.matchAll(/<link\b[^>]*rel=["']stylesheet["'][^>]*href=["']([^"']+)["'][^>]*>/gi),
  ].map((match) => match[1]);
  assert.deepEqual(styles, ["./styles/index.css", "./styles/local.css"]);

  const expectedScripts = [
    "../../assets/project-entry-transition.js",
    "./assets/vendor/music-tempo.min.js",
    "./assets/vendor/gsap.min.js",
    "./runtime-bootstrap.bundle.js",
    "./app.bundle.js",
  ];
  const scripts = [
    ...html.matchAll(/<script\b[^>]*src=["']([^"']+)["'][^>]*><\/script>/gi),
  ].map((match) => match[1]);
  assert.deepEqual(scripts, expectedScripts);
  assert.ok(html.lastIndexOf("</script>") < html.lastIndexOf("</body>"));
});

test("the base stylesheet is the pinned upstream stylesheet", async () => {
  const [published, upstream, local] = await Promise.all([
    readFile(`${project}/styles/index.css`, "utf8"),
    readFile(
      `${project}/upstream/mineradio-2.0.2/public/css/index.css`,
      "utf8",
    ),
    readFile(`${project}/styles/local.css`, "utf8"),
  ]);
  assert.equal(published.replace(/\r\n/g, "\n"), upstream.replace(/\r\n/g, "\n"));
  assert.match(local, /PULSE local-only adapters/);
  assert.match(local, /:focus-visible/);
  assert.match(local, /prefers-reduced-motion:\s*reduce/);
  await assert.rejects(access(`${project}/styles.css`));
});

test("the visible shell contains no online or desktop workflow", async () => {
  const html = await readFile(`${project}/index.html`, "utf8");
  assert.doesNotMatch(
    html,
    /music\.163\.com|y\.qq\.com|kugou\.com|qishui|spotify|electronAPI|ipcRenderer|wallpaperPropertyListener/i,
  );
  assert.doesNotMatch(
    html,
    /account-panel|login-panel|provider-panel|podcast-panel|desktop-lyrics|cuefield|automix/i,
  );
});

test("hidden panels stay inert and closing returns focus to their trigger", async () => {
  const [html, fxBindings, queueShell, panelShell] = await Promise.all([
    readFile(`${project}/index.html`, "utf8"),
    readFile(`${project}/src/mineradio/07-fx/07-bindings-shelf-immersive.js`, "utf8"),
    readFile(`${project}/src/mineradio/05-playback/18-playlist-panel-shell.js`, "utf8"),
    readFile(`${project}/src/mineradio/10-shell/02-peek-panels-upload.js`, "utf8"),
  ]);
  for (const id of ["fx-panel", "playlist-panel", "mini-queue-popover"]) {
    assert.match(
      html,
      new RegExp(`id=["']${id}["'][^>]*aria-hidden=["']true["'][^>]*\\binert\\b`, "is"),
    );
  }
  assert.match(panelShell, /function setPulsePanelVisibility\s*\(/);
  assert.match(panelShell, /setAttribute\(['"]aria-hidden['"]/);
  assert.match(panelShell, /element\.inert\s*=\s*!open/);
  assert.match(panelShell, /returnTarget\.focus/);
  assert.match(fxBindings, /setPulsePanelVisibility\(panel, open, ['"]fx['"]/);
  assert.match(queueShell, /setPulsePanelVisibility\(el, open, ['"]pl['"]/);
  assert.match(queueShell, /focusWasInside[\s\S]*btn\.focus/);
});

test("mobile chrome uses viewport-stable safe regions", async () => {
  const css = await readFile(`${project}/styles/local.css`, "utf8");
  assert.match(css, /max-width:\s*calc\(100dvw\s*-\s*20px\)/);
  assert.match(css, /env\(safe-area-inset-(?:left|right|bottom)/);
  assert.match(css, /#controls[\s\S]*min-width:\s*0/);
  assert.match(css, /#control-title-text[\s\S]*text-overflow:\s*ellipsis/);
});

test("entry prepares idle metadata art and a visible unified space without autoplay", async () => {
  const [entry, playbackCover, loader, field] = await Promise.all([
    readFile(`${project}/src/mineradio/10-shell/00-gesture-control.js`, "utf8"),
    readFile(`${project}/src/mineradio/05-playback/13-playback-start-audio.js`, "utf8"),
    readFile(`${project}/src/mineradio/03-beat/05-cover-loading-crop.js`, "utf8"),
    readFile(`${project}/src/mineradio/02-visual/15-ripples-cover-depth.js`, "utf8"),
  ]);
  assert.match(entry, /commitPulseTrackCover\([^;]+idlePreview:\s*true/);
  assert.doesNotMatch(entry, /\.play\s*\(/);
  assert.match(playbackCover, /commitPulseTrackCover\(song, token, extraOptions\)/);
  assert.match(loader, /function applyCoverCanvas[\s\S]*thumb-cover/);
  assert.match(field, /musicSpace\.visible = true/);
});

test("classic mode shares the visible playback metadata adapter", async () => {
  const [startup, playback, cover] = await Promise.all([
    readFile(`${project}/src/mineradio/10-shell/05-startup-bindings.js`, "utf8"),
    readFile(`${project}/src/mineradio/05-playback/13-playback-start-audio.js`, "utf8"),
    readFile(`${project}/src/mineradio/03-beat/05-cover-loading-crop.js`, "utf8"),
  ]);
  assert.match(startup, /function updateControlTrackInfo\(song\)/);
  assert.match(startup, /function setControlCoverSrc\(src\)/);
  assert.match(startup, /function updatePulseAppMode\(mode, options\)/);
  assert.match(startup, /selectPulseTrack\(track\.id, \{ origin: 'classic-home'/);
  assert.match(playback, /typeof updateControlTrackInfo === 'function'/);
  assert.match(cover, /typeof setControlCoverSrc === 'function'/);
});
