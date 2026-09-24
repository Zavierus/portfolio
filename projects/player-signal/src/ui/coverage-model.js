function sortedReasonCounts(cleaning) {
  const counts = cleaning?.exclusionCounts ?? (cleaning?.excludedReviews ?? []).reduce(
    (result, item) => ({ ...result, [item.reason]: (result[item.reason] ?? 0) + 1 }),
    {},
  );
  return Object.entries(counts)
    .map(([reason, count]) => ({ reason, count }))
    .sort((left, right) => right.count - left.count || left.reason.localeCompare(right.reason));
}

export function createCoverageModel(analysis) {
  const cleaning = analysis?.cleaning ?? {};
  const acceptedReviews = cleaning.acceptedReviews ?? [];
  const classifiedIds = new Set();
  for (const topic of analysis?.topics ?? []) {
    for (const id of [...(topic.evidenceIds ?? []), ...(topic.counterEvidenceIds ?? [])]) classifiedIds.add(id);
  }
  const acceptedIds = new Set(acceptedReviews.map((review) => review.reviewIdHash));
  const classified = [...classifiedIds].filter((id) => acceptedIds.has(id)).length;
  const unclassified = Array.isArray(analysis?.unclassified)
    ? analysis.unclassified.length
    : Math.max(0, acceptedReviews.length - classified);
  const accounting = cleaning.sampleAccounting ?? {};
  const dates = acceptedReviews
    .map((review) => review.createdAt)
    .filter((value) => Number.isFinite(Date.parse(value)))
    .sort((left, right) => Date.parse(left) - Date.parse(right));
  const accepted = Number(accounting.accepted ?? acceptedReviews.length) || 0;

  return Object.freeze({
    counts: Object.freeze({
      fetched: Number(accounting.fetched ?? accepted + Number(accounting.excluded ?? 0)) || 0,
      accepted,
      classified,
      unclassified,
      excluded: Number(accounting.excluded ?? cleaning.excludedReviews?.length ?? 0) || 0,
    }),
    classificationRate: accepted > 0 ? classified / accepted : 0,
    exclusionReasons: Object.freeze(sortedReasonCounts(cleaning).map(Object.freeze)),
    range: Object.freeze({ start: dates[0] ?? null, end: dates.at(-1) ?? null }),
  });
}
