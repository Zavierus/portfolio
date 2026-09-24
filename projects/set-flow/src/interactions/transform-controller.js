import { TransformControls } from "three/addons/controls/TransformControls.js";

const TAU = Math.PI * 2;

export function snapValue(value, grid = 0.1) {
  if (!Number.isFinite(value) || !Number.isFinite(grid) || grid <= 0) return value;
  const snapped = Math.round(value / grid) * grid;
  return Number(snapped.toFixed(6));
}

export function normalizeAngle(value) {
  if (!Number.isFinite(value)) return 0;
  return ((value + Math.PI) % TAU + TAU) % TAU - Math.PI;
}

export function normalizeTransformForCommit(transform, { grid = 0.1, minY = -Infinity } = {}) {
  const snappedY = snapValue(transform.position.y, grid);
  return {
    position: {
      x: snapValue(transform.position.x, grid),
      y: Number.isFinite(minY) ? Math.max(minY, snappedY) : snappedY,
      z: snapValue(transform.position.z, grid),
    },
    rotation: {
      x: normalizeAngle(transform.rotation.x),
      y: normalizeAngle(transform.rotation.y),
      z: normalizeAngle(transform.rotation.z),
    },
  };
}

function objectTransform(object) {
  return {
    position: { x: object.position.x, y: object.position.y, z: object.position.z },
    rotation: { x: object.rotation.x, y: object.rotation.y, z: object.rotation.z },
  };
}

function applyTransform(object, transform) {
  object.position.set(transform.position.x, transform.position.y, transform.position.z);
  object.rotation.set(transform.rotation.x, transform.rotation.y, transform.rotation.z);
}

function isEditableKeyboardTarget(target) {
  return target instanceof HTMLElement && Boolean(target.closest("input, textarea, select, [contenteditable='true']"));
}

export function createTransformController({ studio, store, onSelectionChange, onStatus, grid = 0.1 } = {}) {
  if (!studio?.scene || !studio?.camera || !studio?.renderer || !store) {
    throw new TypeError("Transform controller requires a studio scene and project store");
  }

  const control = new TransformControls(studio.camera, studio.renderer.domElement);
  const helper = control.getHelper();
  // Keep the gizmo on the default layer: TransformControls raycasts against it with a
  // layer-0 raycaster, so hiding it on layer 31 would break picking entirely.
  studio.scene.add(helper);
  control.setMode("translate");
  control.setTranslationSnap(grid);
  control.setRotationSnap(Math.PI / 12);
  control.setSize(1.5);

  let selectedId = null;
  let dragStart = null;
  let cancelCommit = false;

  function selectedAsset() {
    return store.getState().assets.find((asset) => asset.id === selectedId) || null;
  }

  function select(assetId) {
    const asset = store.getState().assets.find((entry) => entry.id === assetId) || null;
    const object = asset ? studio.getAssetObject(asset.id) : null;
    selectedId = object ? asset.id : null;
    control.detach();
    studio.setSelectedAsset(selectedId);
    if (object && !asset.locked) control.attach(object);
    onSelectionChange?.(selectedId, asset);
    if (asset?.locked) onStatus?.(`${asset.name} 已锁定；可查看但不能移动`, "neutral");
    return selectedId;
  }

  const handleDragging = (event) => {
    studio.controls.enabled = !event.value;
  };

  const handleMouseDown = () => {
    if (!control.object || !selectedId) return;
    dragStart = objectTransform(control.object);
    cancelCommit = false;
  };

  const handleMouseUp = () => {
    if (!control.object || !selectedId || !dragStart) return;
    const object = control.object;
    if (cancelCommit) {
      applyTransform(object, dragStart);
      dragStart = null;
      cancelCommit = false;
      return;
    }

    const next = normalizeTransformForCommit(objectTransform(object), { grid, minY: selectedAsset()?.dimensions.height / 2 });
    applyTransform(object, next);
    const result = store.updateAssetTransform(selectedId, next);
    if (!result.ok) {
      applyTransform(object, dragStart);
      onStatus?.(`移动失败：${result.errors[0]?.message || "工程约束不允许该位置"}`, "error");
    } else {
      onStatus?.(`已移动 ${selectedAsset()?.name || selectedId} · 吸附 ${grid.toFixed(2)} m`, "success");
    }
    dragStart = null;
  };

  const handleKeyDown = (event) => {
    if (isEditableKeyboardTarget(event.target)) return;
    const modifier = event.ctrlKey || event.metaKey;
    if (modifier && event.key.toLowerCase() === "z") {
      event.preventDefault();
      const changed = event.shiftKey ? store.redo() : store.undo();
      if (changed) onStatus?.(event.shiftKey ? "已重做上一步" : "已撤销上一步", "success");
      return;
    }
    if (event.key === "Escape" && control.dragging) {
      cancelCommit = true;
      control.reset();
      onStatus?.("已取消本次移动");
      return;
    }
    if (event.key === "Delete" && selectedId) {
      const asset = selectedAsset();
      if (!asset || asset.locked) {
        onStatus?.("锁定对象不能删除", "error");
        return;
      }
      const removedId = selectedId;
      const result = store.removeAsset(removedId);
      if (result.ok) {
        select(null);
        onStatus?.(`已删除 ${asset.name}；可使用撤销恢复`, "success");
      }
      return;
    }
    if (event.key.toLowerCase() === "w") control.setMode("translate");
    if (event.key.toLowerCase() === "e") control.setMode("rotate");
  };

  control.addEventListener("dragging-changed", handleDragging);
  control.addEventListener("mouseDown", handleMouseDown);
  control.addEventListener("mouseUp", handleMouseUp);
  window.addEventListener("keydown", handleKeyDown);

  return {
    control,
    select,
    setMode(mode) {
      if (!['translate', 'rotate'].includes(mode)) return false;
      control.setMode(mode);
      return true;
    },
    refresh() {
      const id = selectedId;
      select(id);
    },
    getSelectedId() { return selectedId; },
    dispose() {
      control.removeEventListener("dragging-changed", handleDragging);
      control.removeEventListener("mouseDown", handleMouseDown);
      control.removeEventListener("mouseUp", handleMouseUp);
      window.removeEventListener("keydown", handleKeyDown);
      control.detach();
      studio.scene.remove(helper);
      control.dispose();
      helper.traverse((child) => {
        child.geometry?.dispose?.();
        if (Array.isArray(child.material)) child.material.forEach((entry) => entry.dispose?.());
        else child.material?.dispose?.();
      });
    },
  };
}
