import type { Tool } from './types';
import { baseName } from '@/lib/format';
import { h264Tail } from './videoEncode';

// Operation → ffmpeg video filter.
const FILTERS: Record<string, string> = {
  '90cw': 'transpose=1',
  '90ccw': 'transpose=2',
  '180': 'transpose=2,transpose=2',
  hflip: 'hflip',
  vflip: 'vflip',
};

/**
 * Rotate / Flip / Mirror — reorient a video. See specs/features/rotate-flip-mirror.md.
 */
export const rotateFlipMirror: Tool = {
  slug: 'rotate-flip-mirror',
  name: 'Rotate / Flip / Mirror',
  category: 'Resize & transform',
  status: 'live',
  accept: 'video/*',
  desc: 'Rotate 90°/180°, or flip a video horizontally or vertically.',

  options: [
    {
      id: 'op',
      type: 'segmented',
      label: 'Operation',
      default: '90cw',
      choices: [
        { value: '90cw', label: 'Rotate 90° ↻' },
        { value: '90ccw', label: 'Rotate 90° ↺' },
        { value: '180', label: 'Rotate 180°' },
        { value: 'hflip', label: 'Flip horizontal' },
        { value: 'vflip', label: 'Flip vertical' },
      ],
    },
  ],

  buildCommand: (values, input) => {
    const outputName = `${baseName(input.name)}.mp4`;
    const filter = FILTERS[String(values.op)] ?? 'transpose=1';
    const args: string[] = ['-i', input.name, '-vf', filter, ...h264Tail(), outputName];
    return { args, outputName };
  },
};
