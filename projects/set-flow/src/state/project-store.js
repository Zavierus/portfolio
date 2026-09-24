import { cloneProject, validateProject } from "../domain/project-schema.js";
import { createCommandHistory } from "./command-history.js";

function editError(path, code, message) {
  return { path, code, message };
}

function versionSnapshot(project) {
  const snapshot = cloneProject(project);
  snapshot.versions = [];
  return snapshot;
}

function assetCost(project) {
  return project.assets.reduce((sum, asset) => sum + Number(asset.cost || 0), 0);
}

export function compareVersions(leftVersion, rightVersion) {
  if (!leftVersion?.snapshot || !rightVersion?.snapshot) {
    throw new TypeError("对比版本缺少工程快照");
  }
  const leftAssets = new Map(leftVersion.snapshot.assets.map((asset) => [asset.id, asset]));
  const rightAssets = new Map(rightVersion.snapshot.assets.map((asset) => [asset.id, asset]));
  const assetIds = new Set([...leftAssets.keys(), ...rightAssets.keys()]);
  const changedAssetIds = [...assetIds]
    .filter((id) => JSON.stringify(leftAssets.get(id) || null) !== JSON.stringify(rightAssets.get(id) || null))
    .sort();
  const leftIssues = new Set(leftVersion.issueIds || []);
  const rightIssues = new Set(rightVersion.issueIds || []);
  const leftIssueSummaries = new Map((leftVersion.issues || []).map((issue) => [issue.id, issue]));
  const rightIssueSummaries = new Map((rightVersion.issues || []).map((issue) => [issue.id, issue]));
  const resolvedIssueIds = [...leftIssues].filter((id) => !rightIssues.has(id)).sort();
  const newIssueIds = [...rightIssues].filter((id) => !leftIssues.has(id)).sort();

  return {
    leftId: leftVersion.id,
    rightId: rightVersion.id,
    changedAssetCount: changedAssetIds.length,
    changedAssetIds,
    changedAssets: changedAssetIds.map((id) => ({
      id,
      before: leftAssets.get(id)?.name || null,
      after: rightAssets.get(id)?.name || null,
    })),
    budgetDelta: assetCost(rightVersion.snapshot) - assetCost(leftVersion.snapshot),
    resolvedIssueIds,
    newIssueIds,
    resolvedIssues: resolvedIssueIds.map((id) => leftIssueSummaries.get(id) || { id, message: id, severity: "info" }),
    newIssues: newIssueIds.map((id) => rightIssueSummaries.get(id) || { id, message: id, severity: "info" }),
    roomChanged: JSON.stringify(leftVersion.snapshot.room) !== JSON.stringify(rightVersion.snapshot.room),
    cameraChanged: JSON.stringify(leftVersion.snapshot.cameras) !== JSON.stringify(rightVersion.snapshot.cameras),
  };
}

