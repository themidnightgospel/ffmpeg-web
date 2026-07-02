import type { Tool } from './types';
import { baseName, extension } from '@/lib/format';
import { h264Tail } from './videoEncode';

/**
 * Burn Subtitles — render a subtitle file permanently into the video picture.
 * SRT/VTT are styled via force_style; ASS files carry their own styling.
 * The subtitle file is staged into the FS and read by the filter (not an -i input).
 * See specs/features/burn-subtitles.md.
 */
export const burnSubtitles: Tool = {
  slug: 'burn-subtitles',
  name: 'Burn Subtitles',
  category: 'Subtitles & overlays',
  status: 'live',
  accept: 'video/*',
  secondary: {
    id: 'subs',
    label: 'Subtitle file',
    accept: '.srt,.vtt,.ass,.ssa',
    prompt: 'Drop the .srt / .ass file',
  },
  desc: 'Burn a subtitle track permanently into the video.',

  options: [
    { id: 'fontsize', type: 'stepper', label: 'Font size', min: 8, max: 96, step: 1, default: 24 },
  ],

  buildCommand: (values, input) => {
    const subs = input.secondaryName ?? 'subs.srt';
    const outputName = `${baseName(input.name)}.subbed.mp4`;
    const isAss = ['ass', 'ssa'].includes(extension(subs));

    // ASS carries its own styling; SRT/VTT get force_style for font size.
    const filter = isAss
      ? `ass=${subs}`
      : `subtitles=${subs}:force_style='FontSize=${String(values.fontsize)}'`;

    return {
      args: ['-i', input.name, '-vf', filter, ...h264Tail(20), outputName],
      outputName,
    };
  },
};
