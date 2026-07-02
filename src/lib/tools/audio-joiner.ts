import type { Tool } from './types';
import { baseName } from '@/lib/format';
import { audioEncoder } from './audioEncoders';

const OUTPUTS: Record<string, string> = {
  mp3: 'mp3',
  m4a: 'm4a',
  wav: 'wav',
};

/**
 * Audio Joiner — concatenate several audio files into one. Each track is
 * resampled to a common format so the concat filter can join differing sources.
 * See specs/features/audio-joiner.md.
 */
export const audioJoiner: Tool = {
  slug: 'audio-joiner',
  name: 'Audio Joiner',
  category: 'Audio tools',
  status: 'live',
  multi: { label: 'Tracks to join', accept: 'audio/*', prompt: 'Drop 2+ audio files (in order)', min: 2 },
  desc: 'Join several audio files into one continuous track.',

  options: [
    {
      id: 'format',
      type: 'segmented',
      label: 'Output format',
      default: 'mp3',
      choices: [
        { value: 'mp3', label: 'MP3' },
        { value: 'm4a', label: 'M4A' },
        { value: 'wav', label: 'WAV' },
      ],
    },
  ],

  buildCommand: (values, input) => {
    const names = input.names ?? [input.name];
    const n = names.length;
    const ext = OUTPUTS[String(values.format)] ?? 'mp3';
    const outputName = `${baseName(names[0]!)}.joined.${ext}`;

    const norm = names
      .map((_, i) => `[${i}:a]aresample=44100,aformat=sample_fmts=fltp:channel_layouts=stereo[a${i}]`)
      .join(';');
    const chain = names.map((_, i) => `[a${i}]`).join('');
    const fc = `${norm};${chain}concat=n=${n}:v=0:a=1[a]`;

    const args = [
      ...names.flatMap((name) => ['-i', name]),
      '-filter_complex', fc,
      '-map', '[a]',
      '-c:a', audioEncoder(ext),
      outputName,
    ];
    return { args, outputName };
  },
};
