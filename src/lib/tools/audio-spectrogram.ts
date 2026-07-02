import type { Tool } from './types';
import { baseName } from '@/lib/format';

/**
 * Audio Spectrogram — frequency-over-time image from audio (showspectrumpic).
 * See specs/features/audio-spectrogram.md.
 */
export const audioSpectrogram: Tool = {
  slug: 'audio-spectrogram',
  name: 'Audio Spectrogram',
  category: 'Advanced',
  status: 'live',
  accept: 'audio/*',
  desc: 'Generate a spectrogram image (frequency over time) from audio.',

  options: [
    {
      id: 'size',
      type: 'segmented',
      label: 'Size',
      default: '1280x480',
      choices: [
        { value: '1024x512', label: '1024×512' },
        { value: '1280x480', label: '1280×480' },
        { value: '1920x1080', label: '1920×1080' },
      ],
    },
    {
      id: 'color',
      type: 'segmented',
      label: 'Colour scheme',
      default: 'intensity',
      choices: [
        { value: 'intensity', label: 'Intensity' },
        { value: 'magma', label: 'Magma' },
        { value: 'viridis', label: 'Viridis' },
        { value: 'rainbow', label: 'Rainbow' },
      ],
    },
  ],

  buildCommand: (values, input) => {
    const outputName = `${baseName(input.name)}.spectrogram.png`;
    const filter = `showspectrumpic=s=${String(values.size)}:legend=1:color=${String(values.color)}`;
    return {
      args: ['-i', input.name, '-filter_complex', filter, '-frames:v', '1', outputName],
      outputName,
    };
  },
};
