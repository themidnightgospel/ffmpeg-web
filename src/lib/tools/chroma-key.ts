import type { Tool } from './types';
import { baseName, extension } from '@/lib/format';
import { h264Tail } from './videoEncode';

const COLORS: Record<string, string> = {
  green: '0x00FF00',
  blue: '0x0000FF',
};

const IMAGE_EXTS = ['jpg', 'jpeg', 'png', 'webp', 'bmp', 'gif'];

/**
 * Chroma Key — replace a green/blue screen in the foreground video with a
 * background image or video. Needs a second (background) file.
 * See specs/features/chroma-key.md.
 */
export const chromaKey: Tool = {
  slug: 'chroma-key',
  name: 'Chroma Key',
  category: 'Advanced',
  status: 'live',
  accept: 'video/*',
  secondary: { id: 'bg', label: 'Background', accept: 'image/*,video/*', prompt: 'Drop the background' },
  desc: 'Replace a green/blue screen with a new background.',

  options: [
    {
      id: 'color',
      type: 'segmented',
      label: 'Screen color',
      default: 'green',
      choices: [
        { value: 'green', label: 'Green' },
        { value: 'blue', label: 'Blue' },
      ],
    },
    { id: 'similarity', type: 'stepper', label: 'Similarity', min: 0.01, max: 1, step: 0.01, default: 0.1, hint: 'higher = more removed' },
    { id: 'blend', type: 'stepper', label: 'Edge blend', min: 0, max: 1, step: 0.05, default: 0.2 },
  ],

  buildCommand: (values, input) => {
    const bg = input.secondaryName ?? 'bg.jpg';
    const color = COLORS[String(values.color)] ?? COLORS.green;
    const bgIsImage = IMAGE_EXTS.includes(extension(bg));
    const outputName = `${baseName(input.name)}.keyed.mp4`;

    // Foreground keyed, then overlaid on the background ([1:v]).
    const filter =
      `[0:v]chromakey=${color}:${String(values.similarity)}:${String(values.blend)}[ck];` +
      `[1:v][ck]overlay[v]`;

    // A still image must be looped, otherwise it decodes to a single frame and
    // the output ends immediately; -shortest then bounds it to the foreground.
    const bgInput = bgIsImage ? ['-loop', '1', '-i', bg] : ['-i', bg];

    return {
      args: [
        '-i', input.name, ...bgInput,
        '-filter_complex', filter,
        '-map', '[v]', '-map', '0:a?',
        ...h264Tail(20),
        ...(bgIsImage ? ['-shortest'] : []),
        outputName,
      ],
      outputName,
    };
  },
};
