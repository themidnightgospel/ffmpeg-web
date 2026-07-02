import type { Tool } from './types';
import { baseName } from '@/lib/format';

const CONCAT = '[0:v]reverse[r];[0:v][r]concat=n=2:v=1:a=0';

/**
 * Boomerang Maker — play a short clip forward then reversed. See
 * specs/features/boomerang-maker.md. Keep clips short (reverse buffers frames).
 */
export const boomerangMaker: Tool = {
  slug: 'boomerang-maker',
  name: 'Boomerang Maker',
  category: 'GIF & meme',
  status: 'live',
  accept: 'video/*',
  desc: 'Turn a short clip into a forward-then-reverse boomerang (muted).',

  options: [
    {
      id: 'format',
      type: 'segmented',
      label: 'Output',
      default: 'mp4',
      choices: [
        { value: 'mp4', label: 'MP4' },
        { value: 'gif', label: 'GIF' },
      ],
    },
  ],

  buildCommand: (values, input) => {
    const format = String(values.format);
    const outputName = `${baseName(input.name)}.boomerang.${format}`;

    if (format === 'gif') {
      const graph = `${CONCAT},fps=15,scale=480:-1:flags=lanczos[v]`;
      return { args: ['-i', input.name, '-filter_complex', graph, '-map', '[v]', outputName], outputName };
    }

    const graph = `${CONCAT}[v]`;
    const args: string[] = [
      '-i', input.name,
      '-filter_complex', graph,
      '-map', '[v]', '-an',
      '-c:v', 'libx264', '-crf', '23', '-preset', 'veryfast', '-pix_fmt', 'yuv420p',
      '-movflags', '+faststart',
      outputName,
    ];
    return { args, outputName };
  },
};
