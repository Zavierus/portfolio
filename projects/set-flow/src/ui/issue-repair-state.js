import { diffIssues } from "../detection/issue-diff.js";

export function createIssueRepairTracker(initialIssues = []) {
  let previousIssues = [...initialIssues];
  let activeId = null;

  return {
    focus(issueId) {
      activeId = previousIssues.some((issue) => issue.id === issueId) ? issueId : null;
      return previousIssues.find((issue) => issue.id === activeId) || null;
    },
    update(nextIssues = []) {
      const next = [...nextIssues];
      const diff = diffIssues(previousIssues, next);
      const resolved = activeId && diff.resolvedIds.includes(activeId)
        ? previousIssues.find((issue) => issue.id === activeId)
        : null;
      if (resolved) activeId = null;
      previousIssues = next;
      return Object.freeze({
        diff,
        activeIssue: next.find((issue) => issue.id === activeId) || null,
        resolvedMessage: resolved ? `已解决：${resolved.message}` : null,
      });
    },
    getActiveIssue() {
      return previousIssues.find((issue) => issue.id === activeId) || null;
    },
    clear() { activeId = null; },
  };
}
