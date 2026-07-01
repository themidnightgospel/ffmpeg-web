import type { ConversionRunner, RunResult } from './types';

/* Stand-in for the real ffmpeg.wasm engine: animates progress over ~2s and
   returns a small text blob. Swapped for ffmpegRunner in the next milestone;
   nothing in the UI or tool configs changes. */

const DURATION_MS = 2000;

export const mockRunner: ConversionRunner = {
  run(input, args, outputName, options) {
    const { onProgress, signal } = options ?? {};

    return new Promise<RunResult>((resolve, reject) => {
      if (signal?.aborted) {
        reject(new DOMException('Aborted', 'AbortError'));
        return;
      }

      const start = performance.now();
      let raf = 0;

      const onAbort = () => {
        cancelAnimationFrame(raf);
        reject(new DOMException('Aborted', 'AbortError'));
      };
      signal?.addEventListener('abort', onAbort, { once: true });

      const tick = (now: number) => {
        const t = Math.min((now - start) / DURATION_MS, 1);
        const eased = 1 - Math.pow(1 - t, 2); // ease-out
        onProgress?.({ ratio: eased, stage: t < 1 ? 'Transcoding' : 'Finalizing' });

        if (t < 1) {
          raf = requestAnimationFrame(tick);
          return;
        }

        signal?.removeEventListener('abort', onAbort);
        const text = [
          `Khinkali Tool Chain — mock output for ${outputName}`,
          `source: ${input.name}`,
          `ffmpeg ${args.join(' ')}`,
          'This is a development stand-in; no real conversion was performed.',
        ].join('\n');
        const blob = new Blob([text], { type: 'text/plain' });
        resolve({ blob, outputName });
      };

      raf = requestAnimationFrame(tick);
    });
  },
};
