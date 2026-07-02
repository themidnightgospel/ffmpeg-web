import type { Tool } from './types';
import { baseName } from '@/lib/format';

/**
 * Replace Audio Track — swap a video's audio for a new track, or mix a new track
 * over the existing one. Needs a second (audio) file.
 * See specs/features/replace-audio-track.md.
 */
export const replaceAudioTrack: Tool = {
  slug: 'replace-audio-track',
  name: 'Replace Audio Track',
  category: 'Audio tools',
  status: 'live',
  accept: 'video/*',
  secondary: { id: 'audio', label: 'New audio', accept: 'audio/*', prompt: 'Drop the audio track' },
  desc: 'Replace or mix a video’s audio with a new track.',

  options: [
    {
      id: 'mode',
      type: 'segmented',
      label: 'Mode',
      default: 'replace',
      choices: [
        { value: 'replace', label: 'Replace' },
        { value: 'mix', label: 'Mix over existing' },
      ],
    },
  ],

  buildCommand: (values, input) => {
    const audio = input.secondaryName ?? 'audio';
    const outputName = `${baseName(input.name)}.newaudio.mp4`;

    const args =
      values.mode === 'mix'
        ? [
            '-i', input.name, '-i', audio,
            '-filter_complex', '[0:a][1:a]amix=inputs=2:duration=first[a]',
            '-map', '0:v', '-map', '[a]', '-c:v', 'copy', outputName,
          ]
        : [
            '-i', input.name, '-i', audio,
            '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-shortest', outputName,
          ];

    return { args, outputName };
  },
};
