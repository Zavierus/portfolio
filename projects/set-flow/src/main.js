import { createAssetFromCatalog } from "./assets/asset-catalog.js";
import { createExampleProject } from "./domain/example-project.js";
import { evaluateProject } from "./detection/issue-model.js";
import { createExecutionPackage } from "./export/export-project.js";
import { createTransformController, normalizeTransformForCommit } from "./interactions/transform-controller.js";
import { createProjectRepository } from "./persistence/project-repository.js";
import { createSaveCoordinator } from "./persistence/save-coordinator.js";
import { createCameraMonitors } from "./render/camera-monitor.js";
import { createPerformancePolicy } from "./render/performance-policy.js";
import { createStudioViewport } from "./render/viewport.js";
import { compareVersions, createProjectStore } from "./state/project-store.js";
import { createAppShell } from "./ui/app-shell.js";
import { createIssueEvidenceModel } from "./ui/issue-evidence-model.js";
import { createIssueRepairTracker } from "./ui/issue-repair-state.js";

const root = document.querySelector("[data-set-flow-app]");
const state = document.querySelector("[data-build-state]");
const stateLabel = document.querySelector("[data-build-state-label]");

function downloadText(filename, text, type = "application/json") {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

function downloadDataUrl(filename, dataUrl) {
  const anchor = document.createElement("a");
  anchor.href = dataUrl;
  anchor.download = filename;
  anchor.click();
}

function compactImage(dataUrl, { maxWidth = 720, maxHeight = 520, quality = 0.72 } = {}) {
  if (!dataUrl) return Promise.resolve(null);
  return new Promise((resolve) => {
    const image = new Image();
    image.onload = () => {
      const scale = Math.min(1, maxWidth / image.naturalWidth, maxHeight / image.naturalHeight);
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
      canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
      canvas.getContext("2d")?.drawImage(image, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/jpeg", quality));
    };
    image.onerror = () => resolve(dataUrl);
    image.src = dataUrl;
  });
}

async function startApp() {
  const repository = createProjectRepository();
  let shell;
  const saveCoordinator = createSaveCoordinator({
    repository,
    createFallback: createExampleProject,
    onState(saveState) {
      if (!shell) return;
      const messages = {
        dirty: "有未保存修改 · 正在等待自动保存",
        saving: "正在保存到本机…",
        saved: "已保存到本机",
      };
      shell.setStatus(
        saveState.status === "error" ? `保存失败：${saveState.message}` : messages[saveState.status] || "本地工程已就绪",
        saveState.status === "error" ? "error" : saveState.status === "saved" ? "success" : "neutral",
      );
    },
  });
  const restored = await saveCoordinator.restore();
  const store = createProjectStore(restored.project);
  const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches || false;
  let latestIssues = evaluateProject(store.getState());
  const issueTracker = createIssueRepairTracker(latestIssues);
  const performancePolicy = createPerformancePolicy({
    quality: store.getState().settings.quality,
    devicePixelRatio: window.devicePixelRatio,
    hardwareConcurrency: navigator.hardwareConcurrency,
    reducedMotion,
    assetCount: store.getState().assets.length,
  });
  document.documentElement.dataset.setFlowQuality = performancePolicy.quality;
  let viewport;
  let transformController;
  let cameraMonitors;
  let assetSequence = store.getState().assets.length;

  shell = createAppShell(root, {
    async onSave() {
      await saveCoordinator.saveNow(store.getState());
    },
    onUndo() {
      if (!store.undo()) shell.setStatus("当前没有可撤销的修改");
      else shell.setStatus("已撤销上一步", "success");
    },
    onRedo() {
      if (!store.redo()) shell.setStatus("当前没有可重做的修改");
      else shell.setStatus("已重做上一步", "success");
    },
    onExport() {
      try {
        const monitorCaptures = cameraMonitors?.capture() || {};
        const result = createExecutionPackage(store.getState(), {
          issues: evaluateProject(store.getState()),
          captures: { top: viewport?.capture(), ...monitorCaptures },
        });
        if (!result.ok) {
          shell.setStatus("导出失败：工程数据不完整", "error");
          return;
        }
        result.files.forEach((file, index) => {
          window.setTimeout(() => {
            if (file.dataUrl) downloadDataUrl(file.filename, file.dataUrl);
            else downloadText(file.filename, file.text, file.mime);
          }, index * 90);
        });
        shell.setStatus(`已生成执行包 · ${result.files.length} 个文件`, "success");
      } catch (error) {
        shell.setStatus(`导出失败：${error instanceof Error ? error.message : "浏览器无法生成文件"}`, "error");
      }
    },
    onSelect(nextSelection) {
      if (nextSelection.kind === "asset") {
        viewport?.setSelectedAsset(nextSelection.id);
        transformController?.select(nextSelection.id);
        shell.setStatus(`已选择 ${nextSelection.id}`);
      } else {
        viewport?.setSelectedAsset(null);
        transformController?.select(null);
        shell.setStatus(`正在设置机位 ${nextSelection.id}`);
      }
    },
    onUpdateProjectSettings(settings) {
      const result = store.updateProjectSettings(settings);
      shell.setStatus(result.ok ? "工程规格已更新" : result.errors[0]?.message || "工程规格无效", result.ok ? "success" : "error");
    },
    onAddAsset(type) {
      assetSequence += 1;
      const project = store.getState();
      const lane = assetSequence % 5;
      const asset = createAssetFromCatalog(type, {
        id: `${type}-${Date.now()}-${assetSequence}`,
        position: { x: -1 + lane * 0.45, z: 0.35 + Math.floor(lane / 3) * 0.45 },
      });
      const result = store.addAsset(asset);
      if (result.ok) {
        shell.selectAsset(asset.id);
        viewport?.setSelectedAsset(asset.id);
        transformController?.select(asset.id);
      }
      shell.setStatus(result.ok ? `已添加 ${asset.name}` : result.errors[0]?.message || "添加资产失败", result.ok ? "success" : "error");
    },
    onDuplicateSelection(nextSelection) {
      if (nextSelection.kind !== "asset") return;
      const result = store.duplicateAsset(nextSelection.id);
      if (result.ok) {
        shell.selectAsset(result.assetId);
        viewport?.setSelectedAsset(result.assetId);
        transformController?.select(result.assetId);
      }
      shell.setStatus(result.ok ? "资产副本已加入场景" : result.errors[0]?.message || "复制失败", result.ok ? "success" : "error");
    },
    onDeleteSelection(nextSelection) {
      if (nextSelection.kind !== "asset") return;
      const result = store.removeAsset(nextSelection.id);
      shell.setStatus(result.ok ? "资产已移除，可使用撤销恢复" : result.errors[0]?.message || "删除失败", result.ok ? "success" : "error");
    },
    onSetLocked(nextSelection, locked) {
      if (nextSelection.kind !== "asset") return;
      const result = store.setAssetLocked(nextSelection.id, locked);
      shell.setStatus(result.ok ? (locked ? "资产已锁定" : "资产已解锁") : result.errors[0]?.message || "锁定状态修改失败", result.ok ? "success" : "error");
    },
    onLocateSelection(nextSelection) {
      if (nextSelection.kind === "asset") {
        viewport?.focusAsset(nextSelection.id);
        shell.setStatus("视口已聚焦所选资产", "success");
      } else {
        shell.setStatus("已在右侧监看区标出所选机位");
      }
    },
    onUpdateCamera(cameraId, patch) {
      const result = store.updateCamera(cameraId, patch);
      shell.setStatus(result.ok ? "机位参数已更新" : result.errors[0]?.message || "机位参数无效", result.ok ? "success" : "error");
    },
    onSetView(view) {
      viewport?.setView(view);
      shell.setStatus(`视图已切换：${view}`);
    },
    onSetTransformMode(mode) {
      if (transformController?.setMode(mode)) shell.setStatus(mode === "rotate" ? "变换模式：旋转" : "变换模式：移动");
    },
    onUpdateTransform(assetId, transform) {
      const asset = store.getState().assets.find((entry) => entry.id === assetId);
      if (!asset || asset.locked) {
        shell.setStatus("锁定对象不能修改", "error");
        shell.sync(store.getState(), store.historySnapshot());
        return;
      }
      const result = store.updateAssetTransform(assetId, normalizeTransformForCommit(transform, { grid: 0.1, minY: asset.dimensions.height / 2 }));
      shell.setStatus(result.ok ? `已更新 ${asset.name} · 吸附 0.10 m` : `修改失败：${result.errors[0]?.message || "数值无效"}`, result.ok ? "success" : "error");
    },
    onFocusIssue(issue) {
      issueTracker.focus(issue.id);
      const evidence = createIssueEvidenceModel(issue);
      const assetId = issue.assetIds[0] || null;
      if (assetId) {
        shell.selectAsset(assetId);
        transformController?.select(assetId);
        viewport?.setSelectedAsset(assetId);
      }
      viewport?.focusEvidence(evidence, { animate: !reducedMotion });
      cameraMonitors?.setActive(evidence.cameraId);
      cameraMonitors?.highlightSafeZone(evidence.visual.safeZone);
      shell.setActiveIssue(issue.id);
      shell.setStatus(issue.message, issue.severity === "critical" ? "error" : "neutral");
    },
    async onSaveVersion(name) {
      shell.setStatus("正在采集三维总览与节目机位…");
      const monitorCaptures = cameraMonitors?.capture() || {};
      const rawPreviews = {
        top: viewport?.capture() || null,
        primary: monitorCaptures["camera-primary"] || null,
        detail: monitorCaptures["camera-detail"] || null,
      };
      const previews = Object.fromEntries((await Promise.all(Object.entries(rawPreviews).map(async ([key, value]) => [key, await compactImage(value)])))
        .filter(([, value]) => value));
      const result = store.saveVersion(name, { issues: latestIssues, previews });
      shell.setStatus(result.ok ? `已保存版本：${name}` : result.errors[0]?.message || "保存版本失败", result.ok ? "success" : "error");
    },
    onCompareVersions(leftId, rightId) {
      const versions = store.getState().versions;
      const left = versions.find((version) => version.id === leftId);
      const right = versions.find((version) => version.id === rightId);
      if (!left || !right || left.id === right.id) {
        shell.setStatus("请选择两个不同的版本进行比较", "error");
        return;
      }
      shell.showComparison(compareVersions(left, right), left, right);
      shell.setStatus(`正在比较 ${left.name} 与 ${right.name}`, "success");
    },
  }, store.getState());

  shell.sync(store.getState(), store.historySnapshot());
  shell.syncIssues(latestIssues);
  shell.syncVersions(store.getState().versions);
  shell.setStatus(restored.message, restored.source === "storage-error" ? "error" : "success");
  const canvas = root.querySelector("[data-studio-canvas]");
  if (canvas) {
    try {
      viewport = createStudioViewport({
        canvas,
        policy: performancePolicy,
        onDragStart(assetId) {
          const asset = store.getState().assets.find((entry) => entry.id === assetId);
          if (!asset || asset.locked) {
            shell.setStatus("锁定对象不能直接拖动，请先解锁", "error");
            return false;
          }
          transformController?.select(assetId);
          if (viewport) viewport.controls.enabled = false;
          shell.setStatus(`正在拖动 ${asset.name} · 松开完成移动`);
          return true;
        },
        onDragEnd(assetId) {
          if (viewport) viewport.controls.enabled = true;
          const asset = store.getState().assets.find((entry) => entry.id === assetId);
          const object = viewport?.getAssetObject(assetId);
          if (!asset || !object) return;
          const next = normalizeTransformForCommit({
            position: { x: object.position.x, y: object.position.y, z: object.position.z },
            rotation: { x: asset.transform.rotation.x, y: asset.transform.rotation.y, z: asset.transform.rotation.z },
          }, { grid: 0.1, minY: asset.dimensions.height / 2 });
          const result = store.updateAssetTransform(assetId, next);
          if (!result.ok) {
            viewport?.sync(store.getState());
            shell.setStatus(`移动失败：${result.errors[0]?.message || "工程约束不允许该位置"}`, "error");
          } else {
            shell.setStatus(`已移动 ${asset.name} · 吸附 0.10 m`, "success");
          }
        },
        onContextLost() {
          canvas.closest(".drafting-stage")?.removeAttribute("data-viewport");
          shell.showViewportFailure("三维上下文已中断。工程数据仍然安全，可以重新加载视口。", () => window.location.reload());
          shell.setStatus("三维视口已中断", "error");
        },
        onContextRestored() {
          canvas.closest(".drafting-stage")?.setAttribute("data-viewport", "ready");
          shell.setStatus("三维视口已恢复", "success");
        },
        onSelect(assetId) {
          if (!assetId) {
            shell.setStatus("未选择对象");
            return;
          }
          shell.selectAsset(assetId);
          transformController?.select(assetId);
          shell.setStatus(`已选择 ${assetId}`);
        },
      });
      viewport.sync(store.getState());
      const initialAssetId = store.getState().assets.find((asset) => !asset.locked)?.id
        || store.getState().assets[0]?.id
        || null;
      viewport.setSelectedAsset(initialAssetId);
      transformController = createTransformController({
        studio: viewport,
        store,
        onSelectionChange(assetId) {
          if (assetId) shell.selectAsset(assetId);
        },
        onStatus(message, tone) { shell.setStatus(message, tone); },
      });
      transformController.select(initialAssetId);
      if (initialAssetId) shell.selectAsset(initialAssetId);
      cameraMonitors = createCameraMonitors({ root, scene: viewport.scene, cameras: store.getState().cameras, policy: performancePolicy });
      canvas.closest(".drafting-stage")?.setAttribute("data-viewport", "ready");
    } catch (error) {
      shell.showViewportFailure(`三维视口启动失败：${error instanceof Error ? error.message : "未知错误"}`, () => window.location.reload());
      shell.setStatus("三维视口未能启动", "error");
    }
  }

  let autosaveReady = false;
  store.subscribe((project, history) => {
    const nextIssues = evaluateProject(project);
    const issueUpdate = issueTracker.update(nextIssues);
    latestIssues = nextIssues;
    shell.sync(project, history);
    shell.syncIssues(nextIssues);
    shell.syncVersions(project.versions);
    viewport?.sync(project);
    cameraMonitors?.update(project.cameras);
    if (issueUpdate.resolvedMessage) {
      viewport?.clearEvidence();
      cameraMonitors?.setActive(null);
      cameraMonitors?.highlightSafeZone(null);
      shell.setActiveIssue(null);
      queueMicrotask(() => shell.setStatus(issueUpdate.resolvedMessage, "success"));
    } else if (issueUpdate.activeIssue) {
      const evidence = createIssueEvidenceModel(issueUpdate.activeIssue);
      viewport?.focusEvidence(evidence, { animate: false });
      cameraMonitors?.setActive(evidence.cameraId);
      cameraMonitors?.highlightSafeZone(evidence.visual.safeZone);
      shell.setActiveIssue(issueUpdate.activeIssue.id);
    }
    if (autosaveReady) saveCoordinator.markChanged(project);
  });
  autosaveReady = true;
  const handleBeforeUnload = (event) => {
    if (!saveCoordinator.isDirty()) return;
    event.preventDefault();
    event.returnValue = "";
  };
  window.addEventListener("beforeunload", handleBeforeUnload);
  window.addEventListener("pagehide", () => {
    cameraMonitors?.dispose();
    transformController?.dispose();
    viewport?.dispose();
    saveCoordinator.dispose();
  }, { once: true });
  root.dataset.runtime = "ready";
  if (state) state.classList.add("is-ready");
  if (stateLabel) stateLabel.textContent = restored.source === "local" ? "Local project restored" : "Workspace ready";
}

if (root) {
  void startApp().catch((error) => {
    if (stateLabel) stateLabel.textContent = "Workspace failed";
    root.innerHTML = `<p role="alert">SET//FLOW 启动失败：${error instanceof Error ? error.message : "未知错误"}</p>`;
  });
}
