import type { Tool } from './types';
import { baseName } from '@/lib/format';
import { h264Tail } from './videoEncode';
import { CAPTION_FONT, drawtextFilter } from './drawtext';

const COLORS: Record<string, string> = {
  white: 'white',
  black: 'black',
  yellow: 'yellow',
  red: 'red',
};

// Position → y expression (all horizontally centered).
function yExpr(position: string): string {
  switch (position) {
    case 'top': return '40';
    case 'center': return '(h-text_h)/2';
    case 'bottom':
    default: return 'h-text_h-40';
  }
}

/**
 * Add Text Overlay — draw a text caption onto a video with position, size, color
 * and an optional background box. See specs/features/add-text-overlay.md.
 */
export const addTextOverlay: Tool = {
  slug: 'add-text-overlay',
  name: 'Add Text Overlay',
  category: 'Subtitles & overlays',
  status: 'live',
  accept: 'video/*',
  assets: [CAPTION_FONT],
  desc: 'Overlay custom text onto a video.',

  options: [
    { id: 'text', type: 'text', label: 'Text', default: 'Hello', placeholder: 'Your text', maxLength: 200 },
    {
      id: 'position',
      type: 'segmented',
      label: 'Position',
      default: 'bottom',
      choices: [
        { value: 'top', label: 'Top' },
        { value: 'center', label: 'Center' },
        { value: 'bottom', label: 'Bottom' },
      ],
    },
    { id: 'fontsize', type: 'stepper', label: 'Font size', min: 12, max: 200, step: 2, default: 48 },
    {
      id: 'color',
      type: 'segmented',
      label: 'Color',
      default: 'white',
      choices: [
        { value: 'white', label: 'White' },
        { value: 'black', label: 'Black' },
        { value: 'yellow', label: 'Yellow' },
        { value: 'red', label: 'Red' },
      ],
    },
    { id: 'box', type: 'toggle', label: 'Background box', default: true, advanced: true },
  ],

  buildCommand: (values, input) => {
    const outputName = `${baseName(input.name)}.captioned.mp4`;
    const filter = drawtextFilter({
      text: String(values.text),
      fontsize: Number(values.fontsize),
      color: COLORS[String(values.color)] ?? 'white',
      x: '(w-text_w)/2',
      y: yExpr(String(values.position)),
      box: values.box === true,
      boxcolor: 'black@0.5',
    });

    return {
      args: ['-i', input.name, '-vf', filter, ...h264Tail(20), outputName],
      outputName,
    };
  },
};
