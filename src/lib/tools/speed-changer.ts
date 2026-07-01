import type { Tool } from './types';
import { baseName } from '@/lib/format';
import { h264Tail } from './videoEncode';

// atempo accepts 0.5–2.0, so chain factors to reach the target tempo.
function atempoChain(speed: number): string {
  const parts: string[] = [];
  let r = speed;
  while (r > 2) {
    parts.push('atempo=2');
    r /= 2;
  }
  while (r < 0.5) {
    parts.push('atempo=0.5');
    r *= 2;
  }
  parts.push(`atempo=${r}`);
  return parts.join(',');
}

/**
 * Speed Changer — speed up / slow down, keeping audio in sync and pitch-correct.
 * See specs/features/speed-changer.md.
 */
export const speedChanger: Tool = {
  slug: 'speed-changer',
  name: 'Speed Changer',
  category: 'Resize & transform',
  status: 'live',
  accept: 'video/*',
  desc: 'Speed up or slow down a video (0.25×–4×), keeping audio synced.',

  options: [
    {
      id: 'speed',
      type: 'stepper',
      label: 'Speed',
      min: 0.25,
      max: 4,
      step: 0.25,
      default: 1,
      hint: '1 = normal · 2 = twice as fast',
    },
    {
      id: 'muteAudio',
      type: 'toggle',
      label: 'Mute audio',
      default: false,
      description: 'Drop the audio track (common for extreme speeds).',
    },
  ],

  buildCommand: (values, input) => {
    const speed = Number(values.speed);
    const outputName = `${baseName(input.name)}.mp4`;
    const setpts = `setpts=PTS/${speed}`;

    if (values.muteAudio === true) {
      const args: string[] = [
        '-i',
        input.name,
        '-vf',
        setpts,
        '-an',
        '-c:v',
        'libx264',
        '-crf',
        '20',
        '-preset',
        'veryfast',
        '-movflags',
        '+faststart',
        outputName,
      ];
      return { args, outputName };
    }

    const graph = `[0:v]${setpts}[v];[0:a]${atempoChain(speed)}[a]`;
    const args: string[] = [
      '-i',
      input.name,
      '-filter_complex',
      graph,
      '-map',
      '[v]',
      '-map',
      '[a]',
      ...h264Tail(),
      outputName,
    ];
    return { args, outputName };
  },
};
