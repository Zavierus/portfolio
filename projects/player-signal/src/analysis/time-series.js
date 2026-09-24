function createBucket(date) {
  return { date, total: 0, positive: 0, negative: 0, segments: { new: 0, mid: 0, core: 0 } };
}

export function createDailySeries(reviews) {
  const buckets = new Map();
  for (const review of reviews) {
    const date = new Date(review.createdAt).toISOString().slice(0, 10);
    if (!buckets.has(date)) buckets.set(date, createBucket(date));
    const bucket = buckets.get(date);
    bucket.total += 1;
    bucket[review.recommended ? "positive" : "negative"] += 1;
    if (Object.hasOwn(bucket.segments, review.playerSegment)) bucket.segments[review.playerSegment] += 1;
  }
  return [...buckets.values()].sort((left, right) => left.date.localeCompare(right.date));
}
