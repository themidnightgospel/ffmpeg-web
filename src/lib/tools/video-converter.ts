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
// WebM can only hold VP8/VP9/AV1 video + Opus/Vorbis audio, so codec choice is
// fixed for it — disable the codec pickers and force the right encoders.
const codecFixed = (v: { remux?: unknown; format?: unknown }) =>
  v.remux === true || v.format === 'webm';

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
      disabledWhen: codecFixed,
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
      disabledWhen: codecFixed,
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
      type: 'stepper',
      label: 'CRF quality',
      advanced: true,
      disabledWhen: isRemux,
      min: 18,
      max: 28,
      step: 1,
      default: 23,
      hint: '18 = best quality · 28 = smallest',
    },
  ],

  buildCommand: (values, input) => {
    const format = String(values.format);
    const outputName = `${baseName(input.name)}.${format}`;
    const args: string[] = ['-i', input.name];

    if (values.remux === true) {
      args.push('-c', 'copy');
    } else {
      const webm = format === 'webm';
      // WebM forces VP9/Opus; other containers respect the chosen codecs.
      const vEnc = webm ? 'libvpx-vp9' : (VIDEO_ENCODERS[String(values.vcodec)] ?? 'libx264');
      const aEnc = webm ? 'libopus' : (AUDIO_ENCODERS[String(values.acodec)] ?? 'aac');

      args.push('-c:v', vEnc);
      if (vEnc !== 'copy') {
        args.push('-crf', String(values.crf));
        if (vEnc === 'libvpx-vp9') args.push('-b:v', '0'); // constant-quality VP9
      }
      args.push('-c:a', aEnc);
    }

    args.push(outputName);
    return { args, outputName };
  },
};
