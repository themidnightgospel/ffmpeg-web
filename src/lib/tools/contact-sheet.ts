import type { Tool } from './types';
import { baseName } from '@/lib/format';

/**
 * Contact Sheet — a grid of thumbnails sampled across a video (tile filter).
 * See specs/features/contact-sheet.md.
 */
export const contactSheet: Tool = {
  slug: 'contact-sheet',
  name: 'Contact Sheet',
  category: 'Extraction & capture',
  status: 'live',
  accept: 'video/*',
  desc: 'Build a single image grid of thumbnails sampled across a video.',

  options: [
    {
      id: 'grid',
      type: 'segmented',
      label: 'Grid',
      default: '4x4',
      choices: [
        { value: '3x3', label: '3×3' },
        { value: '4x4', label: '4×4' },
        { value: '4x5', label: '4×5' },
        { value: '5x6', label: '5×6' },
      ],
    },
    {
      id: 'interval',
      type: 'stepper',
      label: 'Seconds between frames',
      min: 1,
      max: 120,
      step: 1,
      default: 10,
    },
    {
      id: 'thumbWidth',
      type: 'segmented',
      label: 'Thumb width',
      default: '240',
      choices: [
        { value: '160', label: '160' },
        { value: '240', label: '240' },
        { value: '320', label: '320' },
      ],
    },
  ],

  buildCommand: (values, input) => {
    const outputName = `${baseName(input.name)}.contact.png`;
    const vf =
      `fps=1/${String(values.interval)},scale=${String(values.thumbWidth)}:-1,tile=${String(values.grid)}`;
    return {
      args: ['-i', input.name, '-frames:v', '1', '-vf', vf, outputName],
      outputName,
    };
  },
};
