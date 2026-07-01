import type { Tool } from './types';
import { baseName } from '@/lib/format';

/**
 * Video Resizer — scale to a target height, preserving aspect ratio (width is
 * kept even for H.264). See specs/features/video-resizer.md.
 */
export const videoResizer: Tool = {
  slug: 'video-resizer',
  name: 'Video Resizer',
  category: 'Resize & transform',
  status: 'live',
  accept: 'video/*',
  desc: 'Scale a video to a target resolution, keeping its aspect ratio.',

  options: [
    {
      id: 'height',
      type: 'segmented',
      label: 'Resolution',
      default: '720',
      choices: [
        { value: '2160', label: '2160p' },
        { value: '1440', label: '1440p' },
        { value: '1080', label: '1080p' },
        { value: '720', label: '720p' },
        { value: '480', label: '480p' },
        { value: '360', label: '360p' },
      ],
    },
    {
      id: 'scaler',
      type: 'segmented',
      label: 'Scaling quality',
      advanced: true,
      default: 'lanczos',
      choices: [
        { value: 'lanczos', label: 'Lanczos (best)' },
        { value: 'bicubic', label: 'Bicubic' },
        { value: 'bilinear', label: 'Bilinear (fast)' },
      ],
    },
  ],

  buildCommand: (values, input) => {
    const outputName = `${baseName(input.name)}.mp4`;
    const args: string[] = [
      '-i',
      input.name,
      '-vf',
      `scale=-2:${String(values.height)}:flags=${String(values.scaler)}`,
      '-c:v',
      'libx264',
      '-crf',
      '20',
      '-preset',
      'veryfast',
      '-c:a',
      'aac',
      '-b:a',
      '128k',
      '-movflags',
      '+faststart',
      outputName,
    ];
    return { args, outputName };
  },
};
