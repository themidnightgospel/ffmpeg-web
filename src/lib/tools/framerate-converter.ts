import type { Tool } from './types';
import { baseName } from '@/lib/format';
import { h264Tail } from './videoEncode';

/**
 * Framerate Converter — retime a video to a target fps, by dropping/duplicating
 * frames or motion interpolation. See specs/features/framerate-converter.md.
 */
export const framerateConverter: Tool = {
  slug: 'framerate-converter',
  name: 'Framerate Converter',
  category: 'Resize & transform',
  status: 'live',
  accept: 'video/*',
  desc: 'Change a video’s frame rate (24, 30, 60 fps and more).',

  options: [
    {
      id: 'fps',
      type: 'segmented',
      label: 'Target fps',
      default: '30',
      choices: [
        { value: '24', label: '24' },
        { value: '25', label: '25' },
        { value: '30', label: '30' },
        { value: '50', label: '50' },
        { value: '60', label: '60' },
      ],
    },
    {
      id: 'method',
      type: 'segmented',
      label: 'Method',
      advanced: true,
      default: 'drop',
      choices: [
        { value: 'drop', label: 'Drop / duplicate (fast)' },
        { value: 'interpolate', label: 'Interpolate (smooth, slow)' },
      ],
    },
  ],

  buildCommand: (values, input) => {
    const fps = String(values.fps);
    const outputName = `${baseName(input.name)}.mp4`;
    const filter = values.method === 'interpolate' ? `minterpolate=fps=${fps}` : `fps=${fps}`;
    const args: string[] = ['-i', input.name, '-vf', filter, ...h264Tail(), outputName];
    return { args, outputName };
  },
};
