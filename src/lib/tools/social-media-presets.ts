import type { Tool } from './types';
import { baseName } from '@/lib/format';

// Platform placement → target canvas. Kept in one config so specs are easy to
// update as platforms change. All use H.264/AAC MP4 with +faststart.
const PRESETS: Record<string, { w: number; h: number }> = {
  'reels': { w: 1080, h: 1920 }, // Instagram Reels / Stories, TikTok, Shorts
  'square': { w: 1080, h: 1080 }, // Instagram feed
  'landscape': { w: 1920, h: 1080 }, // YouTube standard, X, Facebook
  'portrait-feed': { w: 1080, h: 1350 }, // Instagram 4:5 feed
};

/**
 * Social-Media Presets — reframe + re-encode a video to a platform's canvas in
 * one click. See specs/features/social-media-presets.md.
 */
export const socialMediaPresets: Tool = {
  slug: 'social-media-presets',
  name: 'Social-Media Presets',
  category: 'Social & platform',
  status: 'live',
  accept: 'video/*',
  desc: 'Reframe a video to a platform-ready size in one click.',

  options: [
    {
      id: 'preset',
      type: 'segmented',
      label: 'Platform',
      default: 'reels',
      choices: [
        { value: 'reels', label: 'Reels / TikTok / Shorts (9:16)' },
        { value: 'square', label: 'Instagram feed (1:1)' },
        { value: 'portrait-feed', label: 'Instagram 4:5' },
        { value: 'landscape', label: 'YouTube / X (16:9)' },
      ],
    },
    {
      id: 'fit',
      type: 'segmented',
      label: 'Fit',
      default: 'pad',
      choices: [
        { value: 'pad', label: 'Pad (letterbox)' },
        { value: 'crop', label: 'Crop (fill)' },
      ],
    },
  ],

  buildCommand: (values, input) => {
    const preset = PRESETS[String(values.preset)] ?? PRESETS['reels']!;
    const { w, h } = preset;
    const vf =
      values.fit === 'crop'
        ? `scale=${w}:${h}:force_original_aspect_ratio=increase,crop=${w}:${h}`
        : `scale=${w}:${h}:force_original_aspect_ratio=decrease,pad=${w}:${h}:(ow-iw)/2:(oh-ih)/2`;
    const outputName = `${baseName(input.name)}.${String(values.preset)}.mp4`;
    return {
      args: [
        '-i', input.name,
        '-vf', vf,
        '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '20',
        '-c:a', 'aac', '-b:a', '128k',
        '-movflags', '+faststart',
        outputName,
      ],
      outputName,
    };
  },
};
