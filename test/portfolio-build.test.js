import assert from "node:assert/strict";
import { access, readFile, stat } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

test("portfolio loads the current module entry and local Three.js runtime", async () => {
  const html = await readFile(new URL("index.html", root), "utf8");
  assert.match(html, /<script type="module" src="\.\/src\/portfolio\/main\.js"><\/script>/);
  await access(new URL("assets/vendor/three.module.js", root));
  await access(new URL("assets/vendor/three.core.js", root));
});

test("portfolio HTML references only existing local resources", async () => {
  const html = await readFile(new URL("index.html", root), "utf8");
  const urls = [...html.matchAll(/(?:href|src)=["'](\.\/[^"'#?]+)["']/g)].map((match) => match[1]);
  for (const url of urls) await access(new URL(url, root));
});

test("homepage hero ships a compact local WebP fallback", async () => {
  const poster = new URL("assets/hero/monumental-fracture-poster.webp", root);
  const [source, stats] = await Promise.all([readFile(poster), stat(poster)]);
  assert.equal(source.toString("ascii", 0, 4), "RIFF");
  assert.equal(source.toString("ascii", 8, 12), "WEBP");
  assert.ok(stats.size > 10_000);
  assert.ok(stats.size < 10 * 1024 * 1024);
});
