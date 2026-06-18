import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL(".", import.meta.url));
const port = Number(process.env.PORT || 4179);

const types = new Map([
  [".html", "text/html; charset=utf-8"],
  [".css", "text/css; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".md", "text/markdown; charset=utf-8"],
  [".sol", "text/plain; charset=utf-8"],
  [".png", "image/png"],
  [".jpg", "image/jpeg"],
  [".jpeg", "image/jpeg"],
  [".webp", "image/webp"]
]);

function safePath(urlPath) {
  const decoded = decodeURIComponent(urlPath.split("?")[0]);
  const clean = decoded === "/" ? "/index.html" : decoded;
  const target = resolve(join(root, clean));
  if (!target.startsWith(resolve(root))) return null;
  return target;
}

const server = createServer(async (request, response) => {
  const target = safePath(request.url || "/");
  if (!target) {
    response.writeHead(403);
    response.end("Forbidden");
    return;
  }

  try {
    const data = await readFile(target);
    response.writeHead(200, {
      "Content-Type": types.get(extname(target).toLowerCase()) || "application/octet-stream",
      "Cache-Control": "no-store"
    });
    response.end(data);
  } catch {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Not found");
  }
});

server.listen(port, () => {
  console.log(`Smart Contract Notes Repo running at http://localhost:${port}`);
});
