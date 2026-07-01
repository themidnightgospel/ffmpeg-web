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
