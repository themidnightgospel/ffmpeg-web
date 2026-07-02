import type { Tool } from './types';
import { baseName } from '@/lib/format';

/**
 * Thumbnail Generator — grab a single frame at a timestamp as an image.
 * See specs/features/thumbnail-generator.md.
 */
export const thumbnailGenerator: Tool = {
  slug: 'thumbnail-generator',
  name: 'Thumbnail Generator',
  category: 'Extraction & capture',
  status: 'live',
  accept: 'video/*',
  desc: 'Capture a still frame from a video at a chosen second.',

  options: [
    {
      id: 'time',
      type: 'stepper',
      label: 'Timestamp (seconds)',
      min: 0,
      max: 7200,
      step: 1,
      default: 1,
    },
    {
      id: 'format',
      type: 'segmented',
      label: 'Image format',
      default: 'jpg',
      choices: [
        { value: 'jpg', label: 'JPG' },
        { value: 'png', label: 'PNG' },
      ],
    },
  ],

  buildCommand: (values, input) => {
    const format = String(values.format);
    const outputName = `${baseName(input.name)}.thumb.${format}`;
    // -ss before -i = fast seek.
    const args: string[] = ['-ss', String(values.time), '-i', input.name, '-frames:v', '1'];
    if (format === 'jpg') args.push('-q:v', '2');
    args.push(outputName);
    return { args, outputName };
  },
};
