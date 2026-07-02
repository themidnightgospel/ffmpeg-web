import type { Tool } from './types';
import { baseName } from '@/lib/format';

// GIF dimensions can be odd; force even for the video codecs.
const EVEN = 'scale=trunc(iw/2)*2:trunc(ih/2)*2';

/**
 * GIF → Video — convert an animated GIF to MP4/WebM (much smaller).
 * See specs/features/gif-to-video.md.
 */
export const gifToVideo: Tool = {
  slug: 'gif-to-video',
  name: 'GIF → Video',
  category: 'Format conversion',
  status: 'live',
  accept: 'image/gif',
  desc: 'Convert an animated GIF to a smaller MP4 or WebM video.',

  options: [
    {
      id: 'format',
      type: 'segmented',
      label: 'Target format',
      default: 'mp4',
      choices: [
        { value: 'mp4', label: 'MP4 (H.264)' },
        { value: 'webm', label: 'WebM (VP8)' },
      ],
    },
  ],

  buildCommand: (values, input) => {
    const format = String(values.format);
    const outputName = `${baseName(input.name)}.${format}`;

    if (format === 'webm') {
      // VP8 (libvpx) — lighter than VP9 in wasm. -cpu-used 5 for a big speedup.
      const args: string[] = [
        '-i', input.name,
        '-vf', EVEN,
        '-pix_fmt', 'yuv420p',
        '-c:v', 'libvpx', '-cpu-used', '5', '-crf', '10', '-b:v', '1M',
        outputName,
      ];
      return { args, outputName };
    }

    const args: string[] = [
      '-i', input.name,
      '-vf', EVEN,
      '-pix_fmt', 'yuv420p',
      '-c:v', 'libx264', '-crf', '23', '-preset', 'veryfast',
      '-movflags', '+faststart',
      outputName,
    ];
    return { args, outputName };
  },
};
