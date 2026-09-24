import { assertNoIdentityFields } from "../data/privacy.js";

const WORK_STATES = new Set(["investigate", "validate", "observe", "low-evidence"]);

function clone(value) {
  return structuredClone(value);
}

function deepFreeze(value, visited = new WeakSet()) {
  if (value === null || typeof value !== "object" || visited.has(value)) return value;
  visited.add(value);
  for (const nested of Object.values(value)) deepFreeze(nested, visited);
  return Object.freeze(value);
}

function immutable(value) {
  assertNoIdentityFields(value);
  return deepFreeze(clone(value));
}

function requireString(value, name, minimum = 1) {
  if (typeof value !== "string" || value.trim().length < minimum) {
    throw new TypeError(`${name} must be a string with at least ${minimum} character(s)`);
  }
  return value.trim();
}

function requireIsoDate(value, name) {
  requireString(value, name);
  if (!Number.isFinite(Date.parse(value))) throw new TypeError(`${name} must be an ISO date`);
  return new Date(value).toISOString();
}

function requireUrl(value, name) {
  requireString(value, name);
  const parsed = new URL(value);
  if (!/^https:$/.test(parsed.protocol)) throw new TypeError(`${name} must use HTTPS`);
  return parsed.href;
}

function requireNonNegative(value, name, integer = false) {
  if (!Number.isFinite(value) || value < 0 || (integer && !Number.isInteger(value))) {
    throw new TypeError(`${name} must be a non-negative ${integer ? "integer" : "number"}`);
  }
  return value;
}

function createSourceRecord(source) {
  return {
    provider: requireString(source?.provider, "source.provider"),
    url: requireUrl(source?.url, "source.url"),
    retrievedAt: requireIsoDate(source?.retrievedAt, "source.retrievedAt"),
  };
}

function requireHash(value, name) {
  if (typeof value !== "string" || !/^[a-f0-9]{64}$/i.test(value)) {
    throw new TypeError(`${name} must be a 64-character hexadecimal hash`);
  }
  return value.toLowerCase();
}

export function createGameRecord(input) {
  assertNoIdentityFields(input);
  return immutable({
    id: requireString(input?.id, "game.id"),
    appId: requireNonNegative(input?.appId, "game.appId", true),
    name: requireString(input?.name, "game.name"),
    storeUrl: requireUrl(input?.storeUrl, "game.storeUrl"),
    capsuleUrl: input?.capsuleUrl ? requireUrl(input.capsuleUrl, "game.capsuleUrl") : null,
    source: createSourceRecord(input?.source),
  });
}

export function createReviewRecord(input) {
  assertNoIdentityFields(input);
  if (typeof input?.recommended !== "boolean") throw new TypeError("review.recommended must be boolean");
  return immutable({
    reviewIdHash: requireHash(input.reviewIdHash, "review.reviewIdHash"),
    text: requireString(input.text, "review.text", 4),
    createdAt: requireIsoDate(input.createdAt, "review.createdAt"),
    recommended: input.recommended,
    playtimeMinutes: requireNonNegative(input.playtimeMinutes, "review.playtimeMinutes"),
    helpfulVotes: requireNonNegative(input.helpfulVotes, "review.helpfulVotes", true),
    language: requireString(input.language, "review.language"),
    source: createSourceRecord(input.source),
  });
}

export function createVersionRecord(input) {
  assertNoIdentityFields(input);
  return immutable({
    id: requireString(input?.id, "version.id"),
    name: requireString(input?.name, "version.name"),
    releasedAt: requireIsoDate(input?.releasedAt, "version.releasedAt"),
    sourceUrl: requireUrl(input?.sourceUrl, "version.sourceUrl"),
    notes: typeof input?.notes === "string" ? input.notes.trim() : "",
  });
}

export function createTopicRecord(input) {
  assertNoIdentityFields(input);
  if (!WORK_STATES.has(input?.workState)) throw new TypeError("topic.workState is unsupported");
  if (!Number.isFinite(input?.confidence) || input.confidence < 0 || input.confidence > 1) {
    throw new TypeError("topic.confidence must be between zero and one");
  }
  const metrics = clone(input.metrics ?? {});
  for (const [key, value] of Object.entries(metrics)) {
    if (!Number.isFinite(value)) throw new TypeError(`topic.metrics.${key} must be finite`);
  }
  return immutable({
    id: requireString(input.id, "topic.id"),
    label: requireString(input.label, "topic.label"),
    category: requireString(input.category, "topic.category"),
    evidenceIds: (input.evidenceIds ?? []).map((id) => requireHash(id, "topic.evidenceIds[]")),
    counterEvidenceIds: (input.counterEvidenceIds ?? []).map((id) => requireHash(id, "topic.counterEvidenceIds[]")),
    metrics,
    confidence: input.confidence,
    workState: input.workState,
  });
}

export function createAnalysisRecord(input) {
  assertNoIdentityFields(input);
  const sample = {
    fetched: requireNonNegative(input?.sample?.fetched, "analysis.sample.fetched", true),
    accepted: requireNonNegative(input?.sample?.accepted, "analysis.sample.accepted", true),
    excluded: requireNonNegative(input?.sample?.excluded, "analysis.sample.excluded", true),
  };
  if (sample.accepted + sample.excluded > sample.fetched) {
    throw new TypeError("analysis.sample accepted and excluded cannot exceed fetched");
  }
  return immutable({
    id: requireString(input.id, "analysis.id"),
    gameId: requireString(input.gameId, "analysis.gameId"),
    generatedAt: requireIsoDate(input.generatedAt, "analysis.generatedAt"),
    sample,
    versionIds: (input.versionIds ?? []).map((id) => requireString(id, "analysis.versionIds[]")),
    topics: (input.topics ?? []).map((topic) => createTopicRecord(topic)),
    source: createSourceRecord(input.source),
  });
}

export function createActionCardRecord(input) {
  assertNoIdentityFields(input);
  return immutable({
    id: requireString(input?.id, "actionCard.id"),
    analysisId: requireString(input?.analysisId, "actionCard.analysisId"),
    topicId: requireString(input?.topicId, "actionCard.topicId"),
    createdAt: requireIsoDate(input?.createdAt, "actionCard.createdAt"),
    title: requireString(input?.title, "actionCard.title"),
    observation: requireString(input?.observation, "actionCard.observation"),
    unknowns: (input?.unknowns ?? []).map((item) => requireString(item, "actionCard.unknowns[]")),
    nextStep: requireString(input?.nextStep, "actionCard.nextStep"),
    evidenceIds: (input?.evidenceIds ?? []).map((id) => requireHash(id, "actionCard.evidenceIds[]")),
  });
}
