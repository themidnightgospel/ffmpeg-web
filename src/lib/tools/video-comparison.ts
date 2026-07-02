import type { Tool } from './types';
import { baseName } from '@/lib/format';
import { h264Tail } from './videoEncode';

/**
 * Video Comparison — place two videos side by side (hstack) or stacked (vstack)
 * for a before/after. Needs a second video file.
 * See specs/features/video-comparison.md.
 */
export const videoComparison: Tool = {
  slug: 'video-comparison',
  name: 'Video Comparison',
  category: 'Advanced',
  status: 'live',
  accept: 'video/*',
  secondary: { id: 'right', label: 'Second video', accept: 'video/*', prompt: 'Drop the second clip' },
  desc: 'Place two videos side by side or stacked for a before/after.',

  options: [
    {
      id: 'layout',
      type: 'segmented',
      label: 'Layout',
      default: 'hstack',
      choices: [
        { value: 'hstack', label: 'Side by side' },
        { value: 'vstack', label: 'Stacked' },
      ],
    },
    { id: 'size', type: 'stepper', label: 'Size (px)', min: 120, max: 2160, step: 20, default: 480, hint: 'shared dimension' },
  ],

  buildCommand: (values, input) => {
    const right = input.secondaryName ?? 'right.mp4';
    const size = Number(values.size);
    const layout = values.layout === 'vstack' ? 'vstack' : 'hstack';
    const outputName = `${baseName(input.name)}.compare.mp4`;

    // hstack needs equal heights (scale to height); vstack needs equal widths.
    const scale = layout === 'hstack' ? `scale=-2:${size}` : `scale=${size}:-2`;
    const filter = `[0:v]${scale}[l];[1:v]${scale}[r];[l][r]${layout}[v]`;

    return {
      args: [
        '-i', input.name, '-i', right,
        '-filter_complex', filter,
        '-map', '[v]', '-map', '0:a?',
        ...h264Tail(20),
        outputName,
      ],
      outputName,
    };
  },
};
