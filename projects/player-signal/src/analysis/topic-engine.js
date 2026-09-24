import { DEFAULT_TOPIC_DICTIONARY } from "./topic-dictionary.js";

function escapeExpression(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function termMatches(text, term) {
  const normalizedText = String(text).toLocaleLowerCase("en-US");
  const normalizedTerm = String(term).toLocaleLowerCase("en-US");
  if (normalizedTerm.includes(" ") || /[^a-z0-9]/.test(normalizedTerm)) return normalizedText.includes(normalizedTerm);
  return new RegExp(`\\b${escapeExpression(normalizedTerm)}\\b`, "i").test(normalizedText);
}

function unique(values) {
  return [...new Set(values)];
}

function freeze(value) {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const nested of Object.values(value)) freeze(nested);
  }
  return value;
}

function topicFromDefinition(definition) {
  return {
    id: definition.id,
    label: definition.label,
    category: definition.category,
    evidenceIds: [],
    counterEvidenceIds: [],
    matchedTerms: [],
  };
}

export function deriveTopics(reviews, options = {}) {
  const dictionary = options.dictionary ?? DEFAULT_TOPIC_DICTIONARY;
  const topics = new Map();
  const assignments = [];
  const unclassified = [];

  for (const review of reviews) {
    const topicIds = [];
    for (const definition of dictionary) {
      const matchedTerms = definition.terms.filter((term) => termMatches(review.normalizedText ?? review.text, term));
      if (matchedTerms.length === 0) continue;
      if (!topics.has(definition.id)) topics.set(definition.id, topicFromDefinition(definition));
      const topic = topics.get(definition.id);
      topic[review.recommended ? "counterEvidenceIds" : "evidenceIds"].push(review.reviewIdHash);
      topic.matchedTerms.push(...matchedTerms);
      topicIds.push(definition.id);
    }
    const assignment = { reviewIdHash: review.reviewIdHash, topicIds: unique(topicIds) };
    assignments.push(assignment);
    if (topicIds.length === 0) unclassified.push({ reviewIdHash: review.reviewIdHash, reason: "no-dictionary-match" });
  }

  return freeze({
    topics: [...topics.values()].map((topic) => ({ ...topic, matchedTerms: unique(topic.matchedTerms).sort() })),
    assignments,
    unclassified,
    corrections: [],
    dictionaryVersion: "seed-v1",
  });
}

function evidenceForReviews(reviews) {
  return {
    evidenceIds: reviews.filter((review) => !review.recommended).map((review) => review.reviewIdHash),
    counterEvidenceIds: reviews.filter((review) => review.recommended).map((review) => review.reviewIdHash),
  };
}

export function applyTopicCorrections(derived, reviews, corrections = {}) {
  const topics = structuredClone(derived.topics);
  const correctionLog = [...(derived.corrections ?? [])];
  const reviewById = new Map(reviews.map((review) => [review.reviewIdHash, review]));

  for (const [topicId, label] of Object.entries(corrections.renames ?? {})) {
    const topic = topics.find((candidate) => candidate.id === topicId);
    if (!topic || typeof label !== "string" || !label.trim()) continue;
    topic.label = label.trim();
    correctionLog.push({ type: "rename", topicId, label: topic.label });
  }

  for (const split of corrections.splits ?? []) {
    const sourceIndex = topics.findIndex((topic) => topic.id === split.sourceId);
    if (sourceIndex < 0 || !Array.isArray(split.groups) || split.groups.length < 2) continue;
    const source = topics[sourceIndex];
    const sourceReviewIds = unique([...source.evidenceIds, ...source.counterEvidenceIds]);
    const sourceReviews = sourceReviewIds.map((id) => reviewById.get(id)).filter(Boolean);
    const splitTopics = split.groups.map((group) => {
      const matchedReviews = sourceReviews.filter((review) =>
        group.terms.some((term) => termMatches(review.normalizedText ?? review.text, term)),
      );
      return {
        id: group.id,
        label: group.label,
        category: source.category,
        ...evidenceForReviews(matchedReviews),
        matchedTerms: unique(group.terms),
      };
    });
    topics.splice(sourceIndex, 1, ...splitTopics.filter((topic) => topic.evidenceIds.length + topic.counterEvidenceIds.length > 0));
    correctionLog.push({ type: "split", sourceId: split.sourceId, targetIds: splitTopics.map((topic) => topic.id) });
  }

  for (const merge of corrections.merges ?? []) {
    const sources = topics.filter((topic) => merge.from.includes(topic.id));
    if (sources.length === 0) continue;
    const merged = {
      id: merge.into.id,
      label: merge.into.label,
      category: merge.into.category,
      evidenceIds: unique(sources.flatMap((topic) => topic.evidenceIds)),
      counterEvidenceIds: unique(sources.flatMap((topic) => topic.counterEvidenceIds)),
      matchedTerms: unique(sources.flatMap((topic) => topic.matchedTerms)).sort(),
    };
    const sourceIds = new Set(merge.from);
    for (let index = topics.length - 1; index >= 0; index -= 1) {
      if (sourceIds.has(topics[index].id)) topics.splice(index, 1);
    }
    topics.push(merged);
    correctionLog.push({ type: "merge", sourceIds: [...merge.from], targetId: merged.id });
  }

  return freeze({ ...structuredClone(derived), topics, corrections: correctionLog });
}
