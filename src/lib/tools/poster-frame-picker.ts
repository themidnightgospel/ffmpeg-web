import type { Tool } from './types';
import { baseName } from '@/lib/format';

/**
 * Poster Frame Picker — pick a cover frame at a timestamp, exported as a
 * high-quality PNG. See specs/features/poster-frame-picker.md.
 */
export const posterFramePicker: Tool = {
  slug: 'poster-frame-picker',
  name: 'Poster Frame Picker',
  category: 'Extraction & capture',
  status: 'live',
  accept: 'video/*',
  desc: 'Export a lossless cover frame from a video at a chosen second.',

  options: [
    {
      id: 'time',
      type: 'stepper',
      label: 'Timestamp (seconds)',
      min: 0,
      max: 7200,
      step: 1,
      default: 1,
    },
  ],

  buildCommand: (values, input) => {
    const outputName = `${baseName(input.name)}.poster.png`;
    return {
      args: ['-ss', String(values.time), '-i', input.name, '-frames:v', '1', outputName],
      outputName,
    };
  },
};
