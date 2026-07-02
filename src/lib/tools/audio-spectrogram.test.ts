import { describe, it, expect } from 'vitest';
import { audioSpectrogram } from './audio-spectrogram';

describe('audioSpectrogram.buildCommand', () => {
  it('renders a spectrogram image with legend + colour scheme', () => {
    const { args, outputName } = audioSpectrogram.buildCommand(
      { size: '1280x480', color: 'intensity' },
      { name: 'track.flac' },
    );
    expect(outputName).toBe('track.spectrogram.png');
    expect(args).toEqual([
      '-i', 'track.flac', '-filter_complex',
      'showspectrumpic=s=1280x480:legend=1:color=intensity',
      '-frames:v', '1', 'track.spectrogram.png',
    ]);
  });
});
