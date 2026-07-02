import type { Tool } from './types';
import { baseName } from '@/lib/format';
import { h264Tail } from './videoEncode';

function overlayXY(position: string, m: number): string {
  switch (position) {
    case 'top-left': return `${m}:${m}`;
    case 'top-right': return `W-w-${m}:${m}`;
    case 'bottom-left': return `${m}:H-h-${m}`;
    case 'bottom-right':
    default: return `W-w-${m}:H-h-${m}`;
  }
}

/**
 * Picture-in-Picture — overlay a second video (e.g. a webcam) onto the main
 * video. Needs a second video file. See specs/features/picture-in-picture.md.
 */
export const pictureInPicture: Tool = {
  slug: 'picture-in-picture',
  name: 'Picture-in-Picture',
  category: 'Subtitles & overlays',
  status: 'live',
  accept: 'video/*',
  secondary: { id: 'overlay', label: 'Overlay video', accept: 'video/*', prompt: 'Drop the overlay clip' },
  desc: 'Overlay a second video (webcam/reaction) onto the main one.',

  options: [
    {
      id: 'position',
      type: 'segmented',
      label: 'Position',
      default: 'bottom-right',
      choices: [
        { value: 'top-left', label: 'Top left' },
        { value: 'top-right', label: 'Top right' },
        { value: 'bottom-left', label: 'Bottom left' },
        { value: 'bottom-right', label: 'Bottom right' },
      ],
    },
    { id: 'scale', type: 'stepper', label: 'Overlay width (px)', min: 80, max: 1280, step: 20, default: 320 },
    { id: 'margin', type: 'stepper', label: 'Margin (px)', min: 0, max: 200, step: 2, default: 20 },
    {
      id: 'audio',
      type: 'segmented',
      label: 'Audio',
      default: 'main',
      choices: [
        { value: 'main', label: 'Main only' },
        { value: 'overlay', label: 'Overlay only' },
        { value: 'mix', label: 'Mix both' },
      ],
    },
  ],

  buildCommand: (values, input) => {
    const overlay = input.secondaryName ?? 'overlay.mp4';
    const scale = Number(values.scale);
    const margin = Number(values.margin);
    const xy = overlayXY(String(values.position), margin);
    const outputName = `${baseName(input.name)}.pip.mp4`;

    let filter = `[1:v]scale=${scale}:-2[pip];[0:v][pip]overlay=${xy}[v]`;
    const maps = ['-map', '[v]'];
    if (values.audio === 'mix') {
      filter += ';[0:a][1:a]amix=inputs=2[a]';
      maps.push('-map', '[a]');
    } else if (values.audio === 'overlay') {
      maps.push('-map', '1:a?');
    } else {
      maps.push('-map', '0:a?');
    }

    return {
      args: ['-i', input.name, '-i', overlay, '-filter_complex', filter, ...maps, ...h264Tail(20), outputName],
      outputName,
    };
  },
};
