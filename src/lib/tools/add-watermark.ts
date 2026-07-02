import type { Tool, OptionValues } from './types';
import { baseName } from '@/lib/format';
import { h264Tail } from './videoEncode';

// Position → overlay x:y expression, using a shared margin `m`.
function overlayXY(position: string, m: number): string {
  switch (position) {
    case 'top-left': return `${m}:${m}`;
    case 'top-right': return `W-w-${m}:${m}`;
    case 'bottom-left': return `${m}:H-h-${m}`;
    case 'center': return `(W-w)/2:(H-h)/2`;
    case 'bottom-right':
    default: return `W-w-${m}:H-h-${m}`;
  }
}

/**
 * Add Watermark — overlay a logo/image onto a video with position, scale, and
 * opacity. Needs a second (image) file. See specs/features/add-watermark.md.
 */
export const addWatermark: Tool = {
  slug: 'add-watermark',
  name: 'Add Watermark',
  category: 'Subtitles & overlays',
  status: 'live',
  accept: 'video/*',
  secondary: { id: 'logo', label: 'Watermark image', accept: 'image/*', prompt: 'Drop the logo/image' },
  desc: 'Overlay a logo or image watermark onto a video.',

  options: [
    {
      id: 'position',
      type: 'segmented',
      label: 'Position',
      default: 'bottom-right',
      choices: [
        { value: 'top-left', label: 'Top left' },
        { value: 'top-right', label: 'Top right' },
        { value: 'bottom-left', label: 'Bottom left' },
        { value: 'bottom-right', label: 'Bottom right' },
        { value: 'center', label: 'Center' },
      ],
    },
    { id: 'scale', type: 'stepper', label: 'Width (px)', min: 20, max: 2000, step: 10, default: 120 },
    { id: 'opacity', type: 'stepper', label: 'Opacity (%)', min: 5, max: 100, step: 5, default: 100 },
    { id: 'margin', type: 'stepper', label: 'Margin (px)', min: 0, max: 200, step: 2, default: 20 },
  ],

  buildCommand: (values: OptionValues, input) => {
    const logo = input.secondaryName ?? 'logo.png';
    const scale = Number(values.scale);
    const alpha = Number(values.opacity) / 100;
    const margin = Number(values.margin);
    const xy = overlayXY(String(values.position), margin);
    const outputName = `${baseName(input.name)}.watermarked.mp4`;

    const filter =
      `[1:v]scale=${scale}:-1,format=rgba,colorchannelmixer=aa=${alpha}[wm];` +
      `[0:v][wm]overlay=${xy}[v]`;

    return {
      args: [
        '-i', input.name, '-i', logo,
        '-filter_complex', filter,
        '-map', '[v]', '-map', '0:a?',
        ...h264Tail(20),
        outputName,
      ],
      outputName,
    };
  },
};
