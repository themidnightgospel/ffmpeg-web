import type { ConversionRunner, RunResult } from './types';

/* Real ffmpeg.wasm engine behind the ConversionRunner interface.

   - Lazy-imports @ffmpeg/ffmpeg so nothing browser-only runs during SSR/build.
   - Feature-detects `crossOriginIsolated`: multithreaded core when isolated,
     single-thread otherwise.
   - Prefetches + caches the core files (Cache Storage, versioned) so they
     download once and persist across visits — bump CORE_VERSION to invalidate.

   NOTE: runtime behavior requires a browser and cannot be verified headlessly. */

// Bump when @ffmpeg/core is updated so the persistent cache invalidates.
const CORE_VERSION = '0.12.6';
const CACHE_NAME = `ffmpeg-core-${CORE_VERSION}`;

// Single-threaded core only. The multithreaded core (SharedArrayBuffer + pthreads)
// is unreliable in ffmpeg.wasm across environments — exec() hangs or crashes the
// tab — so we use the dependable single-thread build. See docs/testing.md.
const MULTITHREAD = false;

// Self-hosted core (copied into public/ffmpeg by scripts/copy-ffmpeg-core.mjs).
const coreBase = (multithread: boolean): string =>
  `${import.meta.env.BASE_URL}ffmpeg/core${multithread ? '-mt' : ''}`;

const coreFiles = (multithread: boolean): string[] => {
  const base = coreBase(multithread);
  const files = [`${base}/ffmpeg-core.js`, `${base}/ffmpeg-core.wasm`];
  if (multithread) files.push(`${base}/ffmpeg-core.worker.js`);
  return files;
};

const cacheAvailable = (): boolean => typeof caches !== 'undefined';

// Remove core caches from older versions.
async function cleanupOldCaches(): Promise<void> {
  if (!cacheAvailable()) return;
  try {
    const keys = await caches.keys();
    await Promise.all(
      keys
        .filter((k) => k.startsWith('ffmpeg-core-') && k !== CACHE_NAME)
        .map((k) => caches.delete(k)),
    );
  } catch {
    /* best-effort */
  }
}

let prefetchStarted = false;

/** Download + persistently cache the core files (called on tool-page load).
    Best-effort and idempotent; the actual wasm instantiation still happens on
    first conversion, reading straight from this cache. */
export async function prefetchCore(): Promise<void> {
  if (prefetchStarted || !cacheAvailable()) return;
  prefetchStarted = true;
  try {
    void cleanupOldCaches();
    const cache = await caches.open(CACHE_NAME);
    await Promise.all(
      coreFiles(MULTITHREAD).map(async (url) => {
        if (await cache.match(url)) return;
        const res = await fetch(url);
        if (res.ok) await cache.put(url, res);
      }),
    );
  } catch {
    /* best-effort — falls back to fetching on demand */
  }
}

// Resolve a core asset to a blob URL, preferring the persistent cache.
async function assetBlobURL(url: string, mime: string): Promise<string> {
  if (cacheAvailable()) {
    try {
      const cache = await caches.open(CACHE_NAME);
      let res = await cache.match(url);
      if (!res) {
        const fetched = await fetch(url);
        if (fetched.ok) await cache.put(url, fetched.clone());
        res = fetched;
      }
      return URL.createObjectURL(new Blob([await res.arrayBuffer()], { type: mime }));
    } catch {
      /* fall through to plain fetch */
    }
  }
  const { toBlobURL } = await import('@ffmpeg/util');
  return toBlobURL(url, mime);
}

// Minimal structural type of the FFmpeg instance we use.
interface FFmpegLike {
  loaded: boolean;
  load(opts: { coreURL: string; wasmURL: string; workerURL?: string }): Promise<boolean>;
  on(event: 'progress', cb: (e: { progress: number }) => void): void;
  writeFile(name: string, data: Uint8Array): Promise<boolean>;
  readFile(name: string): Promise<Uint8Array | string>;
  exec(args: string[]): Promise<number>;
  deleteFile(name: string): Promise<boolean>;
  listDir(path: string): Promise<{ name: string; isDir: boolean }[]>;
}

let instance: FFmpegLike | null = null;
let loadPromise: Promise<FFmpegLike> | null = null;
// Routed to the current run's callback; the listener is registered once.
let currentProgress: ((ratio: number) => void) | null = null;

