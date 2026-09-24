import assert from "node:assert/strict";
import test from "node:test";

import { getAppShellMarkup } from "../src/ui/app-shell.js";
import { createExampleProject } from "../src/domain/example-project.js";

test("desktop shell exposes the planning regions and real project controls", () => {
  const markup = getAppShellMarkup(createExampleProject());

  assert.match(markup, /aria-label="场景和资产"/);
  assert.match(markup, /aria-label="三维空间视口"/);
  assert.match(markup, /data-studio-canvas/);
  assert.match(markup, /data-viewport-fallback-message/);
  assert.match(markup, /data-retry-viewport/);
  assert.match(markup, /CAM A \/ 主机位/);
  assert.match(markup, /CAM B \/ 特写机位/);
  assert.match(markup, /data-camera-monitor="camera-primary"/);
  assert.match(markup, /data-camera-monitor="camera-detail"/);
  assert.match(markup, /data-safe-zone="subtitle"/);
  assert.match(markup, /aria-label="检查台"/);
  assert.match(markup, /aria-label="对象数值变换"/);
  assert.match(markup, /data-transform-mode="translate"/);
  assert.match(markup, /data-transform-mode="rotate"/);
  assert.match(markup, /data-action="save"/);
  assert.match(markup, /data-action="undo"/);
  assert.match(markup, /data-action="redo"/);
  assert.match(markup, /data-action="export"/);
  assert.match(markup, /data-action="versions"/);
  assert.match(markup, /data-version-panel/);
  assert.match(markup, /data-version-name/);
  assert.match(markup, /data-compare-left/);
  assert.match(markup, /data-compare-right/);
  assert.match(markup, /data-version-contact-sheet/);
  assert.match(markup, /data-comparison-media/);
});

test("shell exposes live geometry and a real rule result mount without fake scores", () => {
  const markup = getAppShellMarkup(createExampleProject());

  assert.match(markup, /单击选择 · 拖拽旋转 · 滚轮缩放 · 双击聚焦/);
  assert.match(markup, /RULE ENGINE \/ ACTIVE/);
  assert.match(markup, /data-issue-list/);
  assert.match(markup, /data-issue-count/);
  assert.doesNotMatch(markup, /(?:score|评分|98%|100%)/i);
  assert.doesNotMatch(markup, /disabled/);
});

test("the document keeps a desktop-only compatibility notice", async () => {
  const html = await import("node:fs/promises").then(({ readFile }) =>
    readFile(new URL("../index.html", import.meta.url), "utf8"),
  );

  assert.match(html, /class="desktop-notice"/);
  assert.match(html, /至少 960px/);
  assert.doesNotMatch(html, /foundation|in progress|Preparing the project model/i);
  assert.match(html, /2026-08-14-release/);
});

test("shell exposes real project settings scene actions and asset library", () => {
  const markup = getAppShellMarkup(createExampleProject());

  assert.match(markup, /data-project-settings/);
  for (const name of ["room-width", "room-depth", "room-height", "budget-limit", "default-aspect"]) {
    assert.match(markup, new RegExp(`name="${name}"`));
  }
  assert.match(markup, /autocomplete="off"/);
  assert.match(markup, /data-selection-action="locate"/);
  assert.match(markup, /data-selection-action="duplicate"/);
  assert.match(markup, /data-selection-action="lock"/);
  assert.match(markup, /data-selection-action="delete"/);
  assert.match(markup, /data-asset-library/);
  assert.match(markup, /data-add-asset="garment-rack"/);
  assert.match(markup, /data-camera-id="camera-primary"/);
  assert.match(markup, /data-camera-form/);
  assert.match(markup, /name="camera-focal-length"/);
  assert.match(markup, /data-delete-dialog/);
  assert.doesNotMatch(markup, /下一阶段|foundation|in progress/i);
});

test("switch controls publish pressed state and delete uses a native dialog", () => {
  const markup = getAppShellMarkup(createExampleProject());

  assert.match(markup, /data-view="isometric"[^>]*aria-pressed="true"/);
  assert.match(markup, /data-view="top"[^>]*aria-pressed="false"/);
  assert.match(markup, /data-transform-mode="translate"[^>]*aria-pressed="true"/);
  assert.match(markup, /<dialog[^>]*data-delete-dialog/);
  assert.match(markup, /data-delete-confirm/);
});

test("shell exposes a compact accessible usage guide", () => {
  const markup = getAppShellMarkup(createExampleProject());

  assert.match(markup, /data-action="guide"/);
  assert.match(markup, /<dialog[^>]*data-guide-dialog[^>]*aria-labelledby="guide-dialog-title"/);
  assert.match(markup, /id="guide-dialog-title"[^>]*>快速上手</);
  for (const label of ["添加设备", "调整场景", "检查问题", "保存交付"]) {
    assert.match(markup, new RegExp(label));
  }
  for (const shortcut of ["W", "E", "Delete", "Ctrl + Z"]) {
    assert.ok(markup.includes(`<kbd>${shortcut}</kbd>`));
  }
  assert.match(markup, /data-close-guide/);
});
