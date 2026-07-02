import type { Tool } from './types';
import { baseName } from '@/lib/format';

// Target format → (audio codec, file extension). M4R is an AAC stream in an
// .m4r container (iPhone); MP3/OGG for Android.
const FORMATS: Record<string, { codec: string; ext: string }> = {
  m4r: { codec: 'aac', ext: 'm4r' },
  mp3: { codec: 'libmp3lame', ext: 'mp3' },
  ogg: { codec: 'libvorbis', ext: 'ogg' },
};

/**
 * Ringtone Maker — trim a song to a short segment, optionally fade + normalize,
 * and export to a ringtone format. See specs/features/ringtone-maker.md.
 */
export const ringtoneMaker: Tool = {
  slug: 'ringtone-maker',
  name: 'Ringtone Maker',
  category: 'Audio tools',
  status: 'live',
  accept: 'audio/*,video/*',
  desc: 'Trim a song into a phone ringtone with fades.',

  options: [
    { id: 'start', type: 'time', label: 'Start', default: '00:00:00', withMs: true },
    {
      id: 'duration',
      type: 'stepper',
      label: 'Length (seconds)',
      min: 1,
      max: 40,
      step: 1,
      default: 30,
      hint: 'iPhone limit: 40s',
    },
    {
      id: 'format',
      type: 'segmented',
      label: 'Format',
      default: 'm4r',
      choices: [
        { value: 'm4r', label: 'M4R (iPhone)' },
        { value: 'mp3', label: 'MP3 (Android)' },
        { value: 'ogg', label: 'OGG (Android)' },
      ],
    },
    { id: 'fade', type: 'toggle', label: 'Fade in / out', default: true },
    { id: 'normalize', type: 'toggle', label: 'Normalize loudness', default: false },
  ],

  buildCommand: (values, input) => {
    const fmt = FORMATS[String(values.format)] ?? FORMATS.m4r!;
    const duration = Number(values.duration);
    const outputName = `${baseName(input.name)}.${fmt.ext}`;

    const filters: string[] = [];
    if (values.normalize === true) filters.push('loudnorm=I=-16:TP=-1.5:LRA=11');
    if (values.fade === true) {
      const outStart = Math.max(0, duration - 1);
      filters.push('afade=t=in:st=0:d=1', `afade=t=out:st=${outStart}:d=1`);
    }

    const args: string[] = ['-ss', String(values.start), '-t', String(duration), '-i', input.name, '-vn'];
    if (filters.length > 0) args.push('-af', filters.join(','));
    args.push('-c:a', fmt.codec, outputName);

    return { args, outputName };
  },
};
