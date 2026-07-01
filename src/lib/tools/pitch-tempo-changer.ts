import type { Tool } from './types';
import { baseName } from '@/lib/format';
import { audioEncoder, LOSSLESS_AUDIO } from './audioEncoders';

const REF_RATE = 44100;

/**
 * Pitch / Tempo Changer — change tempo without pitch, or pitch without tempo.
 * Pitch uses the asetrate/aresample/atempo trick at a reference rate.
 * See specs/features/pitch-tempo-changer.md.
 */
export const pitchTempoChanger: Tool = {
  slug: 'pitch-tempo-changer',
  name: 'Pitch / Tempo Changer',
  category: 'Audio tools',
  status: 'live',
  accept: 'audio/*',
  desc: 'Change tempo without pitch, or shift pitch (semitones) without tempo.',

  options: [
    {
      id: 'mode',
      type: 'segmented',
      label: 'Mode',
      default: 'tempo',
      choices: [
        { value: 'tempo', label: 'Tempo (keep pitch)' },
        { value: 'pitch', label: 'Pitch (keep tempo)' },
      ],
    },
    {
      id: 'tempo',
      type: 'stepper',
      label: 'Tempo ×',
      min: 0.5,
      max: 2,
      step: 0.05,
      default: 1,
      disabledWhen: (v) => v.mode !== 'tempo',
      hint: '1 = normal',
    },
    {
      id: 'semitones',
      type: 'stepper',
      label: 'Pitch (semitones)',
      min: -12,
      max: 12,
      step: 1,
      default: 0,
      disabledWhen: (v) => v.mode !== 'pitch',
      hint: '+12 = one octave up',
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

    let filter: string;
    if (values.mode === 'pitch') {
      const factor = Math.pow(2, Number(values.semitones) / 12);
      filter = `aresample=${REF_RATE},asetrate=${Math.round(REF_RATE * factor)},aresample=${REF_RATE},atempo=${1 / factor}`;
    } else {
      filter = `atempo=${String(values.tempo)}`;
    }

    const args: string[] = ['-i', input.name, '-vn', '-af', filter, '-c:a', audioEncoder(format)];
    if (!LOSSLESS_AUDIO.has(format)) args.push('-b:a', '192k');
    args.push(outputName);
    return { args, outputName };
  },
};
