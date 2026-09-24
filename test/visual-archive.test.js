import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

test("visual archive publishes separated visual lanes including video", async () => {
  const [home, page, data] = await Promise.all([
    readFile(new URL("index.html", root), "utf8"),
    readFile(new URL("projects/visual-archive/index.html", root), "utf8"),
    import("../projects/visual-archive/data.js"),
  ]);

  assert.match(home, /id="archive"/);
  assert.match(home, /projects\/visual-archive\/index\.html\?category=video/);
  assert.match(home, /projects\/visual-archive\/index\.html\?category=photography/);
  assert.match(home, /projects\/visual-archive\/index\.html\?category=design/);
  assert.match(home, /projects\/visual-archive\/index\.html\?category=dynamic/);
  assert.match(page, /data-gallery-grid/);
  assert.match(page, /<script type="module" src="\.\/app\.js"><\/script>/);
  assert.deepEqual(data.categories.map(({ id }) => id), ["video", "photography", "design", "dynamic"]);
  assert.equal(data.items.filter(({ category }) => category === "video").length, 51);
  assert.equal(data.items.filter(({ category }) => category === "photography").length, 205);
  assert.equal(data.items.filter(({ category }) => category === "design").length, 10);
  assert.equal(data.items.filter(({ category }) => category === "dynamic").length, 1);
});

test("visual archive item files stay inside the project and exist", async () => {
  const { items } = await import("../projects/visual-archive/data.js");
  for (const item of items) {
    assert.ok(item.file.startsWith("./assets/"));
    await access(new URL(item.file, new URL("../projects/visual-archive/", import.meta.url)));
  }
});

test("WeChat editorial card preserves the original article URL", async () => {
  const { items } = await import("../projects/visual-archive/data.js");
  const editorial = items.find(({ category }) => category === "dynamic");
  assert.equal(editorial.href, "https://mp.weixin.qq.com/s/T9odAzfl-W1A7EnxlHiejg");
  assert.match(editorial.file, /recruitment-wechat-cover\.jpg$/);
  assert.equal(editorial.author, "Bancs 音乐社");
  assert.equal(editorial.status, "可直达原文");
});