async function loadFFmpeg(): Promise<FFmpegLike> {
  const { FFmpeg } = await import('@ffmpeg/ffmpeg');
  const ffmpeg = new FFmpeg() as unknown as FFmpegLike;

  ffmpeg.on('progress', ({ progress }) => {
    currentProgress?.(Math.min(Math.max(progress, 0), 1));
  });

  const files = coreFiles(MULTITHREAD);
  const [coreURL, wasmURL, workerURL] = await Promise.all([
    assetBlobURL(files[0]!, 'text/javascript'),
    assetBlobURL(files[1]!, 'application/wasm'),
    MULTITHREAD ? assetBlobURL(files[2]!, 'text/javascript') : Promise.resolve(''),
  ]);

  await ffmpeg.load({ coreURL, wasmURL, ...(MULTITHREAD ? { workerURL } : {}) });
  return ffmpeg;
}

async function getFFmpeg(): Promise<FFmpegLike> {
  if (instance?.loaded) return instance;
  loadPromise ??= loadFFmpeg();
  instance = await loadPromise;
  return instance;
}

export const ffmpegRunner: ConversionRunner = {
  // Called on tool-page load to download + cache the core ahead of time.
  warmUp() {
    void prefetchCore();
  },

  async run(input, args, outputName, options): Promise<RunResult> {
    const { onProgress, signal, extraFiles, assets, collectPrefix } = options ?? {};
    if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');

    onProgress?.({ ratio: 0, stage: 'Loading engine…' });
    const ffmpeg = await getFFmpeg();

    currentProgress = onProgress ? (ratio) => onProgress({ ratio, stage: 'Transcoding' }) : null;

    const { fetchFile } = await import('@ffmpeg/util');
    await ffmpeg.writeFile(input.name, await fetchFile(input));
    for (const extra of extraFiles ?? []) {
      await ffmpeg.writeFile(extra.name, await fetchFile(extra));
    }
    // Static assets (e.g. fonts) fetched from the site and staged into the FS.
    for (const asset of assets ?? []) {
      const res = await fetch(`${import.meta.env.BASE_URL}${asset.url}`);
      if (!res.ok) throw new Error(`Failed to load asset ${asset.name}`);
      await ffmpeg.writeFile(asset.name, new Uint8Array(await res.arrayBuffer()));
    }

    const code = await ffmpeg.exec(args);
    if (code !== 0) throw new Error(`ffmpeg exited with code ${code}`);

    const readBytes = async (name: string): Promise<Uint8Array<ArrayBuffer>> => {
      const data = await ffmpeg.readFile(name);
      // Copy into a fresh ArrayBuffer-backed view (the MT core may return a
      // SharedArrayBuffer-backed Uint8Array, which isn't a valid BlobPart).
      return typeof data === 'string' ? new TextEncoder().encode(data) : new Uint8Array(data);
    };

    let blob: Blob;
    const produced: string[] = [];

    if (collectPrefix) {
      // Multi-output: gather every file matching the prefix and zip them.
      const entries = await ffmpeg.listDir('/');
      const outputs = entries
        .filter((e) => !e.isDir && e.name.startsWith(collectPrefix))
        .map((e) => e.name)
        .sort();
      if (outputs.length === 0) throw new Error('No output files were produced.');

      const files: Record<string, Uint8Array> = {};
      for (const name of outputs) {
        files[name] = await readBytes(name);
        produced.push(name);
      }
      const { zipSync } = await import('fflate');
      const zipped = zipSync(files, { level: 0 });
      // Copy into a fresh ArrayBuffer-backed view so it's a valid BlobPart.
      blob = new Blob([new Uint8Array(zipped)], { type: 'application/zip' });
    } else {
      blob = new Blob([await readBytes(outputName)], { type: 'application/octet-stream' });
      produced.push(outputName);
    }

    await ffmpeg.deleteFile(input.name).catch(() => undefined);
    for (const extra of extraFiles ?? []) {
      await ffmpeg.deleteFile(extra.name).catch(() => undefined);
    }
    for (const name of produced) {
      await ffmpeg.deleteFile(name).catch(() => undefined);
    }

    return { blob, outputName };
  },
};
