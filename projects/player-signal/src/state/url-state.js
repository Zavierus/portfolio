const VIEWS = new Set(["field", "table"]);
const QUEUES = new Set(["new", "growing", "largest", "core", "persistent", "unclassified"]);
const TOPIC_PATTERN = /^[a-z0-9][a-z0-9-]{0,79}$/i;

export function parseWorkspaceState(search = "") {
  const parameters = new URLSearchParams(String(search).replace(/^\?/, ""));
  const view = parameters.get("view");
  const queue = parameters.get("queue");
  const topic = parameters.get("topic");
  return Object.freeze({
    view: VIEWS.has(view) ? view : "field",
    queue: QUEUES.has(queue) ? queue : null,
    topic: topic && TOPIC_PATTERN.test(topic) ? topic : null,
  });
}

export function serializeWorkspaceState(state = {}) {
  const parameters = new URLSearchParams();
  if (state.view === "table") parameters.set("view", "table");
  if (QUEUES.has(state.queue)) parameters.set("queue", state.queue);
  if (state.topic && TOPIC_PATTERN.test(state.topic)) parameters.set("topic", state.topic);
  const value = parameters.toString();
  return value ? `?${value}` : "";
}
