import type { Tool } from './types';
import { baseName } from '@/lib/format';
import { h264Tail } from './videoEncode';

/**
 * Deinterlacer — remove combing from interlaced video (yadif/bwdif).
 * See specs/features/deinterlacer.md.
 */
export const deinterlacer: Tool = {
  slug: 'deinterlacer',
  name: 'Deinterlacer',
  category: 'Advanced',
  status: 'live',
  accept: 'video/*',
  desc: 'Remove interlacing artifacts, producing clean progressive video.',

  options: [
    {
      id: 'method',
      type: 'segmented',
      label: 'Method',
      default: 'yadif',
      choices: [
        { value: 'yadif', label: 'yadif' },
        { value: 'bwdif', label: 'bwdif (better)' },
      ],
    },
    {
      id: 'doubleRate',
      type: 'toggle',
      label: 'Double frame rate',
      default: false,
      description: 'Output one frame per field (doubles fps and file size).',
    },
  ],

  buildCommand: (values, input) => {
    const outputName = `${baseName(input.name)}.mp4`;
    const mode = values.doubleRate === true ? '1' : '0';
    const vf = `${String(values.method)}=mode=${mode}`;
    const args: string[] = ['-i', input.name, '-vf', vf, ...h264Tail(), outputName];
    return { args, outputName };
  },
};
