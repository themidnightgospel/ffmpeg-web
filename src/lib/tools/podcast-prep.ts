import type { Tool } from './types';
import { baseName } from '@/lib/format';

/**
 * Podcast Prep — loudness-normalize a recording and export a publish-ready MP3.
 * See specs/features/podcast-prep.md.
 */
export const podcastPrep: Tool = {
  slug: 'podcast-prep',
  name: 'Podcast Prep',
  category: 'Social & platform',
  status: 'live',
  accept: 'audio/*',
  desc: 'Level a recording to podcast loudness and export a ready-to-upload MP3.',

  options: [
    {
      id: 'lufs',
      type: 'segmented',
      label: 'Loudness',
      default: '-16',
      choices: [
        { value: '-14', label: '−14 (streaming)' },
        { value: '-16', label: '−16 (podcast)' },
        { value: '-19', label: '−19 (spoken)' },
      ],
    },
    {
      id: 'bitrate',
      type: 'segmented',
      label: 'Bitrate',
      default: '128',
      choices: [
        { value: '96', label: '96k' },
        { value: '128', label: '128k' },
        { value: '192', label: '192k' },
      ],
    },
    {
      id: 'mono',
      type: 'toggle',
      label: 'Mono (voice)',
      default: false,
      description: 'Halves size for spoken-word content.',
    },
  ],

  buildCommand: (values, input) => {
    const outputName = `${baseName(input.name)}.podcast.mp3`;
    const args: string[] = [
      '-i', input.name, '-vn',
      '-af', `loudnorm=I=${String(values.lufs)}:TP=-1.5:LRA=11`,
      '-c:a', 'libmp3lame', '-b:a', `${String(values.bitrate)}k`,
    ];
    if (values.mono === true) args.push('-ac', '1');
    args.push(outputName);
    return { args, outputName };
  },
};
