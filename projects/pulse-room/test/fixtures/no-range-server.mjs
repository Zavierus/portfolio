import { createReadStream } from "node:fs";
import { realpath, stat } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, isAbsolute, join, relative, resolve } from "node:path";

const MIME_TYPES = new Map([
  [".css", "text/css; charset=utf-8"],
  [".html", "text/html; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".m4a", "audio/mp4"],
  [".md", "text/markdown; charset=utf-8"],
  [".mp3", "audio/mpeg"],
  [".ogg", "audio/ogg"],
  [".png", "image/png"],
  [".wasm", "application/wasm"],
  [".wav", "audio/wav"],
  [".webp", "image/webp"],
]);

const SECURITY_HEADERS = Object.freeze({
  "Content-Security-Policy": "default-src 'self'; base-uri 'self'; connect-src 'self'; font-src 'self' data:; frame-ancestors 'none'; img-src 'self' blob: data:; media-src 'self' blob: data:; object-src 'none'; script-src 'self' 'wasm-unsafe-eval'; style-src 'self' 'unsafe-inline'; worker-src 'self' blob:",
  "Cross-Origin-Embedder-Policy": "require-corp",
  "Cross-Origin-Opener-Policy": "same-origin",
  "Cross-Origin-Resource-Policy": "same-origin",
  "Permissions-Policy": "camera=(), geolocation=(), microphone=()",
  "Referrer-Policy": "no-referrer",
});

function parseArguments(argv) {
  const options = { root: process.cwd(), port: 0, host: "127.0.0.1" };
  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];
    if (value === "--root") options.root = argv[++index];
    else if (value === "--port") options.port = Number(argv[++index]);
    else if (value === "--host") options.host = argv[++index];
    else throw new Error(`Unknown argument: ${value}`);
  }
  if (!Number.isInteger(options.port) || options.port < 0 || options.port > 65535) {
    throw new RangeError("--port must be an integer between 0 and 65535");
  }
  return options;
}

function isInside(root, candidate) {
  const pathFromRoot = relative(root, candidate);
  return pathFromRoot === "" || (!pathFromRoot.startsWith("..") && !isAbsolute(pathFromRoot));
}

function respond(response, statusCode, body) {
  const payload = Buffer.from(body, "utf8");
  response.writeHead(statusCode, {
    ...SECURITY_HEADERS,
    "Content-Length": payload.length,
    "Content-Type": "text/plain; charset=utf-8",
  });
  response.end(payload);
}

const options = parseArguments(process.argv.slice(2));
const root = await realpath(resolve(options.root));

const server = createServer(async (request, response) => {
  if (request.method !== "GET" && request.method !== "HEAD") {
    response.setHeader("Allow", "GET, HEAD");
    respond(response, 405, "Method Not Allowed");
    return;
  }

  const rawPath = String(request.url || "/").split("?", 1)[0];
  let decodedPath;
  try {
    decodedPath = decodeURIComponent(rawPath).replaceAll("\\", "/");
  } catch {
    respond(response, 400, "Bad Request");
    return;
  }
  if (decodedPath.split("/").includes("..")) {
    respond(response, 403, "Forbidden");
    return;
  }

  let candidate = resolve(root, decodedPath.replace(/^\/+/, ""));
  if (!isInside(root, candidate)) {
    respond(response, 403, "Forbidden");
    return;
  }

  try {
    let fileStat = await stat(candidate);
    if (fileStat.isDirectory()) {
      candidate = join(candidate, "index.html");
      fileStat = await stat(candidate);
    }
    const realCandidate = await realpath(candidate);
    if (!isInside(root, realCandidate) || !fileStat.isFile()) {
      respond(response, 403, "Forbidden");
      return;
    }

    response.writeHead(200, {
      ...SECURITY_HEADERS,
      "Accept-Ranges": "none",
      "Cache-Control": "no-store",
      "Content-Length": fileStat.size,
      "Content-Type": MIME_TYPES.get(extname(realCandidate).toLowerCase()) || "application/octet-stream",
      "X-Pulse-QA-No-Range": request.headers.range ? "range-ignored" : "full-body",
    });
    if (request.method === "HEAD") response.end();
    else createReadStream(realCandidate).pipe(response);
  } catch (error) {
    respond(response, error?.code === "ENOENT" ? 404 : 500, error?.code === "ENOENT" ? "Not Found" : "Server Error");
  }
});

server.listen(options.port, options.host, () => {
  const address = server.address();
  const port = typeof address === "object" && address ? address.port : options.port;
  process.stdout.write(`PULSE no-range server listening on http://${options.host}:${port}/\n`);
});

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => server.close(() => process.exit(0)));
}
