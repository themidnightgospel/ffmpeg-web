import type { Tool } from './types';
import { baseName } from '@/lib/format';

/**
 * Video to Image Sequence — export frames from a video as images, returned as a
 * ZIP. Frame rate controls how many frames per second are extracted.
 * See specs/features/video-to-image-sequence.md.
 */
export const videoToImageSequence: Tool = {
  slug: 'video-to-image-sequence',
  name: 'Video to Image Sequence',
  category: 'Extraction & capture',
  status: 'live',
  accept: 'video/*',
  desc: 'Export frames from a video as a ZIP of images.',

  options: [
    { id: 'fps', type: 'stepper', label: 'Frames per second', min: 1, max: 30, step: 1, default: 1, hint: 'higher = more frames' },
    {
      id: 'format',
      type: 'segmented',
      label: 'Image format',
      default: 'png',
      choices: [
        { value: 'png', label: 'PNG' },
        { value: 'jpg', label: 'JPG' },
      ],
    },
  ],

  buildCommand: (values, input) => {
    const ext = String(values.format);
    const outputName = `${baseName(input.name)}.frames.zip`;
    return {
      args: ['-i', input.name, '-vf', `fps=${String(values.fps)}`, `frame_%04d.${ext}`],
      outputName,
      collectPrefix: 'frame_',
    };
  },
};
