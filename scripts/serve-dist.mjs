// Minimal static server for dist/ that sets the cross-origin isolation headers
// (COOP/COEP) directly, so tests get SharedArrayBuffer without the service-worker
// reload dance. Used as the Playwright webServer. See docs/testing.md.
import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const distDir = fileURLToPath(new URL('../dist', import.meta.url));
const port = process.env.PORT ? Number(process.env.PORT) : 4321;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.mjs': 'text/javascript',
  '.css': 'text/css',
  '.wasm': 'application/wasm',
  '.json': 'application/json',
  '.xml': 'application/xml',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.txt': 'text/plain',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

const ISOLATION_HEADERS = {
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Embedder-Policy': 'require-corp',
  'Cross-Origin-Resource-Policy': 'cross-origin',
};

// The site builds with base '/ffmpeg-web/' (GitHub project page), so its HTML
// references assets under that prefix. Strip it here so dist/ is served whether
// requested at the root (test navigation) or under the base (asset URLs) —
// mirroring how GitHub Pages mounts the artifact at the project path.
const BASE = '/ffmpeg-web';
function stripBase(p) {
  if (p === BASE) return '/';
  if (p.startsWith(`${BASE}/`)) return p.slice(BASE.length);
  return p;
}

const server = http.createServer(async (req, res) => {
  try {
    const urlPath = stripBase(decodeURIComponent((req.url ?? '/').split('?')[0]));
    let filePath = join(distDir, normalize(urlPath));
    let info = await stat(filePath).catch(() => null);
    if (info?.isDirectory()) {
      filePath = join(filePath, 'index.html');
      info = await stat(filePath).catch(() => null);
    }
    if (!info) {
      res.writeHead(404, ISOLATION_HEADERS);
      res.end('Not found');
      return;
    }
    const body = await readFile(filePath);
    res.writeHead(200, {
      'Content-Type': MIME[extname(filePath)] ?? 'application/octet-stream',
      ...ISOLATION_HEADERS,
    });
    res.end(body);
  } catch (err) {
    res.writeHead(500);
    res.end(String(err));
  }
});

server.listen(port, () => console.log(`[serve-dist] http://localhost:${port}`));
