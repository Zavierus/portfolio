import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

test("portfolio follows a recruiter-friendly section order", async () => {
  const html = await readFile(new URL("index.html", root), "utf8");
  const sectionIds = ["identity", "work", "outcomes", "experience", "archive", "contact"];
  let cursor = -1;
  for (const id of sectionIds) {
    const next = html.indexOf(`id="${id}"`);
    assert.ok(next > cursor, `${id} should follow the prior section`);
    cursor = next;
  }
  assert.match(html, /class="[^"]*skip-link[^"]*"[^>]*href="#work"/);
  assert.match(html, /data-hero-canvas/);
  assert.match(html, /data-hero-poster/);
});

test("portfolio publishes four portal entrances without duplicate bands", async () => {
  const html = await readFile(new URL("index.html", root), "utf8");
  for (const slug of ["frame-zero", "pulse-room", "set-flow", "player-signal"]) {
    assert.match(html, new RegExp(`projects/${slug}/index\\.html`));
  }
  assert.equal((html.match(/data-project-preview=/g) || []).length, 4);
  assert.equal((html.match(/class="project-band\b/g) || []).length, 0);
  assert.match(html, /class="relic-exhibit reveal"/);
  assert.match(html, /relic-01-poster\.webp/);
});

test("portfolio publishes the redesigned visual editor and resume", async () => {
  const html = await readFile(new URL("index.html", root), "utf8");
  assert.match(html, /class="visual-editor reveal"/);
  assert.match(html, /data-contact-sheet/);
  assert.match(html, /class="visual-editor__companions"/);
  assert.match(html, /assets\/resume\/[^"']+\.pdf/);
  assert.match(html, /\sdownload(?:\s|>)/i);
  await access(new URL("assets/resume/王泽源_Ziaver_个人主简历.pdf", root));
});
