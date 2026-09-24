import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const projectRoot = new URL("../", import.meta.url);

test("player delegates visuals to the authored performance director", async () => {
  const [html, main, visualizer] = await Promise.all([
    readFile(new URL("index.html", projectRoot), "utf8"),
    readFile(new URL("src/main.js", projectRoot), "utf8"),
    readFile(new URL("src/visualizer.js", projectRoot), "utf8"),
  ]);

  assert.doesNotMatch(html, /APERTURE|RIBBON|GRID|mode-switch/);
  assert.doesNotMatch(main, /querySelectorAll\(["']\[data-mode\]/);
  assert.match(main, /visualizer\.selectTrack\(track/);
  assert.match(visualizer, /createPerformanceDirector/);
  assert.match(visualizer, /onContextLost/);
  assert.match(visualizer, /onContextRestored/);
  assert.match(visualizer, /loadSignalChrysalisModule/);
  assert.match(visualizer, /loadTriuneGateModule/);
  assert.match(visualizer, /loadNullCathedralModule/);
  assert.match(visualizer, /loadPacketBloomModule/);
  assert.match(html, /id="worldLabel"/);
  assert.match(html, /id="sectionLabel"/);
  assert.match(html, /class="performance-meta" role="group" aria-label=/);
  assert.match(main, /worldLabel/);
  assert.match(main, /sectionLabel/);
  assert.doesNotMatch(html, /锛|杩|鎾|闊|鈫|鈮|浣滃搧|瀵煎叆/);
});
