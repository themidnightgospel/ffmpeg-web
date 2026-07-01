import type { Tool } from './types';
import { baseName } from '@/lib/format';

// Map UI codec choices to ffmpeg encoder names.
const VIDEO_ENCODERS: Record<string, string> = {
  h264: 'libx264',
  vp9: 'libvpx-vp9',
  copy: 'copy',
};
const AUDIO_ENCODERS: Record<string, string> = {
  aac: 'aac',
  opus: 'libopus',
  mp3: 'libmp3lame',
};

const isRemux = (v: { remux?: unknown }) => v.remux === true;

/**
 * Video Converter — the reference tool.
 * Everything about it is declared here; the generic ToolRunner renders and runs it.
 */
export const videoConverter: Tool = {
  slug: 'video-converter',
  name: 'Video Converter',
  category: 'Format conversion',
  status: 'live',
  accept: 'video/*',
  desc: "Change a video's container and codec — MP4, WebM, MKV and more — right in your browser.",

  options: [
    {
      id: 'format',
      type: 'segmented',
      label: 'Target format',
      default: 'mp4',
      choices: [
        { value: 'mp4', label: 'MP4' },
        { value: 'webm', label: 'WebM' },
        { value: 'mkv', label: 'MKV' },
        { value: 'mov', label: 'MOV' },
        { value: 'avi', label: 'AVI' },
        { value: 'flv', label: 'FLV' },
      ],
    },
    {
      id: 'vcodec',
      type: 'segmented',
      label: 'Video codec',
      default: 'h264',
      disabledWhen: isRemux,
      choices: [
        { value: 'h264', label: 'H.264' },
        { value: 'vp9', label: 'VP9' },
        { value: 'copy', label: 'Keep original' },
      ],
    },
    {
      id: 'acodec',
      type: 'segmented',
      label: 'Audio codec',
      default: 'aac',
      disabledWhen: isRemux,
      choices: [
        { value: 'aac', label: 'AAC' },
        { value: 'opus', label: 'Opus' },
        { value: 'mp3', label: 'MP3' },
      ],
    },
    {
      id: 'remux',
      type: 'toggle',
      label: 'Remux — no re-encode',
      default: false,
      description:
        'Repackage streams without quality loss. Much faster; codecs must be compatible.',
    },
    {
      id: 'crf',
      type: 'slider',
      label: 'CRF quality',
      advanced: true,
      disabledWhen: isRemux,
      min: 18,
      max: 28,
      step: 1,
      default: 23,
      hint: 'lower = better',
      minLabel: '18 · High quality',
      maxLabel: '28 · Small file',
    },
  ],

  buildCommand: (values, input) => {
    const format = String(values.format);
    const outputName = `${baseName(input.name)}.${format}`;
    const args: string[] = ['-i', input.name];

    if (values.remux === true) {
      args.push('-c', 'copy');
    } else {
      const vcodec = String(values.vcodec);
      args.push('-c:v', VIDEO_ENCODERS[vcodec] ?? 'libx264');
      if (vcodec !== 'copy') {
        args.push('-crf', String(values.crf));
      }
      const acodec = String(values.acodec);
      args.push('-c:a', AUDIO_ENCODERS[acodec] ?? 'aac');
    }

    args.push(outputName);
    return { args, outputName };
  },
};