export function createProjectStore(initialProject, { historyLimit = 100 } = {}) {
  const initialValidation = validateProject(initialProject);
  if (!initialValidation.valid) {
    throw new TypeError(`Invalid initial SET//FLOW project: ${initialValidation.errors[0].message}`);
  }

  let state = cloneProject(initialProject);
  const listeners = new Set();
  const history = createCommandHistory({ limit: historyLimit });

  function notify() {
    const snapshot = cloneProject(state);
    const historySnapshot = history.snapshot();
    for (const listener of listeners) listener(snapshot, historySnapshot);
  }

  function dispatch(label, mutator) {
    const before = cloneProject(state);
    const after = cloneProject(state);

    try {
      mutator(after);
    } catch (error) {
      return {
        ok: false,
        errors: [editError("project", "edit-failed", error instanceof Error ? error.message : "工程修改失败")],
      };
    }

    after.updatedAt = new Date().toISOString();
    const validation = validateProject(after);
    if (!validation.valid) return { ok: false, errors: validation.errors };

    history.execute({
      label,
      do() { state = cloneProject(after); },
      undo() { state = cloneProject(before); },
    });
    notify();
    return { ok: true, errors: [] };
  }

  function findAsset(assetId) {
    return state.assets.find((asset) => asset.id === assetId) || null;
  }

  function lockedAssetError(asset) {
    return { ok: false, errors: [editError("assets", "asset-locked", `${asset.name} 已锁定，请先解锁再修改`)] };
  }

  return {
    getState() {
      return cloneProject(state);
    },

    subscribe(listener) {
      if (typeof listener !== "function") throw new TypeError("Project subscriber must be a function");
      listeners.add(listener);
      return () => listeners.delete(listener);
    },

    dispatch,

    replaceProject(project) {
      const validation = validateProject(project);
      if (!validation.valid) return { ok: false, errors: validation.errors };
      state = cloneProject(project);
      history.clear();
      notify();
      return { ok: true, errors: [] };
    },

    resizeRoom(dimensions) {
      return dispatch("调整房间尺寸", (draft) => {
        draft.room = { ...draft.room, ...cloneProject(dimensions) };
      });
    },

    updateProjectSettings({ room, budget, aspect } = {}) {
      return dispatch("调整工程设置", (draft) => {
        if (room) draft.room = { ...draft.room, ...cloneProject(room) };
        if (budget) draft.budget = { ...draft.budget, ...cloneProject(budget) };
        if (aspect !== undefined) draft.brief.aspect = aspect;
      });
    },

    addAsset(asset) {
      return dispatch(`添加 ${asset?.name || "资产"}`, (draft) => {
        draft.assets.push(cloneProject(asset));
      });
    },

    removeAsset(assetId) {
      const asset = findAsset(assetId);
      if (!asset) {
        return { ok: false, errors: [editError("assets", "asset-not-found", "没有找到需要删除的资产")] };
      }
      if (asset.locked) return lockedAssetError(asset);
      return dispatch("删除资产", (draft) => {
        draft.assets = draft.assets.filter((asset) => asset.id !== assetId);
      });
    },

    duplicateAsset(assetId) {
      const asset = findAsset(assetId);
      if (!asset) return { ok: false, errors: [editError("assets", "asset-not-found", "没有找到需要复制的资产")] };
      let index = 1;
      let nextId = `${asset.id}-copy-${index}`;
      while (state.assets.some((candidate) => candidate.id === nextId)) {
        index += 1;
        nextId = `${asset.id}-copy-${index}`;
      }
      const grid = Number(state.settings.gridStep) || 0.1;
      const copy = cloneProject(asset);
      copy.id = nextId;
      copy.name = `${asset.name} 副本`;
      copy.locked = false;
      copy.transform.position.x += grid;
      copy.transform.position.z += grid;
      const result = dispatch(`复制 ${asset.name}`, (draft) => { draft.assets.push(copy); });
      return result.ok ? { ...result, assetId: nextId } : result;
    },

    setAssetLocked(assetId, locked) {
      const asset = findAsset(assetId);
      if (!asset) return { ok: false, errors: [editError("assets", "asset-not-found", "没有找到需要锁定的资产")] };
      return dispatch(locked ? `锁定 ${asset.name}` : `解锁 ${asset.name}`, (draft) => {
        draft.assets.find((candidate) => candidate.id === assetId).locked = Boolean(locked);
      });
    },

    updateAssetTransform(assetId, transform) {
      const asset = findAsset(assetId);
      if (!asset) {
        return { ok: false, errors: [editError("assets", "asset-not-found", "没有找到需要移动的资产")] };
      }
      if (asset.locked) return lockedAssetError(asset);
      return dispatch("调整资产位置", (draft) => {
        const asset = draft.assets.find((entry) => entry.id === assetId);
        asset.transform = cloneProject(transform);
      });
    },

    updateCamera(cameraId, patch) {
      const camera = state.cameras.find((candidate) => candidate.id === cameraId);
      if (!camera) return { ok: false, errors: [editError("cameras", "camera-not-found", "没有找到需要修改的机位")] };
      return dispatch(`调整 ${camera.name}`, (draft) => {
        const target = draft.cameras.find((candidate) => candidate.id === cameraId);
        if (patch.position) target.position = { ...target.position, ...cloneProject(patch.position) };
        if (patch.target) target.target = { ...target.target, ...cloneProject(patch.target) };
        for (const key of ["focalLength", "aspect", "safeZonePreset"]) {
          if (patch[key] !== undefined) target[key] = cloneProject(patch[key]);
        }
      });
    },

    saveVersion(name, { issueIds = [], issues = [], previews = {} } = {}) {
      const cleanName = String(name || "").trim();
      if (!cleanName) return { ok: false, errors: [editError("versions.name", "name-required", "请输入版本名称")] };
      const versionId = `version-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
      const createdAt = new Date().toISOString();
      const snapshot = versionSnapshot(state);
      const issueSummaries = issues.map((issue) => ({ id: issue.id, message: String(issue.message || issue.id), severity: issue.severity || "info" }));
      const nextIssueIds = issueSummaries.length ? issueSummaries.map((issue) => issue.id) : issueIds;
      const cleanPreviews = Object.fromEntries(Object.entries(previews)
        .filter(([key, value]) => ["top", "primary", "detail"].includes(key) && typeof value === "string" && value.startsWith("data:image/")));
      const result = dispatch(`保存版本 ${cleanName}`, (draft) => {
        draft.versions.push({
          id: versionId,
          name: cleanName,
          createdAt,
          issueIds: [...new Set(nextIssueIds)].sort(),
          issues: issueSummaries,
          previews: cleanPreviews,
          snapshot,
        });
      });
      return result.ok ? { ...result, versionId } : result;
    },

    undo() {
      const changed = history.undo();
      if (changed) notify();
      return changed;
    },

    redo() {
      const changed = history.redo();
      if (changed) notify();
      return changed;
    },

    canUndo() {
      return history.canUndo();
    },

    canRedo() {
      return history.canRedo();
    },

    historySnapshot() {
      return history.snapshot();
    },
  };
}
