import type { Tool } from './types';
import { baseName } from '@/lib/format';
import { h264Tail } from './videoEncode';

/**
 * Color Adjuster — brightness / contrast / saturation / gamma / hue via the
 * eq + hue filters. See specs/features/color-adjuster.md.
 */
export const colorAdjuster: Tool = {
  slug: 'color-adjuster',
  name: 'Color Adjuster',
  category: 'Advanced',
  status: 'live',
  accept: 'video/*',
  desc: 'Tune brightness, contrast, saturation, gamma, and hue.',

  options: [
    { id: 'brightness', type: 'stepper', label: 'Brightness', min: -1, max: 1, step: 0.05, default: 0, hint: '0 = unchanged' },
    { id: 'contrast', type: 'stepper', label: 'Contrast', min: 0, max: 2, step: 0.05, default: 1, hint: '1 = unchanged' },
    { id: 'saturation', type: 'stepper', label: 'Saturation', min: 0, max: 3, step: 0.05, default: 1, hint: '0 = grayscale' },
    { id: 'gamma', type: 'stepper', label: 'Gamma', advanced: true, min: 0.1, max: 3, step: 0.05, default: 1 },
    { id: 'hue', type: 'stepper', label: 'Hue (°)', advanced: true, min: -180, max: 180, step: 5, default: 0 },
  ],

  buildCommand: (values, input) => {
    const outputName = `${baseName(input.name)}.mp4`;
    const eq =
      `eq=brightness=${String(values.brightness)}` +
      `:contrast=${String(values.contrast)}` +
      `:saturation=${String(values.saturation)}` +
      `:gamma=${String(values.gamma)}`;
    const vf = `${eq},hue=h=${String(values.hue)}`;
    const args: string[] = ['-i', input.name, '-vf', vf, ...h264Tail(), outputName];
    return { args, outputName };
  },
};
