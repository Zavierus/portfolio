export function isAllowedOrigin(request, allowedOrigins = []) {
  const origin = request.headers.get("origin");
  return !origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin);
}

export function jsonResponse(request, body, options = {}) {
  const headers = new Headers({ "content-type": "application/json; charset=utf-8", "cache-control": options.cacheControl ?? "no-store" });
  const origin = request.headers.get("origin");
  if (origin && (options.allowedOrigins ?? []).includes(origin)) { headers.set("access-control-allow-origin", origin); headers.set("vary", "Origin"); }
  if (options.retryAfterSeconds) headers.set("retry-after", String(options.retryAfterSeconds));
  return new Response(`${JSON.stringify(body)}\n`, { status: options.status ?? 200, headers });
}

export function errorResponse(request, code, message, options = {}) {
  return jsonResponse(request, { error: { code, message, ...(options.retryAfterSeconds ? { retryAfterSeconds: options.retryAfterSeconds } : {}) } }, options);
}
