import type { Tool } from './types';
import { baseName } from '@/lib/format';

const LOSSY = new Set(['jpg', 'webp']);

// Map a 1–100 quality to ffmpeg's mjpeg -q:v scale (2 = best, 31 = worst).
function jpegQ(quality: number): number {
  const q = Math.round(31 - ((quality - 1) / 99) * 29);
  return Math.min(31, Math.max(2, q));
}

/**
 * Image Format Converter — convert single images between PNG/JPG/WebP/BMP/TIFF.
 * See specs/features/image-format-converter.md.
 */
export const imageFormatConverter: Tool = {
  slug: 'image-format-converter',
  name: 'Image Format Converter',
  category: 'Format conversion',
  status: 'live',
  accept: 'image/*',
  desc: 'Convert an image between PNG, JPG, WebP, BMP, and TIFF.',

  options: [
    {
      id: 'format',
      type: 'segmented',
      label: 'Target format',
      default: 'png',
      choices: [
        { value: 'png', label: 'PNG' },
        { value: 'jpg', label: 'JPG' },
        { value: 'webp', label: 'WebP' },
        { value: 'bmp', label: 'BMP' },
        { value: 'tiff', label: 'TIFF' },
      ],
    },
    {
      id: 'quality',
      type: 'stepper',
      label: 'Quality',
      min: 1,
      max: 100,
      step: 1,
      default: 90,
      disabledWhen: (v) => !LOSSY.has(String(v.format)),
      hint: 'JPG / WebP only',
    },
  ],

  buildCommand: (values, input) => {
    const format = String(values.format);
    const outputName = `${baseName(input.name)}.${format}`;
    const quality = Number(values.quality);
    const args: string[] = ['-i', input.name];

    if (format === 'jpg') args.push('-q:v', String(jpegQ(quality)));
    else if (format === 'webp') args.push('-quality', String(quality));

    args.push(outputName);
    return { args, outputName };
  },
};
