import type { Tool } from './types';
import { baseName } from '@/lib/format';
import { audioEncoder, LOSSLESS_AUDIO } from './audioEncoders';

/**
 * Silence Remover — strip silent stretches from audio via the silenceremove
 * filter. See specs/features/silence-remover.md.
 */
export const silenceRemover: Tool = {
  slug: 'silence-remover',
  name: 'Silence Remover',
  category: 'Trimming & cutting',
  status: 'live',
  accept: 'audio/*',
  desc: 'Automatically remove silent sections from audio.',

  options: [
    {
      id: 'threshold',
      type: 'segmented',
      label: 'Silence threshold',
      default: '-40',
      choices: [
        { value: '-30', label: '−30 dB (strict)' },
        { value: '-40', label: '−40 dB' },
        { value: '-50', label: '−50 dB (loose)' },
      ],
    },
    {
      id: 'minDuration',
      type: 'stepper',
      label: 'Min silence (s)',
      min: 0.5,
      max: 5,
      step: 0.5,
      default: 1,
      hint: 'only cut silences longer than this',
    },
    {
      id: 'format',
      type: 'segmented',
      label: 'Output format',
      default: 'mp3',
      choices: [
        { value: 'mp3', label: 'MP3' },
        { value: 'wav', label: 'WAV' },
        { value: 'flac', label: 'FLAC' },
        { value: 'm4a', label: 'M4A' },
      ],
    },
  ],

  buildCommand: (values, input) => {
    const format = String(values.format);
    const outputName = `${baseName(input.name)}.trimmed.${format}`;
    const filter =
      `silenceremove=stop_periods=-1:stop_duration=${String(values.minDuration)}` +
      `:stop_threshold=${String(values.threshold)}dB`;
    const args: string[] = ['-i', input.name, '-vn', '-af', filter, '-c:a', audioEncoder(format)];
    if (!LOSSLESS_AUDIO.has(format)) args.push('-b:a', '192k');
    args.push(outputName);
    return { args, outputName };
  },
};
