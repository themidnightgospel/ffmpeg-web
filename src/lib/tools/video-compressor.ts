import type { Tool } from './types';
import { baseName } from '@/lib/format';

/**
 * Video Compressor — shrink file size via CRF (quality-targeted) H.264, with an
 * optional downscale. See specs/features/video-compressor.md.
 */
export const videoCompressor: Tool = {
  slug: 'video-compressor',
  name: 'Video Compressor',
  category: 'Compression',
  status: 'live',
  accept: 'video/*',
  desc: 'Shrink a video with a quality target (CRF), optionally downscaling.',

  options: [
    {
      id: 'crf',
      type: 'stepper',
      label: 'CRF quality',
      min: 18,
      max: 35,
      step: 1,
      default: 28,
      hint: 'lower = better · higher = smaller',
    },
    {
      id: 'resolution',
      type: 'segmented',
      label: 'Resolution',
      default: 'source',
      choices: [
        { value: 'source', label: 'Source' },
        { value: '1080', label: '1080p' },
        { value: '720', label: '720p' },
        { value: '480', label: '480p' },
      ],
    },
    {
      id: 'preset',
      type: 'segmented',
      label: 'Encoding speed',
      advanced: true,
      default: 'veryfast',
      choices: [
        { value: 'veryfast', label: 'Fast' },
        { value: 'medium', label: 'Balanced' },
        { value: 'slow', label: 'Smaller (slow)' },
      ],
    },
    {
      id: 'audioBitrate',
      type: 'segmented',
      label: 'Audio bitrate',
      advanced: true,
      default: '128',
      choices: [
        { value: '96', label: '96k' },
        { value: '128', label: '128k' },
        { value: '192', label: '192k' },
      ],
    },
  ],

  buildCommand: (values, input) => {
    const outputName = `${baseName(input.name)}.mp4`;
    const args: string[] = ['-i', input.name];

    if (values.resolution !== 'source') {
      // -2 keeps the width even (H.264 requirement).
      args.push('-vf', `scale=-2:${String(values.resolution)}`);
    }

    args.push(
      '-c:v',
      'libx264',
      '-crf',
      String(values.crf),
      '-preset',
      String(values.preset),
      '-c:a',
      'aac',
      '-b:a',
      `${String(values.audioBitrate)}k`,
      '-movflags',
      '+faststart',
      outputName,
    );
    return { args, outputName };
  },
};
