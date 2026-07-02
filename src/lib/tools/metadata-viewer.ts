import type { Tool } from './types';

/**
 * Metadata Viewer — inspect a media file's container, duration, bitrate, and
 * streams. Read-only: probes with `ffmpeg -i` and shows the parsed banner; it
 * produces no output file. See specs/features/metadata-viewer.md.
 */
export const metadataViewer: Tool = {
  slug: 'metadata-viewer',
  name: 'Metadata Viewer',
  category: 'Advanced',
  status: 'live',
  accept: 'video/*,audio/*',
  inspect: true,
  desc: 'Inspect a media file’s duration, bitrate, codecs, and streams.',

  options: [],

  buildCommand: (_values, input) => ({
    // `-i` with no output triggers the info banner; the runner captures the log.
    args: ['-i', input.name],
    outputName: '',
  }),
};
