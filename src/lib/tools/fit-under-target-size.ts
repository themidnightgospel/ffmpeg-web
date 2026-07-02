import type { Tool } from './types';
import { baseName } from '@/lib/format';

/**
 * Fit Under Target Size — compress a video to land under a chosen file size by
 * computing the video bitrate from the target size and the media duration
 * (read in-browser). If duration is unavailable, falls back to a quality-based
 * (CRF) compress. See specs/features/fit-under-target-size.md.
 */
export const fitUnderTargetSize: Tool = {
  slug: 'fit-under-target-size',
  name: 'Fit Under Target Size',
  category: 'Compression',
  status: 'live',
  accept: 'video/*',
  desc: 'Compress a video to fit under a target file size.',

  options: [
    { id: 'targetMB', type: 'stepper', label: 'Target size (MB)', min: 1, max: 2000, step: 1, default: 25 },
    {
      id: 'audioKbps',
      type: 'segmented',
      label: 'Audio bitrate',
      default: '128',
      choices: [
        { value: '64', label: '64k' },
        { value: '128', label: '128k' },
        { value: '192', label: '192k' },
      ],
    },
  ],

  buildCommand: (values, input) => {
    const targetMB = Number(values.targetMB);
    const audioKbps = Number(values.audioKbps);
    const duration = input.durationSec ?? 0;
    const outputName = `${baseName(input.name)}.fit.mp4`;

    // No duration → quality-based fallback (can't compute a precise bitrate).
    if (!duration || duration <= 0) {
      return {
        args: [
          '-i', input.name,
          '-c:v', 'libx264', '-crf', '28', '-preset', 'veryfast', '-pix_fmt', 'yuv420p',
          '-c:a', 'aac', '-b:a', `${audioKbps}k`,
          '-movflags', '+faststart',
          outputName,
        ],
        outputName,
      };
    }

    // Budget the video bitrate from the target size, reserving audio + ~5% overhead.
    // Use decimal MB (8000 kbit/MB) + the margin so we reliably land UNDER the
    // target regardless of MB/MiB interpretation.
    const totalKbits = targetMB * 8 * 1000 * 0.95;
    const videoKbps = Math.max(100, Math.floor(totalKbits / duration) - audioKbps);

    return {
      args: [
        '-i', input.name,
        '-c:v', 'libx264', '-b:v', `${videoKbps}k`,
        '-maxrate', `${videoKbps}k`, '-bufsize', `${videoKbps * 2}k`,
        '-preset', 'veryfast', '-pix_fmt', 'yuv420p',
        '-c:a', 'aac', '-b:a', `${audioKbps}k`,
        '-movflags', '+faststart',
        outputName,
      ],
      outputName,
    };
  },
};
