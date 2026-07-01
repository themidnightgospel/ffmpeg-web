import type { Tool } from './types';
import { baseName } from '@/lib/format';

/**
 * Video → GIF — turn a clip into an animated GIF (single-pass).
 * A palette two-pass gives better colour but needs multi-command support; this
 * uses a fast single pass. See specs/features/video-to-gif.md.
 */
export const videoToGif: Tool = {
  slug: 'video-to-gif',
  name: 'Video → GIF',
  category: 'Format conversion',
  status: 'live',
  accept: 'video/*',
  desc: 'Turn a short clip into an animated GIF (control fps, width, length).',

  options: [
    {
      id: 'duration',
      type: 'stepper',
      label: 'Length (seconds)',
      min: 1,
      max: 30,
      step: 1,
      default: 6,
      hint: 'GIFs get large fast — keep it short',
    },
    {
      id: 'fps',
      type: 'segmented',
      label: 'Frame rate',
      default: '15',
      choices: [
        { value: '10', label: '10' },
        { value: '15', label: '15' },
        { value: '24', label: '24' },
      ],
    },
    {
      id: 'width',
      type: 'segmented',
      label: 'Width',
      default: '480',
      choices: [
        { value: '320', label: '320' },
        { value: '480', label: '480' },
        { value: '640', label: '640' },
      ],
    },
  ],

  buildCommand: (values, input) => {
    const outputName = `${baseName(input.name)}.gif`;
    const filter = `fps=${String(values.fps)},scale=${String(values.width)}:-1:flags=lanczos`;
    const args: string[] = [
      '-i',
      input.name,
      '-t',
      String(values.duration),
      '-vf',
      filter,
      outputName,
    ];
    return { args, outputName };
  },
};
