import assert from "node:assert/strict";
import test from "node:test";

import { createExampleProject } from "../src/domain/example-project.js";
import { compareVersions, createProjectStore } from "../src/state/project-store.js";

test("store protects its state and notifies once for a successful edit", () => {
  const store = createProjectStore(createExampleProject());
  let notifications = 0;
  const unsubscribe = store.subscribe(() => { notifications += 1; });
  const leaked = store.getState();
  leaked.room.width = 99;

  const result = store.resizeRoom({ width: 4.2 });

  assert.equal(result.ok, true);
  assert.equal(store.getState().room.width, 4.2);
  assert.equal(notifications, 1);
  unsubscribe();
});

test("invalid edits do not enter history or notify subscribers", () => {
  const store = createProjectStore(createExampleProject());
  let notifications = 0;
  store.subscribe(() => { notifications += 1; });

  const result = store.resizeRoom({ width: -2 });

  assert.equal(result.ok, false);
  assert.equal(store.getState().room.width, 3.8);
  assert.equal(store.canUndo(), false);
  assert.equal(notifications, 0);
  assert.ok(result.errors.some((error) => error.path === "room.width"));
});

test("asset transforms, removal, undo and redo use reversible commands", () => {
  const store = createProjectStore(createExampleProject());
  const initial = store.getState().assets.find((asset) => asset.id === "table-1");

  store.updateAssetTransform("table-1", {
    position: { x: 1.2, y: 0.39, z: 0.1 },
    rotation: { x: 0, y: 0.5, z: 0 },
  });
  assert.equal(store.getState().assets.find((asset) => asset.id === "table-1").transform.position.x, 1.2);

  store.removeAsset("table-1");
  assert.equal(store.getState().assets.some((asset) => asset.id === "table-1"), false);

  store.undo();
  store.undo();
  assert.deepEqual(store.getState().assets.find((asset) => asset.id === "table-1").transform, initial.transform);

  store.redo();
  assert.equal(store.getState().assets.find((asset) => asset.id === "table-1").transform.position.x, 1.2);
});

test("adding an asset rejects duplicate identifiers", () => {
  const store = createProjectStore(createExampleProject());
  const duplicate = structuredClone(store.getState().assets[0]);

  const result = store.addAsset(duplicate);

  assert.equal(result.ok, false);
  assert.equal(store.getState().assets.filter((asset) => asset.id === duplicate.id).length, 1);
});

test("named versions remain isolated and compare evidence without declaring a winner", () => {
  const store = createProjectStore(createExampleProject());
  const first = store.saveVersion("方案 A", {
    issues: [
      { id: "collision:a:b", message: "灯架与活动区重叠", severity: "warning" },
      { id: "boundary:rack", message: "陈列架越界", severity: "critical" },
    ],
    previews: { top: "data:image/jpeg;base64,TOPA", primary: "data:image/jpeg;base64,CAMA" },
  });
  store.updateAssetTransform("table-1", {
    position: { x: 1.2, y: 0.4, z: -0.3 },
    rotation: { x: 0, y: 0, z: 0 },
  });
  const second = store.saveVersion("方案 B", {
    issues: [
      { id: "collision:a:b", message: "灯架与活动区重叠", severity: "warning" },
      { id: "camera:table", message: "桌面遮挡主机位", severity: "warning" },
    ],
    previews: { top: "data:image/jpeg;base64,TOPB" },
  });
  const versions = store.getState().versions;

  assert.equal(first.ok, true);
  assert.equal(second.ok, true);
  assert.equal(versions.length, 2);
  assert.equal(versions[0].name, "方案 A");
  assert.equal(versions[0].snapshot.assets.find((asset) => asset.id === "table-1").transform.position.x, 0.55);
  assert.equal(versions[1].snapshot.assets.find((asset) => asset.id === "table-1").transform.position.x, 1.2);
  assert.equal(versions[0].previews.primary, "data:image/jpeg;base64,CAMA");
  assert.equal(versions[1].previews.primary, undefined);

  const comparison = compareVersions(versions[0], versions[1]);
  assert.equal(comparison.changedAssetCount, 1);
  assert.deepEqual(comparison.resolvedIssueIds, ["boundary:rack"]);
  assert.deepEqual(comparison.newIssueIds, ["camera:table"]);
  assert.deepEqual(comparison.changedAssets.map((asset) => asset.id), ["table-1"]);
  assert.equal(comparison.resolvedIssues[0].message, "陈列架越界");
  assert.equal(comparison.newIssues[0].message, "桌面遮挡主机位");
  assert.equal("winner" in comparison, false);
});

