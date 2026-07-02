import type { Tool } from './types';
import { baseName } from '@/lib/format';

const RES: Record<string, { w: number; h: number }> = {
  '1080p': { w: 1920, h: 1080 },
  '720p': { w: 1280, h: 720 },
};

/**
 * Image Sequence to Video — turn a set of images into a slideshow video. Each
 * image is held for the chosen duration, normalized to a common canvas, then
 * concatenated. Images with arbitrary names are handled as explicit inputs (not
 * a numbered pattern). See specs/features/image-sequence-to-video.md.
 */
export const imageSequenceToVideo: Tool = {
  slug: 'image-sequence-to-video',
  name: 'Image Sequence to Video',
  category: 'Resize & transform',
  status: 'live',
  multi: { label: 'Images', accept: 'image/*', prompt: 'Drop images (in order)', min: 2 },
  desc: 'Turn a set of images into a slideshow video.',

  options: [
    { id: 'duration', type: 'stepper', label: 'Seconds per image', min: 0.5, max: 10, step: 0.5, default: 2 },
    { id: 'fps', type: 'stepper', label: 'Frame rate', min: 10, max: 60, step: 1, default: 30 },
    {
      id: 'resolution',
      type: 'segmented',
      label: 'Resolution',
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
    const dur = Number(values.duration);
    const fps = Number(values.fps);
    const n = names.length;
    const outputName = `${baseName(names[0]!)}.slideshow.mp4`;

    const norm = names
      .map(
        (_, i) =>
          `[${i}:v]scale=${w}:${h}:force_original_aspect_ratio=decrease,` +
          `pad=${w}:${h}:(ow-iw)/2:(oh-ih)/2,setsar=1,fps=${fps}[v${i}]`,
      )
      .join(';');
    const chain = names.map((_, i) => `[v${i}]`).join('');
    const fc = `${norm};${chain}concat=n=${n}:v=1:a=0[v]`;

    const args = [
      ...names.flatMap((name) => ['-loop', '1', '-t', String(dur), '-i', name]),
      '-filter_complex', fc,
      '-map', '[v]',
      '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '20',
      '-pix_fmt', 'yuv420p', '-movflags', '+faststart',
      outputName,
    ];
    return { args, outputName };
  },
};
