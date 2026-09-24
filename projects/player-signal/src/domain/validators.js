import { assertNoIdentityFields } from "../data/privacy.js";
import { createGameRecord, createReviewRecord, createVersionRecord } from "./schemas.js";

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
    }],
  ];
  for (const [field, operation] of fields) capture(errors, `${prefix}.${field}`, `invalid-${field}`, operation);
  capture(errors, prefix, "invalid-review", () => createReviewRecord(review));
}

export function validateDataset(input) {
  const errors = [];
  const dataset = structuredClone(input);

  capture(errors, "dataset", "identity-field", () => assertNoIdentityFields(dataset));
  capture(errors, "game", "invalid-game", () => createGameRecord(dataset?.game));

  if (!Array.isArray(dataset?.reviews)) {
    errors.push(error("reviews", "invalid-reviews", "reviews must be an array"));
  } else {
    const seen = new Set();
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
    const seen = new Set();
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
