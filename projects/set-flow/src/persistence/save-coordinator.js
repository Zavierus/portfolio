import { cloneProject } from "../domain/project-schema.js";

function noop() {}

export function createSaveCoordinator({
  repository,
  createFallback,
  delay = 900,
  onState = noop,
} = {}) {
  if (!repository || typeof repository.save !== "function" && typeof repository.list !== "function") {
    throw new TypeError("SET//FLOW save coordinator requires a project repository");
  }
  if (typeof createFallback !== "function") {
    throw new TypeError("SET//FLOW save coordinator requires a fallback project factory");
  }
  if (!Number.isFinite(delay) || delay < 0) {
    throw new RangeError("Autosave delay must be a non-negative number");
  }

  let pendingProject = null;
  let timer = null;
  let dirty = false;
  let disposed = false;
  let activeSave = null;

  function publish(status, extra = {}) {
    onState({ status, dirty, ...extra });
  }

  function cancelTimer() {
    if (timer !== null) clearTimeout(timer);
    timer = null;
  }

  async function persist(project) {
    if (disposed) return { ok: false, code: "disposed", message: "保存协调器已关闭" };
    cancelTimer();
    const snapshot = cloneProject(project);
    pendingProject = snapshot;
    dirty = true;
    publish("saving", { projectId: snapshot.id });
    const savePromise = repository.save(snapshot);
    activeSave = savePromise;
    const result = await savePromise;
    if (activeSave === savePromise) activeSave = null;
    if (disposed) return result;
    if (result.ok) {
      pendingProject = null;
      dirty = false;
      publish("saved", { projectId: snapshot.id });
    } else {
      dirty = true;
      publish("error", { projectId: snapshot.id, message: result.message || "本地工程保存失败", code: result.code });
    }
    return result;
  }

  return {
    async restore() {
      try {
        const result = await repository.list();
        if (result.ok && result.projects.length > 0) {
          return { source: "local", project: cloneProject(result.projects[0]), message: "已恢复最近的本地工程" };
        }
        if (result.ok) {
          return { source: "example", project: cloneProject(createFallback()), message: "已打开内置示例" };
        }
        return {
          source: "storage-error",
          project: cloneProject(createFallback()),
          message: `本地工程不可用：${result.message || "无法读取浏览器存储"}`,
          code: result.code,
        };
      } catch (error) {
        return {
          source: "storage-error",
          project: cloneProject(createFallback()),
          message: `本地工程不可用：${error instanceof Error ? error.message : "无法读取浏览器存储"}`,
          code: "storage-failed",
        };
      }
    },

    markChanged(project) {
      if (disposed) return false;
      pendingProject = cloneProject(project);
      dirty = true;
      cancelTimer();
      publish("dirty", { projectId: pendingProject.id });
      timer = setTimeout(() => { void persist(pendingProject); }, delay);
      return true;
    },

    saveNow(project = pendingProject) {
      if (!project) return Promise.resolve({ ok: false, code: "nothing-to-save", message: "当前没有待保存的工程修改" });
      return persist(project);
    },

    async flush() {
      cancelTimer();
      if (activeSave) return activeSave;
      if (!pendingProject) return { ok: true, code: "already-saved" };
      return persist(pendingProject);
    },

    isDirty() {
      return dirty;
    },

    dispose() {
      disposed = true;
      cancelTimer();
      pendingProject = null;
    },
  };
}
