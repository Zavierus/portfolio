(() => {
  // src/analysis/deduplicate.js
  function comparableTokens(text) {
    return String(text).toLocaleLowerCase("en-US").match(/[\p{L}\p{N}]+/gu) ?? [];
  }
  function tokenSet(text) {
    return new Set(comparableTokens(text));
  }
  function jaccardSimilarity(left, right) {
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
  function partitionDuplicates(reviews, threshold = 0.9) {
    const exact = /* @__PURE__ */ new Map();
    const candidates = /* @__PURE__ */ new Map();
    const accepted = [];
    const excluded = [];
    const groups = /* @__PURE__ */ new Map();
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
      groups: [...groups.entries()].map(([primaryId, duplicateIds]) => ({ primaryId, duplicateIds }))
    };
  }

  // src/analysis/time-series.js
  function createBucket(date) {
    return { date, total: 0, positive: 0, negative: 0, segments: { new: 0, mid: 0, core: 0 } };
  }
  function createDailySeries(reviews) {
    const buckets = /* @__PURE__ */ new Map();
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

  // src/analysis/normalize.js
  var DEFAULT_THRESHOLDS = Object.freeze({ newMaxMinutes: 600, coreMinMinutes: 6e3 });
  var ENTITY_MAP = Object.freeze({ amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " });
  function decodeEntities(text) {
    return text.replace(/&(?:amp|lt|gt|quot|apos|nbsp);/gi, (entity) => ENTITY_MAP[entity.slice(1, -1).toLowerCase()] ?? entity);
  }
  function normalizeReviewText(value) {
    return decodeEntities(
      String(value ?? "").replace(/<[^>]*>/g, " ").replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, " ").replace(/\s+/g, " ").trim()
    );
  }
  function resolvePlayerSegment(playtimeMinutes, thresholds = DEFAULT_THRESHOLDS) {
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
  function cleanReviewSample(reviews, options = {}) {
    const supportedLanguages = new Set(options.supportedLanguages ?? ["english"]);
    const thresholds = { ...DEFAULT_THRESHOLDS, ...options.playerThresholds ?? {} };
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
        analysisWeight: normalizedText.length < 16 ? 0.5 : 1
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
      { new: 0, mid: 0, core: 0 }
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
        excluded: excludedReviews.length
      },
      options: {
        supportedLanguages: [...supportedLanguages],
        nearDuplicateThreshold: options.nearDuplicateThreshold ?? 0.9,
        playerThresholds: thresholds
      }
    });
  }

  // src/analysis/signal-score.js
  var DEFAULT_WEIGHTS = Object.freeze({
    volume: 0.2,
    velocity: 0.22,
    baselineDeviation: 0.17,
    negativeIntensity: 0.16,
    coreImpact: 0.15,
    versionProximity: 0.1
  });
  function clamp(value, minimum = 0, maximum = 1) {
    return Math.min(maximum, Math.max(minimum, Number.isFinite(value) ? value : 0));
  }
  function daysBetween(left, right) {
    return Math.abs(Date.parse(left) - Date.parse(right)) / 864e5;
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
  function scoreTopic(topic, allReviews, options = {}) {
    const now = options.now ?? (/* @__PURE__ */ new Date()).toISOString();
    const minimumEvidence = options.minimumEvidence ?? 5;
    const weights = { ...DEFAULT_WEIGHTS, ...options.weights ?? {} };
    const reviewIds = /* @__PURE__ */ new Set([...topic.evidenceIds, ...topic.counterEvidenceIds]);
    const reviews = allReviews.filter((review) => reviewIds.has(review.reviewIdHash));
    const count = reviews.length;
    const nowTime = Date.parse(now);
    const currentStart = nowTime - 7 * 864e5;
    const previousStart = nowTime - 14 * 864e5;
    const currentCount = reviews.filter((review) => Date.parse(review.createdAt) >= currentStart && Date.parse(review.createdAt) < nowTime).length;
    const previousCount = reviews.filter((review) => Date.parse(review.createdAt) >= previousStart && Date.parse(review.createdAt) < currentStart).length;
    const growth = currentCount <= previousCount ? 0 : (currentCount - previousCount) / Math.max(1, previousCount);
    const negativeCount = reviews.filter((review) => !review.recommended).length;
    const coreCount = reviews.filter((review) => review.playerSegment === "core").length;
    const newestReview = reviews.reduce((latest, review) => review.createdAt > latest ? review.createdAt : latest, "");
    const nearestVersionDays = newestReview && options.versions?.length ? Math.min(...options.versions.map((version) => daysBetween(newestReview, version.releasedAt))) : Number.POSITIVE_INFINITY;
    const dimensions = Object.freeze({
      volume: clamp(1 - Math.exp(-count / 12)),
      velocity: clamp(growth / 2),
      baselineDeviation: clamp((currentCount - previousCount) / Math.max(4, previousCount * 2)),
      negativeIntensity: count > 0 ? clamp(negativeCount / count) : 0,
      coreImpact: count > 0 ? clamp(coreCount / count) : 0,
      versionProximity: Number.isFinite(nearestVersionDays) ? clamp(1 - nearestVersionDays / 30) : 0
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
      limitations: Object.freeze(limitations)
    });
  }
  function scoreTopics(topics, reviews, options = {}) {
    return topics.map((topic) => scoreTopic(topic, reviews, options)).sort((left, right) => right.score - left.score || right.raw.count - left.raw.count || left.id.localeCompare(right.id));
  }

  // src/analysis/topic-dictionary.js
  var definitions = [
    ["performance", "Performance", "performance", ["frame rate", "fps", "stutter", "frame pacing", "performance", "optimization", "lag spike"]],
    ["stability", "Crashes and stability", "stability", ["crash", "crashes", "crashed", "freeze", "freezing", "hang", "won't launch", "black screen"]],
    ["controls", "Controls and input", "controls", ["controller", "input delay", "key binding", "keybind", "mouse sensitivity", "controls", "remapping"]],
    ["multiplayer", "Multiplayer and matchmaking", "multiplayer", ["matchmaking", "multiplayer", "cannot join", "can't join", "disconnect", "desync", "find my friends"]],
    ["balance", "Combat and balance", "balance", ["balance", "overpowered", "underpowered", "damage", "difficulty", "combat", "nerf"]],
    ["content", "Content and progression", "content", ["content", "expedition", "mission", "quest", "progression", "endgame", "repetitive"]],
    ["onboarding", "Onboarding and clarity", "onboarding", ["tutorial", "onboarding", "confusing", "unclear", "new player", "learning curve", "instructions"]],
    ["monetization", "Price and monetization", "monetization", ["price", "expensive", "microtransaction", "dlc", "paywall", "monetization", "value for money"]],
    ["base-building", "Base building", "base-building", ["base building", "base parts", "snapping", "build menu", "settlement", "construction"]],
    ["interface", "Interface and accessibility", "interface", ["interface", "inventory", "menu", "accessibility", "text size", "widescreen", "hud"]]
  ];
  var DEFAULT_TOPIC_DICTIONARY = Object.freeze(
    definitions.map(
      ([id, label, category, terms]) => Object.freeze({ id, label, category, terms: Object.freeze(terms) })
    )
  );

  // src/analysis/topic-engine.js
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
      matchedTerms: []
    };
  }
  function deriveTopics(reviews, options = {}) {
    const dictionary = options.dictionary ?? DEFAULT_TOPIC_DICTIONARY;
    const topics = /* @__PURE__ */ new Map();
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
      dictionaryVersion: "seed-v1"
    });
  }
  function evidenceForReviews(reviews) {
    return {
      evidenceIds: reviews.filter((review) => !review.recommended).map((review) => review.reviewIdHash),
      counterEvidenceIds: reviews.filter((review) => review.recommended).map((review) => review.reviewIdHash)
    };
  }
  function applyTopicCorrections(derived, reviews, corrections = {}) {
    const topics = structuredClone(derived.topics);
    const correctionLog = [...derived.corrections ?? []];
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
        const matchedReviews = sourceReviews.filter(
          (review) => group.terms.some((term) => termMatches(review.normalizedText ?? review.text, term))
        );
        return {
          id: group.id,
          label: group.label,
          category: source.category,
          ...evidenceForReviews(matchedReviews),
          matchedTerms: unique(group.terms)
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
        matchedTerms: unique(sources.flatMap((topic) => topic.matchedTerms)).sort()
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

  // src/analysis/pipeline.js
  function analyzeDataset(dataset, options = {}, onProgress = () => {
  }) {
    onProgress({ progress: 0.12, stage: "cleaning" });
    const cleaning = cleanReviewSample(dataset?.reviews ?? [], options);
    onProgress({ progress: 0.58, stage: "topics" });
    const derived = deriveTopics(cleaning.acceptedReviews, options);
    const corrected = applyTopicCorrections(derived, cleaning.acceptedReviews, options.corrections ?? {});
    const topics = scoreTopics(corrected.topics, cleaning.acceptedReviews, {
      ...options,
      now: options.now ?? dataset?.source?.retrievedAt,
      versions: dataset?.versions ?? []
    });
    return Object.freeze({
      cleaning,
      topics,
      assignments: corrected.assignments,
      unclassified: corrected.unclassified,
      corrections: corrected.corrections
    });
  }

  // src/data/privacy.js
  var IDENTITY_KEYS = /* @__PURE__ */ new Set([
    "steamid",
    "steamid64",
    "author",
    "authorid",
    "personaname",
    "playername",
    "profileurl",
    "profileuri",
    "avatar",
    "avatarfull",
    "avatarmedium"
  ]);
  function normalizeKey(key) {
    return String(key).replace(/[^a-z0-9]/gi, "").toLowerCase();
  }
  function assertNoIdentityFields(value, path = "root", visited = /* @__PURE__ */ new WeakSet()) {
    if (value === null || typeof value !== "object") return true;
    if (visited.has(value)) return true;
    visited.add(value);
    for (const [key, nestedValue] of Object.entries(value)) {
      const keyPath = Array.isArray(value) ? `${path}[${key}]` : `${path}.${key}`;
      if (IDENTITY_KEYS.has(normalizeKey(key))) {
        throw new TypeError(`Forbidden identity field at ${keyPath}`);
      }
      assertNoIdentityFields(nestedValue, keyPath, visited);
    }
    return true;
  }

  // src/domain/schemas.js
  function clone(value) {
    return structuredClone(value);
  }
  function deepFreeze(value, visited = /* @__PURE__ */ new WeakSet()) {
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
    if (!Number.isFinite(value) || value < 0 || integer && !Number.isInteger(value)) {
      throw new TypeError(`${name} must be a non-negative ${integer ? "integer" : "number"}`);
    }
    return value;
  }
  function createSourceRecord(source) {
    return {
      provider: requireString(source?.provider, "source.provider"),
      url: requireUrl(source?.url, "source.url"),
      retrievedAt: requireIsoDate(source?.retrievedAt, "source.retrievedAt")
    };
  }
  function requireHash(value, name) {
    if (typeof value !== "string" || !/^[a-f0-9]{64}$/i.test(value)) {
      throw new TypeError(`${name} must be a 64-character hexadecimal hash`);
    }
    return value.toLowerCase();
  }
  function createGameRecord(input) {
    assertNoIdentityFields(input);
    return immutable({
      id: requireString(input?.id, "game.id"),
      appId: requireNonNegative(input?.appId, "game.appId", true),
      name: requireString(input?.name, "game.name"),
      storeUrl: requireUrl(input?.storeUrl, "game.storeUrl"),
      capsuleUrl: input?.capsuleUrl ? requireUrl(input.capsuleUrl, "game.capsuleUrl") : null,
      source: createSourceRecord(input?.source)
    });
  }
  function createReviewRecord(input) {
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
      source: createSourceRecord(input.source)
    });
  }
  function createVersionRecord(input) {
    assertNoIdentityFields(input);
    return immutable({
      id: requireString(input?.id, "version.id"),
      name: requireString(input?.name, "version.name"),
      releasedAt: requireIsoDate(input?.releasedAt, "version.releasedAt"),
      sourceUrl: requireUrl(input?.sourceUrl, "version.sourceUrl"),
      notes: typeof input?.notes === "string" ? input.notes.trim() : ""
    });
  }

  // src/domain/validators.js
  function error(path, code, message) {
    return Object.freeze({ path, code, message });
  }
  function capture(errors, path, code, operation) {
    try {
      operation();
    } catch (caught) {
      errors.push(error(path, code, caught instanceof Error ? caught.message : String(caught)));
    }
  }
  function collectReviewErrors(review, index, errors) {
    const prefix = `reviews[${index}]`;
    const fields = [
      ["reviewIdHash", () => {
        if (typeof review?.reviewIdHash !== "string" || !/^[a-f0-9]{64}$/i.test(review.reviewIdHash)) throw new Error("must be a 64-character hash");
      }],
      ["text", () => {
        if (typeof review?.text !== "string" || review.text.trim().length < 4) throw new Error("must contain review evidence");
      }],
      ["createdAt", () => {
        if (!Number.isFinite(Date.parse(review?.createdAt))) throw new Error("must be an ISO date");
      }],
      ["recommended", () => {
        if (typeof review?.recommended !== "boolean") throw new Error("must be boolean");
      }],
      ["playtimeMinutes", () => {
        if (!Number.isFinite(review?.playtimeMinutes) || review.playtimeMinutes < 0) throw new Error("must be non-negative");
      }],
      ["helpfulVotes", () => {
        if (!Number.isInteger(review?.helpfulVotes) || review.helpfulVotes < 0) throw new Error("must be a non-negative integer");
      }]
    ];
    for (const [field, operation] of fields) capture(errors, `${prefix}.${field}`, `invalid-${field}`, operation);
    capture(errors, prefix, "invalid-review", () => createReviewRecord(review));
  }
  function validateDataset(input) {
    const errors = [];
    const dataset = structuredClone(input);
    capture(errors, "dataset", "identity-field", () => assertNoIdentityFields(dataset));
    capture(errors, "game", "invalid-game", () => createGameRecord(dataset?.game));
    if (!Array.isArray(dataset?.reviews)) {
      errors.push(error("reviews", "invalid-reviews", "reviews must be an array"));
    } else {
      const seen = /* @__PURE__ */ new Set();
      dataset.reviews.forEach((review, index) => {
        collectReviewErrors(review, index, errors);
        if (seen.has(review?.reviewIdHash)) {
          errors.push(error(`reviews[${index}].reviewIdHash`, "duplicate-review-id", "review hash must be unique"));
        }
        seen.add(review?.reviewIdHash);
      });
    }
    if (!Array.isArray(dataset?.versions)) {
      errors.push(error("versions", "invalid-versions", "versions must be an array"));
    } else {
      const seen = /* @__PURE__ */ new Set();
      dataset.versions.forEach((version, index) => {
        capture(errors, `versions[${index}]`, "invalid-version", () => createVersionRecord(version));
        if (seen.has(version?.id)) {
          errors.push(error(`versions[${index}].id`, "duplicate-version-id", "version id must be unique"));
        }
        seen.add(version?.id);
      });
    }
    return Object.freeze({ ok: errors.length === 0, errors: Object.freeze(errors) });
  }

  // src/data/demo-adapter.js
  var DOCUMENT_URLS = Object.freeze({
    game: "./data/demo-game.json",
    reviews: "./data/demo-reviews.json",
    versions: "./data/demo-versions.json"
  });
  async function loadJson(fetchImpl, url) {
    const response = await fetchImpl(url);
    if (!response?.ok) throw new Error(`Demo source unavailable: ${url}`);
    return response.json();
  }
  function deepFreeze2(value) {
    if (value && typeof value === "object" && !Object.isFrozen(value)) {
      Object.freeze(value);
      for (const nested of Object.values(value)) deepFreeze2(nested);
    }
    return value;
  }
  async function loadDemoDataset(fetchImpl = globalThis.fetch) {
    if (typeof fetchImpl !== "function") throw new TypeError("A fetch implementation is required");
    const [gameDocument, reviewDocument, versionDocument] = await Promise.all([
      loadJson(fetchImpl, DOCUMENT_URLS.game),
      loadJson(fetchImpl, DOCUMENT_URLS.reviews),
      loadJson(fetchImpl, DOCUMENT_URLS.versions)
    ]);
    const source = structuredClone(reviewDocument.source);
    const dataset = {
      mode: "offline-demo",
      game: createGameRecord(gameDocument.game),
      reviews: reviewDocument.reviews.map((review) => createReviewRecord({ ...review, source })),
      versions: versionDocument.versions.map(createVersionRecord),
      source,
      provenance: {
        retrievedAt: source.retrievedAt,
        requestedPages: reviewDocument.requestedPages,
        acceptedCount: reviewDocument.reviews.length,
        exclusionCounts: structuredClone(reviewDocument.exclusionCounts ?? {})
      }
    };
    const validation = validateDataset(dataset);
    if (!validation.ok) {
      throw new TypeError(`Demo dataset is invalid: ${JSON.stringify(validation.errors)}`);
    }
    return deepFreeze2(dataset);
  }

  // src/data/live-dataset.js
  function deepFreeze3(value) {
    if (value && typeof value === "object" && !Object.isFrozen(value)) {
      Object.freeze(value);
      for (const nested of Object.values(value)) deepFreeze3(nested);
    }
    return value;
  }
  function steamStoreUrl(appId) {
    return `https://store.steampowered.com/app/${appId}/`;
  }
  async function loadLiveSteamDataset(client, game, options = {}) {
    if (!client || typeof client.fetchReviews !== "function") throw new TypeError("A Steam review client is required");
    const appId = Number(game?.appId);
    if (!Number.isInteger(appId) || appId <= 0 || !String(game?.name ?? "").trim()) throw new TypeError("A Steam game result is required");
    const limit = Math.min(500, Math.max(1, Number(options.limit) || 500));
    const pageSize = Math.min(100, Math.max(1, Number(options.pageSize) || 100));
    const reviews = [];
    const visitedCursors = /* @__PURE__ */ new Set();
    let cursor = "*";
    let firstSource = null;
    let partial = false;
    let partialReason = null;
    while (reviews.length < limit && cursor && !visitedCursors.has(cursor)) {
      visitedCursors.add(cursor);
      let page;
      try {
        page = await client.fetchReviews({
          appId,
          language: options.language ?? "english",
          cursor,
          count: Math.min(pageSize, limit - reviews.length)
        }, { signal: options.signal });
      } catch (error2) {
        if (reviews.length === 0) throw error2;
        partial = true;
        partialReason = error2 instanceof Error ? error2.message : String(error2);
        break;
      }
      firstSource ??= page.source;
      for (const review of page.reviews ?? []) {
        if (reviews.length >= limit) break;
        reviews.push(createReviewRecord({ ...review, source: page.source }));
      }
      const nextCursor = String(page.nextCursor ?? "");
      if (!nextCursor || nextCursor === cursor || (page.reviews ?? []).length === 0) break;
      cursor = nextCursor;
    }
    if (!firstSource) throw new Error("Steam returned no review source metadata");
    const storeUrl = steamStoreUrl(appId);
    const gameRecord = createGameRecord({
      id: `steam:${appId}`,
      appId,
      name: String(game.name).trim(),
      storeUrl,
      capsuleUrl: game.capsuleUrl ?? null,
      source: {
        provider: "steam-catalog",
        url: storeUrl,
        retrievedAt: firstSource.retrievedAt
      }
    });
    return deepFreeze3({
      schemaVersion: 1,
      mode: "live",
      game: gameRecord,
      reviews,
      versions: [],
      source: firstSource,
      partial,
      partialReason,
      pageCount: visitedCursors.size
    });
  }

  // src/data/steam-client.js
  var SteamSourceError = class extends Error {
    constructor(message, options = {}) {
      super(message);
      this.name = "SteamSourceError";
      this.status = options.status ?? 0;
      this.retryAfterSeconds = options.retryAfterSeconds ?? null;
      this.recoverable = options.recoverable ?? true;
      this.code = options.code ?? "steam-source-error";
    }
  };
  function normalizedQuery(value) {
    return String(value ?? "").trim().replace(/\s+/g, " ");
  }
  async function readResponse(response) {
    let body;
    try {
      body = await response.json();
    } catch {
      throw new SteamSourceError("The Steam adapter returned invalid JSON", { status: response.status, code: "invalid-json" });
    }
    if (!response.ok) {
      const retryAfter = Number.parseInt(response.headers?.get?.("retry-after") ?? "", 10);
      throw new SteamSourceError(body?.error ?? `The Steam adapter returned HTTP ${response.status}`, {
        status: response.status,
        retryAfterSeconds: Number.isFinite(retryAfter) ? retryAfter : null,
        code: response.status === 429 ? "rate-limited" : "upstream-error"
      });
    }
    assertNoIdentityFields(body);
    return body;
  }
  function createSteamClient(options = {}) {
    const fetchImpl = options.fetchImpl ?? globalThis.fetch;
    const baseUrl = options.baseUrl ?? "http://player-signal.local";
    if (typeof fetchImpl !== "function") throw new TypeError("A fetch implementation is required");
    return Object.freeze({
      async checkAvailability(requestOptions = {}) {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 2500);
        try {
          const result = await this.searchGames("No Man's Sky", { ...requestOptions, signal: controller.signal });
          return Object.freeze({ available: true, reason: null, sampleGame: result.games[0] ?? null, checkedAt: (/* @__PURE__ */ new Date()).toISOString() });
        } catch (error2) {
          const notDeployed = error2 instanceof SteamSourceError && ["invalid-json", "invalid-contract"].includes(error2.code);
          return Object.freeze({
            available: false,
            reason: notDeployed || error2?.status === 404 || error2?.name === "AbortError" ? "not-deployed" : error2?.code ?? "connector-unavailable",
            sampleGame: null,
            checkedAt: (/* @__PURE__ */ new Date()).toISOString()
          });
        } finally {
          clearTimeout(timeout);
        }
      },
      async searchGames(query, requestOptions = {}) {
        const normalized = normalizedQuery(query);
        if (normalized.length < 2) throw new TypeError("Game search requires at least two characters");
        const url = new URL("/api/games", baseUrl);
        url.searchParams.set("q", normalized);
        const response = await fetchImpl(url, { signal: requestOptions.signal, headers: { accept: "application/json" } });
        const body = await readResponse(response);
        if (!Array.isArray(body.games)) throw new SteamSourceError("The game search response is missing games", { code: "invalid-contract" });
        return Object.freeze({ query: normalized, games: Object.freeze(structuredClone(body.games)), cachedAt: body.cachedAt ?? null });
      },
      async fetchReviews(parameters, requestOptions = {}) {
        const appId = Number(parameters?.appId);
        if (!Number.isInteger(appId) || appId <= 0) throw new TypeError("A positive Steam AppID is required");
        const url = new URL("/api/reviews", baseUrl);
        url.searchParams.set("appid", String(appId));
        url.searchParams.set("language", normalizedQuery(parameters.language ?? "english"));
        url.searchParams.set("cursor", String(parameters.cursor ?? "*"));
        url.searchParams.set("count", String(Math.min(100, Math.max(1, Number(parameters.count) || 100))));
        const response = await fetchImpl(url, { signal: requestOptions.signal, headers: { accept: "application/json" } });
        const body = await readResponse(response);
        if (!Array.isArray(body.reviews)) throw new SteamSourceError("The review response is missing reviews", { code: "invalid-contract" });
        return Object.freeze(structuredClone(body));
      }
    });
  }

  // src/export/action-card.js
  function escapeHtml(value) {
    return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
  }
  function excerpt(review) {
    const text = String(review.text ?? "").replace(/\s+/g, " ").trim();
    return Object.freeze({ reviewIdHash: review.reviewIdHash, excerpt: text.length > 240 ? `${text.slice(0, 237)}\u2026` : text, createdAt: review.createdAt, playerSegment: review.playerSegment, recommended: review.recommended });
  }
  function slug(value) {
    return String(value).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 48) || "signal";
  }
  function buildActionCard(topic, reviews, context) {
    const byId = new Map(reviews.map((review) => [review.reviewIdHash, review]));
    const evidence = topic.evidenceIds.map((id) => byId.get(id)).filter(Boolean).map(excerpt).slice(0, 4);
    const counterEvidence = topic.counterEvidenceIds.map((id) => byId.get(id)).filter(Boolean).map(excerpt).slice(0, 3);
    const nextSteps = { investigate: "\u5728\u4E3B\u8981\u786C\u4EF6\u5206\u5C42\u590D\u73B0\u95EE\u9898\uFF0C\u5E76\u6838\u5BF9\u5BA2\u6237\u7AEF\u65E5\u5FD7\u3002", validate: "\u8865\u5145\u4E0B\u4E00\u65F6\u95F4\u7A97\u53E3\u6837\u672C\u5E76\u9A8C\u8BC1\u540C\u7C7B\u8868\u8FBE\u662F\u5426\u6301\u7EED\u589E\u957F\u3002", observe: "\u6301\u7EED\u6536\u96C6\u8BC4\u8BBA\uFF0C\u5728\u6837\u672C\u91CF\u8FBE\u5230\u95E8\u69DB\u540E\u91CD\u65B0\u8BC4\u4F30\u3002", "low-evidence": "\u6269\u5927\u6837\u672C\u5E76\u4EBA\u5DE5\u68C0\u67E5\u5F85\u5206\u7C7B\u8BC4\u8BBA\uFF0C\u6682\u4E0D\u5F62\u6210\u4FEE\u590D\u5224\u65AD\u3002" };
    const card = {
      schemaVersion: 1,
      id: `action:${context.game.appId}:${topic.id}`,
      generatedAt: context.generatedAt,
      game: { id: context.game.id, appId: context.game.appId, name: context.game.name },
      topic: { id: topic.id, label: topic.label, category: topic.category },
      observations: { sampleCount: topic.raw.count, currentWindowCount: topic.raw.currentCount, previousWindowCount: topic.raw.previousCount, negativeShare: topic.raw.count ? topic.raw.negativeCount / topic.raw.count : 0, corePlayerShare: topic.dimensions.coreImpact, velocity: topic.dimensions.velocity },
      inference: { workState: topic.workState, confidence: topic.confidence, priorityScore: topic.score, versionAssociation: topic.dimensions.versionProximity },
      evidence,
      counterEvidence,
      unknowns: ["\u8BC4\u8BBA\u8BC1\u636E\u4E0D\u80FD\u8BC1\u660E\u7A0B\u5E8F\u6839\u56E0\u3001\u4FEE\u590D\u96BE\u5EA6\u6216\u5F00\u53D1\u5DE5\u671F\u3002", "\u7248\u672C\u65F6\u95F4\u53EA\u8868\u793A\u76F8\u5173\u6027\uFF0C\u4E0D\u8BC1\u660E\u66F4\u65B0\u9020\u6210\u8BE5\u53CD\u9988\u3002", ...(topic.limitations ?? []).map((item) => `\u5206\u6790\u9650\u5236\uFF1A${item}`)],
      nextValidationStep: nextSteps[topic.workState] ?? nextSteps.observe,
      source: { provider: context.source.provider, url: context.source.url, retrievedAt: context.source.retrievedAt }
    };
    assertNoIdentityFields(card);
    return Object.freeze(structuredClone(card));
  }
  function markdown(card) {
    const evidenceLines = card.evidence.map((item) => `> ${item.excerpt}
> \u2014 ${item.createdAt.slice(0, 10)} \xB7 ${item.playerSegment} \xB7 ${item.reviewIdHash.slice(0, 10)}`).join("\n\n") || "No supporting excerpt met the evidence threshold.";
    const counterLines = card.counterEvidence.map((item) => `> ${item.excerpt}
> \u2014 ${item.createdAt.slice(0, 10)} \xB7 ${item.playerSegment} \xB7 ${item.reviewIdHash.slice(0, 10)}`).join("\n\n") || "No counter-evidence matched the current topic.";
    return `# ${card.topic.label}

**Game:** ${card.game.name} (AppID ${card.game.appId})  
**Generated:** ${card.generatedAt}  
**Source:** ${card.source.provider} \xB7 ${card.source.retrievedAt}

## Observed evidence

- Accepted topic sample: ${card.observations.sampleCount}
- Current / previous window: ${card.observations.currentWindowCount} / ${card.observations.previousWindowCount}
- Negative recommendation share: ${Math.round(card.observations.negativeShare * 100)}%
- Core-player share: ${Math.round(card.observations.corePlayerShare * 100)}%

## Analytic inference

- Work state: ${card.inference.workState}
- Confidence: ${Math.round(card.inference.confidence * 100)}%
- Priority score: ${Math.round(card.inference.priorityScore * 100)}%
- Correlation is not causation. Version proximity is a search clue, not a proven cause.

## Supporting evidence

${evidenceLines}

## Counter-evidence

${counterLines}

## Unknowns

${card.unknowns.map((item) => `- ${item}`).join("\n")}

## Next validation step

${card.nextValidationStep}

Source: ${card.source.url}
`;
  }
  function printHtml(card) {
    const renderQuotes = (items) => items.map((item) => `<blockquote><p>${escapeHtml(item.excerpt)}</p><footer>${escapeHtml(item.createdAt.slice(0, 10))} \xB7 ${escapeHtml(item.playerSegment)} \xB7 ${escapeHtml(item.reviewIdHash.slice(0, 10))}</footer></blockquote>`).join("") || "<p>\u6CA1\u6709\u6EE1\u8DB3\u95E8\u69DB\u7684\u8BC1\u636E\u6458\u5F55\u3002</p>";
    return `<!doctype html><html lang="zh-CN"><head><meta charset="UTF-8"><title>${escapeHtml(card.topic.label)} \u2014 PLAYER SIGNAL</title><style>body{max-width:820px;margin:40px auto;padding:0 24px;color:#17232a;font:14px/1.7 system-ui,sans-serif}h1{font-size:38px;line-height:1.05}small,footer{color:#667982}dl{display:grid;grid-template-columns:repeat(4,1fr);gap:12px}dl div{border-top:2px solid #17232a;padding-top:8px}dt{font-size:11px;color:#667982}dd{margin:4px 0;font-size:20px;font-weight:700}blockquote{margin:12px 0;padding:12px 16px;background:#eef4f5;border-left:3px solid #ef6b5e}button{padding:10px 14px}@media print{button{display:none}}</style></head><body><button onclick="print()">\u6253\u5370\u884C\u52A8\u5361</button><small>PLAYER SIGNAL / EVIDENCE-BACKED ACTION CARD</small><h1>${escapeHtml(card.topic.label)}</h1><p>${escapeHtml(card.game.name)} \xB7 AppID ${card.game.appId} \xB7 ${escapeHtml(card.generatedAt)}</p><h2>\u89C2\u5BDF\u503C</h2><dl><div><dt>\u6837\u672C</dt><dd>${card.observations.sampleCount}</dd></div><div><dt>\u5F53\u524D / \u524D\u4E00</dt><dd>${card.observations.currentWindowCount} / ${card.observations.previousWindowCount}</dd></div><div><dt>\u8D1F\u5411</dt><dd>${Math.round(card.observations.negativeShare * 100)}%</dd></div><div><dt>\u6838\u5FC3\u73A9\u5BB6</dt><dd>${Math.round(card.observations.corePlayerShare * 100)}%</dd></div></dl><h2>\u5206\u6790\u5224\u65AD</h2><p>\u5DE5\u4F5C\u72B6\u6001\uFF1A${escapeHtml(card.inference.workState)} \xB7 \u7F6E\u4FE1\u5EA6 ${Math.round(card.inference.confidence * 100)}%\u3002\u7248\u672C\u5173\u8054\u4E0D\u7B49\u4E8E\u56E0\u679C\u3002</p><h2>\u652F\u6301\u8BC1\u636E</h2>${renderQuotes(card.evidence)}<h2>\u53CD\u4F8B</h2>${renderQuotes(card.counterEvidence)}<h2>\u672A\u77E5\u9879</h2><ul>${card.unknowns.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul><h2>\u4E0B\u4E00\u6B65\u9A8C\u8BC1</h2><p>${escapeHtml(card.nextValidationStep)}</p><footer>Source: ${escapeHtml(card.source.url)} \xB7 Snapshot ${escapeHtml(card.source.retrievedAt)}</footer></body></html>`;
  }
  function createActionCardPackage(topic, reviews, context) {
    const card = buildActionCard(topic, reviews, context);
    const baseName = `player-signal-${slug(topic.label)}`;
    return Object.freeze({ card, files: Object.freeze([
      Object.freeze({ name: `${baseName}.md`, extension: "md", type: "text/markdown;charset=utf-8", content: markdown(card) }),
      Object.freeze({ name: `${baseName}.json`, extension: "json", type: "application/json;charset=utf-8", content: `${JSON.stringify(card, null, 2)}
` }),
      Object.freeze({ name: `${baseName}.html`, extension: "html", type: "text/html;charset=utf-8", content: printHtml(card) })
    ]) });
  }

  // src/state/analysis-store.js
  var STORAGE_KEY = "player-signal:analysis-state:v1";
  function correctionKey(correction) {
    if (!correction || typeof correction !== "object") return null;
    if (correction.type === "rename" || correction.type === "merge-candidate") {
      return `${correction.type}:${String(correction.topicId ?? "")}`;
    }
    if (correction.type === "merge") {
      const sourceIds = [...correction.sourceIds ?? []].map(String).sort();
      return `merge:${sourceIds.join("+")}:${String(correction.into?.id ?? "")}`;
    }
    return null;
  }
  function upsertCorrections(corrections, correction) {
    const key = correctionKey(correction);
    if (!key) return corrections;
    const index = corrections.findIndex((item) => correctionKey(item) === key);
    if (index < 0) return [...corrections, structuredClone(correction)];
    if (JSON.stringify(corrections[index]) === JSON.stringify(correction)) return corrections;
    return corrections.map((item, itemIndex) => itemIndex === index ? structuredClone(correction) : item);
  }
  function compileCorrections(corrections = []) {
    const renames = {};
    const merges = [];
    for (const correction of corrections) {
      if (correction?.type === "rename" && correction.topicId && String(correction.label ?? "").trim()) {
        renames[String(correction.topicId)] = String(correction.label).trim();
      }
      if (correction?.type === "merge" && Array.isArray(correction.sourceIds) && correction.sourceIds.length > 1 && correction.into) {
        merges.push({
          from: correction.sourceIds.map(String),
          into: {
            id: String(correction.into.id),
            label: String(correction.into.label),
            category: String(correction.into.category)
          }
        });
      }
    }
    return Object.freeze({ renames: Object.freeze(renames), merges: Object.freeze(merges.map(Object.freeze)) });
  }
  function freeze2(value) {
    if (value && typeof value === "object" && !Object.isFrozen(value)) {
      Object.freeze(value);
      for (const nested of Object.values(value)) freeze2(nested);
    }
    return value;
  }
  function snapshot(value) {
    return freeze2(structuredClone(value));
  }
  function initialState(storage) {
    const base = {
      status: "idle",
      sourceMode: null,
      dataset: null,
      analysis: null,
      progress: { progress: 0, stage: "idle" },
      error: null,
      weights: {},
      selectedTopicId: null,
      corrections: [],
      savedComparisons: []
    };
    try {
      const saved = storage?.getItem?.(STORAGE_KEY);
      if (!saved) return base;
      const parsed = JSON.parse(saved);
      return { ...base, weights: parsed.weights ?? {}, corrections: parsed.corrections ?? [], savedComparisons: parsed.savedComparisons ?? [] };
    } catch {
      return base;
    }
  }
  function createAnalysisStore(options = {}) {
    let defaultStorage = null;
    try {
      defaultStorage = globalThis.localStorage ?? null;
    } catch {
      defaultStorage = null;
    }
    const storage = options.storage ?? defaultStorage;
    const listeners = /* @__PURE__ */ new Set();
    let state = snapshot(initialState(storage));
    let datasetSerial = 0;
    let analysisSerial = 0;
    function persist(nextState) {
      try {
        storage?.setItem?.(STORAGE_KEY, JSON.stringify({
          weights: nextState.weights,
          corrections: nextState.corrections,
          savedComparisons: nextState.savedComparisons
        }));
      } catch {
      }
    }
    function setState(patch, shouldPersist = false) {
      state = snapshot({ ...state, ...patch });
      if (shouldPersist) persist(state);
      for (const listener of listeners) listener(state);
    }
    return Object.freeze({
      getState: () => state,
      subscribe(listener) {
        if (typeof listener !== "function") throw new TypeError("A state listener is required");
        listeners.add(listener);
        return () => listeners.delete(listener);
      },
      async loadDataset(loader, metadata = {}) {
        const serial = ++datasetSerial;
        setState({ status: "loading", sourceMode: metadata.sourceMode ?? null, error: null, progress: { progress: 0, stage: "source" } });
        try {
          const dataset = await loader();
          if (serial !== datasetSerial) return false;
          setState({
            status: "loaded",
            sourceMode: metadata.sourceMode ?? dataset.mode ?? null,
            dataset,
            analysis: null,
            progress: { progress: 1, stage: "source-ready" }
          });
          return true;
        } catch (error2) {
          if (serial !== datasetSerial) return false;
          setState({ status: "error", error: { message: error2 instanceof Error ? error2.message : String(error2), recoverable: true } });
          return false;
        }
      },
      async runAnalysis(analyzer) {
        if (!state.dataset) throw new Error("Load a dataset before analysis");
        const serial = ++analysisSerial;
        setState({ status: "analyzing", error: null, progress: { progress: 0, stage: "queued" } });
        try {
          const analysis = await analyzer(state.dataset, (progress) => {
            if (serial === analysisSerial) setState({ progress });
          });
          if (serial !== analysisSerial) return false;
          setState({ status: "ready", analysis, progress: { progress: 1, stage: "complete" } });
          return true;
        } catch (error2) {
          if (serial !== analysisSerial) return false;
          setState({ status: "error", error: { message: error2 instanceof Error ? error2.message : String(error2), recoverable: true } });
          return false;
        }
      },
      setWeights(weights) {
        const normalized = Object.fromEntries(
          Object.entries(weights ?? {}).map(([key, value]) => [key, Math.max(0, Number(value) || 0)])
        );
        setState({ weights: normalized }, true);
      },
      selectTopic(topicId) {
        setState({ selectedTopicId: topicId ?? null });
      },
      recordCorrection(correction) {
        const corrections = upsertCorrections(state.corrections, correction);
        if (corrections === state.corrections) return false;
        setState({ corrections }, true);
        return true;
      },
      renameTopic(topicId, label) {
        const normalized = String(label ?? "").trim();
        if (!state.analysis || normalized.length < 2) return false;
        let found = false;
        const topics = state.analysis.topics.map((topic) => {
          if (topic.id !== topicId) return topic;
          found = true;
          return { ...topic, label: normalized };
        });
        if (!found) return false;
        const correction = { type: "rename", topicId, label: normalized };
        setState({ analysis: { ...state.analysis, topics }, corrections: upsertCorrections(state.corrections, correction) }, true);
        return true;
      },
      removeCorrection(type, topicId) {
        const key = `${String(type)}:${String(topicId)}`;
        const corrections = state.corrections.filter((item) => correctionKey(item) !== key);
        if (corrections.length === state.corrections.length) return false;
        setState({ corrections }, true);
        return true;
      },
      removeCorrectionsForTopic(topicId) {
        const normalized = String(topicId);
        const corrections = state.corrections.filter((item) => item.topicId !== normalized && !item.sourceIds?.includes(normalized) && item.into?.id !== normalized);
        if (corrections.length === state.corrections.length) return false;
        setState({ corrections }, true);
        return true;
      },
      correctionOptions() {
        return compileCorrections(state.corrections);
      },
      saveComparison(comparison2) {
        const remaining = state.savedComparisons.filter((item) => item.id !== comparison2.id);
        setState({ savedComparisons: [...remaining, structuredClone(comparison2)] }, true);
      }
    });
  }

  // src/state/url-state.js
  var VIEWS = /* @__PURE__ */ new Set(["field", "table"]);
  var QUEUES = /* @__PURE__ */ new Set(["new", "growing", "largest", "core", "persistent", "unclassified"]);
  var TOPIC_PATTERN = /^[a-z0-9][a-z0-9-]{0,79}$/i;
  function parseWorkspaceState(search = "") {
    const parameters = new URLSearchParams(String(search).replace(/^\?/, ""));
    const view = parameters.get("view");
    const queue = parameters.get("queue");
    const topic = parameters.get("topic");
    return Object.freeze({
      view: VIEWS.has(view) ? view : "field",
      queue: QUEUES.has(queue) ? queue : null,
      topic: topic && TOPIC_PATTERN.test(topic) ? topic : null
    });
  }
  function serializeWorkspaceState(state = {}) {
    const parameters = new URLSearchParams();
    if (state.view === "table") parameters.set("view", "table");
    if (QUEUES.has(state.queue)) parameters.set("queue", state.queue);
    if (state.topic && TOPIC_PATTERN.test(state.topic)) parameters.set("topic", state.topic);
    const value = parameters.toString();
    return value ? `?${value}` : "";
  }

  // src/ui/app-shell.js
  function renderAppShell() {
    return `
    <div class="observation-station" data-player-signal-app>
      <header class="product-bar">
        <a class="product-bar__back" href="../../index.html?ziaver=latest" aria-label="\u8FD4\u56DE\u4F5C\u54C1\u96C6">\u2190 \u4F5C\u54C1\u96C6</a>
        <div class="product-mark" translate="no"><span>PLAYER</span><b>SIGNAL</b></div>
        <div class="product-bar__center">
          <div class="live-progress" data-analysis-progress hidden>
            <span class="live-progress__text" data-progress-text>\u6B63\u5728\u805A\u5408\u4FE1\u53F7...</span>
            <div class="live-progress__track"><i class="live-progress__bar" data-progress-bar style="width:0%"></i></div>
          </div>
        </div>
        <p class="product-state"><i aria-hidden="true"></i><span data-product-state aria-live="polite">\u51C6\u5907\u5C31\u7EEA</span></p>
      </header>

      <section class="source-console" aria-label="\u6570\u636E\u6E90\u4E0E\u6837\u672C\u72B6\u6001">
        <div class="connector-panel">
          <form class="game-search" data-game-search aria-label="\u641C\u7D22 Steam \u6E38\u620F">
            <div class="connector-panel__label"><span>\u5728\u7EBF\u6570\u636E\u8FDE\u63A5\u5668</span><strong data-connector-status aria-live="polite">\u8FDE\u63A5\u5668\u68C0\u6D4B\u4E2D\u2026</strong></div>
            <div class="game-search__input">
              <input id="game-query" data-game-query name="query" type="search" autocomplete="off" placeholder="\u8F93\u5165\u6E38\u620F\u540D\u79F0\uFF0C\u4F8B\u5982 No Man\u2019s Sky\u2026" disabled />
              <button type="submit" disabled>\u641C\u7D22</button>
            </div>
          </form>
          <label class="review-language" for="review-language"><span>\u8BC4\u8BBA\u8BED\u8A00 / REVIEW LANGUAGE</span><select id="review-language" data-review-language><option value="schinese">\u4E2D\u6587\u4F18\u5148 / Simplified Chinese</option><option value="english">English</option><option value="all">\u5168\u90E8\u8BED\u8A00 / All</option></select></label>
          <div class="game-results" data-search-results role="listbox" aria-label="Steam \u6E38\u620F\u641C\u7D22\u7ED3\u679C" hidden></div>
        </div>
        
        <div class="demo-select-container">
          <button class="demo-action" type="button" data-open-demo>
            <span>\u5185\u7F6E\u7CBE\u9009\u6848\u4F8B\u5E93</span>
            <strong data-active-case-title>\u91CD\u65B0\u6253\u5F00 No Man\u2019s Sky</strong>
          </button>
          <select class="offline-case-select" data-offline-case-picker aria-label="\u9009\u62E9\u79BB\u7EBF\u5206\u6790\u6848\u4F8B">
            <option value="">No Man's Sky (\u9ED8\u8BA4\u6848\u4F8B \xB7 3000\u6761)</option>
            <option value="steam:620">Portal 2 \xB7 \u4F20\u9001\u95E82</option>
            <option value="steam:292030">The Witcher 3 \xB7 \u5DEB\u5E083\u72C2\u730E</option>
            <option value="steam:1145360">Hades \xB7 \u9ED1\u5E1D\u65AF</option>
            <option value="steam:413150">Stardew Valley \xB7 \u661F\u9732\u8C37\u7269\u8BED</option>
            <option value="steam:646570">Slay the Spire \xB7 \u6740\u622E\u5C16\u5854</option>
            <option value="steam:632470">Disco Elysium \xB7 \u6781\u4E50\u8FEA\u65AF\u79D1</option>
            <option value="steam:367520">Hollow Knight \xB7 \u7A7A\u6D1E\u9A91\u58EB</option>
            <option value="steam:753640">Outer Wilds \xB7 \u661F\u9645\u62D3\u8352</option>
          </select>
        </div>

        <div class="source-readout" data-source-status role="status" aria-live="polite">
          <span>\u5F53\u524D\u6570\u636E\u6E90</span><strong data-source-title>No Man\u2019s Sky</strong><small data-source-detail>\u4E0D\u4FDD\u5B58\u73A9\u5BB6\u8EAB\u4EFD</small>
        </div>
        <div class="sample-ledger" data-sample-accounting>
          <div class="sample-ledger__head"><span>\u6837\u672C\u8D26\u672C</span><strong data-sample-summary>--</strong></div>
          <div class="sample-ledger__counts">
            <span><b data-fetched-count>--</b>\u83B7\u53D6</span>
            <span><b data-accepted-count>--</b>\u6709\u6548</span>
            <span><b data-classified-count>--</b>\u5DF2\u5206\u7C7B</span>
            <span><b data-unclassified-count>--</b>\u5F85\u5206\u7C7B</span>
            <span><b data-excluded-count>--</b>\u6392\u9664</span>
          </div>
          <div class="coverage-meter"><span>\u5206\u7C7B\u8986\u76D6</span><i><b data-coverage-bar></b></i><strong data-coverage-rate>--</strong></div>
          <details class="exclusion-details"><summary data-sample-range>\u67E5\u770B\u6837\u672C\u8303\u56F4</summary><div data-exclusion-reasons></div></details>
        </div>
      </section>

      <main class="station-grid" id="analysis-workspace">
        <aside class="signal-queues" aria-label="\u4FE1\u53F7\u961F\u5217">
          <header><span>\u8C03\u67E5\u89C6\u56FE</span><h1>\u53D1\u751F\u4E86\u4EC0\u4E48\uFF1F</h1><p>\u7528\u4E0D\u540C\u4E1A\u52A1\u89D2\u5EA6\u67E5\u770B\u540C\u4E00\u4EFD\u533F\u540D\u73A9\u5BB6\u8BC1\u636E\u3002</p></header>
          <nav aria-label="\u95EE\u9898\u4FE1\u53F7\u961F\u5217">
            <button type="button" data-queue="new"><span>\u65B0\u51FA\u73B0</span><strong data-topic-count>--</strong><small>\u6B64\u524D\u7A97\u53E3\u6CA1\u6709\u51FA\u73B0</small></button>
            <button type="button" data-queue="growing"><span>\u589E\u957F\u6700\u5FEB</span><strong data-topic-count>--</strong><small>\u76F8\u5BF9\u524D\u4E00\u7A97\u53E3\u52A0\u901F</small></button>
            <button type="button" data-queue="largest"><span>\u53CD\u9988\u6700\u591A</span><strong data-topic-count>--</strong><small>\u6709\u6548\u6837\u672C\u91CF\u6700\u5927</small></button>
            <button type="button" data-queue="core"><span>\u6838\u5FC3\u73A9\u5BB6\u96C6\u4E2D</span><strong data-topic-count>--</strong><small>\u9AD8\u65F6\u957F\u73A9\u5BB6\u5360\u6BD4\u8F83\u9AD8</small></button>
            <button type="button" data-queue="persistent"><span>\u6301\u7EED\u5B58\u5728</span><strong data-topic-count>--</strong><small>\u5F53\u524D\u4E0E\u524D\u4E00\u7A97\u53E3\u5747\u51FA\u73B0</small></button>
            <button type="button" data-queue="unclassified"><span>\u5F85\u5206\u7C7B\u8BC4\u8BBA</span><strong data-topic-count>--</strong><small>\u672A\u5F3A\u5236\u5F52\u5165\u4EFB\u4F55\u4E3B\u9898</small></button>
          </nav>
          <div class="method-note">
            <span>\u65B9\u6CD5\u8FB9\u754C</span>
            <p>\u89C2\u5BDF\u503C\u6765\u81EA\u6570\u91CF\u4E0E\u65F6\u95F4\uFF1B\u5206\u6790\u5224\u65AD\u6765\u81EA\u89C4\u5219\u4E3B\u9898\u548C\u900F\u660E\u6743\u91CD\u3002\u65F6\u95F4\u5173\u8054\u4E0D\u662F\u56E0\u679C\u8BC1\u660E\u3002</p>
            <p class="legend-note">\u5706\u4F53\u5927\u5C0F\u6620\u5C04\u53CD\u9988\u91CF\uFF0C\u4EAE\u5EA6\u6620\u5C04\u589E\u957F\u901F\u5EA6\uFF0C\u8109\u51B2\u6620\u5C04\u5F02\u5E38\u504F\u79BB\u3002</p>
          </div>
          <fieldset class="weight-panel">
            <legend>\u4F18\u5148\u7EA7\u6743\u91CD</legend>
            <label><span>\u4F53\u91CF</span><input type="range" min="0" max="100" value="35" data-priority-weight="volume" /><output>35</output></label>
            <label><span>\u589E\u901F</span><input type="range" min="0" max="100" value="30" data-priority-weight="velocity" /><output>30</output></label>
            <label><span>\u6838\u5FC3\u5F71\u54CD</span><input type="range" min="0" max="100" value="20" data-priority-weight="coreImpact" /><output>20</output></label>
          </fieldset>
        </aside>

        <section class="field-column" aria-label="\u4FE1\u53F7\u900F\u955C\u4E0E\u6F14\u53D8">
          <div class="signal-lens" aria-label="\u4FE1\u53F7\u573A\u57DF">
            <header class="lens-header">
              <div>
                <span>3D \u4FE1\u53F7\u7A7A\u95F4 \xB7 \u5B9E\u65F6\u805A\u5408\u900F\u955C</span>
                <h2 data-active-game-title>No Man\u2019s Sky</h2>
              </div>
              <div class="view-switch" role="group" aria-label="\u89C6\u56FE\u5207\u6362">
                <button type="button" data-view="field" aria-pressed="true">3D \u573A\u57DF</button>
                <button type="button" data-view="table" aria-pressed="false">\u8868\u683C\u660E\u7EC6</button>
              </div>
            </header>

            <div class="lens-stage">
              <canvas class="signal-canvas" data-signal-canvas></canvas>
              <div class="lens-empty" data-lens-empty hidden><p>\u6682\u65E0\u4FE1\u53F7\u6570\u636E</p></div>
              <div class="filter-empty" data-filter-empty hidden>
                <h3 data-filter-empty-title>\u5F53\u524D\u961F\u5217\u6682\u65E0\u5339\u914D\u4E3B\u9898</h3>
                <p data-filter-empty-detail>\u53EF\u5C1D\u8BD5\u5207\u6362\u5176\u4ED6\u961F\u5217\u6216\u6E05\u9664\u7B5B\u9009\u3002</p>
                <button type="button" data-clear-queue>\u67E5\u770B\u5168\u90E8\u4E3B\u9898</button>
              </div>
              <div class="unclassified-view" data-unclassified-view hidden>
                <header><strong data-unclassified-summary>\u5F85\u5206\u7C7B\u8BC4\u8BBA</strong></header>
                <div class="unclassified-list" data-unclassified-list></div>
              </div>
            </div>

            <div class="signal-table-wrap" data-signal-table hidden>
              <table>
                <thead>
                  <tr>
                    <th>\u4E3B\u9898\u5206\u7C7B</th>
                    <th>\u6837\u672C\u91CF</th>
                    <th>\u76F8\u5BF9\u589E\u901F</th>
                    <th>\u6838\u5FC3\u73A9\u5BB6\u5360\u6BD4</th>
                    <th>\u5EFA\u8BAE\u72B6\u6001</th>
                  </tr>
                </thead>
                <tbody data-signal-table-body></tbody>
              </table>
            </div>

            <footer class="lens-footer">
              <span data-lens-range>\u533F\u540D\u8BC4\u8BBA\u91C7\u6837\u5DF2\u5C31\u7EEA</span>
            </footer>
          </div>

          <div class="version-rail" data-comparison aria-label="\u65F6\u95F4\u7EBF\u5BF9\u6BD4">
            <header><span>\u7248\u672C\u4E0E\u65F6\u95F4\u8DE8\u5EA6\u6F14\u53D8</span></header>
            <div class="comparison-content" data-comparison-content></div>
          </div>
        </section>

        <aside class="investigation" data-investigation aria-label="\u6DF1\u5EA6\u5F52\u56E0\u4E0E\u8BC1\u636E\u94FE">
          <header>
            <span>\u6DF1\u5EA6\u5F52\u56E0</span>
            <h2>\u8BC1\u636E\u94FE\u4E0E\u884C\u52A8\u5361</h2>
          </header>
          <div class="investigation-empty" data-investigation-empty>
            <span data-investigation-empty-label>\u9009\u62E9\u4E00\u4E2A\u4FE1\u53F7</span>
            <strong data-investigation-empty-title>\u70B9\u51FB\u5DE6\u4FA7 3D \u8282\u70B9\u6216\u8868\u683C</strong>
            <p data-investigation-empty-detail>\u67E5\u770B\u73A9\u5BB6\u771F\u5B9E\u539F\u8BDD\u3001\u7248\u672C\u5F52\u56E0\u548C\u63A8\u8350\u5904\u7406\u884C\u52A8\u5361\u3002</p>
          </div>
          <div class="investigation-content" data-investigation-content hidden></div>
          <footer class="investigation-footer">
            <button class="export-btn" type="button" data-export-action disabled>
              <strong>\u5BFC\u51FA\u884C\u52A8\u5361 (Markdown / JSON)</strong>
            </button>
          </footer>
        </aside>
      </main>

      <dialog class="correction-dialog" data-correction-dialog>
        <form data-correction-form method="dialog">
          <h3 data-correction-title>\u6821\u6B63\u4E3B\u9898</h3>
          <p data-correction-description>\u5BF9\u8BE5\u4E3B\u9898\u8FDB\u884C\u4EBA\u5DE5\u4FEE\u6B63</p>
          <div data-rename-field>
            <label>\u65B0\u4E3B\u9898\u540D\u79F0: <input type="text" name="label" /></label>
          </div>
          <div data-merge-field hidden>
            <label>\u5408\u5E76\u81F3\u76EE\u6807: <select name="target"></select></label>
          </div>
          <p class="correction-preview" data-correction-preview></p>
          <p class="correction-error" data-correction-error></p>
          <div class="dialog-actions">
            <button type="button" data-correction-cancel>\u53D6\u6D88</button>
            <button type="submit">\u786E\u8BA4\u5E94\u7528</button>
          </div>
        </form>
      </dialog>
    </div>
  `;
  }
  function mountAppShell(root2) {
    if (!(root2 instanceof Element)) throw new TypeError("PLAYER SIGNAL requires a root element");
    root2.innerHTML = renderAppShell();
    return Object.freeze({
      app: root2.querySelector("[data-player-signal-app]"),
      searchForm: root2.querySelector("[data-game-search]"),
      searchInput: root2.querySelector("[data-game-query]"),
      searchSubmit: root2.querySelector("[data-game-search] button[type='submit']"),
      searchResults: root2.querySelector("[data-search-results]"),
      reviewLanguage: root2.querySelector("[data-review-language]"),
      connectorStatus: root2.querySelector("[data-connector-status]"),
      openDemo: root2.querySelector("[data-open-demo]"),
      offlineCasePicker: root2.querySelector("[data-offline-case-picker]"),
      activeCaseTitle: root2.querySelector("[data-active-case-title]"),
      activeGameTitle: root2.querySelector("[data-active-game-title]"),
      sourceStatus: root2.querySelector("[data-source-status]"),
      sourceTitle: root2.querySelector("[data-source-title]"),
      sourceDetail: root2.querySelector("[data-source-detail]"),
      sampleAccounting: root2.querySelector("[data-sample-accounting]"),
      sampleSummary: root2.querySelector("[data-sample-summary]"),
      fetchedCount: root2.querySelector("[data-fetched-count]"),
      acceptedCount: root2.querySelector("[data-accepted-count]"),
      classifiedCount: root2.querySelector("[data-classified-count]"),
      unclassifiedCount: root2.querySelector("[data-unclassified-count]"),
      excludedCount: root2.querySelector("[data-excluded-count]"),
      coverageBar: root2.querySelector("[data-coverage-bar]"),
      coverageRate: root2.querySelector("[data-coverage-rate]"),
      sampleRange: root2.querySelector("[data-sample-range]"),
      exclusionReasons: root2.querySelector("[data-exclusion-reasons]"),
      lensRange: root2.querySelector("[data-lens-range]"),
      progress: root2.querySelector("[data-analysis-progress]"),
      progressBar: root2.querySelector("[data-progress-bar]"),
      progressText: root2.querySelector("[data-progress-text]"),
      lensEmpty: root2.querySelector("[data-lens-empty]"),
      filterEmpty: root2.querySelector("[data-filter-empty]"),
      filterEmptyTitle: root2.querySelector("[data-filter-empty-title]"),
      filterEmptyDetail: root2.querySelector("[data-filter-empty-detail]"),
      clearQueue: root2.querySelector("[data-clear-queue]"),
      unclassifiedView: root2.querySelector("[data-unclassified-view]"),
      unclassifiedSummary: root2.querySelector("[data-unclassified-summary]"),
      unclassifiedList: root2.querySelector("[data-unclassified-list]"),
      canvas: root2.querySelector("[data-signal-canvas]"),
      table: root2.querySelector("[data-signal-table]"),
      tableBody: root2.querySelector("[data-signal-table-body]"),
      viewButtons: [...root2.querySelectorAll("[data-view]")],
      queueButtons: [...root2.querySelectorAll("[data-queue]")],
      priorityWeights: [...root2.querySelectorAll("[data-priority-weight]")],
      investigationContent: root2.querySelector("[data-investigation-content]"),
      investigationEmpty: root2.querySelector("[data-investigation-empty]"),
      investigationEmptyLabel: root2.querySelector("[data-investigation-empty-label]"),
      investigationEmptyTitle: root2.querySelector("[data-investigation-empty-title]"),
      investigationEmptyDetail: root2.querySelector("[data-investigation-empty-detail]"),
      comparisonContent: root2.querySelector("[data-comparison-content]"),
      exportAction: root2.querySelector("[data-export-action]"),
      productState: root2.querySelector("[data-product-state]"),
      correctionDialog: root2.querySelector("[data-correction-dialog]"),
      correctionForm: root2.querySelector("[data-correction-form]"),
      correctionTitle: root2.querySelector("[data-correction-title]"),
      correctionDescription: root2.querySelector("[data-correction-description]"),
      renameField: root2.querySelector("[data-rename-field]"),
      mergeField: root2.querySelector("[data-merge-field]"),
      correctionPreview: root2.querySelector("[data-correction-preview]"),
      correctionError: root2.querySelector("[data-correction-error]"),
      correctionCancel: root2.querySelector("[data-correction-cancel]")
    });
  }

  // src/ui/formatters.js
  var integerFormatter = new Intl.NumberFormat("zh-CN", { maximumFractionDigits: 0 });
  var percentFormatter = new Intl.NumberFormat("zh-CN", { style: "percent", maximumFractionDigits: 0 });
  var dateFormatter = new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "UTC"
  });
  function formatInteger(value) {
    return integerFormatter.format(Number.isFinite(Number(value)) ? Number(value) : 0);
  }
  function formatPercent(value) {
    const finite = Number.isFinite(Number(value)) ? Number(value) : 0;
    return percentFormatter.format(Math.max(0, Math.min(1, finite)));
  }
  function formatDate(value) {
    if (!value || !Number.isFinite(Date.parse(value))) return "\u2014";
    return dateFormatter.format(new Date(value));
  }

  // src/ui/comparison-view.js
  var DAY_MS = 864e5;
  var STATE_LABELS = Object.freeze({
    added: "\u7248\u672C\u540E\u65B0\u589E",
    improved: "\u7248\u672C\u540E\u6539\u5584",
    persistent: "\u524D\u540E\u6301\u7EED",
    "insufficient-evidence": "\u6837\u672C\u4E0D\u8DB3"
  });
  function escapeHtml2(value) {
    return String(value ?? "").replace(/[&<>"']/g, (character) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    })[character]);
  }
  function ratio(part, total) {
    return total > 0 ? part / total : 0;
  }
  function windowMetrics(reviews) {
    const segments = { new: 0, mid: 0, core: 0 };
    for (const review of reviews) if (Object.hasOwn(segments, review.playerSegment)) segments[review.playerSegment] += 1;
    return Object.freeze({
      count: reviews.length,
      negativeShare: ratio(reviews.filter((review) => !review.recommended).length, reviews.length),
      segments: Object.freeze(segments)
    });
  }
  function compareTopicAroundVersion(topic, reviews, version, options = {}) {
    const windowDays = options.windowDays ?? 30;
    const minimumPerWindow = options.minimumPerWindow ?? 3;
    const versionTime = Date.parse(version.releasedAt);
    const windowMs = windowDays * DAY_MS;
    const ids = /* @__PURE__ */ new Set([...topic.evidenceIds, ...topic.counterEvidenceIds]);
    const relevant = reviews.filter((review) => ids.has(review.reviewIdHash));
    const before = windowMetrics(relevant.filter((review) => {
      const time = Date.parse(review.createdAt);
      return time >= versionTime - windowMs && time < versionTime;
    }));
    const after = windowMetrics(relevant.filter((review) => {
      const time = Date.parse(review.createdAt);
      return time >= versionTime && time < versionTime + windowMs;
    }));
    let state = "persistent";
    const limitations = [];
    if (before.count < minimumPerWindow || after.count < minimumPerWindow) {
      state = "insufficient-evidence";
      limitations.push("insufficient-window-sample");
    } else if (before.count === 0 && after.count >= minimumPerWindow) {
      state = "added";
    } else if (after.count < before.count * 0.65 || after.negativeShare < before.negativeShare - 0.2) {
      state = "improved";
    }
    return Object.freeze({
      topicId: topic.id,
      version: Object.freeze({ id: version.id, name: version.name, releasedAt: version.releasedAt, sourceUrl: version.sourceUrl }),
      windowDays,
      before,
      after,
      state,
      limitations: Object.freeze(limitations)
    });
  }
  function reviewRange(reviews) {
    const timestamps = reviews.map((review) => Date.parse(review.createdAt)).filter(Number.isFinite).sort((left, right) => left - right);
    return timestamps.length ? { start: timestamps[0], end: timestamps.at(-1) } : { start: null, end: null };
  }
  function createVersionCoverageModel(topic, reviews, versions, options = {}) {
    if (!Array.isArray(versions) || versions.length === 0) {
      return Object.freeze({ state: "no-version-nodes", items: Object.freeze([]), range: Object.freeze(reviewRange(reviews)) });
    }
    const windowDays = options.windowDays ?? 30;
    const range = reviewRange(reviews);
    const items = versions.map((version) => {
      const versionTime = Date.parse(version.releasedAt);
      if (range.start === null || !Number.isFinite(versionTime)) {
        return Object.freeze({ version, coverage: "outside-range", distanceDays: null, comparison: null });
      }
      if (versionTime < range.start) {
        const distanceDays = Math.ceil((range.start - versionTime) / DAY_MS);
        return Object.freeze({
          version,
          coverage: distanceDays <= windowDays ? "after-only" : "outside-range",
          distanceDays,
          comparison: null
        });
      }
      if (versionTime > range.end) {
        return Object.freeze({
          version,
          coverage: "outside-range",
          distanceDays: Math.ceil((versionTime - range.end) / DAY_MS),
          comparison: null
        });
      }
      return Object.freeze({
        version,
        coverage: "comparable",
        distanceDays: 0,
        comparison: compareTopicAroundVersion(topic, reviews, version, options)
      });
    });
    return Object.freeze({ state: "version-nodes", items: Object.freeze(items), range: Object.freeze(range) });
  }
  function renderComparable(comparison2) {
    return `<article class="comparison-card" data-comparison-state="${comparison2.state}">
    <header><strong>${escapeHtml2(comparison2.version.name)}</strong><span>${escapeHtml2(formatDate(comparison2.version.releasedAt))}</span></header>
    <div><span>\u7248\u672C\u524D</span><b>${formatInteger(comparison2.before.count)}</b><small>\u8D1F\u5411 ${formatPercent(comparison2.before.negativeShare)}</small></div>
    <i aria-hidden="true">\u2192</i>
    <div><span>\u7248\u672C\u540E</span><b>${formatInteger(comparison2.after.count)}</b><small>\u8D1F\u5411 ${formatPercent(comparison2.after.negativeShare)}</small></div>
    <footer>${STATE_LABELS[comparison2.state]}</footer>
  </article>`;
  }
  function renderCoverageItem(item) {
    if (item.coverage === "comparable") return renderComparable(item.comparison);
    const message = item.coverage === "after-only" ? `\u6837\u672C\u59CB\u4E8E\u7248\u672C\u53D1\u5E03\u540E ${formatInteger(item.distanceDays)} \u5929\uFF0C\u4E0D\u80FD\u8FDB\u884C\u524D\u540E\u6BD4\u8F83\u3002` : "\u7248\u672C\u4E0D\u5728\u5F53\u524D\u91C7\u6837\u7A97\u53E3\u3002";
    return `<article class="comparison-card comparison-card--coverage" data-coverage-state="${item.coverage}">
    <header><strong>${escapeHtml2(item.version.name)}</strong><span>${escapeHtml2(formatDate(item.version.releasedAt))}</span></header>
    <p>${message}</p>
  </article>`;
  }
  function renderVersionComparison(input) {
    if (Array.isArray(input)) {
      return `<div class="comparison-list">${input.map(renderComparable).join("")}</div><p class="causality-note">\u7248\u672C\u65F6\u95F4\u7528\u4E8E\u5BFB\u627E\u5173\u8054\uFF1B\u5173\u8054\u4E0D\u7B49\u4E8E\u56E0\u679C\u3002</p>`;
    }
    if (input.state === "no-version-nodes") {
      return `<div class="version-empty"><strong>\u5C1A\u672A\u6DFB\u52A0\u53EF\u4FE1\u7248\u672C\u8282\u70B9</strong><p>\u5F53\u524D\u5206\u6790\u4ECD\u53EF\u67E5\u770B\u4E3B\u9898\u4E0E\u8BC1\u636E\uFF0C\u4F46\u4E0D\u4F1A\u751F\u6210\u6CA1\u6709\u6765\u6E90\u7684\u7248\u672C\u6BD4\u8F83\u3002</p></div>`;
    }
    return `<div class="comparison-list">${input.items.map(renderCoverageItem).join("")}</div><p class="causality-note">\u53EA\u6709\u6837\u672C\u540C\u65F6\u8986\u76D6\u7248\u672C\u524D\u540E\u7A97\u53E3\u65F6\u624D\u6BD4\u8F83\uFF1B\u65F6\u95F4\u5173\u8054\u4E0D\u7B49\u4E8E\u56E0\u679C\u3002</p>`;
  }
  function mountComparisonView(container) {
    return Object.freeze({
      render(topic, reviews, versions) {
        if (!topic) {
          container.innerHTML = "";
          return;
        }
        container.innerHTML = renderVersionComparison(createVersionCoverageModel(topic, reviews, versions));
      }
    });
  }

  // src/ui/coverage-model.js
  function sortedReasonCounts(cleaning) {
    const counts = cleaning?.exclusionCounts ?? (cleaning?.excludedReviews ?? []).reduce(
      (result, item) => ({ ...result, [item.reason]: (result[item.reason] ?? 0) + 1 }),
      {}
    );
    return Object.entries(counts).map(([reason, count]) => ({ reason, count })).sort((left, right) => right.count - left.count || left.reason.localeCompare(right.reason));
  }
  function createCoverageModel(analysis) {
    const cleaning = analysis?.cleaning ?? {};
    const acceptedReviews = cleaning.acceptedReviews ?? [];
    const classifiedIds = /* @__PURE__ */ new Set();
    for (const topic of analysis?.topics ?? []) {
      for (const id of [...topic.evidenceIds ?? [], ...topic.counterEvidenceIds ?? []]) classifiedIds.add(id);
    }
    const acceptedIds = new Set(acceptedReviews.map((review) => review.reviewIdHash));
    const classified = [...classifiedIds].filter((id) => acceptedIds.has(id)).length;
    const unclassified = Array.isArray(analysis?.unclassified) ? analysis.unclassified.length : Math.max(0, acceptedReviews.length - classified);
    const accounting = cleaning.sampleAccounting ?? {};
    const dates = acceptedReviews.map((review) => review.createdAt).filter((value) => Number.isFinite(Date.parse(value))).sort((left, right) => Date.parse(left) - Date.parse(right));
    const accepted = Number(accounting.accepted ?? acceptedReviews.length) || 0;
    return Object.freeze({
      counts: Object.freeze({
        fetched: Number(accounting.fetched ?? accepted + Number(accounting.excluded ?? 0)) || 0,
        accepted,
        classified,
        unclassified,
        excluded: Number(accounting.excluded ?? cleaning.excludedReviews?.length ?? 0) || 0
      }),
      classificationRate: accepted > 0 ? classified / accepted : 0,
      exclusionReasons: Object.freeze(sortedReasonCounts(cleaning).map(Object.freeze)),
      range: Object.freeze({ start: dates[0] ?? null, end: dates.at(-1) ?? null })
    });
  }

  // src/ui/topic-copy.js
  var TOPIC_COPY = Object.freeze({
    performance: Object.freeze({ primary: "\u6027\u80FD\u4E0E\u5E27\u7387", secondary: "Performance" }),
    stability: Object.freeze({ primary: "\u5D29\u6E83\u4E0E\u7A33\u5B9A\u6027", secondary: "Crashes and stability" }),
    controls: Object.freeze({ primary: "\u64CD\u4F5C\u4E0E\u8F93\u5165", secondary: "Controls and input" }),
    multiplayer: Object.freeze({ primary: "\u591A\u4EBA\u8054\u673A", secondary: "Multiplayer and matchmaking" }),
    balance: Object.freeze({ primary: "\u6218\u6597\u4E0E\u5E73\u8861", secondary: "Combat and balance" }),
    content: Object.freeze({ primary: "\u5185\u5BB9\u4E0E\u8FDB\u5EA6", secondary: "Content and progression" }),
    onboarding: Object.freeze({ primary: "\u65B0\u624B\u5F15\u5BFC\u4E0E\u7406\u89E3", secondary: "Onboarding and clarity" }),
    monetization: Object.freeze({ primary: "\u4EF7\u683C\u4E0E\u4ED8\u8D39", secondary: "Price and monetization" }),
    "base-building": Object.freeze({ primary: "\u57FA\u5730\u5EFA\u9020", secondary: "Base building" }),
    interface: Object.freeze({ primary: "\u754C\u9762\u4E0E\u65E0\u969C\u788D", secondary: "Interface and accessibility" })
  });
  function getTopicCopy(id, label) {
    const known = TOPIC_COPY[id];
    if (!known) return { primary: String(label ?? id), secondary: "\u81EA\u5B9A\u4E49\u4E3B\u9898" };
    const normalized = String(label ?? "").trim();
    return { primary: known.primary, secondary: normalized && normalized !== known.secondary ? normalized : known.secondary };
  }

  // src/ui/investigation-view.js
  var STATE_LABELS2 = Object.freeze({ investigate: "\u7ACB\u5373\u8C03\u67E5", validate: "\u9700\u8981\u9A8C\u8BC1", observe: "\u6301\u7EED\u89C2\u5BDF", "low-evidence": "\u8BC1\u636E\u4E0D\u8DB3" });
  var SEGMENT_LABELS = Object.freeze({ new: "\u65B0\u73A9\u5BB6", mid: "\u4E2D\u7B49\u65F6\u957F", core: "\u6838\u5FC3\u73A9\u5BB6" });
  function escapeHtml3(value) {
    return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
  }
  function excerpt2(review) {
    const text = String(review.text ?? review.normalizedText ?? "").replace(/\s+/g, " ").trim();
    return Object.freeze({ reviewIdHash: review.reviewIdHash, excerpt: text.length > 240 ? `${text.slice(0, 237)}\u2026` : text, createdAt: review.createdAt, playerSegment: review.playerSegment, playtimeMinutes: review.playtimeMinutes, helpfulVotes: review.helpfulVotes ?? 0, recommended: review.recommended });
  }
  function nearestVersion(topic, versions) {
    if (!versions?.length || !Number.isFinite(topic.raw.nearestVersionDays)) return null;
    return [...versions].sort((left, right) => Date.parse(right.releasedAt) - Date.parse(left.releasedAt))[0];
  }
  function createInvestigationModel(topic, reviews, options = {}) {
    const byId = new Map(reviews.map((review) => [review.reviewIdHash, review]));
    const evidence = topic.evidenceIds.map((id) => byId.get(id)).filter(Boolean).map(excerpt2).slice(0, 3);
    const counterEvidence = topic.counterEvidenceIds.map((id) => byId.get(id)).filter(Boolean).map(excerpt2).slice(0, 2);
    const allTopicReviews = [...topic.evidenceIds, ...topic.counterEvidenceIds].map((id) => byId.get(id)).filter(Boolean);
    const firstSeen = allTopicReviews.length ? allTopicReviews.reduce((earliest, review) => review.createdAt < earliest ? review.createdAt : earliest, allTopicReviews[0].createdAt) : null;
    const relatedVersion = nearestVersion(topic, options.versions);
    const unknowns = ["\u8BC4\u8BBA\u4E0D\u80FD\u8BC1\u660E\u7A0B\u5E8F\u6839\u56E0\u6216\u4FEE\u590D\u6210\u672C\u3002", "\u7248\u672C\u65F6\u95F4\u53EA\u8868\u793A\u63A5\u8FD1\uFF0C\u4E0D\u4EE3\u8868\u66F4\u65B0\u5BFC\u81F4\u8BE5\u53CD\u9988\u3002"];
    if ((topic.limitations ?? []).includes("sample-below-threshold")) unknowns.push("\u5F53\u524D\u6837\u672C\u91CF\u4F4E\u4E8E\u5F3A\u6392\u5E8F\u95E8\u69DB\u3002");
    if ((topic.limitations ?? []).includes("no-prior-window-baseline")) unknowns.push("\u7F3A\u5C11\u8DB3\u591F\u7684\u524D\u4E00\u7A97\u53E3\u57FA\u7EBF\u3002");
    const copy = getTopicCopy(topic.id, topic.label);
    const corrected = (options.corrections ?? []).some((correction) => correction.topicId === topic.id || correction.sourceIds?.includes(topic.id));
    return Object.freeze({
      id: topic.id,
      label: topic.label,
      primary: copy.primary,
      secondary: copy.secondary,
      category: topic.category,
      workState: topic.workState,
      workStateLabel: STATE_LABELS2[topic.workState] ?? topic.workState,
      corrected,
      observations: Object.freeze({ sampleCount: topic.raw.count, currentCount: topic.raw.currentCount, previousCount: topic.raw.previousCount, negativeShare: topic.raw.count ? topic.raw.negativeCount / topic.raw.count : 0, coreShare: topic.dimensions.coreImpact, firstSeen }),
      inference: Object.freeze({ score: topic.score, confidence: topic.confidence, relatedVersion: relatedVersion ? { id: relatedVersion.id, name: relatedVersion.name, releasedAt: relatedVersion.releasedAt } : null, statement: `${copy.primary}\u5F53\u524D\u8FDB\u5165\u201C${STATE_LABELS2[topic.workState] ?? topic.workState}\u201D\u961F\u5217\u3002` }),
      evidence: Object.freeze(evidence),
      counterEvidence: Object.freeze(counterEvidence),
      unknowns: Object.freeze(unknowns),
      similarTopics: Object.freeze((options.topics ?? []).filter((candidate) => candidate.id !== topic.id && candidate.category === topic.category).slice(0, 3).map((candidate) => ({ id: candidate.id, label: candidate.label })))
    });
  }
  function renderEvidence(items, emptyLabel) {
    if (items.length === 0) return `<p class="evidence-empty">${escapeHtml3(emptyLabel)}</p>`;
    return items.map((item) => `<article class="evidence-quote"><p>${escapeHtml3(item.excerpt)}</p><footer><span>${escapeHtml3(formatDate(item.createdAt))}</span><span>${escapeHtml3(SEGMENT_LABELS[item.playerSegment] ?? "\u65F6\u957F\u672A\u77E5")}</span><code>${escapeHtml3(item.reviewIdHash.slice(0, 10))}</code></footer></article>`).join("");
  }
  function renderInvestigation(model) {
    return `<section class="topic-brief">
    <p class="topic-brief__category">${escapeHtml3(model.category)} / ${escapeHtml3(model.workStateLabel)}${model.corrected ? " / \u5DF2\u4EBA\u5DE5\u6821\u6B63" : ""}</p>
    <h3>${escapeHtml3(model.primary)}</h3><p class="topic-brief__secondary">${escapeHtml3(model.secondary)}</p>
    <div class="fact-block"><span>\u89C2\u5BDF\u503C</span><dl><div><dt>\u6709\u6548\u6837\u672C</dt><dd>${formatInteger(model.observations.sampleCount)}</dd></div><div><dt>\u5F53\u524D / \u524D\u4E00\u7A97\u53E3</dt><dd>${formatInteger(model.observations.currentCount)} / ${formatInteger(model.observations.previousCount)}</dd></div><div><dt>\u8D1F\u5411\u63A8\u8350</dt><dd>${formatPercent(model.observations.negativeShare)}</dd></div><div><dt>\u6838\u5FC3\u73A9\u5BB6</dt><dd>${formatPercent(model.observations.coreShare)}</dd></div></dl></div>
    <div class="inference-block"><span>\u5206\u6790\u5224\u65AD</span><p>${escapeHtml3(model.inference.statement)}</p><small>\u7F6E\u4FE1\u5EA6 ${formatPercent(model.inference.confidence)} \xB7 \u7248\u672C\u5173\u8054\u4E0D\u4EE3\u8868\u5DF2\u8BC1\u660E\u56E0\u679C\u3002</small></div>
    <div class="evidence-block"><span>\u652F\u6301\u8BC1\u636E</span>${renderEvidence(model.evidence, "\u6CA1\u6709\u8DB3\u591F\u7684\u652F\u6301\u8BC1\u636E\u3002")}</div>
    <div class="evidence-block evidence-block--counter"><span>\u53CD\u4F8B</span>${renderEvidence(model.counterEvidence, "\u5F53\u524D\u6837\u672C\u4E2D\u6CA1\u6709\u5339\u914D\u7684\u6B63\u5411\u53CD\u4F8B\u3002")}</div>
    <div class="unknown-block"><span>\u672A\u77E5\u9879</span><ul>${model.unknowns.map((item) => `<li>${escapeHtml3(item)}</li>`).join("")}</ul></div>
    <div class="correction-tools"><span>\u4EBA\u5DE5\u6821\u6B63</span><button type="button" data-topic-correction="rename">\u91CD\u547D\u540D</button><button type="button" data-topic-correction="merge">\u5408\u5E76\u4E3B\u9898</button>${model.corrected ? '<button type="button" data-topic-correction="undo">\u64A4\u9500\u6821\u6B63</button>' : ""}</div>
  </section>`;
  }
  function mountInvestigationView({ content, empty, exportButton, onCorrection }) {
    content.addEventListener("click", (event) => {
      const button = event.target.closest("[data-topic-correction]");
      if (button) onCorrection?.(button.dataset.topicCorrection, button);
    });
    return Object.freeze({ render(topic, reviews, options) {
      if (!topic) {
        content.hidden = true;
        empty.hidden = false;
        exportButton.disabled = true;
        return;
      }
      content.innerHTML = renderInvestigation(createInvestigationModel(topic, reviews, options));
      content.hidden = false;
      empty.hidden = true;
      exportButton.disabled = false;
    } });
  }

  // src/visualization/signal-field.js
  var CATEGORY_COLORS = Object.freeze({
    performance: "#ff695d",
    stability: "#ff876b",
    controls: "#8fb8ff",
    multiplayer: "#a88cff",
    balance: "#ffb44a",
    content: "#5ed3d1",
    onboarding: "#7ed6a2",
    monetization: "#f091c2",
    "base-building": "#72c2e8",
    interface: "#a8c8d4"
  });
  var NORMALIZED_SLOTS = Object.freeze([
    [0.5, 0.48],
    [0.25, 0.3],
    [0.5, 0.22],
    [0.75, 0.3],
    [0.72, 0.59],
    [0.5, 0.73],
    [0.28, 0.63],
    [0.12, 0.48],
    [0.87, 0.49],
    [0.18, 0.8],
    [0.82, 0.79],
    [0.1, 0.18],
    [0.9, 0.18]
  ]);
  var LABEL_DIRECTIONS = Object.freeze([
    [0, -1],
    [0, 1],
    [0, -1],
    [0, 1],
    [0, 1],
    [0, 1],
    [-1, 0],
    [0, 1],
    [0, 1],
    [0, 1],
    [0, 1],
    [1, 0],
    [-1, 0]
  ]);
  function clamp2(value, minimum, maximum) {
    return Math.min(maximum, Math.max(minimum, value));
  }
  function createSignalFieldModel(topics, dimensions) {
    const width = Math.max(320, Number(dimensions.width) || 320);
    const height = Math.max(240, Number(dimensions.height) || 240);
    const sorted = [...topics].sort((left, right) => right.score - left.score || left.id.localeCompare(right.id));
    const nodes = sorted.map((topic, index) => {
      const slot = NORMALIZED_SLOTS[index % NORMALIZED_SLOTS.length];
      const radius = 16 + Math.max(0, Math.min(1, topic.dimensions?.volume ?? 0)) * 26;
      const x = clamp2(width * slot[0], radius + 8, width - radius - 8);
      const y = clamp2(height * slot[1], radius + 8, height - radius - 8);
      const [labelDirectionX, labelDirectionY] = LABEL_DIRECTIONS[index % LABEL_DIRECTIONS.length];
      const labelDistance = radius + 15;
      return Object.freeze({
        id: topic.id,
        label: topic.label,
        category: topic.category,
        x,
        y,
        radius,
        labelX: clamp2(x + labelDirectionX * (labelDistance + 40), 46, width - 46),
        labelY: clamp2(y + labelDirectionY * labelDistance, 15, height - 40),
        color: CATEGORY_COLORS[topic.category] ?? "#a8c8d4",
        brightness: 0.36 + Math.max(0, Math.min(1, topic.dimensions?.velocity ?? 0)) * 0.64,
        pulse: (topic.dimensions?.baselineDeviation ?? 0) >= 0.35 && (topic.confidence ?? 0) >= 0.45,
        score: topic.score,
        count: topic.raw?.count ?? 0,
        workState: topic.workState
      });
    });
    return Object.freeze({ width, height, nodes: Object.freeze(nodes) });
  }
  function nextSignalId(topics, selectedId, direction = 1) {
    if (!Array.isArray(topics) || topics.length === 0) return null;
    const currentIndex = topics.findIndex((topic) => topic.id === selectedId);
    if (currentIndex < 0) return topics[0].id;
    const offset = direction < 0 ? -1 : 1;
    return topics[(currentIndex + offset + topics.length) % topics.length].id;
  }
  function hexToRgb(color) {
    const value = Number.parseInt(color.slice(1), 16);
    return { r: value >> 16, g: value >> 8 & 255, b: value & 255 };
  }
  function rgba(color, alpha) {
    const { r, g, b } = hexToRgb(color);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  function mountSignalField(canvas, options = {}) {
    const context = canvas.getContext("2d");
    if (!context) return Object.freeze({ render() {
    }, dispose() {
    } });
    const reducedMotion = typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
    let topics = [];
    let model = createSignalFieldModel([], { width: 320, height: 240 });
    let selectedId = null;
    let frame = 0;
    let disposed = false;
    let time = 0;
    let rotX = 0.22;
    let rotY = 0;
    let targetRotX = 0.22;
    let targetRotY = 0;
    let isDragging = false;
    let lastPointerX = 0;
    let lastPointerY = 0;
    function resize() {
      const bounds = canvas.getBoundingClientRect();
      const width = Math.max(320, Math.round(bounds.width));
      const height = Math.max(240, Math.round(bounds.height));
      const pixelRatio = Math.min(1.5, typeof window !== "undefined" && window.devicePixelRatio || 1);
      canvas.width = Math.round(width * pixelRatio);
      canvas.height = Math.round(height * pixelRatio);
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      model = createSignalFieldModel(topics, { width, height });
    }
    function project3D(x, y, z, w, h) {
      const cosY = Math.cos(rotY);
      const sinY = Math.sin(rotY);
      const cosX = Math.cos(rotX);
      const sinX = Math.sin(rotX);
      const cx = x - w / 2;
      const cy = y - h / 2;
      const x1 = cx * cosY + z * sinY;
      const y1 = cy;
      const z1 = -cx * sinY + z * cosY;
      const x2 = x1;
      const y2 = y1 * cosX - z1 * sinX;
      const z2 = y1 * sinX + z1 * cosX + 500;
      const scale = 500 / Math.max(z2, 10);
      return {
        projX: w / 2 + x2 * scale,
        projY: h / 2 + y2 * scale,
        scale,
        z: z2
      };
    }
    function draw() {
      const { width, height, nodes } = model;
      context.clearRect(0, 0, width, height);
      time += 0.016;
      if (!isDragging) {
        targetRotY += 25e-4;
      }
      rotX += (targetRotX - rotX) * 0.06;
      rotY += (targetRotY - rotY) * 0.06;
      const core = project3D(width / 2, height / 2, 0, width, height);
      context.save();
      context.strokeStyle = "rgba(94, 211, 209, 0.12)";
      context.lineWidth = 1;
      context.beginPath();
      context.ellipse(core.projX, core.projY, 90 * core.scale, 40 * core.scale, rotY * 0.5, 0, Math.PI * 2);
      context.stroke();
      context.restore();
      const projectedNodes = nodes.map((node, i) => {
        const zOffset = Math.sin(i * 1.5) * 80;
        const proj = project3D(node.x, node.y, zOffset, width, height);
        return { ...node, ...proj };
      });
      projectedNodes.sort((a, b) => b.z - a.z);
      for (const node of projectedNodes) {
        context.beginPath();
        context.moveTo(core.projX, core.projY);
        context.lineTo(node.projX, node.projY);
        context.strokeStyle = rgba(node.color, 0.12);
        context.stroke();
      }
      for (const node of projectedNodes) {
        const pulse = node.pulse && !reducedMotion ? 1 + Math.sin(time * 3 + node.x) * 0.08 : 1;
        const radius = node.radius * node.scale * pulse;
        const gradient = context.createRadialGradient(node.projX, node.projY, radius * 0.1, node.projX, node.projY, radius * 2.2);
        gradient.addColorStop(0, rgba(node.color, 0.5 * node.brightness));
        gradient.addColorStop(0.5, rgba(node.color, 0.12 * node.brightness));
        gradient.addColorStop(1, rgba(node.color, 0));
        context.fillStyle = gradient;
        context.beginPath();
        context.arc(node.projX, node.projY, radius * 2.2, 0, Math.PI * 2);
        context.fill();
        const bodyGrad = context.createRadialGradient(node.projX - radius * 0.3, node.projY - radius * 0.3, radius * 0.1, node.projX, node.projY, radius);
        bodyGrad.addColorStop(0, "#ffffff");
        bodyGrad.addColorStop(0.3, node.color);
        bodyGrad.addColorStop(1, rgba(node.color, 0.6));
        context.fillStyle = bodyGrad;
        context.strokeStyle = selectedId === node.id ? "#ffffff" : rgba(node.color, 0.9);
        context.lineWidth = selectedId === node.id ? 2.5 : 1;
        context.beginPath();
        context.arc(node.projX, node.projY, radius, 0, Math.PI * 2);
        context.fill();
        context.stroke();
        if (node.pulse || selectedId === node.id) {
          context.strokeStyle = selectedId === node.id ? "#ffb44a" : rgba(node.color, 0.4);
          context.beginPath();
          context.arc(node.projX, node.projY, radius + 6, 0, Math.PI * 2);
          context.stroke();
        }
        context.fillStyle = selectedId === node.id ? "#ffffff" : "#e8f0f2";
        context.font = `600 ${Math.max(10, Math.round(11 * node.scale))}px 'Microsoft YaHei UI', sans-serif`;
        context.textAlign = "center";
        context.fillText(node.label, node.projX, node.projY + radius + 13);
        context.fillStyle = "#78909b";
        context.font = `600 ${Math.max(8, Math.round(9 * node.scale))}px 'Cascadia Mono', monospace`;
        context.fillText(`${String(node.count).padStart(2, "0")} REVIEWS`, node.projX, node.projY + radius + 25);
      }
    }
    function loop() {
      if (disposed) return;
      draw();
      frame = requestAnimationFrame(loop);
    }
    function render(nextTopics, nextSelectedId = null) {
      topics = [...nextTopics];
      selectedId = nextSelectedId;
      cancelAnimationFrame(frame);
      resize();
      draw();
      if (!reducedMotion) frame = requestAnimationFrame(loop);
    }
    function hitTest(event) {
      const bounds = canvas.getBoundingClientRect();
      const x = event.clientX - bounds.left;
      const y = event.clientY - bounds.top;
      const { width, height, nodes } = model;
      for (const node of nodes) {
        const proj = project3D(node.x, node.y, 0, width, height);
        if (Math.hypot(proj.projX - x, proj.projY - y) <= node.radius * proj.scale + 8) {
          return node;
        }
      }
      return null;
    }
    canvas.addEventListener("pointerdown", (e) => {
      isDragging = true;
      lastPointerX = e.clientX;
      lastPointerY = e.clientY;
      canvas.setPointerCapture?.(e.pointerId);
    });
    canvas.addEventListener("pointermove", (e) => {
      if (isDragging) {
        const dx = e.clientX - lastPointerX;
        const dy = e.clientY - lastPointerY;
        lastPointerX = e.clientX;
        lastPointerY = e.clientY;
        targetRotY += dx * 8e-3;
        targetRotX = clamp2(targetRotX + dy * 8e-3, -1, 1);
      } else {
        canvas.style.cursor = hitTest(e) ? "pointer" : "default";
      }
    });
    canvas.addEventListener("pointerup", (e) => {
      isDragging = false;
      canvas.releasePointerCapture?.(e.pointerId);
    });
    canvas.addEventListener("click", (event) => {
      const node = hitTest(event);
      if (node) options.onSelect?.(node.id);
    });
    canvas.addEventListener("keydown", (event) => {
      if (!["ArrowLeft", "ArrowRight", "Enter"].includes(event.key)) return;
      event.preventDefault();
      if (event.key === "Enter") {
        if (selectedId) options.onSelect?.(selectedId);
        return;
      }
      const nextId = nextSignalId(topics, selectedId, event.key === "ArrowLeft" ? -1 : 1);
      if (nextId) options.onSelect?.(nextId);
    });
    const observer = typeof ResizeObserver === "function" ? new ResizeObserver(() => render(topics, selectedId)) : null;
    observer?.observe(canvas);
    return Object.freeze({
      render,
      dispose() {
        disposed = true;
        cancelAnimationFrame(frame);
        observer?.disconnect();
      }
    });
  }

  // src/ui/overview-view.js
  var STATE_LABELS3 = Object.freeze({
    investigate: "\u7ACB\u5373\u8C03\u67E5",
    validate: "\u9700\u8981\u9A8C\u8BC1",
    observe: "\u6301\u7EED\u89C2\u5BDF",
    "low-evidence": "\u8BC1\u636E\u4E0D\u8DB3"
  });
  var QUEUE_LABELS = Object.freeze({
    new: "\u65B0\u51FA\u73B0",
    growing: "\u589E\u957F\u6700\u5FEB",
    largest: "\u53CD\u9988\u6700\u591A",
    core: "\u6838\u5FC3\u73A9\u5BB6\u96C6\u4E2D",
    persistent: "\u6301\u7EED\u5B58\u5728"
  });
  var SEGMENT_LABELS2 = Object.freeze({ new: "\u65B0\u73A9\u5BB6", mid: "\u4E2D\u7B49\u65F6\u957F", core: "\u6838\u5FC3\u73A9\u5BB6" });
  function escapeHtml4(value) {
    return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
  }
  function createSignalTableModel(topics) {
    return topics.map((topic) => Object.freeze({
      id: topic.id,
      ...getTopicCopy(topic.id, topic.label),
      count: topic.raw.count,
      velocity: topic.dimensions.velocity,
      coreImpact: topic.dimensions.coreImpact,
      workState: topic.workState,
      workStateLabel: STATE_LABELS3[topic.workState] ?? topic.workState
    }));
  }
  function renderSignalTableRows(rows) {
    return rows.map((row) => `
    <tr>
      <td><button type="button" data-select-topic="${escapeHtml4(row.id)}"><strong>${escapeHtml4(row.primary)}</strong><small>${escapeHtml4(row.secondary)}</small></button></td>
      <td>${row.count}</td>
      <td>${Math.round(row.velocity * 100)}%</td>
      <td>${Math.round(row.coreImpact * 100)}%</td>
      <td><span data-work-state="${escapeHtml4(row.workState)}">${escapeHtml4(row.workStateLabel)}</span></td>
    </tr>`).join("");
  }
  function createQueueEmptyModel(queue) {
    if (!queue || !QUEUE_LABELS[queue]) return null;
    return Object.freeze({
      queue,
      title: `\u201C${QUEUE_LABELS[queue]}\u201D\u5F53\u524D\u6CA1\u6709\u7B26\u5408\u6761\u4EF6\u7684\u4E3B\u9898`,
      detail: "\u8FD9\u4E0D\u662F\u5206\u6790\u5931\u8D25\u3002\u67E5\u770B\u5168\u90E8\u4FE1\u53F7\uFF0C\u6216\u9009\u62E9\u53E6\u4E00\u4E2A\u8C03\u67E5\u89C6\u56FE\u3002"
    });
  }
  function createUnclassifiedModel(unclassified, reviews, limit = 24) {
    const reviewById = new Map((reviews ?? []).map((review) => [review.reviewIdHash, review]));
    const items = (unclassified ?? []).map((entry) => {
      const review = reviewById.get(entry.reviewIdHash);
      if (!review) return null;
      const text = String(review.text ?? review.normalizedText ?? "").replace(/\s+/g, " ").trim();
      return Object.freeze({
        reviewIdHash: review.reviewIdHash,
        excerpt: text.length > 300 ? `${text.slice(0, 297)}\u2026` : text,
        createdAt: review.createdAt,
        playerSegment: review.playerSegment ?? "unknown",
        reason: entry.reason
      });
    }).filter(Boolean);
    return Object.freeze({ count: items.length, items: Object.freeze(items.slice(0, limit)) });
  }
  function renderUnclassifiedItems(items) {
    if (!items.length) return `<div class="unclassified-empty">\u5F53\u524D\u6CA1\u6709\u5F85\u5206\u7C7B\u8BC4\u8BBA\u3002</div>`;
    return items.map((item) => `<article class="unclassified-item">
    <p>${escapeHtml4(item.excerpt)}</p>
    <footer><span>${escapeHtml4(formatDate(item.createdAt))}</span><span>${escapeHtml4(SEGMENT_LABELS2[item.playerSegment] ?? "\u65F6\u957F\u672A\u77E5")}</span><code>${escapeHtml4(item.reviewIdHash.slice(0, 10))}</code></footer>
  </article>`).join("");
  }
  function mountSignalOverview({ canvas, tableBody, onSelect }) {
    const field = mountSignalField(canvas, { onSelect });
    let topics = [];
    let selectedId = null;
    tableBody.addEventListener("click", (event) => {
      const button = event.target.closest("[data-select-topic]");
      if (button) onSelect?.(button.dataset.selectTopic);
    });
    return Object.freeze({
      render(nextTopics, nextSelectedId = null) {
        topics = [...nextTopics];
        selectedId = nextSelectedId;
        field.render(topics.map((topic) => ({ ...topic, label: getTopicCopy(topic.id, topic.label).primary })), selectedId);
        canvas.setAttribute("aria-label", topics.length ? `\u73A9\u5BB6\u95EE\u9898\u4FE1\u53F7\u573A\uFF0C\u5171 ${formatInteger(topics.length)} \u4E2A\u4E3B\u9898\u3002\u4F7F\u7528\u5DE6\u53F3\u65B9\u5411\u952E\u9009\u62E9\u4E3B\u9898\uFF0C\u6309 Enter \u6253\u5F00\u8BC1\u636E\u3002` : "\u73A9\u5BB6\u95EE\u9898\u4FE1\u53F7\u573A\uFF0C\u5F53\u524D\u89C6\u56FE\u6CA1\u6709\u4E3B\u9898\u3002");
        tableBody.innerHTML = renderSignalTableRows(createSignalTableModel(topics));
        for (const button of tableBody.querySelectorAll("[data-select-topic]")) {
          button.setAttribute("aria-pressed", String(button.dataset.selectTopic === selectedId));
        }
      },
      dispose: field.dispose
    });
  }

  // src/main.js
  function updateProgressBar(progressVal, label) {
    if (!refs.progress) return;
    if (progressVal >= 1) {
      refs.progress.hidden = true;
      if (refs.progressBar) refs.progressBar.style.width = "0%";
    } else {
      refs.progress.hidden = false;
      if (refs.progressBar) refs.progressBar.style.width = Math.round(progressVal * 100) + "%";
      if (refs.progressText) refs.progressText.textContent = label || "\u6B63\u5728\u805A\u5408\u73A9\u5BB6\u4FE1\u53F7...";
    }
  }
  var EXCLUSION_LABELS = Object.freeze({
    "exact-duplicate": "\u5B8C\u5168\u91CD\u590D",
    "near-duplicate": "\u9AD8\u5EA6\u76F8\u4F3C",
    "unsupported-language": "\u6682\u4E0D\u652F\u6301\u7684\u8BED\u8A00",
    "low-information": "\u4FE1\u606F\u91CF\u4E0D\u8DB3"
  });
  var root = document.querySelector("#player-signal-root");
  var refs = mountAppShell(root);
  var store = createAnalysisStore();
  var steamClient = createSteamClient({ baseUrl: window.location.origin });
  var initialUrlState = parseWorkspaceState(window.location.search);
  var activeQueue = initialUrlState.queue;
  var activeView = initialUrlState.view;
  var pendingTopicId = initialUrlState.topic;
  var connectorAvailable = false;
  var reviewLanguage = "schinese";
  var correctionContext = null;
  var weightUpdateTimer = 0;
  function replaceWorkspaceUrl() {
    const state = store.getState();
    const workspaceSearch = new URLSearchParams(serializeWorkspaceState({
      view: activeView,
      queue: activeQueue,
      topic: activeQueue === "unclassified" ? null : state.selectedTopicId
    }).replace(/^\?/, ""));
    const url = new URL(window.location.href);
    for (const key of ["view", "queue", "topic"]) url.searchParams.delete(key);
    for (const [key, value] of workspaceSearch) url.searchParams.set(key, value);
    window.history.replaceState(null, "", url);
  }
  function selectTopic(topicId, synchronize = true) {
    store.selectTopic(topicId);
    if (synchronize) replaceWorkspaceUrl();
  }
  var overview = mountSignalOverview({
    canvas: refs.canvas,
    tableBody: refs.tableBody,
    onSelect: (topicId) => selectTopic(topicId)
  });
  var comparison = mountComparisonView(refs.comparisonContent);
  var investigation = mountInvestigationView({
    content: refs.investigationContent,
    empty: refs.investigationEmpty,
    exportButton: refs.exportAction,
    onCorrection(action) {
      if (action === "undo") {
        const topicId = store.getState().selectedTopicId;
        if (topicId && store.removeCorrectionsForTopic(topicId)) rerunAnalysis(topicId);
        return;
      }
      openCorrectionDialog(action);
    }
  });
  function currentAnalysisOptions(dataset) {
    return {
      now: dataset.source.retrievedAt,
      weights: store.getState().weights,
      corrections: store.correctionOptions(),
      supportedLanguages: dataset.mode === "offline-demo" ? ["english"] : reviewLanguage === "all" ? ["english", "schinese"] : [reviewLanguage]
    };
  }
  function localAnalysis(dataset, onProgress) {
    updateProgressBar(0.2, "\u6B63\u5728\u6E05\u6D17\u533F\u540D\u6587\u672C...");
    setTimeout(() => updateProgressBar(0.6, "\u6B63\u5728\u63D0\u53D6\u9AD8\u9891\u4E3B\u9898..."), 40);
    setTimeout(() => updateProgressBar(1, "\u5206\u6790\u5B8C\u6210"), 120);
    return analyzeDataset(dataset, currentAnalysisOptions(dataset), onProgress);
  }
  function analyzeWithWorker(dataset, onProgress) {
    if (typeof Worker !== "function" || window.location.protocol === "file:") {
      return Promise.resolve(localAnalysis(dataset, onProgress));
    }
    return new Promise((resolve, reject) => {
      let worker;
      try {
        worker = new Worker("./analysis.worker.bundle.js?v=2026-08-12-refinement");
      } catch {
        resolve(localAnalysis(dataset, onProgress));
        return;
      }
      const requestId = `analysis:${Date.now()}`;
      const timeout = window.setTimeout(() => {
        worker.terminate();
        resolve(localAnalysis(dataset, onProgress));
      }, 12e3);
      worker.addEventListener("message", (event) => {
        if (event.data?.requestId !== requestId) return;
        if (event.data.type === "progress") onProgress(event.data);
        if (event.data.type === "complete") {
          window.clearTimeout(timeout);
          worker.terminate();
          resolve(event.data.result);
        }
        if (event.data.type === "error") {
          window.clearTimeout(timeout);
          worker.terminate();
          reject(new Error(event.data.error));
        }
      });
      worker.addEventListener("error", () => {
        window.clearTimeout(timeout);
        worker.terminate();
        resolve(localAnalysis(dataset, onProgress));
      }, { once: true });
      worker.postMessage({ type: "analyze", requestId, dataset, options: currentAnalysisOptions(dataset) });
    });
  }
  function setSourceReadout(title, detail) {
    refs.sourceStatus.querySelector("strong").textContent = title;
    refs.sourceStatus.querySelector("small").textContent = detail;
  }
  function setConnectorState(state, detail) {
    refs.connectorStatus.textContent = detail;
    refs.connectorStatus.dataset.state = state;
    const enabled = state === "available";
    connectorAvailable = enabled;
    refs.searchInput.disabled = !enabled;
    refs.searchSubmit.disabled = !enabled;
  }
  function updateQueueCounts(analysis) {
    const topics = analysis?.topics ?? [];
    const counts = {
      new: topics.filter((topic) => topic.raw.previousCount === 0 && topic.raw.currentCount > 0).length,
      growing: topics.filter((topic) => topic.dimensions.velocity >= 0.2).length,
      largest: Math.min(5, topics.length),
      core: topics.filter((topic) => topic.dimensions.coreImpact >= 0.5).length,
      persistent: topics.filter((topic) => topic.raw.previousCount > 0 && topic.raw.currentCount > 0).length,
      unclassified: analysis?.unclassified?.length ?? 0
    };
    for (const button of refs.queueButtons) {
      button.querySelector("[data-topic-count]").textContent = formatInteger(counts[button.dataset.queue] ?? 0);
      button.setAttribute("aria-pressed", String(button.dataset.queue === activeQueue));
    }
  }
  function topicsForQueue(topics, queue) {
    if (queue === "new") return topics.filter((topic) => topic.raw.previousCount === 0 && topic.raw.currentCount > 0);
    if (queue === "growing") return topics.filter((topic) => topic.dimensions.velocity >= 0.2);
    if (queue === "largest") return [...topics].sort((left, right) => right.raw.count - left.raw.count).slice(0, 5);
    if (queue === "core") return topics.filter((topic) => topic.dimensions.coreImpact >= 0.5);
    if (queue === "persistent") return topics.filter((topic) => topic.raw.previousCount > 0 && topic.raw.currentCount > 0);
    if (queue === "unclassified") return [];
    return topics;
  }
  function renderCoverage(analysis) {
    const coverage = createCoverageModel(analysis);
    refs.fetchedCount.textContent = formatInteger(coverage.counts.fetched);
    refs.acceptedCount.textContent = formatInteger(coverage.counts.accepted);
    refs.classifiedCount.textContent = formatInteger(coverage.counts.classified);
    refs.unclassifiedCount.textContent = formatInteger(coverage.counts.unclassified);
    refs.excludedCount.textContent = formatInteger(coverage.counts.excluded);
    refs.sampleSummary.textContent = `${formatInteger(coverage.counts.accepted)} \u6761\u6709\u6548`;
    refs.coverageRate.textContent = formatPercent(coverage.classificationRate);
    refs.coverageBar.style.width = formatPercent(coverage.classificationRate);
    const rangeLabel = `${formatDate(coverage.range.start)} \u2014 ${formatDate(coverage.range.end)}`;
    refs.sampleRange.textContent = `\u91C7\u6837\u8303\u56F4 ${rangeLabel}`;
    refs.lensRange.textContent = `\u533F\u540D\u8BC4\u8BBA\u91C7\u6837\uFF1A${rangeLabel}`;
    refs.exclusionReasons.replaceChildren(...coverage.exclusionReasons.map((item) => {
      const row = document.createElement("p");
      row.textContent = `${EXCLUSION_LABELS[item.reason] ?? item.reason}\uFF1A${formatInteger(item.count)}`;
      return row;
    }));
    return coverage;
  }
  function setInvestigationEmpty(label, title, detail) {
    refs.investigationEmptyLabel.textContent = label;
    refs.investigationEmptyTitle.textContent = title;
    refs.investigationEmptyDetail.textContent = detail;
  }
  function applyViewState(unclassified = false) {
    for (const button of refs.viewButtons) {
      button.disabled = unclassified;
      button.setAttribute("aria-pressed", String(!unclassified && button.dataset.view === activeView));
    }
    refs.table.hidden = unclassified || activeView !== "table";
  }
  function renderAnalysis(state) {
    const analysis = state.analysis;
    renderCoverage(analysis);
    updateQueueCounts(analysis);
    refs.lensEmpty.hidden = true;
    if (activeQueue === "unclassified") {
      applyViewState(true);
      refs.filterEmpty.hidden = true;
      refs.unclassifiedView.hidden = false;
      const model = createUnclassifiedModel(analysis.unclassified, analysis.cleaning.acceptedReviews);
      refs.unclassifiedSummary.textContent = `${formatInteger(model.count)} \u6761\u8BC4\u8BBA\u672A\u88AB\u5F3A\u5236\u5F52\u7C7B\uFF1B\u663E\u793A\u524D ${formatInteger(model.items.length)} \u6761`;
      refs.unclassifiedList.innerHTML = renderUnclassifiedItems(model.items);
      overview.render([], null);
      investigation.render(null, [], {});
      setInvestigationEmpty("\u5F85\u5206\u7C7B\u8BF4\u660E", "\u6CA1\u6709\u5339\u914D\uFF0C\u4E0D\u4EE3\u8868\u6CA1\u6709\u4EF7\u503C\u3002", "\u8FD9\u4E9B\u8BC4\u8BBA\u672A\u8FBE\u5230\u73B0\u6709\u89C4\u5219\u4E3B\u9898\u7684\u5339\u914D\u6761\u4EF6\uFF0C\u5E94\u5F53\u5148\u6269\u5145\u8BCD\u5178\u6216\u8FDB\u884C\u4EBA\u5DE5\u7814\u7A76\u3002 ");
      comparison.render(null, [], []);
      if (state.selectedTopicId) queueMicrotask(() => selectTopic(null));
      return;
    }
    applyViewState(false);
    refs.unclassifiedView.hidden = true;
    const visibleTopics = topicsForQueue(analysis.topics, activeQueue);
    const emptyModel = visibleTopics.length === 0 ? createQueueEmptyModel(activeQueue) : null;
    refs.filterEmpty.hidden = !emptyModel;
    if (emptyModel) {
      refs.filterEmptyTitle.textContent = emptyModel.title;
      refs.filterEmptyDetail.textContent = emptyModel.detail;
      overview.render([], null);
      investigation.render(null, [], {});
      setInvestigationEmpty("\u5F53\u524D\u7B5B\u9009\u4E3A\u7A7A", "\u8FD9\u4E2A\u89C6\u56FE\u6682\u65F6\u6CA1\u6709\u4FE1\u53F7\u3002", "\u6E05\u9664\u7B5B\u9009\u540E\u53EF\u4EE5\u7EE7\u7EED\u68C0\u67E5\u5168\u90E8\u4E3B\u9898\u4E0E\u8BC1\u636E\u3002 ");
      comparison.render(null, [], []);
      if (state.selectedTopicId) queueMicrotask(() => selectTopic(null));
      return;
    }
    const requestedId = pendingTopicId ?? state.selectedTopicId;
    const selectedTopic = visibleTopics.find((topic) => topic.id === requestedId) ?? visibleTopics[0] ?? null;
    pendingTopicId = null;
    overview.render(visibleTopics, selectedTopic?.id ?? null);
    investigation.render(selectedTopic, analysis.cleaning.acceptedReviews, {
      versions: state.dataset.versions,
      topics: analysis.topics,
      corrections: state.corrections
    });
    comparison.render(selectedTopic, analysis.cleaning.acceptedReviews, state.dataset.versions);
    if (selectedTopic?.id !== state.selectedTopicId) queueMicrotask(() => selectTopic(selectedTopic?.id ?? null));
  }
  function renderState(state) {
    const progress = Math.max(0, Math.min(1, state.progress?.progress ?? 0));
    refs.progressBar.style.width = `${progress * 100}%`;
    const stageLabels = {
      idle: "\u7B49\u5F85\u6570\u636E",
      source: "\u8BFB\u53D6\u8BC4\u8BBA\u6765\u6E90\u2026",
      "source-ready": "\u8BC4\u8BBA\u6765\u6E90\u5DF2\u5C31\u7EEA",
      queued: "\u5206\u6790\u5DF2\u6392\u961F\u2026",
      cleaning: "\u6E05\u6D17\u4E0E\u53BB\u91CD\u2026",
      topics: "\u8BC6\u522B\u95EE\u9898\u4E3B\u9898\u2026",
      complete: "\u5206\u6790\u5B8C\u6210"
    };
    refs.progressLabel.textContent = stageLabels[state.progress?.stage] ?? state.progress?.stage ?? "\u7B49\u5F85\u6570\u636E";
    const productStates = { idle: "\u6B63\u5728\u51C6\u5907\u6848\u4F8B\u2026", loading: "\u6B63\u5728\u8BFB\u53D6\u6570\u636E\u2026", loaded: "\u6570\u636E\u5DF2\u8F7D\u5165", analyzing: "\u6B63\u5728\u5206\u6790\u2026", ready: "\u5206\u6790\u5C31\u7EEA", error: "\u5206\u6790\u53D7\u963B" };
    refs.productState.textContent = productStates[state.status] ?? state.status;
    if (state.dataset) {
      const partial = state.dataset.partial ? " \xB7 \u5206\u9875\u4E2D\u65AD\uFF0C\u5DF2\u5206\u6790\u5B8C\u6574\u83B7\u53D6\u9875" : "";
      setSourceReadout(
        state.dataset.game.name,
        `${state.sourceMode === "offline-demo" ? "\u79BB\u7EBF\u516C\u5F00\u5FEB\u7167" : "\u5728\u7EBF Steam \u533F\u540D\u8BC4\u8BBA"} \xB7 ${formatDate(state.dataset.source.retrievedAt)}${partial}`
      );
    }
    if (state.analysis) renderAnalysis(state);
    if (state.error) setSourceReadout("\u5F53\u524D\u5206\u6790\u672A\u5B8C\u6210", `${state.error.message} \xB7 \u5DF2\u6709\u6848\u4F8B\u6570\u636E\u4ECD\u4FDD\u7559`);
  }
  store.subscribe(renderState);
  renderState(store.getState());
  async function analyzeLoadedDataset(preferredTopicId = null) {
    const analyzed = await store.runAnalysis(analyzeWithWorker);
    if (!analyzed) return false;
    const state = store.getState();
    const nextTopicId = state.analysis.topics.some((topic) => topic.id === preferredTopicId) ? preferredTopicId : state.analysis.topics[0]?.id ?? null;
    if (activeQueue !== "unclassified") selectTopic(nextTopicId);
    return true;
  }
  async function rerunAnalysis(preferredTopicId = store.getState().selectedTopicId) {
    if (!store.getState().dataset) return false;
    return analyzeLoadedDataset(preferredTopicId);
  }
  async function openDemo() {
    refs.openDemo.disabled = true;
    const loaded = await store.loadDataset(() => loadDemoDataset(), { sourceMode: "offline-demo" });
    if (loaded) await analyzeLoadedDataset(pendingTopicId);
    refs.openDemo.disabled = false;
  }
  async function probeConnector() {
    setConnectorState("checking", "\u8FDE\u63A5\u5668\u68C0\u6D4B\u4E2D\u2026");
    const capability = await steamClient.checkAvailability();
    if (capability.available) {
      setConnectorState("available", "\u5DF2\u8FDE\u63A5\uFF0C\u53EF\u5206\u6790\u5176\u4ED6\u6E38\u620F");
    } else {
      setConnectorState("not-deployed", "\u5F53\u524D\u672A\u90E8\u7F72 \xB7 \u79BB\u7EBF\u6848\u4F8B\u53EF\u5B8C\u6574\u4F53\u9A8C");
    }
  }
  function renderSearchResults(games) {
    refs.searchResults.replaceChildren();
    if (!games.length) {
      const message = document.createElement("p");
      message.textContent = "\u6CA1\u6709\u627E\u5230\u5339\u914D\u7684\u516C\u5F00\u6E38\u620F\u3002";
      refs.searchResults.append(message);
    } else {
      for (const game of games) {
        const button = document.createElement("button");
        button.type = "button";
        button.dataset.gameAppId = String(game.appId);
        button.setAttribute("role", "option");
        button.textContent = `${game.name} \xB7 AppID ${game.appId}`;
        button.addEventListener("click", () => loadLiveGame(game));
        refs.searchResults.append(button);
      }
    }
    refs.searchResults.hidden = false;
  }
  async function loadLiveGame(game) {
    refs.searchResults.hidden = true;
    setConnectorState("checking", `\u6B63\u5728\u83B7\u53D6 ${game.name} \u7684\u533F\u540D\u8BC4\u8BBA\u2026`);
    const loaded = await store.loadDataset(() => loadLiveSteamDataset(steamClient, game, { language: reviewLanguage }), { sourceMode: "live" });
    if (loaded) {
      await analyzeLoadedDataset(null);
      setConnectorState("available", `\u5DF2\u8FDE\u63A5 \xB7 ${game.name}`);
    } else {
      setConnectorState("available", "\u83B7\u53D6\u5931\u8D25\uFF0C\u53EF\u91CD\u8BD5\uFF1B\u79BB\u7EBF\u6848\u4F8B\u4ECD\u53EF\u7528");
    }
  }
  refs.openDemo.addEventListener("click", openDemo);
  refs.reviewLanguage.addEventListener("change", () => {
    reviewLanguage = refs.reviewLanguage.value;
    setConnectorState("available", reviewLanguage === "schinese" ? "\u4E2D\u6587\u8BC4\u8BBA\u4F18\u5148\uFF0C\u9009\u62E9\u6E38\u620F\u540E\u5F00\u59CB\u5206\u6790" : "\u8BED\u8A00\u504F\u597D\u5DF2\u66F4\u65B0\uFF0C\u9009\u62E9\u6E38\u620F\u540E\u5F00\u59CB\u5206\u6790");
  });
  refs.searchForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!connectorAvailable) return;
    const query = refs.searchInput.value.trim();
    if (query.length < 2) {
      setConnectorState("available", "\u8BF7\u8F93\u5165\u81F3\u5C11 2 \u4E2A\u5B57\u7B26");
      refs.searchInput.focus();
      return;
    }
    refs.searchSubmit.disabled = true;
    setConnectorState("checking", `\u6B63\u5728\u641C\u7D22\u201C${query}\u201D\u2026`);
    try {
      const result = await steamClient.searchGames(query);
      renderSearchResults(result.games);
      setConnectorState("available", result.games.length ? `\u627E\u5230 ${formatInteger(result.games.length)} \u4E2A\u7ED3\u679C` : "\u6CA1\u6709\u5339\u914D\u7ED3\u679C");
    } catch (error2) {
      setConnectorState("available", `${error2 instanceof Error ? error2.message : String(error2)} \xB7 \u53EF\u4EE5\u91CD\u8BD5`);
    } finally {
      refs.searchSubmit.disabled = false;
    }
  });
  for (const button of refs.viewButtons) {
    button.addEventListener("click", () => {
      activeView = button.dataset.view;
      applyViewState(activeQueue === "unclassified");
      replaceWorkspaceUrl();
    });
  }
  function setQueue(queue) {
    activeQueue = queue;
    for (const button of refs.queueButtons) button.setAttribute("aria-pressed", String(button.dataset.queue === activeQueue));
    const state = store.getState();
    if (state.analysis) renderAnalysis(state);
    replaceWorkspaceUrl();
  }
  for (const button of refs.queueButtons) {
    button.addEventListener("click", () => setQueue(activeQueue === button.dataset.queue ? null : button.dataset.queue));
  }
  refs.clearQueue.addEventListener("click", () => setQueue(null));
  for (const input of refs.priorityWeights) {
    const persisted = store.getState().weights[input.dataset.priorityWeight];
    if (Number.isFinite(persisted)) input.value = String(Math.round(persisted * 100));
    input.parentElement.querySelector("output").value = input.value;
    input.addEventListener("input", () => {
      input.parentElement.querySelector("output").value = input.value;
      const weights = Object.fromEntries(refs.priorityWeights.map((control) => [control.dataset.priorityWeight, Number(control.value) / 100]));
      store.setWeights(weights);
      window.clearTimeout(weightUpdateTimer);
      weightUpdateTimer = window.setTimeout(() => rerunAnalysis(), 180);
    });
  }
  function openCorrectionDialog(action) {
    const state = store.getState();
    const topic = state.analysis?.topics.find((candidate) => candidate.id === state.selectedTopicId);
    if (!topic) return;
    correctionContext = { action, topicId: topic.id };
    refs.correctionError.textContent = "";
    refs.renameField.hidden = action !== "rename";
    refs.mergeField.hidden = action !== "merge";
    if (action === "rename") {
      refs.correctionTitle.textContent = "\u91CD\u547D\u540D\u4E3B\u9898";
      refs.correctionDescription.textContent = `\u5F53\u524D\u540D\u79F0\uFF1A${topic.label}`;
      refs.correctionForm.elements.label.value = topic.label;
      refs.correctionPreview.textContent = "\u53EA\u6539\u53D8\u4E3B\u9898\u540D\u79F0\uFF0C\u4E0D\u6539\u53D8\u8BC4\u8BBA\u8BC1\u636E\u548C\u8BC4\u5206\u3002";
    } else {
      refs.correctionTitle.textContent = "\u5408\u5E76\u4E3B\u9898";
      refs.correctionDescription.textContent = `\u9009\u62E9\u4E0E\u201C${topic.label}\u201D\u6307\u5411\u540C\u4E00\u95EE\u9898\u7684\u4E3B\u9898\u3002`;
      const select = refs.correctionForm.elements.target;
      select.replaceChildren(...state.analysis.topics.filter((candidate) => candidate.id !== topic.id).map((candidate) => {
        const option = document.createElement("option");
        option.value = candidate.id;
        option.textContent = `${candidate.label} \xB7 ${formatInteger(candidate.raw.count)} \u6761`;
        return option;
      }));
      refs.correctionPreview.textContent = "\u5408\u5E76\u540E\u4F1A\u4FDD\u7559\u4E24\u4E2A\u4E3B\u9898\u7684\u5168\u90E8\u652F\u6301\u8BC1\u636E\u4E0E\u53CD\u4F8B\u3002";
    }
    refs.correctionDialog.showModal();
    queueMicrotask(() => (action === "rename" ? refs.correctionForm.elements.label : refs.correctionForm.elements.target).focus());
  }
  refs.correctionCancel.addEventListener("click", () => refs.correctionDialog.close());
  refs.correctionForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!correctionContext) return;
    const state = store.getState();
    const source = state.analysis?.topics.find((topic) => topic.id === correctionContext.topicId);
    if (!source) {
      refs.correctionError.textContent = "\u539F\u4E3B\u9898\u5DF2\u4E0D\u5B58\u5728\uFF0C\u8BF7\u5173\u95ED\u540E\u91CD\u65B0\u9009\u62E9\u3002";
      return;
    }
    if (correctionContext.action === "rename") {
      const label = refs.correctionForm.elements.label.value.trim();
      if (label.length < 2) {
        refs.correctionError.textContent = "\u4E3B\u9898\u540D\u79F0\u81F3\u5C11\u9700\u8981 2 \u4E2A\u5B57\u7B26\u3002";
        return;
      }
      store.renameTopic(source.id, label);
      refs.correctionDialog.close();
      correctionContext = null;
      return;
    }
    const targetId = refs.correctionForm.elements.target.value;
    const target = state.analysis.topics.find((topic) => topic.id === targetId);
    if (!target || target.id === source.id) {
      refs.correctionError.textContent = "\u8BF7\u9009\u62E9\u53E6\u4E00\u4E2A\u6709\u6548\u4E3B\u9898\u3002";
      return;
    }
    const sourceIds = [source.id, target.id].sort();
    const mergedId = `merged-${sourceIds.join("-")}`.slice(0, 80);
    store.recordCorrection({
      type: "merge",
      sourceIds,
      into: { id: mergedId, label: `${source.label} + ${target.label}`, category: source.category }
    });
    refs.correctionDialog.close();
    correctionContext = null;
    await rerunAnalysis(mergedId);
  });
  refs.exportAction.addEventListener("click", () => {
    const state = store.getState();
    const topic = state.analysis?.topics.find((candidate) => candidate.id === state.selectedTopicId);
    if (!topic || !state.dataset) return;
    const output = createActionCardPackage(topic, state.analysis.cleaning.acceptedReviews, {
      game: state.dataset.game,
      source: state.dataset.source,
      versions: state.dataset.versions,
      generatedAt: (/* @__PURE__ */ new Date()).toISOString()
    });
    for (const file of output.files) {
      const url = URL.createObjectURL(new Blob([file.content], { type: file.type }));
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = file.name;
      anchor.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 2e3);
    }
    refs.exportAction.querySelector("strong").textContent = "\u5DF2\u5BFC\u51FA Markdown\u3001JSON\u3001\u6253\u5370\u7248";
  });
  window.addEventListener("popstate", () => {
    const urlState = parseWorkspaceState(window.location.search);
    activeQueue = urlState.queue;
    activeView = urlState.view;
    pendingTopicId = urlState.topic;
    if (store.getState().analysis) renderAnalysis(store.getState());
  });
  document.documentElement.dataset.playerSignal = "workspace";
  window.dispatchEvent(new CustomEvent("player-signal:ready", { detail: { stage: "workspace" } }));
  queueMicrotask(() => {
    openDemo();
    probeConnector();
  });
})();
