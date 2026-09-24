export function diffIssues(previousIssues = [], nextIssues = []) {
  const previousIds = new Set(previousIssues.map((issue) => issue?.id).filter(Boolean));
  const nextIds = new Set(nextIssues.map((issue) => issue?.id).filter(Boolean));
  return Object.freeze({
    resolvedIds: Object.freeze([...previousIds].filter((id) => !nextIds.has(id)).sort()),
    persistentIds: Object.freeze([...nextIds].filter((id) => previousIds.has(id)).sort()),
    newIds: Object.freeze([...nextIds].filter((id) => !previousIds.has(id)).sort()),
  });
}
