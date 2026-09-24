import { partitionDuplicates, tokenSet } from "./deduplicate.js";
import { createDailySeries } from "./time-series.js";

const DEFAULT_THRESHOLDS = Object.freeze({ newMaxMinutes: 600, coreMinMinutes: 6000 });
const ENTITY_MAP = Object.freeze({ amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " });

function decodeEntities(text) {
  return text.replace(/&(?:amp|lt|gt|quot|apos|nbsp);/gi, (entity) => ENTITY_MAP[entity.slice(1, -1).toLowerCase()] ?? entity);
}

export function normalizeReviewText(value) {
  return decodeEntities(
    String(value ?? "")
      .replace(/<[^>]*>/g, " ")
      .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, " ")
      .replace(/\s+/g, " ")
      .trim(),
  );
}

export function resolvePlayerSegment(playtimeMinutes, thresholds = DEFAULT_THRESHOLDS) {
  const minutes = Math.max(0, Number(playtimeMinutes) || 0);
  if (minutes < thresholds.newMaxMinutes) return "new";
  if (minutes >= thresholds.coreMinMinutes) return "core";
  return "mid";
}

function exclusion(review, reason, extra = {}) {
  return { reviewIdHash: review.reviewIdHash, reason, ...extra };
}

function freezeResult(value) {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const nested of Object.values(value)) freezeResult(nested);
  }
  return value;
}

export function cleanReviewSample(reviews, options = {}) {
  const supportedLanguages = new Set(options.supportedLanguages ?? ["english"]);
  const thresholds = { ...DEFAULT_THRESHOLDS, ...(options.playerThresholds ?? {}) };
  const prepared = [];
  const excludedReviews = [];

  for (const sourceReview of reviews) {
    const review = structuredClone(sourceReview);
    const normalizedText = normalizeReviewText(review.text);
    if (!supportedLanguages.has(review.language)) {
      excludedReviews.push(exclusion(review, "unsupported-language"));
      continue;
    }
    const tokens = tokenSet(normalizedText);
    const letterCount = (normalizedText.match(/[\p{L}\p{N}]/gu) ?? []).length;
    if (normalizedText.length < 4 || tokens.size < 2 || letterCount < 4) {
      excludedReviews.push(exclusion(review, "low-information"));
      continue;
    }
    prepared.push({
      ...review,
      normalizedText,
      playerSegment: resolvePlayerSegment(review.playtimeMinutes, thresholds),
      analysisWeight: normalizedText.length < 16 ? 0.5 : 1,
    });
  }

  const duplicates = partitionDuplicates(prepared, options.nearDuplicateThreshold ?? 0.9);
  for (const item of duplicates.excluded) {
    excludedReviews.push(exclusion(item.review, item.reason, { duplicateOf: item.duplicateOf }));
  }
  const exclusionCounts = {};
  for (const item of excludedReviews) exclusionCounts[item.reason] = (exclusionCounts[item.reason] ?? 0) + 1;
  const acceptedReviews = duplicates.accepted;
  const playerSegments = acceptedReviews.reduce(
    (counts, review) => ({ ...counts, [review.playerSegment]: counts[review.playerSegment] + 1 }),
    { new: 0, mid: 0, core: 0 },
  );

  return freezeResult({
    acceptedReviews,
    excludedReviews,
    exclusionCounts,
    duplicateGroups: duplicates.groups,
    playerSegments,
    dailySeries: createDailySeries(acceptedReviews),
    sampleAccounting: {
      fetched: reviews.length,
      accepted: acceptedReviews.length,
      excluded: excludedReviews.length,
    },
    options: {
      supportedLanguages: [...supportedLanguages],
      nearDuplicateThreshold: options.nearDuplicateThreshold ?? 0.9,
      playerThresholds: thresholds,
    },
  });
}
