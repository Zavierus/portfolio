from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from urllib.error import HTTPError, URLError
from urllib.parse import parse_qs, urlencode, urlparse
from urllib.request import Request, urlopen
from datetime import datetime, timezone
import hashlib
import json
import os
import re
import sys
import threading
import time


API_CACHE = {}
API_CACHE_LOCK = threading.Lock()
CACHE_TTL_SECONDS = 300
DEFAULT_REVIEW_SALT = "local-player-signal-preview-salt"


def now_iso():
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


def cache_get(key):
    with API_CACHE_LOCK:
        item = API_CACHE.get(key)
        if item and item[0] > time.monotonic():
            return item[1]
        API_CACHE.pop(key, None)
    return None


def cache_set(key, value, ttl=CACHE_TTL_SECONDS):
    with API_CACHE_LOCK:
        API_CACHE[key] = (time.monotonic() + ttl, value)


def json_bytes(body):
    return (json.dumps(body, ensure_ascii=False, separators=(",", ":")) + "\n").encode("utf-8")


def error_body(code, message, status):
    return status, {"error": {"code": code, "message": message}}


def steam_json(url, timeout=12):
    request = Request(url, headers={"accept": "application/json", "user-agent": "ZenoPlayerSignal/1.0"})
    try:
        with urlopen(request, timeout=timeout) as response:
            status = getattr(response, "status", 200)
            body = json.loads(response.read().decode("utf-8"))
            return status, body
    except HTTPError as error:
        raise RuntimeError(f"upstream-http-{error.code}") from error
    except (URLError, TimeoutError, OSError, json.JSONDecodeError) as error:
        raise RuntimeError("upstream-timeout") from error


def safe_text(value):
    text = str(value or "")
    text = re.sub(r"7656119\d{10}", "[redacted]", text)
    text = re.sub(r"https?://steamcommunity\.com/(?:id|profiles)/[^\s]+", "[redacted]", text, flags=re.I)
    text = re.sub(r"[\x00-\x1f\x7f]", " ", text)
    return re.sub(r"\s+", " ", text).strip()


def review_hash(recommendation_id, salt):
    return hashlib.sha256(f"{salt}\0{recommendation_id}".encode("utf-8")).hexdigest()


def games_api(query):
    query = re.sub(r"\s+", " ", query or "").strip()
    if len(query) < 2:
        return error_body("invalid-query", "Search requires at least two characters", 400)
    cache_key = f"games:{query.lower()}"
    cached = cache_get(cache_key)
    if cached:
        return 200, cached
    params = urlencode({"term": query, "l": "english", "cc": "us"})
    try:
        _, upstream = steam_json(f"https://store.steampowered.com/api/storesearch/?{params}")
    except RuntimeError as error:
        code = "upstream-timeout" if str(error) == "upstream-timeout" else "upstream-unavailable"
        status = 504 if code == "upstream-timeout" else 502
        return error_body(code, "Steam game search is temporarily unavailable", status)
    raw_games = upstream.get("items") if isinstance(upstream, dict) else []
    games = []
    for game in raw_games if isinstance(raw_games, list) else []:
        app_id = game.get("id")
        name = str(game.get("name") or "").strip()
        if not app_id or not name:
            continue
        games.append({
            "id": f"steam:{int(app_id)}",
            "appId": int(app_id),
            "name": name,
            "capsuleUrl": f"https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/{int(app_id)}/capsule_231x87.jpg",
        })
    body = {"query": query, "games": games[:12], "cachedAt": now_iso()}
    cache_set(cache_key, body)
    return 200, body


def reviews_api(parameters):
    try:
        app_id = int(parameters.get("appid", [""])[0])
    except (TypeError, ValueError):
        app_id = 0
    if app_id <= 0:
        return error_body("invalid-appid", "A positive Steam AppID is required", 400)
    language = str(parameters.get("language", ["english"])[0] or "english")
    cursor = str(parameters.get("cursor", ["*"])[0] or "*")
    try:
        count = min(100, max(1, int(parameters.get("count", ["100"])[0])))
    except (TypeError, ValueError):
        count = 100
    salt = os.environ.get("PLAYER_SIGNAL_REVIEW_SALT", DEFAULT_REVIEW_SALT)
    cache_key = f"reviews:{app_id}:{language}:{cursor}:{count}"
    cached = cache_get(cache_key)
    if cached:
        return 200, cached
    query = urlencode({"json": 1, "filter": "recent", "language": language, "review_type": "all", "purchase_type": "all", "num_per_page": count, "cursor": cursor})
    upstream_url = f"https://store.steampowered.com/appreviews/{app_id}?{query}"
    try:
        _, upstream = steam_json(upstream_url)
    except RuntimeError as error:
        code = "upstream-timeout" if str(error) == "upstream-timeout" else "upstream-unavailable"
        status = 504 if code == "upstream-timeout" else 502
        return error_body(code, "Steam reviews are temporarily unavailable", status)
    if not isinstance(upstream, dict) or not upstream.get("success") or not isinstance(upstream.get("reviews"), list):
        return error_body("invalid-upstream-contract", "Steam returned an unexpected review response", 502)
    reviews = []
    for review in upstream["reviews"]:
        recommendation_id = review.get("recommendationid")
        if not recommendation_id:
            continue
        author = review.get("author") or {}
        try:
            created_at = datetime.fromtimestamp(int(review.get("timestamp_created", 0)), timezone.utc).isoformat().replace("+00:00", "Z")
        except (TypeError, ValueError, OSError):
            created_at = now_iso()
        text = safe_text(review.get("review"))
        if len(text) < 4:
            continue
        reviews.append({
            "reviewIdHash": review_hash(recommendation_id, salt),
            "text": text,
            "createdAt": created_at,
            "recommended": bool(review.get("voted_up")),
            "playtimeMinutes": max(0, int(author.get("playtime_forever") or 0)),
            "helpfulVotes": max(0, int(review.get("votes_up") or 0)),
            "language": str(review.get("language") or language),
        })
    body = {
        "reviews": reviews,
        "nextCursor": str(upstream.get("cursor") or ""),
        "source": {"provider": "steam-public-reviews", "url": upstream_url, "retrievedAt": now_iso()},
        "page": {"count": len(reviews), "requested": count},
    }
    cache_set(cache_key, body)
    return 200, body


class PreviewHandler(SimpleHTTPRequestHandler):
    server_version = "ZENOPreview/1.1"

    def end_headers(self):
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        self.send_header("X-Zeno-Preview", "latest")
        super().end_headers()

    def log_message(self, format, *args):
        return

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", self.headers.get("origin", "*"))
        self.send_header("Access-Control-Allow-Methods", "GET, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Accept, Content-Type")
        self.end_headers()

    def do_GET(self):
        parsed = urlparse(self.path)
        if parsed.path == "/api/games":
            status, body = games_api(parse_qs(parsed.query).get("q", [""])[0])
            self.write_json(status, body)
            return
        if parsed.path == "/api/reviews":
            status, body = reviews_api(parse_qs(parsed.query))
            self.write_json(status, body)
            return
        super().do_GET()

    def write_json(self, status, body):
        payload = json_bytes(body)
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(payload)))
        origin = self.headers.get("origin")
        if origin:
            self.send_header("Access-Control-Allow-Origin", origin)
            self.send_header("Vary", "Origin")
        self.end_headers()
        self.wfile.write(payload)


def main():
    root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 4266
    os.chdir(root)
    server = ThreadingHTTPServer(("127.0.0.1", port), PreviewHandler)
    server.serve_forever()


if __name__ == "__main__":
    main()
