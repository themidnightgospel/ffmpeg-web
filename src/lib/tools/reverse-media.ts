import type { Tool } from './types';
import { baseName } from '@/lib/format';
import { h264Tail } from './videoEncode';

/**
 * Reverse Media — play a video backwards (optionally its audio too).
 * `reverse`/`areverse` buffer the whole stream, so keep clips short.
 * See specs/features/reverse-media.md.
 */
export const reverseMedia: Tool = {
  slug: 'reverse-media',
  name: 'Reverse Media',
  category: 'Resize & transform',
  status: 'live',
  accept: 'video/*',
  desc: 'Play a short video backwards. Keep clips short — the whole stream is buffered.',

  options: [
    {
      id: 'mode',
      type: 'segmented',
      label: 'Reverse',
      default: 'both',
      choices: [
        { value: 'both', label: 'Video + audio' },
        { value: 'mute', label: 'Video only (mute)' },
      ],
    },
  ],

  buildCommand: (values, input) => {
    const outputName = `${baseName(input.name)}.mp4`;

    if (values.mode === 'mute') {
      const args: string[] = [
        '-i',
        input.name,
        '-vf',
        'reverse',
        '-an',
        '-c:v',
        'libx264',
        '-crf',
        '20',
        '-preset',
        'veryfast',
        '-pix_fmt',
        'yuv420p',
        '-movflags',
        '+faststart',
        outputName,
      ];
      return { args, outputName };
    }

    const args: string[] = [
      '-i',
      input.name,
      '-vf',
      'reverse',
      '-af',
      'areverse',
      ...h264Tail(),
      outputName,
    ];
    return { args, outputName };
  },
};
