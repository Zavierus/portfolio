import { hashReviewIdentity } from "../../src/data/privacy.js";

function safeText(value) { return String(value ?? "").replace(/7656119\d{10}/g, "[redacted]").replace(/https?:\/\/steamcommunity\.com\/(?:id|profiles)\/[^\s]+/gi, "[redacted]").replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim(); }

export async function anonymizeSteamReview(review, salt) {
  if (!review?.recommendationid) throw new TypeError("Steam review is missing recommendationid");
  const reviewIdHash = await hashReviewIdentity(String(review.recommendationid), salt);
  return Object.freeze({ reviewIdHash, text: safeText(review.review), createdAt: new Date(Number(review.timestamp_created) * 1000).toISOString(), recommended: Boolean(review.voted_up), playtimeMinutes: Math.max(0, Number(review.author?.playtime_forever) || 0), helpfulVotes: Math.max(0, Number.parseInt(review.votes_up, 10) || 0), language: String(review.language ?? "english") });
}
