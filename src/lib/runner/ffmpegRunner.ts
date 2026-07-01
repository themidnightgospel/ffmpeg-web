import type { ConversionRunner, RunResult } from './types';

/* Real ffmpeg.wasm engine behind the ConversionRunner interface.

   - Lazy-imports @ffmpeg/ffmpeg so nothing browser-only runs during SSR/build.
   - Feature-detects `crossOriginIsolated`: loads the multithreaded core when the
     page is cross-origin isolated (via coi-serviceworker), else the single-thread
     core. See docs/tech-stack.md.

   NOTE: runtime behavior requires a browser and cannot be verified headlessly —
   smoke-test in the browser after build. */

const isolated = (): boolean =>
  typeof crossOriginIsolated !== 'undefined' && crossOriginIsolated === true;

// Core files are self-hosted (copied into public/ffmpeg by scripts/copy-ffmpeg-core.mjs)
// so they load same-origin under COEP and don't depend on a CDN. See docs/testing.md.
const coreBase = (multithread: boolean): string =>
  `${import.meta.env.BASE_URL}ffmpeg/core${multithread ? '-mt' : ''}`;

// Minimal structural type of the FFmpeg instance we use (avoids importing types at module top).
interface FFmpegLike {
  loaded: boolean;
  load(opts: { coreURL: string; wasmURL: string; workerURL?: string }): Promise<boolean>;
  on(event: 'progress', cb: (e: { progress: number }) => void): void;
  writeFile(name: string, data: Uint8Array): Promise<boolean>;
  readFile(name: string): Promise<Uint8Array | string>;
  exec(args: string[]): Promise<number>;
  deleteFile(name: string): Promise<boolean>;
}

let instance: FFmpegLike | null = null;

async function getFFmpeg(): Promise<FFmpegLike> {
  if (instance?.loaded) return instance;

  const [{ FFmpeg }, { toBlobURL }] = await Promise.all([
    import('@ffmpeg/ffmpeg'),
    import('@ffmpeg/util'),
  ]);

  const ffmpeg = new FFmpeg() as unknown as FFmpegLike;
  const multithread = isolated();
  const base = coreBase(multithread);

  await ffmpeg.load({
    coreURL: await toBlobURL(`${base}/ffmpeg-core.js`, 'text/javascript'),
    wasmURL: await toBlobURL(`${base}/ffmpeg-core.wasm`, 'application/wasm'),
    ...(multithread
      ? { workerURL: await toBlobURL(`${base}/ffmpeg-core.worker.js`, 'text/javascript') }
      : {}),
  });

  instance = ffmpeg;
  return ffmpeg;
}

export const ffmpegRunner: ConversionRunner = {
  async run(input, args, outputName, options): Promise<RunResult> {
    const { onProgress, signal } = options ?? {};
    if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');

    onProgress?.({ ratio: 0, stage: 'Loading ffmpeg' });
    const ffmpeg = await getFFmpeg();

    if (onProgress) {
      ffmpeg.on('progress', ({ progress }) => {
        onProgress({ ratio: Math.min(Math.max(progress, 0), 1), stage: 'Transcoding' });
      });
    }

    const { fetchFile } = await import('@ffmpeg/util');
    await ffmpeg.writeFile(input.name, await fetchFile(input));

    const code = await ffmpeg.exec(args);
    if (code !== 0) throw new Error(`ffmpeg exited with code ${code}`);

    const data = await ffmpeg.readFile(outputName);
    // Copy into a fresh ArrayBuffer-backed view (the MT core may return a
    // SharedArrayBuffer-backed Uint8Array, which isn't a valid BlobPart).
    const bytes = typeof data === 'string' ? new TextEncoder().encode(data) : new Uint8Array(data);
    const blob = new Blob([bytes], { type: 'application/octet-stream' });

    // Tidy the in-memory FS so repeated runs don't accumulate files.
    await ffmpeg.deleteFile(input.name).catch(() => undefined);
    await ffmpeg.deleteFile(outputName).catch(() => undefined);

    return { blob, outputName };
  },
};
