import type { Tool } from './types';
import { baseName } from '@/lib/format';

// Codec choice → (encoder, container extension).
const CODECS: Record<string, { enc: string; ext: string }> = {
  opus: { enc: 'libopus', ext: 'opus' },
  mp3: { enc: 'libmp3lame', ext: 'mp3' },
  aac: { enc: 'aac', ext: 'm4a' },
};

/**
 * Audio Compressor — shrink audio by lowering bitrate/sample-rate, optional mono
 * downmix, and an efficient codec. See specs/features/audio-compressor.md.
 */
export const audioCompressor: Tool = {
  slug: 'audio-compressor',
  name: 'Audio Compressor',
  category: 'Compression',
  status: 'live',
  accept: 'audio/*',
  desc: 'Reduce audio file size with bitrate, codec, mono, and sample-rate controls.',

  options: [
    {
      id: 'codec',
      type: 'segmented',
      label: 'Codec',
      default: 'opus',
      choices: [
        { value: 'opus', label: 'Opus' },
        { value: 'mp3', label: 'MP3' },
        { value: 'aac', label: 'AAC' },
      ],
    },
    {
      id: 'bitrate',
      type: 'segmented',
      label: 'Bitrate',
      default: '96',
      choices: [
        { value: '48', label: '48k' },
        { value: '64', label: '64k' },
        { value: '96', label: '96k' },
        { value: '128', label: '128k' },
        { value: '192', label: '192k' },
      ],
    },
    {
      id: 'mono',
      type: 'toggle',
      label: 'Downmix to mono',
      default: false,
      description: 'Halves size for speech/voice. Not recommended for stereo music.',
    },
    {
      id: 'samplerate',
      type: 'segmented',
      label: 'Sample rate',
      advanced: true,
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
    const codec = CODECS[String(values.codec)] ?? CODECS.opus!;
    const outputName = `${baseName(input.name)}.${codec.ext}`;
    const args: string[] = [
      '-i',
      input.name,
      '-vn',
      '-c:a',
      codec.enc,
      '-b:a',
      `${String(values.bitrate)}k`,
    ];

    if (values.mono === true) args.push('-ac', '1');
    if (values.samplerate !== 'source') args.push('-ar', String(values.samplerate));

    args.push(outputName);
    return { args, outputName };
  },
};
