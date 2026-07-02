import type { Tool } from './types';
import { baseName, extension } from '@/lib/format';

/**
 * Metadata Stripper — remove metadata (title, GPS, timestamps, software tags)
 * without re-encoding. See specs/features/metadata-stripper.md.
 */
export const metadataStripper: Tool = {
  slug: 'metadata-stripper',
  name: 'Metadata Stripper',
  category: 'Extraction & capture',
  status: 'live',
  accept: 'audio/*,video/*',
  desc: 'Remove metadata (including GPS/location) from a media file, losslessly.',

  options: [
    {
      id: 'chapters',
      type: 'toggle',
      label: 'Also remove chapters',
      default: true,
    },
  ],

  buildCommand: (values, input) => {
    // -c copy keeps the streams untouched, so the container/extension is preserved.
    const ext = extension(input.name) || 'mp4';
    const outputName = `${baseName(input.name)}.cleaned.${ext}`;
    // -map 0 keeps every stream (extra audio, subtitles, attachments); without
    // it ffmpeg's default selection would drop all but one stream per type.
    const args: string[] = ['-i', input.name, '-map', '0', '-map_metadata', '-1', '-c', 'copy'];
    if (values.chapters === true) args.push('-map_chapters', '-1');
    args.push(outputName);
    return { args, outputName };
  },
};
