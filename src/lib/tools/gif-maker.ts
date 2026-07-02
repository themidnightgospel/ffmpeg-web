import type { Tool } from './types';
import { baseName } from '@/lib/format';
import { CAPTION_FONT, drawtextFilter } from './drawtext';

/**
 * GIF Maker — a richer video→GIF flow: trim, set width/fps, and add an optional
 * caption, all in a single palettegen/paletteuse pass for good color.
 * See specs/features/gif-maker.md.
 */
export const gifMaker: Tool = {
  slug: 'gif-maker',
  name: 'GIF Maker',
  category: 'GIF & meme',
  status: 'live',
  accept: 'video/*',
  assets: [CAPTION_FONT],
  desc: 'Make a polished GIF from a video with trim and captions.',

  options: [
    { id: 'start', type: 'time', label: 'Start', default: '00:00:00', withMs: true },
    { id: 'duration', type: 'stepper', label: 'Length (seconds)', min: 1, max: 30, step: 1, default: 4 },
    { id: 'width', type: 'stepper', label: 'Width (px)', min: 120, max: 1280, step: 20, default: 480 },
    { id: 'fps', type: 'stepper', label: 'Frame rate', min: 5, max: 30, step: 1, default: 15 },
    { id: 'caption', type: 'text', label: 'Caption (optional)', default: '', placeholder: 'e.g. LOL', maxLength: 120 },
  ],

  buildCommand: (values, input) => {
    const outputName = `${baseName(input.name)}.gif`;
    const fps = Number(values.fps);
    const width = Number(values.width);
    const caption = String(values.caption).trim();

    const chain = [`fps=${fps}`, `scale=${width}:-1:flags=lanczos`];
    if (caption) {
      chain.push(
        drawtextFilter({
          text: caption.toUpperCase(),
          fontsize: Math.round(width / 12),
          color: 'white',
          x: '(w-text_w)/2',
          y: 'h-text_h-20',
          borderw: 3,
          bordercolor: 'black',
        }),
      );
    }
    // Single-pass palette: generate + apply within one graph via split.
    const fc = `[0:v]${chain.join(',')},split[a][b];[a]palettegen=stats_mode=diff[p];[b][p]paletteuse=dither=bayer`;

    return {
      args: ['-ss', String(values.start), '-t', String(values.duration), '-i', input.name, '-filter_complex', fc, outputName],
      outputName,
    };
  },
};
