import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const clientRoot = path.join(root, "dist", "client");
const { default: worker } = await import(pathToFileURL(path.join(root, "dist", "server", "index.js")));
const port = Number(process.env.KUBO_QA_PORT ?? 3100);
const mime = { ".css": "text/css", ".js": "text/javascript", ".json": "application/json", ".mp4": "video/mp4", ".png": "image/png", ".svg": "image/svg+xml", ".webp": "image/webp", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".ico": "image/x-icon", ".woff2": "font/woff2" };

const assets = {
  async fetch(request) {
    const url = new URL(request.url);
    const relative = decodeURIComponent(url.pathname).replace(/^\/+/, "") || "index.html";
    const target = path.resolve(clientRoot, relative);
    if (!target.startsWith(clientRoot)) return new Response("Not found", { status: 404 });
    try {
      if (!(await stat(target)).isFile()) return new Response("Not found", { status: 404 });
      return new Response(await readFile(target), { headers: { "content-type": mime[path.extname(target).toLowerCase()] ?? "application/octet-stream" } });
    } catch {
      return new Response("Not found", { status: 404 });
    }
  },
};

const server = createServer(async (incoming, outgoing) => {
  try {
    const origin = `http://${incoming.headers.host ?? `127.0.0.1:${port}`}`;
    const body = incoming.method === "GET" || incoming.method === "HEAD" ? undefined : incoming;
    const request = new Request(new URL(incoming.url ?? "/", origin), { method: incoming.method, headers: incoming.headers, body, duplex: body ? "half" : undefined });
    const pathname = new URL(request.url).pathname;
    const isStatic = pathname.startsWith("/assets/") || pathname.startsWith("/images/") || pathname.startsWith("/videos/") || ["/favicon.svg", "/og.png", "/_headers"].includes(pathname);
    const response = isStatic ? await assets.fetch(request) : await worker.fetch(request, { ASSETS: assets }, { waitUntil() {}, passThroughOnException() {} });
    outgoing.statusCode = response.status;
    response.headers.forEach((value, key) => outgoing.setHeader(key, value));
    outgoing.end(Buffer.from(await response.arrayBuffer()));
  } catch (error) {
    outgoing.statusCode = 500;
    outgoing.end(error instanceof Error ? error.stack : String(error));
  }
});

server.listen(port, "127.0.0.1", () => console.log(`Kubo QA server ready at http://127.0.0.1:${port}`));
