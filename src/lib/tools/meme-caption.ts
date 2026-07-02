import type { Tool } from './types';
import { baseName } from '@/lib/format';
import { h264Tail } from './videoEncode';
import { CAPTION_FONT, drawtextFilter } from './drawtext';

/**
 * Meme Caption — classic Impact-style top/bottom text with a heavy black
 * outline. Needs at least one of top/bottom text.
 * See specs/features/meme-caption.md.
 */
export const memeCaption: Tool = {
  slug: 'meme-caption',
  name: 'Meme Caption',
  category: 'GIF & meme',
  status: 'live',
  accept: 'video/*',
  assets: [CAPTION_FONT],
  desc: 'Add classic top/bottom meme text to a video.',

  options: [
    { id: 'top', type: 'text', label: 'Top text', default: 'TOP TEXT', placeholder: 'Top text', maxLength: 120 },
    { id: 'bottom', type: 'text', label: 'Bottom text', default: 'BOTTOM TEXT', placeholder: 'Bottom text', maxLength: 120 },
    { id: 'fontsize', type: 'stepper', label: 'Font size', min: 16, max: 200, step: 2, default: 48 },
  ],

  buildCommand: (values, input) => {
    const outputName = `${baseName(input.name)}.meme.mp4`;
    const fontsize = Number(values.fontsize);
    const top = String(values.top).trim();
    const bottom = String(values.bottom).trim();

    const filters: string[] = [];
    if (top) {
      filters.push(
        drawtextFilter({
          text: top.toUpperCase(),
          fontsize,
          color: 'white',
          x: '(w-text_w)/2',
          y: '20',
          borderw: 4,
          bordercolor: 'black',
        }),
      );
    }
    if (bottom) {
      filters.push(
        drawtextFilter({
          text: bottom.toUpperCase(),
          fontsize,
          color: 'white',
          x: '(w-text_w)/2',
          y: 'h-text_h-20',
          borderw: 4,
          bordercolor: 'black',
        }),
      );
    }
    // Fall back to a no-op-ish draw if the user cleared both (keeps output valid).
    const vf = filters.length > 0 ? filters.join(',') : 'null';

    return {
      args: ['-i', input.name, '-vf', vf, ...h264Tail(20), outputName],
      outputName,
    };
  },
};
