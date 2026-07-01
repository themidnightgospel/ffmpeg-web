import type { Tool } from './types';
import { baseName } from '@/lib/format';
import { h264Tail } from './videoEncode';

// Target aspect ratio → output dimensions.
const SIZES: Record<string, { w: number; h: number }> = {
  '16:9': { w: 1920, h: 1080 },
  '9:16': { w: 1080, h: 1920 },
  '1:1': { w: 1080, h: 1080 },
  '4:5': { w: 1080, h: 1350 },
};

/**
 * Aspect-Ratio Changer — reframe to a target aspect by cropping (fill) or
 * padding (fit). See specs/features/aspect-ratio-changer.md.
 */
export const aspectRatioChanger: Tool = {
  slug: 'aspect-ratio-changer',
  name: 'Aspect-Ratio Changer',
  category: 'Resize & transform',
  status: 'live',
  accept: 'video/*',
  desc: 'Reframe a video to 16:9, 9:16, 1:1, or 4:5 by cropping or padding.',

  options: [
    {
      id: 'ratio',
      type: 'segmented',
      label: 'Aspect ratio',
      default: '9:16',
      choices: [
        { value: '16:9', label: '16:9' },
        { value: '9:16', label: '9:16' },
        { value: '1:1', label: '1:1' },
        { value: '4:5', label: '4:5' },
      ],
    },
    {
      id: 'method',
      type: 'segmented',
      label: 'Method',
      default: 'pad',
      choices: [
        { value: 'pad', label: 'Pad (fit, bars)' },
        { value: 'crop', label: 'Crop (fill)' },
      ],
    },
  ],

  buildCommand: (values, input) => {
    const outputName = `${baseName(input.name)}.mp4`;
    const { w, h } = SIZES[String(values.ratio)] ?? SIZES['9:16']!;
    const vf =
      values.method === 'crop'
        ? `scale=${w}:${h}:force_original_aspect_ratio=increase,crop=${w}:${h}`
        : `scale=${w}:${h}:force_original_aspect_ratio=decrease,pad=${w}:${h}:(ow-iw)/2:(oh-ih)/2`;
    const args: string[] = ['-i', input.name, '-vf', vf, ...h264Tail(), outputName];
    return { args, outputName };
  },
};
