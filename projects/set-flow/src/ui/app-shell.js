import { listAssetDefinitions } from "../assets/asset-catalog.js";

function escapeMarkup(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

const LIBRARY_TYPES = [
  "presenter",
  "garment-rack",
  "live-table",
  "backdrop",
  "key-light",
  "rim-light",
  "light-stand",
  "monitor",
  "changing-zone-marker",
];

function assetListMarkup(project) {
  return project.assets.map((asset, index) => `
    <li>
      <button class="asset-row${index === 0 ? " is-selected" : ""}" type="button" data-selection-kind="asset" data-asset-id="${escapeMarkup(asset.id)}" aria-pressed="${index === 0}">
        <span class="asset-row__index">${String(index + 1).padStart(2, "0")}</span>
        <span><strong>${escapeMarkup(asset.name)}</strong><small>${escapeMarkup(asset.type)}</small></span>
        <span class="scene-row__meta"><i aria-hidden="true">${asset.locked ? "LOCK" : "EDIT"}</i><b data-issue-badge data-issue-asset="${escapeMarkup(asset.id)}"></b></span>
      </button>
    </li>`).join("");
}

function cameraListMarkup(project) {
  return project.cameras.map((camera, index) => `
    <li>
      <button class="asset-row asset-row--camera" type="button" data-selection-kind="camera" data-camera-id="${escapeMarkup(camera.id)}" aria-pressed="false">
        <span class="asset-row__index">C${index + 1}</span>
        <span><strong>${escapeMarkup(camera.name)}</strong><small>${escapeMarkup(camera.role)} · ${escapeMarkup(camera.aspect)}</small></span>
        <span class="scene-row__meta"><i aria-hidden="true">${Number(camera.focalLength).toFixed(0)} MM</i><b data-issue-badge data-issue-camera="${escapeMarkup(camera.id)}"></b></span>
      </button>
    </li>`).join("");
}

function sceneTreeMarkup(project) {
  return `<div class="scene-tree__group"><span>OBJECTS / ${String(project.assets.length).padStart(2, "0")}</span><ol class="asset-list">${assetListMarkup(project)}</ol></div>
    <div class="scene-tree__group"><span>CAMERAS / ${String(project.cameras.length).padStart(2, "0")}</span><ol class="asset-list">${cameraListMarkup(project)}</ol></div>`;
}

function assetLibraryMarkup() {
  const definitions = new Map(listAssetDefinitions().map((item) => [item.type, item]));
  return LIBRARY_TYPES.map((type) => {
    const item = definitions.get(type);
    return `<button type="button" data-add-asset="${escapeMarkup(type)}"><span>${escapeMarkup(item.displayName)}</span><small>${escapeMarkup(type)}</small><b>＋</b></button>`;
  }).join("");
}

function previewMarkup(version, key, label) {
  const source = version?.previews?.[key];
  const [width, height] = key === "top" ? [640, 420] : [360, 640];
  return source
    ? `<figure><img src="${escapeMarkup(source)}" alt="${escapeMarkup(`${version.name} / ${label}`)}" width="${width}" height="${height}" loading="lazy" decoding="async"><figcaption>${escapeMarkup(label)}</figcaption></figure>`
    : `<figure class="is-missing"><div>画面未获取</div><figcaption>${escapeMarkup(label)}</figcaption></figure>`;
}

function evidenceList(title, items, emptyMessage) {
  return `<section><span>${escapeMarkup(title)}</span>${items.length
    ? `<ul>${items.map((item) => `<li>${escapeMarkup(item.message || item.after || item.before || item.id)}</li>`).join("")}</ul>`
    : `<p>${escapeMarkup(emptyMessage)}</p>`}</section>`;
}

export function getAppShellMarkup(project) {
  const totalCost = project.assets.reduce((sum, asset) => sum + Number(asset.cost || 0), 0);
  return `
    <div class="editor-shell">
      <nav class="command-bar" aria-label="工程操作">
        <div class="project-identity">
          <span>PROJECT / 01</span>
          <strong data-project-name>${escapeMarkup(project.name)}</strong>
        </div>
        <div class="command-bar__group">
          <button type="button" data-action="save" data-tooltip="保存到本机" aria-label="保存工程"><span aria-hidden="true">SAVE</span><b>保存</b></button>
          <button type="button" data-action="undo" data-tooltip="撤销上一步" aria-label="撤销"><span aria-hidden="true">↶</span><b>撤销</b></button>
          <button type="button" data-action="redo" data-tooltip="重做上一步" aria-label="重做"><span aria-hidden="true">↷</span><b>重做</b></button>
          <button type="button" data-action="versions" data-tooltip="保存并比较方案" aria-label="版本与对比"><span aria-hidden="true">A/B</span><b>版本</b></button>
          <button type="button" data-action="export" data-tooltip="导出工程、清单、画面和打印报告" aria-label="导出执行包"><span aria-hidden="true">EXPORT</span><b>导出</b></button>
          <button type="button" data-action="guide" data-tooltip="查看基本操作与快捷键" aria-label="打开使用说明"><span aria-hidden="true">?</span><b>说明</b></button>
        </div>
        <p class="save-state" data-save-state role="status" aria-live="polite">本地工程已就绪</p>
      </nav>

      <aside class="version-panel" data-version-panel aria-label="版本与方案对比" hidden>
        <header><div><span>VERSION LEDGER</span><strong>版本与方案对比</strong></div><button type="button" data-close-versions aria-label="关闭版本面板">×</button></header>
        <form class="version-create" data-version-form>
          <label for="set-flow-version-name">保存当前方案</label>
          <div><input id="set-flow-version-name" data-version-name name="version-name" type="text" maxlength="42" autocomplete="off" placeholder="例如：方案 A / 主播动线优先…"><button type="submit">保存版本</button></div>
        </form>
        <section class="version-ledger" aria-label="已保存版本">
          <span>SAVED SNAPSHOTS</span>
          <div data-version-list data-version-contact-sheet><p>尚未保存版本。</p></div>
        </section>
        <section class="version-compare" aria-label="方案对比">
          <span>SIDE-BY-SIDE EVIDENCE</span>
          <div class="version-selects">
            <label>基准方案<select data-compare-left aria-label="基准方案"></select></label>
            <label>对比方案<select data-compare-right aria-label="对比方案"></select></label>
          </div>
          <button type="button" data-compare-action>比较两个版本</button>
          <div class="comparison-result" data-comparison-result data-comparison-media><p>保存至少两个命名版本后，可以比较对象变化和问题增减。</p></div>
        </section>
      </aside>

      <aside class="asset-rail" aria-label="场景和资产">
        <header class="panel-heading">
          <div><span>SCENE</span><strong>场景与资产</strong></div>
          <b data-asset-count>${String(project.assets.length).padStart(2, "0")}</b>
        </header>
        <div class="room-summary">
          <span>ROOM ENVELOPE</span>
          <strong data-room-size>${project.room.width.toFixed(2)} × ${project.room.depth.toFixed(2)} × ${project.room.height.toFixed(2)} m</strong>
        </div>
        <details class="project-settings" open>
          <summary><span>PROJECT SETTINGS</span><strong>工程规格</strong></summary>
          <form data-project-settings autocomplete="off">
            <fieldset><legend>空间尺寸 / M</legend>
              <label>宽<input name="room-width" type="number" min="1" max="30" step="0.1" value="${project.room.width.toFixed(1)}"></label>
              <label>深<input name="room-depth" type="number" min="1" max="30" step="0.1" value="${project.room.depth.toFixed(1)}"></label>
              <label>高<input name="room-height" type="number" min="1" max="12" step="0.1" value="${project.room.height.toFixed(1)}"></label>
            </fieldset>
            <label class="project-settings__wide">设备预算<input name="budget-limit" type="number" min="0" step="100" value="${Number(project.budget.limit)}"><small>CNY</small></label>
            <label class="project-settings__wide">默认画幅<select name="default-aspect"><option value="9:16"${project.brief.aspect === "9:16" ? " selected" : ""}>9:16 竖屏</option><option value="16:9"${project.brief.aspect === "16:9" ? " selected" : ""}>16:9 横屏</option><option value="1:1"${project.brief.aspect === "1:1" ? " selected" : ""}>1:1 方形</option></select></label>
          </form>
        </details>
        <section class="scene-tree" data-scene-tree data-asset-list aria-label="场景树">${sceneTreeMarkup(project)}</section>
        <div class="selection-actions" role="group" aria-label="所选对象操作">
          <button type="button" data-selection-action="locate" title="在三维视口中定位">定位</button>
          <button type="button" data-selection-action="duplicate" title="复制所选资产">复制</button>
          <button type="button" data-selection-action="lock" title="锁定或解锁所选资产">锁定</button>
          <button type="button" data-selection-action="delete" title="删除所选资产">删除</button>
        </div>
        <details class="asset-library" data-asset-library>
          <summary><span>ASSET LIBRARY</span><strong>添加设备与布景</strong></summary>
          <div>${assetLibraryMarkup()}</div>
        </details>
      </aside>

      <section class="drafting-stage" aria-label="三维空间视口">
        <div class="viewport-toolbar">
          <div><span class="signal-dot" aria-hidden="true"></span><strong>LIVE / 3D SPACE</strong></div>
          <span>GRID 0.10 M</span>
          <div class="view-switch" role="group" aria-label="视图切换">
            <button type="button" data-view="top" aria-pressed="false">俯视</button>
            <button class="is-active" type="button" data-view="isometric" aria-pressed="true">透视</button>
            <button type="button" data-view="front" aria-pressed="false">正面</button>
          </div>
        </div>
        <div class="axis axis--x" aria-hidden="true"><span>0</span><span>1</span><span>2</span><span>3.8 M</span></div>
        <div class="axis axis--y" aria-hidden="true"><span>0</span><span>2</span><span>4</span><span>5.6 M</span></div>
        <canvas class="studio-canvas" data-studio-canvas tabindex="0" aria-label="直播间三维视图"></canvas>
        <div class="viewport-fallback" data-viewport-fallback role="status"><span data-viewport-fallback-message>正在建立三维场景…</span><button type="button" data-retry-viewport hidden>重新加载视口</button></div>
        <div class="viewport-stage-note">
          <span>GEOMETRY / ACTIVE</span>
          <strong>单击选择 · 拖拽旋转 · 滚轮缩放 · 双击聚焦</strong>
        </div>
      </section>

      <aside class="right-desk">
        <section class="monitor-rail" aria-label="机位监看">
          <figure class="monitor monitor--primary">
            <figcaption><span>CAM A / 主机位</span><b>PRIMARY / 9:16</b></figcaption>
            <div class="monitor__frame">
              <div class="monitor__program" data-monitor-program="${escapeMarkup(project.cameras[0]?.id || "camera-primary")}" data-aspect="${escapeMarkup(project.cameras[0]?.aspect || "9:16")}">
                <canvas data-camera-monitor="${escapeMarkup(project.cameras[0]?.id || "camera-primary")}" aria-label="主机位实时画面"></canvas>
                <span class="safe-zone safe-zone--frame" aria-hidden="true"></span>
                <span class="safe-zone safe-zone--head" data-safe-zone="head" aria-hidden="true"></span>
                <span class="safe-zone safe-zone--subtitle" data-safe-zone="subtitle" aria-hidden="true"></span>
                <span class="safe-zone safe-zone--platform" data-safe-zone="platform" aria-hidden="true"></span>
                <span class="monitor__crosshair" aria-hidden="true"></span>
              </div>
            </div>
          </figure>
          <figure class="monitor monitor--detail">
            <figcaption><span>CAM B / 特写机位</span><b>DETAIL / 9:16</b></figcaption>
            <div class="monitor__frame">
              <div class="monitor__program" data-monitor-program="${escapeMarkup(project.cameras[1]?.id || "camera-detail")}" data-aspect="${escapeMarkup(project.cameras[1]?.aspect || "9:16")}">
                <canvas data-camera-monitor="${escapeMarkup(project.cameras[1]?.id || "camera-detail")}" aria-label="特写机位实时画面"></canvas>
                <span class="safe-zone safe-zone--frame" aria-hidden="true"></span>
                <span class="safe-zone safe-zone--product" data-safe-zone="product" aria-hidden="true"></span>
                <span class="safe-zone safe-zone--subtitle" data-safe-zone="subtitle" aria-hidden="true"></span>
                <span class="safe-zone safe-zone--platform" data-safe-zone="platform" aria-hidden="true"></span>
                <span class="monitor__crosshair" aria-hidden="true"></span>
              </div>
            </div>
          </figure>
        </section>

        <section class="inspection-desk" aria-label="检查台">
          <header class="panel-heading"><div><span>INSPECT</span><strong>对象检查台</strong></div><b>LIVE</b></header>
          <div class="selected-asset" data-selected-asset>
            <span>SELECTED</span>
            <strong>${escapeMarkup(project.assets[0]?.name || "未选择对象")}</strong>
            <p>${escapeMarkup(project.assets[0]?.type || "—")}</p>
          </div>
          <div class="transform-mode" role="group" aria-label="变换模式">
            <button class="is-active" type="button" data-transform-mode="translate" aria-pressed="true">移动 <kbd>W</kbd></button>
            <button type="button" data-transform-mode="rotate" aria-pressed="false">旋转 <kbd>E</kbd></button>
          </div>
          <form class="transform-form" data-transform-form aria-label="对象数值变换" autocomplete="off">
            <fieldset><legend>POSITION / M</legend>
              <label>X<input name="position-x" type="number" step="0.1" data-transform-kind="position" data-axis="x" aria-label="位置 X，单位米"></label>
              <label>Y<input name="position-y" type="number" step="0.1" data-transform-kind="position" data-axis="y" aria-label="位置 Y，单位米"></label>
              <label>Z<input name="position-z" type="number" step="0.1" data-transform-kind="position" data-axis="z" aria-label="位置 Z，单位米"></label>
            </fieldset>
            <fieldset><legend>ROTATION / DEG</legend>
              <label>X<input name="rotation-x" type="number" step="1" data-transform-kind="rotation" data-axis="x" aria-label="旋转 X，单位度"></label>
              <label>Y<input name="rotation-y" type="number" step="1" data-transform-kind="rotation" data-axis="y" aria-label="旋转 Y，单位度"></label>
              <label>Z<input name="rotation-z" type="number" step="1" data-transform-kind="rotation" data-axis="z" aria-label="旋转 Z，单位度"></label>
            </fieldset>
            <p class="lock-note" data-lock-note></p>
          </form>
          <form class="camera-form" data-camera-form aria-label="机位数值设置" autocomplete="off" hidden>
            <fieldset><legend>CAMERA POSITION / M</legend>
              <label>X<input name="camera-position-x" type="number" step="0.1" data-camera-kind="position" data-axis="x"></label>
              <label>Y<input name="camera-position-y" type="number" step="0.1" data-camera-kind="position" data-axis="y"></label>
              <label>Z<input name="camera-position-z" type="number" step="0.1" data-camera-kind="position" data-axis="z"></label>
            </fieldset>
            <fieldset><legend>LOOK AT / M</legend>
              <label>X<input name="camera-target-x" type="number" step="0.1" data-camera-kind="target" data-axis="x"></label>
              <label>Y<input name="camera-target-y" type="number" step="0.1" data-camera-kind="target" data-axis="y"></label>
              <label>Z<input name="camera-target-z" type="number" step="0.1" data-camera-kind="target" data-axis="z"></label>
            </fieldset>
            <div class="camera-form__optics">
              <label>焦距<input name="camera-focal-length" type="number" min="12" max="200" step="1"><small>MM</small></label>
              <label>画幅<select name="camera-aspect"><option value="9:16">9:16</option><option value="16:9">16:9</option><option value="1:1">1:1</option></select></label>
            </div>
          </form>
          <div class="rule-state" data-rule-state>
            <span>RULE ENGINE / ACTIVE</span>
            <strong data-issue-summary>正在检查工程规则…</strong>
            <div class="issue-list" data-issue-list aria-live="polite"></div>
          </div>
        </section>
      </aside>

      <footer class="workspace-status">
        <div><span>SCHEMA</span><strong>V${project.schemaVersion}</strong></div>
        <div><span>ASSETS</span><strong data-status-assets>${project.assets.length}</strong></div>
        <div><span>EQUIPMENT</span><strong data-total-cost>¥${totalCost.toLocaleString("zh-CN")}</strong></div>
        <div><span>ISSUES</span><strong data-issue-count>—</strong></div>
        <p data-runtime-message>工程模型、历史记录、本地存储与导出已接入。</p>
      </footer>
    </div>
    <dialog class="usage-guide" data-guide-dialog aria-labelledby="guide-dialog-title">
      <section class="usage-guide__panel">
        <header class="usage-guide__header">
          <div><span>QUICK START / 04 STEPS</span><strong id="guide-dialog-title">快速上手</strong></div>
          <button type="button" data-close-guide aria-label="关闭使用说明">×</button>
        </header>
        <ol class="usage-guide__steps">
          <li><span>01 / BUILD</span><strong>添加设备</strong><p>展开左侧资产库，加入主播区、桌台、灯光和背景等对象。</p></li>
          <li><span>02 / ARRANGE</span><strong>调整场景</strong><p>选中对象后拖动三维操纵轴；也可切换俯视、透视或正面视图。</p></li>
          <li><span>03 / CHECK</span><strong>检查问题</strong><p>点击右侧问题列表，定位碰撞、越界、机位安全区和预算问题。</p></li>
          <li><span>04 / DELIVER</span><strong>保存交付</strong><p>工程会自动保存；命名版本用于比较，导出可生成完整执行包。</p></li>
        </ol>
        <div class="usage-guide__shortcuts" role="group" aria-label="键盘快捷键">
          <span>KEYBOARD</span>
          <ul>
            <li><kbd>W</kbd><span>移动</span></li>
            <li><kbd>E</kbd><span>旋转</span></li>
            <li><kbd>Delete</kbd><span>删除</span></li>
            <li><kbd>Ctrl + Z</kbd><span>撤销</span></li>
          </ul>
        </div>
      </section>
    </dialog>
    <dialog class="delete-dialog" data-delete-dialog aria-labelledby="delete-dialog-title">
      <form method="dialog">
        <span>REMOVE FROM SCENE</span>
        <strong id="delete-dialog-title">删除所选资产？</strong>
        <p data-delete-message>这会从当前工程移除对象，仍可使用撤销恢复。</p>
        <div><button type="submit" value="cancel" data-delete-cancel>保留对象</button><button type="button" data-delete-confirm>确认删除</button></div>
      </form>
    </dialog>`;
}

export function createAppShell(root, callbacks = {}, project) {
  if (!root || typeof root.querySelector !== "function") {
    throw new TypeError("SET//FLOW shell requires a DOM root");
  }

  root.innerHTML = getAppShellMarkup(project);
  const refs = {
    assetList: root.querySelector("[data-asset-list]"),
    projectSettings: root.querySelector("[data-project-settings]"),
    assetLibrary: root.querySelector("[data-asset-library]"),
    assetCount: root.querySelector("[data-asset-count]"),
    roomSize: root.querySelector("[data-room-size]"),
    projectName: root.querySelector("[data-project-name]"),
    selectedAsset: root.querySelector("[data-selected-asset]"),
    transformForm: root.querySelector("[data-transform-form]"),
    cameraForm: root.querySelector("[data-camera-form]"),
    transformMode: root.querySelector(".transform-mode"),
    lockNote: root.querySelector("[data-lock-note]"),
    guideDialog: root.querySelector("[data-guide-dialog]"),
    guideTrigger: root.querySelector('[data-action="guide"]'),
    guideClose: root.querySelector("[data-close-guide]"),
    deleteDialog: root.querySelector("[data-delete-dialog]"),
    deleteMessage: root.querySelector("[data-delete-message]"),
    deleteConfirm: root.querySelector("[data-delete-confirm]"),
    totalCost: root.querySelector("[data-total-cost]"),
    statusAssets: root.querySelector("[data-status-assets]"),
    saveState: root.querySelector("[data-save-state]"),
    issueSummary: root.querySelector("[data-issue-summary]"),
    issueList: root.querySelector("[data-issue-list]"),
    issueCount: root.querySelector("[data-issue-count]"),
    versionPanel: root.querySelector("[data-version-panel]"),
    versionForm: root.querySelector("[data-version-form]"),
    versionName: root.querySelector("[data-version-name]"),
    versionSubmit: root.querySelector('[data-version-form] button[type="submit"]'),
    versionList: root.querySelector("[data-version-list]"),
    compareLeft: root.querySelector("[data-compare-left]"),
    compareRight: root.querySelector("[data-compare-right]"),
    comparisonResult: root.querySelector("[data-comparison-result]"),
    viewportFallbackMessage: root.querySelector("[data-viewport-fallback-message]"),
    retryViewport: root.querySelector("[data-retry-viewport]"),
    undo: root.querySelector('[data-action="undo"]'),
    redo: root.querySelector('[data-action="redo"]'),
  };

  let currentProject = project;
  let currentIssues = [];
  let currentVersions = project.versions || [];
  let viewportRetry = null;
  let selection = { kind: "asset", id: project.assets[0]?.id || null };
  let activeIssueId = null;
  let deleteInvoker = null;
  const removers = [];

  function listen(node, eventName, handler) {
    if (!node || typeof handler !== "function") return;
    node.addEventListener(eventName, handler);
    removers.push(() => node.removeEventListener(eventName, handler));
  }

  for (const [action, callbackName] of [["save", "onSave"], ["undo", "onUndo"], ["redo", "onRedo"], ["export", "onExport"]]) {
    listen(root.querySelector(`[data-action="${action}"]`), "click", callbacks[callbackName]);
  }

  listen(refs.guideTrigger, "click", () => {
    refs.guideDialog.showModal();
    refs.guideClose.focus();
  });
  listen(refs.guideClose, "click", () => refs.guideDialog.close());
  listen(refs.guideDialog, "click", (event) => {
    if (event.target === refs.guideDialog) refs.guideDialog.close();
  });
  listen(refs.guideDialog, "close", () => refs.guideTrigger.focus());

  listen(root.querySelector('[data-action="versions"]'), "click", () => {
    refs.versionPanel.hidden = !refs.versionPanel.hidden;
    if (!refs.versionPanel.hidden) refs.versionName.focus();
  });
  listen(root.querySelector("[data-close-versions]"), "click", () => { refs.versionPanel.hidden = true; });
  listen(refs.versionForm, "submit", async (event) => {
    event.preventDefault();
    const name = refs.versionName.value.trim() || `方案 ${String(currentVersions.length + 1).padStart(2, "0")}`;
    refs.versionSubmit.disabled = true;
    refs.versionSubmit.textContent = "正在保存…";
    try {
      await callbacks.onSaveVersion?.(name);
      refs.versionName.value = "";
    } finally {
      refs.versionSubmit.disabled = false;
      refs.versionSubmit.textContent = "保存版本";
    }
  });
  listen(root.querySelector("[data-compare-action]"), "click", () => {
    callbacks.onCompareVersions?.(refs.compareLeft.value, refs.compareRight.value);
  });
  listen(refs.retryViewport, "click", () => viewportRetry?.());

  for (const button of root.querySelectorAll("[data-view]")) {
    listen(button, "click", () => {
      for (const peer of root.querySelectorAll("[data-view]")) {
        const active = peer === button;
        peer.classList.toggle("is-active", active);
        peer.setAttribute("aria-pressed", String(active));
      }
      callbacks.onSetView?.(button.dataset.view);
    });
  }

  for (const button of root.querySelectorAll("[data-transform-mode]")) {
    listen(button, "click", () => {
      for (const peer of root.querySelectorAll("[data-transform-mode]")) {
        const active = peer === button;
        peer.classList.toggle("is-active", active);
        peer.setAttribute("aria-pressed", String(active));
      }
      callbacks.onSetTransformMode?.(button.dataset.transformMode);
    });
  }

  function setActionState(kind, locked = false) {
    for (const button of root.querySelectorAll("[data-selection-action]")) {
      const action = button.dataset.selectionAction;
      const assetOnly = action !== "locate";
      button.disabled = assetOnly && kind !== "asset";
      if (action === "lock") button.textContent = locked ? "解锁" : "锁定";
    }
  }

  function renderSelection() {
    const asset = selection.kind === "asset" ? currentProject.assets.find((entry) => entry.id === selection.id) : null;
    const camera = selection.kind === "camera" ? currentProject.cameras.find((entry) => entry.id === selection.id) : null;
    if (!asset && !camera) {
      const fallback = currentProject.assets[0] || currentProject.cameras[0];
      if (!fallback) return;
      selection = { kind: currentProject.assets[0] ? "asset" : "camera", id: fallback.id };
      return renderSelection();
    }
    for (const button of refs.assetList.querySelectorAll("[data-selection-kind]")) {
      const buttonId = button.dataset.assetId || button.dataset.cameraId;
      const active = button.dataset.selectionKind === selection.kind && buttonId === selection.id;
      button.classList.toggle("is-selected", active);
      button.setAttribute("aria-pressed", String(active));
    }
    if (camera) {
      refs.selectedAsset.innerHTML = `<span>SELECTED CAMERA</span><strong>${escapeMarkup(camera.name)}</strong><p>${escapeMarkup(camera.role)} / ${escapeMarkup(camera.aspect)} / ${Number(camera.focalLength).toFixed(0)} MM</p>`;
      refs.transformForm.hidden = true;
      refs.cameraForm.hidden = false;
      refs.transformMode.hidden = true;
      for (const input of refs.cameraForm.querySelectorAll("input[data-camera-kind]")) {
        input.value = Number(camera[input.dataset.cameraKind][input.dataset.axis]).toFixed(2);
      }
      refs.cameraForm.elements.namedItem("camera-focal-length").value = Number(camera.focalLength).toFixed(0);
      refs.cameraForm.elements.namedItem("camera-aspect").value = camera.aspect;
      setActionState("camera");
      return;
    }
    refs.selectedAsset.innerHTML = `<span>SELECTED ASSET</span><strong>${escapeMarkup(asset.name)}</strong><p>${escapeMarkup(asset.type)}${asset.locked ? " / 已锁定" : " / 可编辑"}</p>`;
    refs.transformForm.hidden = false;
    refs.cameraForm.hidden = true;
    refs.transformMode.hidden = false;
    const { position, rotation } = asset.transform;
    for (const input of refs.transformForm.querySelectorAll("input[data-transform-kind]")) {
      const kind = input.dataset.transformKind;
      const axis = input.dataset.axis;
      const value = kind === "rotation" ? rotation[axis] * 180 / Math.PI : position[axis];
      input.value = value.toFixed(kind === "rotation" ? 1 : 2);
      input.disabled = Boolean(asset.locked);
    }
    refs.lockNote.textContent = asset.locked
      ? "该对象属于房间基准，已锁定。仍可查看尺寸与位置。"
      : `尺寸 ${asset.dimensions.width.toFixed(2)} × ${asset.dimensions.depth.toFixed(2)} × ${asset.dimensions.height.toFixed(2)} m`;
    refs.lockNote.dataset.locked = String(Boolean(asset.locked));
    setActionState("asset", asset.locked);
  }

  listen(refs.assetList, "click", (event) => {
    const button = event.target.closest("[data-selection-kind]");
    if (!button) return;
    selection = { kind: button.dataset.selectionKind, id: button.dataset.assetId || button.dataset.cameraId };
    renderSelection();
    callbacks.onSelect?.({ ...selection });
    if (selection.kind === "asset") callbacks.onSelectAsset?.(selection.id);
  });

  listen(refs.transformForm, "change", () => {
    if (selection.kind !== "asset" || !selection.id) return;
    const next = { position: {}, rotation: {} };
    for (const input of refs.transformForm.querySelectorAll("input[data-transform-kind]")) {
      const raw = Number.parseFloat(input.value);
      const kind = input.dataset.transformKind;
      const axis = input.dataset.axis;
      next[kind][axis] = kind === "rotation" ? raw * Math.PI / 180 : raw;
    }
    callbacks.onUpdateTransform?.(selection.id, next);
  });

  listen(refs.cameraForm, "change", () => {
    if (selection.kind !== "camera" || !selection.id) return;
    const next = { position: {}, target: {} };
    for (const input of refs.cameraForm.querySelectorAll("input[data-camera-kind]")) {
      next[input.dataset.cameraKind][input.dataset.axis] = Number.parseFloat(input.value);
    }
    next.focalLength = Number.parseFloat(refs.cameraForm.elements.namedItem("camera-focal-length").value);
    next.aspect = refs.cameraForm.elements.namedItem("camera-aspect").value;
    callbacks.onUpdateCamera?.(selection.id, next);
  });

  listen(refs.projectSettings, "change", () => {
    const value = (name) => Number.parseFloat(refs.projectSettings.elements.namedItem(name).value);
    callbacks.onUpdateProjectSettings?.({
      room: { width: value("room-width"), depth: value("room-depth"), height: value("room-height"), unit: currentProject.room.unit },
      budget: { limit: value("budget-limit"), currency: currentProject.budget.currency },
      aspect: refs.projectSettings.elements.namedItem("default-aspect").value,
    });
  });

  listen(refs.assetLibrary, "click", (event) => {
    const button = event.target.closest("[data-add-asset]");
    if (button) callbacks.onAddAsset?.(button.dataset.addAsset);
  });

  listen(root.querySelector(".selection-actions"), "click", (event) => {
    const button = event.target.closest("[data-selection-action]");
    if (!button || button.disabled || !selection.id) return;
    const action = button.dataset.selectionAction;
    if (action === "delete") {
      const selected = currentProject.assets.find((asset) => asset.id === selection.id);
      refs.deleteMessage.textContent = `“${selected?.name || selection.id}”会从当前工程移除，仍可使用撤销恢复。`;
      deleteInvoker = button;
      refs.deleteDialog.showModal();
      return;
    }
    if (action === "locate") callbacks.onLocateSelection?.({ ...selection });
    if (action === "duplicate") callbacks.onDuplicateSelection?.({ ...selection });
    if (action === "lock") {
      const selected = currentProject.assets.find((asset) => asset.id === selection.id);
      callbacks.onSetLocked?.({ ...selection }, !selected?.locked);
    }
  });

  listen(refs.deleteConfirm, "click", () => {
    refs.deleteDialog.close("confirm");
    callbacks.onDeleteSelection?.({ ...selection });
  });
  listen(refs.deleteDialog, "close", () => {
    deleteInvoker?.focus();
    deleteInvoker = null;
  });

  listen(refs.issueList, "click", (event) => {
    const button = event.target.closest("[data-issue-id]");
    if (!button) return;
    const issue = currentIssues.find((entry) => entry.id === button.dataset.issueId);
    if (issue) callbacks.onFocusIssue?.(issue);
  });

  function renderIssueBadges() {
    for (const badge of refs.assetList.querySelectorAll("[data-issue-badge]")) {
      const id = badge.dataset.issueAsset || badge.dataset.issueCamera;
      const count = currentIssues.filter((issue) => issue.assetIds?.includes(id) || issue.cameraId === id).length;
      badge.textContent = count ? String(count) : "";
      badge.hidden = count === 0;
    }
  }

  function sync(nextProject, history = { undoDepth: 0, redoDepth: 0 }) {
    currentProject = nextProject;
    refs.projectName.textContent = nextProject.name;
    refs.assetList.innerHTML = sceneTreeMarkup(nextProject);
    refs.assetCount.textContent = String(nextProject.assets.length).padStart(2, "0");
    refs.statusAssets.textContent = String(nextProject.assets.length);
    refs.roomSize.textContent = `${nextProject.room.width.toFixed(2)} × ${nextProject.room.depth.toFixed(2)} × ${nextProject.room.height.toFixed(2)} m`;
    refs.totalCost.textContent = `¥${nextProject.assets.reduce((sum, asset) => sum + Number(asset.cost || 0), 0).toLocaleString("zh-CN")}`;
    refs.projectSettings.elements.namedItem("room-width").value = nextProject.room.width.toFixed(1);
    refs.projectSettings.elements.namedItem("room-depth").value = nextProject.room.depth.toFixed(1);
    refs.projectSettings.elements.namedItem("room-height").value = nextProject.room.height.toFixed(1);
    refs.projectSettings.elements.namedItem("budget-limit").value = Number(nextProject.budget.limit);
    refs.projectSettings.elements.namedItem("default-aspect").value = nextProject.brief.aspect;
    refs.undo.disabled = history.undoDepth === 0;
    refs.redo.disabled = history.redoDepth === 0;
    renderSelection();
    renderIssueBadges();
  }

  renderSelection();
  return {
    refs,
    sync,
    syncIssues(issues) {
      currentIssues = [...issues];
      refs.issueCount.textContent = String(issues.length);
      refs.issueSummary.textContent = issues.length === 0 ? "当前规则未发现问题" : `发现 ${issues.length} 项需要检查`;
      refs.issueSummary.dataset.state = issues.some((issue) => issue.severity === "critical") ? "critical" : issues.length ? "warning" : "clear";
      refs.issueList.innerHTML = issues.length === 0
        ? '<p class="issue-empty">边界、碰撞、机位安全区和预算均通过当前规则。</p>'
        : issues.map((issue) => `<button class="${issue.id === activeIssueId ? "is-active" : ""}" type="button" data-issue-id="${escapeMarkup(issue.id)}" data-severity="${escapeMarkup(issue.severity)}"${issue.id === activeIssueId ? ' aria-current="true"' : ""}>
            <span>${issue.severity === "critical" ? "必须处理" : issue.severity === "warning" ? "建议检查" : "信息"}</span>
            <strong>${escapeMarkup(issue.message)}</strong>
            <small>${escapeMarkup(issue.suggestion)}</small>
          </button>`).join("");
      renderIssueBadges();
    },
    syncVersions(versions) {
      currentVersions = [...versions];
      refs.versionList.innerHTML = versions.length
        ? versions.map((version, index) => `<article><span>${String(index + 1).padStart(2, "0")}</span>${previewMarkup(version, "top", "三维总览")}<div><strong>${escapeMarkup(version.name)}</strong><small>${escapeMarkup(new Date(version.createdAt).toLocaleString("zh-CN", { hour12: false }))} · ${version.issueIds?.length || 0} 项问题</small></div></article>`).join("")
        : "<p>尚未保存版本。</p>";
      const options = versions.map((version) => `<option value="${escapeMarkup(version.id)}">${escapeMarkup(version.name)}</option>`).join("");
      refs.compareLeft.innerHTML = options;
      refs.compareRight.innerHTML = options;
      if (versions.length > 1) refs.compareRight.value = versions.at(-1).id;
    },
    showComparison(comparison, leftVersion, rightVersion) {
      refs.comparisonResult.innerHTML = `<div class="comparison-head"><span>${escapeMarkup(leftVersion.name)}</span><i aria-hidden="true">→</i><span>${escapeMarkup(rightVersion.name)}</span></div>
        <div class="comparison-contact-sheet">
          <div>${previewMarkup(leftVersion, "top", "三维总览")}${previewMarkup(leftVersion, "primary", "主机位")}</div>
          <div>${previewMarkup(rightVersion, "top", "三维总览")}${previewMarkup(rightVersion, "primary", "主机位")}</div>
        </div>
        <dl>
          <div><dt>对象变化</dt><dd>${comparison.changedAssetCount}</dd></div>
          <div><dt>预算差额</dt><dd>${comparison.budgetDelta >= 0 ? "+" : "−"}¥${Math.abs(comparison.budgetDelta).toLocaleString("zh-CN")}</dd></div>
          <div><dt>已解决</dt><dd>${comparison.resolvedIssueIds.length}</dd></div>
          <div><dt>新增问题</dt><dd>${comparison.newIssueIds.length}</dd></div>
        </dl>
        <div class="comparison-evidence">
          ${evidenceList("CHANGED OBJECTS / 变化对象", comparison.changedAssets, "对象没有变化")}
          ${evidenceList("RESOLVED / 已解决", comparison.resolvedIssues, "没有已解决问题")}
          ${evidenceList("NEW ISSUES / 新增问题", comparison.newIssues, "没有新增问题")}
        </div>
        <p>${comparison.roomChanged ? "房间尺寸有变化。" : "房间尺寸未变化。"}${comparison.cameraChanged ? " 机位参数有变化。" : " 机位参数未变化。"} 这里只展示差异，不自动判断哪个方案更优。</p>`;
    },
    showViewportFailure(message, onRetry) {
      refs.viewportFallbackMessage.textContent = message;
      viewportRetry = typeof onRetry === "function" ? onRetry : null;
      refs.retryViewport.hidden = !viewportRetry;
    },
    selectAsset(assetId) {
      selection = { kind: "asset", id: assetId };
      renderSelection();
    },
    select(nextSelection) {
      selection = { ...nextSelection };
      renderSelection();
    },
    setActiveIssue(issueId) {
      activeIssueId = issueId || null;
      for (const button of refs.issueList.querySelectorAll("[data-issue-id]")) {
        const active = button.dataset.issueId === activeIssueId;
        button.classList.toggle("is-active", active);
        if (active) button.setAttribute("aria-current", "true");
        else button.removeAttribute("aria-current");
      }
    },
    setStatus(message, tone = "neutral") {
      refs.saveState.textContent = message;
      refs.saveState.dataset.tone = tone;
    },
    destroy() { removers.splice(0).forEach((remove) => remove()); },
  };
}
