import type { Tool } from './types';
import { baseName } from '@/lib/format';

// Map UI format choices to ffmpeg audio encoders.
const ENCODERS: Record<string, string> = {
  mp3: 'libmp3lame',
  wav: 'pcm_s16le',
  flac: 'flac',
  aac: 'aac',
  ogg: 'libvorbis',
  m4a: 'aac',
  opus: 'libopus',
};

const LOSSLESS = new Set(['wav', 'flac']);

const isLossless = (v: { format?: unknown }) => LOSSLESS.has(String(v.format));

/**
 * Audio Converter — convert between MP3, WAV, FLAC, AAC, OGG, M4A, Opus.
 * See specs/features/audio-converter.md.
 */
export const audioConverter: Tool = {
  slug: 'audio-converter',
  name: 'Audio Converter',
  category: 'Format conversion',
  status: 'live',
  accept: 'audio/*',
  desc: 'Convert audio between MP3, WAV, FLAC, AAC, OGG, M4A, and Opus.',

  options: [
    {
      id: 'format',
      type: 'segmented',
      label: 'Target format',
      default: 'mp3',
      choices: [
        { value: 'mp3', label: 'MP3' },
        { value: 'wav', label: 'WAV' },
        { value: 'flac', label: 'FLAC' },
        { value: 'aac', label: 'AAC' },
        { value: 'ogg', label: 'OGG' },
        { value: 'm4a', label: 'M4A' },
        { value: 'opus', label: 'Opus' },
      ],
    },
    {
      id: 'bitrate',
      type: 'segmented',
      label: 'Bitrate',
      default: '192',
      // Bitrate only applies to lossy formats.
      disabledWhen: isLossless,
      choices: [
        { value: '96', label: '96k' },
        { value: '128', label: '128k' },
        { value: '192', label: '192k' },
        { value: '256', label: '256k' },
        { value: '320', label: '320k' },
      ],
    },
    {
      id: 'samplerate',
      type: 'segmented',
      label: 'Sample rate',
      default: 'source',
      choices: [
        { value: 'source', label: 'Source' },
        { value: '48000', label: '48 kHz' },
        { value: '44100', label: '44.1 kHz' },
        { value: '22050', label: '22 kHz' },
      ],
    },
  ],

  buildCommand: (values, input) => {
    const format = String(values.format);
    const outputName = `${baseName(input.name)}.${format}`;
    const args: string[] = ['-i', input.name, '-vn', '-c:a', ENCODERS[format] ?? 'libmp3lame'];

    if (!LOSSLESS.has(format)) {
      args.push('-b:a', `${String(values.bitrate)}k`);
    }
    if (values.samplerate !== 'source') {
      args.push('-ar', String(values.samplerate));
    }

    args.push(outputName);
    return { args, outputName };
  },
};
