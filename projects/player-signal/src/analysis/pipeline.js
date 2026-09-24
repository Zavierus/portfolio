import { cleanReviewSample } from "./normalize.js";
import { scoreTopics } from "./signal-score.js";
import { applyTopicCorrections, deriveTopics } from "./topic-engine.js";

export function analyzeDataset(dataset, options = {}, onProgress = () => {}) {
  onProgress({ progress: 0.12, stage: "cleaning" });
  const cleaning = cleanReviewSample(dataset?.reviews ?? [], options);
  onProgress({ progress: 0.58, stage: "topics" });
  const derived = deriveTopics(cleaning.acceptedReviews, options);
  const corrected = applyTopicCorrections(derived, cleaning.acceptedReviews, options.corrections ?? {});
  const topics = scoreTopics(corrected.topics, cleaning.acceptedReviews, {
    ...options,
    now: options.now ?? dataset?.source?.retrievedAt,
    versions: dataset?.versions ?? [],
  });
  return Object.freeze({
    cleaning,
    topics,
    assignments: corrected.assignments,
    unclassified: corrected.unclassified,
    corrections: corrected.corrections,
  });
}
