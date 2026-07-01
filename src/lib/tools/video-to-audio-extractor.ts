import type { Tool } from './types';
import { baseName } from '@/lib/format';
import { audioEncoder, LOSSLESS_AUDIO } from './audioEncoders';

const isCopyOrLossless = (v: { copy?: unknown; format?: unknown }) =>
  v.copy === true || LOSSLESS_AUDIO.has(String(v.format));

/**
 * Video → Audio Extractor — pull the audio track out of a video.
 * See specs/features/video-to-audio-extractor.md.
 */
export const videoToAudioExtractor: Tool = {
  slug: 'video-to-audio-extractor',
  name: 'Video → Audio Extractor',
  category: 'Format conversion',
  status: 'live',
  accept: 'video/*',
  desc: 'Extract the audio track from a video as a standalone audio file.',

  options: [
    {
      id: 'format',
      type: 'segmented',
      label: 'Audio format',
      default: 'mp3',
      disabledWhen: (v) => v.copy === true,
      choices: [
        { value: 'mp3', label: 'MP3' },
        { value: 'wav', label: 'WAV' },
        { value: 'flac', label: 'FLAC' },
        { value: 'aac', label: 'AAC' },
        { value: 'm4a', label: 'M4A' },
        { value: 'opus', label: 'Opus' },
      ],
    },
    {
      id: 'bitrate',
      type: 'segmented',
      label: 'Bitrate',
      default: '192',
      disabledWhen: isCopyOrLossless,
      choices: [
        { value: '128', label: '128k' },
        { value: '192', label: '192k' },
        { value: '256', label: '256k' },
        { value: '320', label: '320k' },
      ],
    },
    {
      id: 'copy',
      type: 'toggle',
      label: 'Keep original audio (no re-encode)',
      default: false,
      description:
        'Extract the original stream losslessly into a Matroska (.mka) file. Fastest; ignores format and bitrate.',
    },
  ],

  buildCommand: (values, input) => {
    const base = baseName(input.name);

    if (values.copy === true) {
      // .mka reliably holds any copied audio codec without re-encoding.
      const outputName = `${base}.mka`;
      return { args: ['-i', input.name, '-vn', '-c:a', 'copy', outputName], outputName };
    }

    const format = String(values.format);
    const outputName = `${base}.${format}`;
    const args: string[] = ['-i', input.name, '-vn', '-c:a', audioEncoder(format)];
    if (!LOSSLESS_AUDIO.has(format)) {
      args.push('-b:a', `${String(values.bitrate)}k`);
    }
    args.push(outputName);
    return { args, outputName };
  },
};
