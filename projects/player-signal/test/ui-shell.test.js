import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { renderAppShell } from "../src/ui/app-shell.js";

test("working shell exposes the complete evidence workflow without fake counts", () => {
  const html = renderAppShell();

  assert.match(html, /aria-label="搜索 Steam 游戏"/);
  assert.match(html, /data-open-demo/);
  assert.match(html, /重新打开 No Man’s Sky/);
  assert.match(html, /data-source-status/);
  assert.match(html, /data-connector-status/);
  assert.match(html, /data-search-results/);
  assert.match(html, /data-sample-accounting/);
  assert.match(html, /data-classified-count/);
  assert.match(html, /data-unclassified-count/);
  assert.match(html, /data-coverage-bar/);
  assert.match(html, /data-exclusion-reasons/);
  assert.match(html, /data-queue="new"/);
  assert.match(html, /data-queue="growing"/);
  assert.match(html, /data-queue="largest"/);
  assert.match(html, /data-queue="core"/);
  assert.match(html, /data-queue="persistent"/);
  assert.match(html, /data-queue="unclassified"/);
  assert.match(html, /<canvas[^>]+data-signal-canvas/);
  assert.match(html, /data-signal-table/);
  assert.match(html, /data-investigation/);
  assert.match(html, /data-comparison/);
  assert.match(html, /data-export-action/);
  assert.match(html, /data-filter-empty/);
  assert.match(html, /data-unclassified-view/);
  assert.match(html, /data-correction-dialog/);
  assert.equal((html.match(/data-priority-weight=/g) ?? []).length, 3);
  assert.doesNotMatch(html, /data-topic-count="\d/);
  assert.doesNotMatch(html, /FAKE LIVE|实时监控中/);
  assert.match(html, /disabled[^>]*data-game-query|data-game-query[^>]*disabled/);
});

test("shell explains visual encoding and keeps source limitations visible", () => {
  const html = renderAppShell();
  assert.match(html, /圆体大小.*反馈量/s);
  assert.match(html, /亮度.*增长速度/s);
  assert.match(html, /脉冲.*异常偏离/s);
  assert.match(html, /观察值/);
  assert.match(html, /分析判断/);
  assert.match(html, /时间关联不是因果证明/);
  assert.match(html, /不保存玩家身份/);
  assert.match(html, /连接器检测中/);
  assert.match(html, /分类覆盖/);
});

test("document retains a desktop compatibility boundary and production entry", async () => {
  const document = await readFile(new URL("../index.html", import.meta.url), "utf8");
  assert.match(document, /class="desktop-notice"/);
  assert.match(document, /至少 960px/);
  assert.match(document, /src="\.\/app\.bundle\.js/);
});
