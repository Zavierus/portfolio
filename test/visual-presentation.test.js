import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

test("homepage keeps project previews uncropped at every breakpoint", async () => {
  const css = await readFile(new URL("styles.css", root), "utf8");
  const projectRules = [...css.matchAll(/\.project-media(?:\s*>\s*img|__channel img|\s*)[^\{]*\{([^}]*)\}/g)]
    .map((match) => match[1])
    .join("\n");

  assert.doesNotMatch(projectRules, /aspect-ratio:\s*(?:16\s*\/\s*8|4\s*\/\s*3)/);
  assert.doesNotMatch(projectRules, /object-fit:\s*cover/);
  assert.match(projectRules, /aspect-ratio:\s*16\s*\/\s*9/);
  assert.match(projectRules, /object-fit:\s*contain/);
});

test("homepage uses the selected high-resolution key art without hiding it in realtime", async () => {
  const [html, fallback] = await Promise.all([
    readFile(new URL("index.html", root), "utf8"),
    readFile(new URL("src/portfolio/hero/hero-fallback.js", root), "utf8"),
  ]);

  assert.match(html, /assets\/hero\/monumental-fracture-keyart\.webp/);
  assert.doesNotMatch(fallback, /data-hero-poster[^\n]+mode\s*!==\s*["']poster["']/);
});
