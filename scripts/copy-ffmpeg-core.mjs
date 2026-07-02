// Copies the ffmpeg.wasm core (single + multithread) out of node_modules into
// public/ffmpeg so it is served same-origin (required under COEP) and there is
// no CDN dependency. Runs automatically before `dev` and `build`.
import { cp, mkdir, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

// Single-threaded core only (the multithreaded core is unreliable — see
// src/lib/runner/ffmpegRunner.ts).
const targets = [['node_modules/@ffmpeg/core/dist/esm', 'public/ffmpeg/core']];

for (const [src, dest] of targets) {
  const from = resolve(root, src);
  const to = resolve(root, dest);
  if (!existsSync(from)) {
    console.warn(`[copy-ffmpeg-core] missing ${src} — run npm install. Skipping.`);
    continue;
  }
  await rm(to, { recursive: true, force: true });
  await mkdir(to, { recursive: true });
  await cp(from, to, { recursive: true });
  console.log(`[copy-ffmpeg-core] ${src} -> ${dest}`);
}
