export function createTaskScheduler() {
  const tasks = new Map();

  return {
    schedule(delay, callback, key = Symbol("task")) {
      tasks.set(key, { remaining: Math.max(0, delay), callback });
      return key;
    },
    update(delta) {
      if (delta <= 0) return;
      for (const [key, task] of [...tasks]) {
        if (tasks.get(key) !== task) continue;
        task.remaining -= delta;
        if (task.remaining <= 0) {
          tasks.delete(key);
          task.callback();
        }
      }
    },
    has(key) {
      return tasks.has(key);
    },
    remaining(key) {
      return tasks.get(key)?.remaining ?? null;
    },
    cancel(key) {
      tasks.delete(key);
    },
    clear() {
      tasks.clear();
    },
  };
}
