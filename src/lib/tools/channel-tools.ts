import type { Tool } from './types';
import { baseName } from '@/lib/format';
import { audioEncoder, LOSSLESS_AUDIO } from './audioEncoders';

// Operation → the ffmpeg args that transform the channels.
const OPS: Record<string, string[]> = {
  mono: ['-ac', '1'],
  stereo: ['-ac', '2'],
  swap: ['-af', 'pan=stereo|c0=c1|c1=c0'],
  left: ['-af', 'pan=stereo|c0=c0|c1=c0'],
  right: ['-af', 'pan=stereo|c0=c1|c1=c1'],
};

/**
 * Channel Tools — mono/stereo conversion, channel swap, and isolation.
 * See specs/features/channel-tools.md.
 */
export const channelTools: Tool = {
  slug: 'channel-tools',
  name: 'Channel Tools',
  category: 'Audio tools',
  status: 'live',
  accept: 'audio/*',
  desc: 'Downmix to mono, upmix to stereo, swap L/R, or isolate a channel.',

  options: [
    {
      id: 'op',
      type: 'segmented',
      label: 'Operation',
      default: 'mono',
      choices: [
        { value: 'mono', label: 'Stereo → mono' },
        { value: 'stereo', label: 'Mono → stereo' },
        { value: 'swap', label: 'Swap L / R' },
        { value: 'left', label: 'Left → both' },
        { value: 'right', label: 'Right → both' },
      ],
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
    const outputName = `${baseName(input.name)}.${format}`;
    const op = OPS[String(values.op)] ?? OPS.mono!;

    const args: string[] = ['-i', input.name, '-vn', ...op, '-c:a', audioEncoder(format)];
    if (!LOSSLESS_AUDIO.has(format)) args.push('-b:a', '192k');
    args.push(outputName);
    return { args, outputName };
  },
};
