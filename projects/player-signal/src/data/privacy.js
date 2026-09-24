const IDENTITY_KEYS = new Set([
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
  "avatarmedium",
]);

function normalizeKey(key) {
  return String(key).replace(/[^a-z0-9]/gi, "").toLowerCase();
}

export function assertNoIdentityFields(value, path = "root", visited = new WeakSet()) {
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

export async function hashReviewIdentity(value, salt) {
  if (typeof value !== "string" || value.length === 0) {
    throw new TypeError("Review identity value is required");
  }
  if (typeof salt !== "string" || salt.length === 0) {
    throw new TypeError("Review identity salt is required");
  }
  if (!globalThis.crypto?.subtle) {
    throw new Error("Web Crypto is unavailable");
  }

  const bytes = new TextEncoder().encode(`${salt}\u0000${value}`);
  const digest = await globalThis.crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}
