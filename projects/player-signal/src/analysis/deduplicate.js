function comparableTokens(text) {
  return String(text)
    .toLocaleLowerCase("en-US")
    .match(/[\p{L}\p{N}]+/gu) ?? [];
}

export function tokenSet(text) {
  return new Set(comparableTokens(text));
}

export function jaccardSimilarity(left, right) {
  if (left.size === 0 && right.size === 0) return 1;
  if (left.size === 0 || right.size === 0) return 0;
  let intersection = 0;
  const smaller = left.size <= right.size ? left : right;
  const larger = smaller === left ? right : left;
  for (const value of smaller) if (larger.has(value)) intersection += 1;
  return intersection / (left.size + right.size - intersection);
}

function candidateKeys(tokens) {
  const sorted = [...tokens].sort();
  const sizeBand = Math.floor(sorted.length / 3);
  const anchors = sorted.slice(0, 3);
  return anchors.map((anchor) => `${anchor}|${sizeBand}`);
}

export function partitionDuplicates(reviews, threshold = 0.9) {
  const exact = new Map();
  const candidates = new Map();
  const accepted = [];
  const excluded = [];
  const groups = new Map();

  for (const review of reviews) {
    const canonical = review.normalizedText.toLocaleLowerCase("en-US");
    const exactPrimary = exact.get(canonical);
    if (exactPrimary) {
      excluded.push({ review, reason: "exact-duplicate", duplicateOf: exactPrimary.reviewIdHash });
      if (!groups.has(exactPrimary.reviewIdHash)) groups.set(exactPrimary.reviewIdHash, []);
      groups.get(exactPrimary.reviewIdHash).push(review.reviewIdHash);
      continue;
    }

    const tokens = tokenSet(review.normalizedText);
    const keys = candidateKeys(tokens);
    const possible = new Set(keys.flatMap((key) => candidates.get(key) ?? []));
    let nearPrimary = null;
    for (const candidate of possible) {
      if (jaccardSimilarity(tokens, candidate.tokens) >= threshold) {
        nearPrimary = candidate.review;
        break;
      }
    }
    if (nearPrimary) {
      excluded.push({ review, reason: "near-duplicate", duplicateOf: nearPrimary.reviewIdHash });
      if (!groups.has(nearPrimary.reviewIdHash)) groups.set(nearPrimary.reviewIdHash, []);
      groups.get(nearPrimary.reviewIdHash).push(review.reviewIdHash);
      exact.set(canonical, nearPrimary);
      continue;
    }

    const entry = { review, tokens };
    accepted.push(review);
    exact.set(canonical, review);
    for (const key of keys) {
      if (!candidates.has(key)) candidates.set(key, []);
      candidates.get(key).push(entry);
    }
  }

  return {
    accepted,
    excluded,
    groups: [...groups.entries()].map(([primaryId, duplicateIds]) => ({ primaryId, duplicateIds })),
  };
}
