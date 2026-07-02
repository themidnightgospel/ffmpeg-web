import type { Tool } from './types';
import { baseName } from '@/lib/format';

/**
 * Waveform Generator — render a static waveform image from audio (showwavespic).
 * See specs/features/waveform-generator.md.
 */
export const waveformGenerator: Tool = {
  slug: 'waveform-generator',
  name: 'Waveform Generator',
  category: 'Audio tools',
  status: 'live',
  accept: 'audio/*',
  desc: 'Render an audio file as a waveform image (PNG).',

  options: [
    {
      id: 'size',
      type: 'segmented',
      label: 'Size',
      default: '1200x400',
      choices: [
        { value: '800x200', label: '800×200' },
        { value: '1200x400', label: '1200×400' },
        { value: '1920x600', label: '1920×600' },
      ],
    },
    {
      id: 'color',
      type: 'segmented',
      label: 'Colour',
      default: '0xE30613',
      choices: [
        { value: '0xE30613', label: 'Red' },
        { value: '0x111111', label: 'Black' },
        { value: '0x3498DB', label: 'Blue' },
      ],
    },
  ],

  buildCommand: (values, input) => {
    const outputName = `${baseName(input.name)}.waveform.png`;
    const filter = `showwavespic=s=${String(values.size)}:colors=${String(values.color)}`;
    return {
      args: ['-i', input.name, '-filter_complex', filter, '-frames:v', '1', outputName],
      outputName,
    };
  },
};
