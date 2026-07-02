import type { Tool } from './types';
import { baseName } from '@/lib/format';

/**
 * GIF Optimizer — shrink an animated GIF via lower fps, smaller width, and a
 * reduced colour palette. Uses a single-command palette (split → palettegen →
 * paletteuse) for good quality. See specs/features/gif-optimizer.md.
 */
export const gifOptimizer: Tool = {
  slug: 'gif-optimizer',
  name: 'GIF Optimizer',
  category: 'Compression',
  status: 'live',
  accept: 'image/gif',
  desc: 'Shrink a GIF with lower framerate, width, and colour count.',

  options: [
    {
      id: 'fps',
      type: 'segmented',
      label: 'Frame rate',
      default: '12',
      choices: [
        { value: '8', label: '8' },
        { value: '10', label: '10' },
        { value: '12', label: '12' },
        { value: '15', label: '15' },
      ],
    },
    {
      id: 'width',
      type: 'segmented',
      label: 'Width',
      default: '480',
      choices: [
        { value: '240', label: '240' },
        { value: '320', label: '320' },
        { value: '480', label: '480' },
        { value: '640', label: '640' },
      ],
    },
    {
      id: 'colors',
      type: 'segmented',
      label: 'Colours',
      default: '128',
      choices: [
        { value: '64', label: '64' },
        { value: '128', label: '128' },
        { value: '256', label: '256' },
      ],
    },
  ],

  buildCommand: (values, input) => {
    const outputName = `${baseName(input.name)}.min.gif`;
    const filter =
      `fps=${String(values.fps)},scale=${String(values.width)}:-1:flags=lanczos,` +
      `split[s0][s1];[s0]palettegen=max_colors=${String(values.colors)}[p];[s1][p]paletteuse`;
    return { args: ['-i', input.name, '-filter_complex', filter, outputName], outputName };
  },
};
