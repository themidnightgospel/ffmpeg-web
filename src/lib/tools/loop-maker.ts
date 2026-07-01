import type { Tool } from './types';
import { baseName, extension } from '@/lib/format';

/**
 * Loop Maker — repeat a clip a number of times (lossless stream copy).
 * See specs/features/loop-maker.md.
 */
export const loopMaker: Tool = {
  slug: 'loop-maker',
  name: 'Loop Maker',
  category: 'Trimming & cutting',
  status: 'live',
  accept: 'audio/*,video/*',
  desc: 'Repeat a clip several times into one longer file, without re-encoding.',

  options: [
    {
      id: 'plays',
      type: 'stepper',
      label: 'Total plays',
      min: 2,
      max: 20,
      step: 1,
      default: 2,
      hint: 'how many times the clip plays in total',
    },
  ],

  buildCommand: (values, input) => {
    const ext = extension(input.name) || 'mp4';
    const outputName = `${baseName(input.name)}.looped.${ext}`;
    // -stream_loop is the number of *extra* loops, so total plays = value + 1.
    const extraLoops = Math.max(0, Number(values.plays) - 1);
    const args: string[] = [
      '-stream_loop',
      String(extraLoops),
      '-i',
      input.name,
      '-c',
      'copy',
      outputName,
    ];
    return { args, outputName };
  },
};
