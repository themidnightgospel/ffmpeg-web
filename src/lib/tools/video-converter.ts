import type { Tool } from './types';
import { baseName } from '@/lib/format';

// Map UI codec choices to ffmpeg encoder names.
// (VP9 is intentionally omitted — its encoder is too memory-heavy for ffmpeg.wasm
// and crashes the tab; WebM uses VP8 below.)
const VIDEO_ENCODERS: Record<string, string> = {
  h264: 'libx264',
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
        'Repackage streams without quality loss. Near-instant; codecs must be compatible ' +
        '(e.g. most MOV→MP4). Try this first.',
    },
    {
      id: 'speed',
      type: 'segmented',
      label: 'Encoding',
      default: 'ultrafast',
      disabledWhen: isRemux,
      choices: [
        { value: 'ultrafast', label: 'Faster' },
        { value: 'veryfast', label: 'Smaller file' },
      ],
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

    // "Faster" (ultrafast) vs "Smaller file" (veryfast). Defaults to Faster —
    // single-thread wasm is slow, so speed is the priority for most conversions.
    const speed = values.speed === 'veryfast' ? 'veryfast' : 'ultrafast';

    if (values.remux === true) {
      args.push('-c', 'copy');
    } else if (format === 'webm') {
      // WebM forces VP8 (libvpx) + Opus. VP8 is far lighter than VP9 in wasm.
      // -cpu-used maps the speed choice (higher = faster; default is slowest).
      const cpu = speed === 'veryfast' ? '5' : '8';
      args.push('-c:v', 'libvpx', '-cpu-used', cpu, '-crf', '10', '-b:v', '1M', '-c:a', 'libopus');
    } else {
      const vEnc = VIDEO_ENCODERS[String(values.vcodec)] ?? 'libx264';
      args.push('-c:v', vEnc);
      // Explicit preset — libx264 otherwise defaults to slow "medium".
      if (vEnc !== 'copy') args.push('-crf', String(values.crf), '-preset', speed);
      args.push('-c:a', AUDIO_ENCODERS[String(values.acodec)] ?? 'aac');
    }

    args.push(outputName);
    return { args, outputName };
  },
};
