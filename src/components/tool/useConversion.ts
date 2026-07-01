import { useCallback, useEffect, useRef, useState } from 'react';
import type { OptionValue, OptionValues, Tool } from '@/lib/tools/types';
import { defaultValues } from '@/lib/tools/types';
import type { ConversionRunner, RunProgress } from '@/lib/runner/types';
import { extension, humanSize } from '@/lib/format';

export type ConversionPhase = 'idle' | 'running' | 'done' | 'error';

export interface ConversionOutput {
  url: string;
  name: string;
  meta: string;
}

export interface Conversion {
  file: File | null;
  values: OptionValues;
  phase: ConversionPhase;
  progress: RunProgress;
  output: ConversionOutput | null;
  error: string | null;
  canStart: boolean;
  setValue: (id: string, value: OptionValue) => void;
  selectFile: (file: File) => void;
  start: () => void;
}

/**
 * The conversion state machine for a tool: holds the file + option values, runs
 * the (pure) command through the injected runner, and tracks progress/result/error.
 * Owns the output object URL and revokes it on replace and on unmount.
 */
export function useConversion(
  tool: Tool,
  runner: ConversionRunner,
  initialValues?: Partial<OptionValues>,
): Conversion {
  const [file, setFile] = useState<File | null>(null);
  const [values, setValues] = useState<OptionValues>(() => {
    const base = defaultValues(tool.options);
    for (const [id, value] of Object.entries(initialValues ?? {})) {
      if (value !== undefined) base[id] = value;
    }
    return base;
  });
  const [phase, setPhase] = useState<ConversionPhase>('idle');
  const [progress, setProgress] = useState<RunProgress>({ ratio: 0, stage: '' });
  const [output, setOutput] = useState<ConversionOutput | null>(null);
  const [error, setError] = useState<string | null>(null);

  const outputUrl = useRef<string | null>(null);

  const releaseOutput = useCallback(() => {
    if (outputUrl.current) {
      URL.revokeObjectURL(outputUrl.current);
      outputUrl.current = null;
    }
    setOutput(null);
  }, []);

  // Revoke the object URL when the consuming component unmounts.
  useEffect(() => releaseOutput, [releaseOutput]);

  const setValue = useCallback((id: string, value: OptionValue) => {
    setValues((prev) => ({ ...prev, [id]: value }));
  }, []);

  const selectFile = useCallback(
    (next: File) => {
      setFile(next);
      setPhase('idle');
      setError(null);
      releaseOutput();
    },
    [releaseOutput],
  );

  const start = useCallback(() => {
    if (!file) return;

    releaseOutput();
    setError(null);
    setPhase('running');
    setProgress({ ratio: 0, stage: 'Starting' });

    const { args, outputName } = tool.buildCommand(values, { name: file.name });

    runner
      .run(file, args, outputName, { onProgress: setProgress })
      .then((result) => {
        const url = URL.createObjectURL(result.blob);
        outputUrl.current = url;
        setOutput({
          url,
          name: result.outputName,
          meta: `${humanSize(result.blob.size)} · ${extension(result.outputName).toUpperCase()}`,
        });
        setPhase('done');
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === 'AbortError') {
          setPhase('idle');
          return;
        }
        console.error('Conversion failed:', err);
        setError(err instanceof Error ? err.message : 'Conversion failed. Please try again.');
        setPhase('error');
      });
  }, [file, values, tool, runner, releaseOutput]);

  return {
    file,
    values,
    phase,
    progress,
    output,
    error,
    canStart: file !== null && phase !== 'running',
    setValue,
    selectFile,
    start,
  };
}
