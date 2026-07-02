import type { Tool } from './types';
import { baseName } from '@/lib/format';
import { h264Tail } from './videoEncode';

const RES: Record<string, { w: number; h: number }> = {
  '1080p': { w: 1920, h: 1080 },
  '720p': { w: 1280, h: 720 },
};

/**
 * Media Merger — concatenate several video clips into one. Each clip is
 * normalized (scale/pad to a common canvas, 30fps, stereo audio) so the concat
 * filter can join clips with differing formats. Inputs must have an audio track.
 * See specs/features/media-merger.md.
 */
export const mediaMerger: Tool = {
  slug: 'media-merger',
  name: 'Media Merger',
  category: 'Trimming & cutting',
  status: 'live',
  multi: { label: 'Clips to merge', accept: 'video/*', prompt: 'Drop 2+ clips (in order)', min: 2 },
  desc: 'Join several video clips into one, in order.',

  options: [
    {
      id: 'resolution',
      type: 'segmented',
      label: 'Output resolution',
      default: '1080p',
      choices: [
        { value: '1080p', label: '1080p' },
        { value: '720p', label: '720p' },
      ],
    },
  ],

  buildCommand: (values, input) => {
    const names = input.names ?? [input.name];
    const { w, h } = RES[String(values.resolution)] ?? RES['1080p']!;
    const n = names.length;
    const outputName = `${baseName(names[0]!)}.merged.mp4`;

    // Normalize each stream, then concat all pairs.
    const norm = names
      .map(
        (_, i) =>
          `[${i}:v]scale=${w}:${h}:force_original_aspect_ratio=decrease,` +
          `pad=${w}:${h}:(ow-iw)/2:(oh-ih)/2,setsar=1,fps=30[v${i}];` +
          `[${i}:a]aresample=44100,aformat=sample_fmts=fltp:channel_layouts=stereo[a${i}]`,
      )
      .join(';');
    const pairs = names.map((_, i) => `[v${i}][a${i}]`).join('');
    const fc = `${norm};${pairs}concat=n=${n}:v=1:a=1[v][a]`;

    const args = [
      ...names.flatMap((name) => ['-i', name]),
      '-filter_complex', fc,
      '-map', '[v]', '-map', '[a]',
      ...h264Tail(20),
      outputName,
    ];
    return { args, outputName };
  },
};
