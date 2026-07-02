import type { Tool } from './types';
import { baseName, extension } from '@/lib/format';

/**
 * Media Splitter — split a video/audio file into fixed-duration segments,
 * returned as a ZIP. Uses the segment muxer with stream copy (fast, lossless;
 * cuts snap to the nearest keyframe). See specs/features/media-splitter.md.
 */
export const mediaSplitter: Tool = {
  slug: 'media-splitter',
  name: 'Media Splitter',
  category: 'Trimming & cutting',
  status: 'live',
  accept: 'video/*,audio/*',
  desc: 'Split a file into fixed-length segments (as a ZIP).',

  options: [
    { id: 'seconds', type: 'stepper', label: 'Segment length (seconds)', min: 5, max: 3600, step: 5, default: 60 },
  ],

  buildCommand: (values, input) => {
    const ext = extension(input.name) || 'mp4';
    const outputName = `${baseName(input.name)}.parts.zip`;
    return {
      args: [
        '-i', input.name,
        '-c', 'copy',
        '-f', 'segment',
        '-segment_time', String(values.seconds),
        '-reset_timestamps', '1',
        `part_%03d.${ext}`,
      ],
      outputName,
      collectPrefix: 'part_',
    };
  },
};
