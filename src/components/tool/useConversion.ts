import { useCallback, useEffect, useRef, useState } from 'react';
import type { OptionValue, OptionValues, Tool } from '@/lib/tools/types';
import { defaultValues } from '@/lib/tools/types';
import type { ConversionRunner, RunProgress } from '@/lib/runner/types';
import { extension, humanSize } from '@/lib/format';
import { getMediaDuration } from '@/lib/media';

export type ConversionPhase = 'idle' | 'running' | 'done' | 'error';

export interface ConversionOutput {
  url: string;
  name: string;
  meta: string;
}

export interface Conversion {
  file: File | null;
  secondaryFile: File | null;
  multiFiles: File[];
  values: OptionValues;
  phase: ConversionPhase;
  progress: RunProgress;
  output: ConversionOutput | null;
  error: string | null;
  canStart: boolean;
  setValue: (id: string, value: OptionValue) => void;
  selectFile: (file: File) => void;
  selectSecondaryFile: (file: File) => void;
  selectMultiFiles: (files: File[]) => void;
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
  const [secondaryFile, setSecondaryFile] = useState<File | null>(null);
  const [multiFiles, setMultiFiles] = useState<File[]>([]);
  const durationRef = useRef<number>(0);
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
      // Read duration in the background so size-targeting tools can use it.
      durationRef.current = 0;
      void getMediaDuration(next).then((d) => {
        durationRef.current = d;
      });
    },
    [releaseOutput],
  );

  const selectSecondaryFile = useCallback(
    (next: File) => {
      setSecondaryFile(next);
      setPhase('idle');
      setError(null);
      releaseOutput();
    },
    [releaseOutput],
  );

  const selectMultiFiles = useCallback(
    (next: File[]) => {
      setMultiFiles(next);
      setPhase('idle');
      setError(null);
      releaseOutput();
    },
    [releaseOutput],
  );

  const needsSecondary = tool.secondary != null;
  const isMulti = tool.multi != null;
  const minFiles = tool.multi?.min ?? 2;

  const start = useCallback(() => {
    // Multi-file tools run over the collected list; others use the single file.
    const primary = isMulti ? multiFiles[0] : file;
    if (!primary) return;
    if (isMulti && multiFiles.length < minFiles) return;
    if (needsSecondary && !secondaryFile) return;

    releaseOutput();
    setError(null);
    setPhase('running');
    setProgress({ ratio: 0, stage: 'Starting' });

    const { args, outputName, collectPrefix } = tool.buildCommand(values, {
      name: primary.name,
      secondaryName: secondaryFile?.name,
      names: isMulti ? multiFiles.map((f) => f.name) : undefined,
      durationSec: durationRef.current,
    });

    const extras = isMulti ? multiFiles.slice(1) : secondaryFile ? [secondaryFile] : [];

    runner
      .run(primary, args, outputName, {
        onProgress: setProgress,
        ...(extras.length > 0 ? { extraFiles: extras } : {}),
        ...(tool.assets ? { assets: tool.assets } : {}),
        ...(collectPrefix ? { collectPrefix } : {}),
      })
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
  }, [file, secondaryFile, multiFiles, isMulti, minFiles, needsSecondary, values, tool, runner, releaseOutput]);

  const hasInput = isMulti ? multiFiles.length >= minFiles : file !== null;

  return {
    file,
    secondaryFile,
    multiFiles,
    values,
    phase,
    progress,
    output,
    error,
    canStart: hasInput && (!needsSecondary || secondaryFile !== null) && phase !== 'running',
    setValue,
    selectFile,
    selectSecondaryFile,
    selectMultiFiles,
    start,
  };
}