test("replacing a project validates, clears history and notifies once", () => {
  const store = createProjectStore(createExampleProject());
  store.resizeRoom({ width: 4.2 });
  const replacement = createExampleProject();
  replacement.id = "restored-project";
  replacement.name = "已恢复工程";
  let notifications = 0;
  store.subscribe(() => { notifications += 1; });

  const result = store.replaceProject(replacement);

  assert.equal(result.ok, true);
  assert.equal(store.getState().id, "restored-project");
  assert.equal(store.canUndo(), false);
  assert.equal(store.canRedo(), false);
  assert.equal(notifications, 1);

  replacement.room.width = -1;
  const invalid = store.replaceProject(replacement);
  assert.equal(invalid.ok, false);
  assert.equal(store.getState().id, "restored-project");
});

test("project settings update as one validated reversible command", () => {
  const store = createProjectStore(createExampleProject());

  const result = store.updateProjectSettings({
    room: { width: 4.6, depth: 6.2, height: 3.1 },
    budget: { limit: 26_000 },
    aspect: "16:9",
  });

  assert.equal(result.ok, true);
  assert.deepEqual(store.getState().room, { width: 4.6, depth: 6.2, height: 3.1, unit: "m" });
  assert.equal(store.getState().budget.limit, 26_000);
  assert.equal(store.getState().brief.aspect, "16:9");
  store.undo();
  assert.equal(store.getState().room.width, 3.8);
  assert.equal(store.getState().brief.aspect, "9:16");

  const invalid = store.updateProjectSettings({ room: { width: -1 } });
  assert.equal(invalid.ok, false);
  assert.equal(store.getState().room.width, 3.8);
});

test("duplicating an asset creates an offset independent copy", () => {
  const store = createProjectStore(createExampleProject());

  const result = store.duplicateAsset("rack-1");
  const copy = store.getState().assets.find((asset) => asset.id === result.assetId);

  assert.equal(result.ok, true);
  assert.notEqual(copy.id, "rack-1");
  assert.match(copy.name, /副本/);
  assert.equal(copy.transform.position.x, 1.1);
  assert.equal(copy.transform.position.z, -1.75);
  assert.equal(copy.locked, false);
  store.undo();
  assert.equal(store.getState().assets.some((asset) => asset.id === copy.id), false);
});

test("locked assets reject transforms and removal until unlocked", () => {
  const store = createProjectStore(createExampleProject());
  assert.equal(store.setAssetLocked("rack-1", true).ok, true);

  const transform = store.updateAssetTransform("rack-1", {
    position: { x: 0, y: 0.95, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
  });
  const removal = store.removeAsset("rack-1");

  assert.equal(transform.ok, false);
  assert.equal(removal.ok, false);
  assert.match(transform.errors[0].message, /锁定/);
  assert.equal(store.setAssetLocked("rack-1", false).ok, true);
  assert.equal(store.removeAsset("rack-1").ok, true);
});

test("camera position target focal length and aspect update reversibly", () => {
  const store = createProjectStore(createExampleProject());

  const result = store.updateCamera("camera-primary", {
    position: { x: 0.2, y: 1.5, z: 2.6 },
    target: { x: 0, y: 1.1, z: -0.8 },
    focalLength: 35,
    aspect: "1:1",
  });

  assert.equal(result.ok, true);
  const camera = store.getState().cameras[0];
  assert.equal(camera.focalLength, 35);
  assert.equal(camera.aspect, "1:1");
  assert.equal(camera.position.z, 2.6);
  store.undo();
  assert.equal(store.getState().cameras[0].focalLength, 28);

  const invalid = store.updateCamera("camera-primary", { focalLength: 4 });
  assert.equal(invalid.ok, false);
  assert.equal(store.getState().cameras[0].focalLength, 28);
});
