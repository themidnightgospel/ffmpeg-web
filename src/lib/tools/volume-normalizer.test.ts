import { describe, it, expect } from 'vitest';
import { volumeNormalizer } from './volume-normalizer';

const input = { name: 'take.wav' };

describe('volumeNormalizer.buildCommand', () => {
  it('applies loudnorm to the target LUFS by default', () => {
    const { args, outputName } = volumeNormalizer.buildCommand(
      { mode: 'loudnorm', lufs: '-16', gain: 0, format: 'mp3' },
      input,
    );
    expect(outputName).toBe('take.mp3');
    expect(args).toEqual([
      '-i', 'take.wav', '-vn', '-af', 'loudnorm=I=-16:TP=-1.5:LRA=11,aresample=48000',
      '-c:a', 'libmp3lame', '-b:a', '192k', 'take.mp3',
    ]);
  });

  it('applies a fixed gain and lossless FLAC (no bitrate)', () => {
    const { args } = volumeNormalizer.buildCommand(
      { mode: 'gain', lufs: '-16', gain: 6, format: 'flac' },
      input,
    );
    expect(args).toEqual(['-i', 'take.wav', '-vn', '-af', 'volume=6dB', '-c:a', 'flac', 'take.flac']);
  });
});
