/* Execution boundary. UI depends on this interface, never on ffmpeg directly,
   so the mock runner and the real ffmpeg.wasm engine are interchangeable. */

export interface RunProgress {
  /** 0..1 */
  ratio: number;
  /** Human-readable stage label, e.g. "Transcoding". */
  stage: string;
}

export interface RunResult {
  blob: Blob;
  outputName: string;
}

export interface RunOptions {
  onProgress?: (progress: RunProgress) => void;
  signal?: AbortSignal;
  /** Extra files staged into the FS (by their `.name`) before exec, e.g. a
      watermark image or replacement audio referenced in the args. */
  extraFiles?: File[];
  /** Static assets fetched from a URL and staged into the FS as `name` (e.g. a
      bundled font referenced by drawtext). */
  assets?: { url: string; name: string }[];
}

export interface ConversionRunner {
  run(
    input: File,
    args: string[],
    outputName: string,
    options?: RunOptions,
  ): Promise<RunResult>;
  /** Optional: preload/cache the engine ahead of the first run (best-effort). */
  warmUp?(): void;
}
