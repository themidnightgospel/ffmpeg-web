import { describe, it, expect } from 'vitest';
import { waveformGenerator } from './waveform-generator';

describe('waveformGenerator.buildCommand', () => {
  it('renders a single waveform image', () => {
    const { args, outputName } = waveformGenerator.buildCommand(
      { size: '1200x400', color: '0xE30613' },
      { name: 'song.mp3' },
    );
    expect(outputName).toBe('song.waveform.png');
    expect(args).toEqual([
      '-i', 'song.mp3', '-filter_complex', 'showwavespic=s=1200x400:colors=0xE30613',
      '-frames:v', '1', 'song.waveform.png',
    ]);
  });
});
