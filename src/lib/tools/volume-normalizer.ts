import type { Tool } from './types';
import { baseName } from '@/lib/format';
import { audioEncoder, LOSSLESS_AUDIO } from './audioEncoders';

/**
 * Volume Normalizer — loudness-normalize (EBU R128 / loudnorm) or apply a fixed
 * gain. See specs/features/volume-normalizer.md.
 */
export const volumeNormalizer: Tool = {
  slug: 'volume-normalizer',
  name: 'Volume Normalizer',
  category: 'Audio tools',
  status: 'live',
  accept: 'audio/*',
  desc: 'Even out loudness to a target level (LUFS) or apply a fixed gain.',

  options: [
    {
      id: 'mode',
      type: 'segmented',
      label: 'Mode',
      default: 'loudnorm',
      choices: [
        { value: 'loudnorm', label: 'Loudness (LUFS)' },
        { value: 'gain', label: 'Fixed gain' },
      ],
    },
    {
      id: 'lufs',
      type: 'segmented',
      label: 'Target loudness',
      default: '-16',
      disabledWhen: (v) => v.mode === 'gain',
      choices: [
        { value: '-14', label: '−14 (streaming)' },
        { value: '-16', label: '−16 (podcast)' },
        { value: '-23', label: '−23 (broadcast)' },
      ],
    },
    {
      id: 'gain',
      type: 'stepper',
      label: 'Gain (dB)',
      min: -20,
      max: 20,
      step: 1,
      default: 0,
      disabledWhen: (v) => v.mode !== 'gain',
      hint: 'boost (+) or cut (−)',
    },
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
    const outputName = `${baseName(input.name)}.${format}`;
    const filter =
      values.mode === 'gain'
        ? `volume=${String(values.gain)}dB`
        : // aresample pins the rate — loudnorm can emit 192 kHz, rejected by lame/vorbis.
          `loudnorm=I=${String(values.lufs)}:TP=-1.5:LRA=11,aresample=48000`;

    const args: string[] = ['-i', input.name, '-vn', '-af', filter, '-c:a', audioEncoder(format)];
    if (!LOSSLESS_AUDIO.has(format)) args.push('-b:a', '192k');
    args.push(outputName);
    return { args, outputName };
  },
};
