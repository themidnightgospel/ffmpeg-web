import type { Tool } from './types';
import { baseName } from '@/lib/format';

/**
 * Extract Subtitles — pull an embedded (text) subtitle track out to SRT/VTT/ASS.
 * Image-based subs (PGS/VobSub) can't be converted to text and will error.
 * See specs/features/extract-subtitles.md.
 */
export const extractSubtitles: Tool = {
  slug: 'extract-subtitles',
  name: 'Extract Subtitles',
  category: 'Subtitles & overlays',
  status: 'live',
  accept: 'video/*,.mkv',
  desc: 'Extract an embedded subtitle track to a standalone SRT/VTT/ASS file.',

  options: [
    {
      id: 'track',
      type: 'stepper',
      label: 'Subtitle track',
      min: 0,
      max: 9,
      step: 1,
      default: 0,
      hint: '0 = first subtitle track',
    },
    {
      id: 'format',
      type: 'segmented',
      label: 'Format',
      default: 'srt',
      choices: [
        { value: 'srt', label: 'SRT' },
        { value: 'vtt', label: 'VTT' },
        { value: 'ass', label: 'ASS' },
      ],
    },
  ],

  buildCommand: (values, input) => {
    const format = String(values.format);
    const outputName = `${baseName(input.name)}.${format}`;
    return {
      args: ['-i', input.name, '-map', `0:s:${String(values.track)}`, outputName],
      outputName,
    };
  },
};
