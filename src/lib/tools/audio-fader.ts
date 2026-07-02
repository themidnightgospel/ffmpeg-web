import type { Tool } from './types';
import { baseName } from '@/lib/format';
import { audioEncoder, LOSSLESS_AUDIO } from './audioEncoders';

/**
 * Audio Fader — add fade-in and/or fade-out. The fade-out uses the areverse
 * trick (reverse → fade-in → reverse) so we don't need to know the duration.
 * See specs/features/audio-fader.md.
 */
export const audioFader: Tool = {
  slug: 'audio-fader',
  name: 'Audio Fader',
  category: 'Audio tools',
  status: 'live',
  accept: 'audio/*',
  desc: 'Add a smooth fade-in and fade-out to audio.',

  options: [
    { id: 'fadeIn', type: 'stepper', label: 'Fade in (s)', min: 0, max: 15, step: 0.5, default: 2 },
    { id: 'fadeOut', type: 'stepper', label: 'Fade out (s)', min: 0, max: 15, step: 0.5, default: 2 },
    {
      id: 'format',
      type: 'segmented',
      label: 'Output format',
      default: 'mp3',
      choices: [
        { value: 'mp3', label: 'MP3' },
        { value: 'wav', label: 'WAV' },
        { value: 'flac', label: 'FLAC' },
        { value: 'm4a', label: 'M4A' },
      ],
    },
  ],

  buildCommand: (values, input) => {
    const format = String(values.format);
    const outputName = `${baseName(input.name)}.faded.${format}`;
    const fin = Number(values.fadeIn);
    const fout = Number(values.fadeOut);

    const parts: string[] = [];
    if (fin > 0) parts.push(`afade=t=in:st=0:d=${fin}`);
    if (fout > 0) parts.push('areverse', `afade=t=in:st=0:d=${fout}`, 'areverse');

    const args: string[] = ['-i', input.name, '-vn'];
    if (parts.length > 0) args.push('-af', parts.join(','));
    args.push('-c:a', audioEncoder(format));
    if (!LOSSLESS_AUDIO.has(format)) args.push('-b:a', '192k');
    args.push(outputName);
    return { args, outputName };
  },
};
