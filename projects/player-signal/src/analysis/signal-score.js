const DEFAULT_WEIGHTS = Object.freeze({
  volume: 0.2,
  velocity: 0.22,
  baselineDeviation: 0.17,
  negativeIntensity: 0.16,
  coreImpact: 0.15,
  versionProximity: 0.1,
});

function clamp(value, minimum = 0, maximum = 1) {
  return Math.min(maximum, Math.max(minimum, Number.isFinite(value) ? value : 0));
}

function daysBetween(left, right) {
  return Math.abs(Date.parse(left) - Date.parse(right)) / 86_400_000;
}

function weightedScore(dimensions, weights) {
  let totalWeight = 0;
  let total = 0;
  for (const [key, rawWeight] of Object.entries(weights)) {
    const weight = Math.max(0, Number(rawWeight) || 0);
    totalWeight += weight;
    total += (dimensions[key] ?? 0) * weight;
  }
  return totalWeight > 0 ? clamp(total / totalWeight) : 0;
}

function workStateFor(score, count, minimumEvidence) {
  if (count < minimumEvidence) return "low-evidence";
  if (score >= 0.62) return "investigate";
  if (score >= 0.4) return "validate";
  return "observe";
}

export function scoreTopic(topic, allReviews, options = {}) {
  const now = options.now ?? new Date().toISOString();
  const minimumEvidence = options.minimumEvidence ?? 5;
  const weights = { ...DEFAULT_WEIGHTS, ...(options.weights ?? {}) };
  const reviewIds = new Set([...topic.evidenceIds, ...topic.counterEvidenceIds]);
  const reviews = allReviews.filter((review) => reviewIds.has(review.reviewIdHash));
  const count = reviews.length;
  const nowTime = Date.parse(now);
  const currentStart = nowTime - 7 * 86_400_000;
  const previousStart = nowTime - 14 * 86_400_000;
  const currentCount = reviews.filter((review) => Date.parse(review.createdAt) >= currentStart && Date.parse(review.createdAt) < nowTime).length;
  const previousCount = reviews.filter((review) => Date.parse(review.createdAt) >= previousStart && Date.parse(review.createdAt) < currentStart).length;
  const growth = currentCount <= previousCount ? 0 : (currentCount - previousCount) / Math.max(1, previousCount);
  const negativeCount = reviews.filter((review) => !review.recommended).length;
  const coreCount = reviews.filter((review) => review.playerSegment === "core").length;
  const newestReview = reviews.reduce((latest, review) => (review.createdAt > latest ? review.createdAt : latest), "");
  const nearestVersionDays = newestReview && options.versions?.length
    ? Math.min(...options.versions.map((version) => daysBetween(newestReview, version.releasedAt)))
    : Number.POSITIVE_INFINITY;

  const dimensions = Object.freeze({
    volume: clamp(1 - Math.exp(-count / 12)),
    velocity: clamp(growth / 2),
    baselineDeviation: clamp((currentCount - previousCount) / Math.max(4, previousCount * 2)),
    negativeIntensity: count > 0 ? clamp(negativeCount / count) : 0,
    coreImpact: count > 0 ? clamp(coreCount / count) : 0,
    versionProximity: Number.isFinite(nearestVersionDays) ? clamp(1 - nearestVersionDays / 30) : 0,
  });
  const score = weightedScore(dimensions, weights);
  const confidence = count === 0 ? 0 : clamp(Math.sqrt(count / 25) * (0.65 + dimensions.negativeIntensity * 0.35));
  const limitations = [];
  if (count < minimumEvidence) limitations.push("sample-below-threshold");
  if (previousCount === 0) limitations.push("no-prior-window-baseline");
  if (!options.versions?.length) limitations.push("no-version-nodes");

  return Object.freeze({
    ...structuredClone(topic),
    dimensions,
    raw: Object.freeze({ count, currentCount, previousCount, negativeCount, coreCount, nearestVersionDays }),
    score,
    confidence,
    workState: workStateFor(score, count, minimumEvidence),
    limitations: Object.freeze(limitations),
  });
}

export function scoreTopics(topics, reviews, options = {}) {
  return topics
    .map((topic) => scoreTopic(topic, reviews, options))
    .sort((left, right) => right.score - left.score || right.raw.count - left.raw.count || left.id.localeCompare(right.id));
}
