import { createGameRecord, createReviewRecord, createVersionRecord } from "../domain/schemas.js";
import { validateDataset } from "../domain/validators.js";

const DOCUMENT_URLS = Object.freeze({
  game: "./data/demo-game.json",
  reviews: "./data/demo-reviews.json",
  versions: "./data/demo-versions.json",
});

const OFFLINE_CASES_URL = "./data/offline-cases.json";

async function loadJson(fetchImpl, url) {
  const response = await fetchImpl(url);
  if (!response?.ok) throw new Error(`Demo source unavailable: ${url}`);
  return response.json();
}

function deepFreeze(value) {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const nested of Object.values(value)) deepFreeze(nested);
  }
  return value;
}

export async function loadDemoDataset(fetchImpl = globalThis.fetch) {
  if (typeof fetchImpl !== "function") throw new TypeError("A fetch implementation is required");
  const [gameDocument, reviewDocument, versionDocument] = await Promise.all([
    loadJson(fetchImpl, DOCUMENT_URLS.game),
    loadJson(fetchImpl, DOCUMENT_URLS.reviews),
    loadJson(fetchImpl, DOCUMENT_URLS.versions),
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
      exclusionCounts: structuredClone(reviewDocument.exclusionCounts ?? {}),
    },
  };
  const validation = validateDataset(dataset);
  if (!validation.ok) {
    throw new TypeError(`Demo dataset is invalid: ${JSON.stringify(validation.errors)}`);
  }
  return deepFreeze(dataset);
}

function createOfflineCaseRecord(caseDocument) {
  const source = structuredClone(caseDocument.source);
  const game = createGameRecord({ ...caseDocument.game, source });
  const reviews = (caseDocument.reviews ?? []).map((review) => createReviewRecord({ ...review, source }));
  const dataset = {
    mode: "offline-case",
    game,
    reviews,
    versions: (caseDocument.versions ?? []).map(createVersionRecord),
    source,
    provenance: {
      retrievedAt: source.retrievedAt,
      requestedPages: 1,
      acceptedCount: reviews.length,
      roles: [...(caseDocument.roles ?? [])],
      signal: caseDocument.signal ?? "",
    },
  };
  const validation = validateDataset(dataset);
  if (!validation.ok) throw new TypeError(`Offline case is invalid: ${JSON.stringify(validation.errors)}`);
  return deepFreeze(dataset);
}

export async function loadOfflineCaseCatalog(fetchImpl = globalThis.fetch) {
  const document = await loadJson(fetchImpl, OFFLINE_CASES_URL);
  if (!Array.isArray(document?.cases)) throw new TypeError("Offline case catalog is missing cases");
  return deepFreeze(document.cases.map(createOfflineCaseRecord));
}

export async function loadOfflineCase(caseId, fetchImpl = globalThis.fetch) {
  const cases = await loadOfflineCaseCatalog(fetchImpl);
  const selected = cases.find((dataset) => dataset.game.id === String(caseId));
  if (!selected) throw new Error(`Offline case not found: ${caseId}`);
  return selected;
}
