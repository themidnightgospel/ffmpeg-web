import type { Tool } from './types';
import { baseName, extension } from '@/lib/format';
import { audioEncoder } from './audioEncoders';

const AUDIO_EXTS = new Set(['mp3', 'wav', 'flac', 'aac', 'm4a', 'ogg', 'oga', 'opus', 'wma']);

/**
 * Video / Audio Trimmer — cut a clip between a start and end point. Fast mode is
 * a lossless stream copy (snaps to nearest keyframe); Precise re-encodes for an
 * exact cut. See specs/features/video-trimmer.md.
 */
export const videoTrimmer: Tool = {
  slug: 'video-trimmer',
  name: 'Video/Audio Trimmer',
  category: 'Trimming & cutting',
  status: 'live',
  accept: 'video/*,audio/*',
  desc: 'Cut a clip from a video or audio file by start and end time.',

  options: [
    { id: 'start', type: 'time', label: 'Start', default: '00:00:00', withMs: true },
    { id: 'end', type: 'time', label: 'End', default: '00:00:10', withMs: true },
    {
      id: 'mode',
      type: 'segmented',
      label: 'Mode',
      default: 'fast',
      choices: [
        { value: 'fast', label: 'Fast (lossless)' },
        { value: 'precise', label: 'Precise (re-encode)' },
      ],
    },
  ],

  buildCommand: (values, input) => {
    const ext = extension(input.name) || 'mp4';
    const isAudio = AUDIO_EXTS.has(ext);
    const start = String(values.start);
    const end = String(values.end);

    // Fast mode: input-seek + stream copy, keep the source container.
    if (values.mode !== 'precise') {
      const outputName = `${baseName(input.name)}.trim.${ext}`;
      return { args: ['-ss', start, '-to', end, '-i', input.name, '-c', 'copy', outputName], outputName };
    }

    // Precise mode: output-seek + re-encode.
    // Audio → re-encode with the source container's encoder, keep the extension.
    // Video → re-encode to MP4/H.264 (safe everywhere; libx264 can't mux into
    // e.g. .webm, so we don't keep an arbitrary source extension).
    if (isAudio) {
      const outputName = `${baseName(input.name)}.trim.${ext}`;
      return {
        args: ['-i', input.name, '-ss', start, '-to', end, '-vn', '-c:a', audioEncoder(ext), outputName],
        outputName,
      };
    }
    const outputName = `${baseName(input.name)}.trim.mp4`;
    return {
      args: [
        '-i', input.name, '-ss', start, '-to', end,
        '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '20', '-pix_fmt', 'yuv420p',
        '-c:a', 'aac', '-movflags', '+faststart', outputName,
      ],
      outputName,
    };
  },
};
