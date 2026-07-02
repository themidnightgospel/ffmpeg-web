import type { ConversionRunner, RunResult } from './types';

/* Stand-in for the real ffmpeg.wasm engine: animates progress over ~2s and
   returns a small text blob. Swapped for ffmpegRunner in the next milestone;
   nothing in the UI or tool configs changes. */

const DURATION_MS = 2000;

export const mockRunner: ConversionRunner = {
  probe(input) {
    return Promise.resolve(
      [
        `Input #0, mock, from '${input.name}':`,
        '  Duration: 00:00:10.00, start: 0.000000, bitrate: 1000 kb/s',
        '  Stream #0:0: Video: h264, yuv420p, 1280x720, 900 kb/s, 30 fps',
        '  Stream #0:1: Audio: aac, 44100 Hz, stereo, 128 kb/s',
      ].join('\n'),
    );
  },

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
