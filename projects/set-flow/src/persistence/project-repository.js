import { cloneProject, validateProject } from "../domain/project-schema.js";

const DATABASE_NAME = "set-flow";
const DATABASE_VERSION = 1;
const PROJECT_STORE = "projects";

function storageFailure(error) {
  return {
    ok: false,
    code: "storage-failed",
    message: error instanceof Error ? error.message : "浏览器无法访问本地工程存储",
  };
}

export function createIndexedDbAdapter(indexedDb = globalThis.indexedDB) {
  let databasePromise;

  function openDatabase() {
    if (!indexedDb) return Promise.reject(new Error("当前浏览器不支持 IndexedDB"));
    if (databasePromise) return databasePromise;

    databasePromise = new Promise((resolve, reject) => {
      const request = indexedDb.open(DATABASE_NAME, DATABASE_VERSION);
      request.onupgradeneeded = () => {
        const database = request.result;
        if (!database.objectStoreNames.contains(PROJECT_STORE)) {
          database.createObjectStore(PROJECT_STORE, { keyPath: "id" });
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error || new Error("无法打开本地工程数据库"));
      request.onblocked = () => reject(new Error("本地工程数据库被另一个页面占用"));
    });
    return databasePromise;
  }

  async function requestFromStore(mode, createRequest) {
    const database = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(PROJECT_STORE, mode);
      const store = transaction.objectStore(PROJECT_STORE);
      const request = createRequest(store);
      request.onsuccess = () => resolve(request.result ?? null);
      request.onerror = () => reject(request.error || new Error("本地工程操作失败"));
      transaction.onabort = () => reject(transaction.error || new Error("本地工程操作已中止"));
    });
  }

  return {
    put(record) {
      return requestFromStore("readwrite", (store) => store.put(record));
    },
    get(id) {
      return requestFromStore("readonly", (store) => store.get(id));
    },
    getAll() {
      return requestFromStore("readonly", (store) => store.getAll());
    },
    delete(id) {
      return requestFromStore("readwrite", (store) => store.delete(id));
    },
  };
}

export function createProjectRepository(adapter = createIndexedDbAdapter()) {
  return {
    async save(project) {
      const validation = validateProject(project);
      if (!validation.valid) {
        return { ok: false, code: "invalid-project", errors: validation.errors };
      }
      try {
        await adapter.put(cloneProject(project));
        return { ok: true, id: project.id };
      } catch (error) {
        return storageFailure(error);
      }
    },

    async load(id) {
      try {
        const record = await adapter.get(id);
        if (!record) return { ok: false, code: "not-found", message: "没有找到该本地工程" };
        const validation = validateProject(record);
        if (!validation.valid) {
          return { ok: false, code: "invalid-record", message: "本地工程数据不完整", errors: validation.errors };
        }
        return { ok: true, project: cloneProject(record) };
      } catch (error) {
        return storageFailure(error);
      }
    },

    async list() {
      try {
        const records = await adapter.getAll();
        const projects = records
          .filter((record) => validateProject(record).valid)
          .map(cloneProject)
          .sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)));
        return { ok: true, projects };
      } catch (error) {
        return storageFailure(error);
      }
    },

    async delete(id) {
      try {
        await adapter.delete(id);
        return { ok: true, id };
      } catch (error) {
        return storageFailure(error);
      }
    },
  };
}
