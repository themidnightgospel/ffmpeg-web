import type { Tool } from './types';
import { baseName, extension } from '@/lib/format';

/**
 * Video / Audio Trimmer — cut a clip between a start and end point. Fast mode is
 * a lossless stream copy (snaps to nearest keyframe); Precise re-encodes for an
 * exact cut. See specs/features/video-trimmer.md.
 */
export const videoTrimmer: Tool = {
  slug: 'video-trimmer',
  name: 'Video / Audio Trimmer',
  category: 'Trimming & cutting',
  status: 'live',
  accept: 'video/*,audio/*',
  desc: 'Cut a clip from a video or audio file by start and end time.',

  options: [
    { id: 'start', type: 'time', label: 'Start', default: '00:00:00', withMs: true },
    { id: 'end', type: 'time', label: 'End', default: '00:00:10', withMs: true },
    {
      id: 'mode',
      type: 'segmented',
      label: 'Mode',
      default: 'fast',
      choices: [
        { value: 'fast', label: 'Fast (lossless)' },
        { value: 'precise', label: 'Precise (re-encode)' },
      ],
    },
  ],

  buildCommand: (values, input) => {
    const ext = extension(input.name) || 'mp4';
    const start = String(values.start);
    const end = String(values.end);
    const outputName = `${baseName(input.name)}.trim.${ext}`;

    // Fast: input-seek + stream copy. Precise: output-seek + re-encode.
    const args =
      values.mode === 'precise'
        ? ['-i', input.name, '-ss', start, '-to', end, '-c:v', 'libx264', '-c:a', 'aac', outputName]
        : ['-ss', start, '-to', end, '-i', input.name, '-c', 'copy', outputName];

    return { args, outputName };
  },
};
