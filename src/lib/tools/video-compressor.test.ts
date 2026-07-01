import { describe, it, expect } from 'vitest';
import { videoCompressor } from './video-compressor';

const input = { name: 'big.mov' };

describe('videoCompressor.buildCommand', () => {
  it('compresses with CRF at source resolution by default', () => {
    const { args, outputName } = videoCompressor.buildCommand(
      { crf: 28, resolution: 'source', preset: 'veryfast', audioBitrate: '128' },
      input,
    );
    expect(outputName).toBe('big.mp4');
    expect(args).toEqual([
      '-i', 'big.mov',
      '-c:v', 'libx264', '-crf', '28', '-preset', 'veryfast',
      '-c:a', 'aac', '-b:a', '128k',
      '-movflags', '+faststart', 'big.mp4',
    ]);
  });

  it('inserts a downscale filter when a resolution is chosen', () => {
    const { args } = videoCompressor.buildCommand(
      { crf: 30, resolution: '720', preset: 'medium', audioBitrate: '96' },
      input,
    );
    expect(args.slice(0, 4)).toEqual(['-i', 'big.mov', '-vf', 'scale=-2:720']);
    expect(args).toContain('-crf');
    expect(args[args.indexOf('-crf') + 1]).toBe('30');
  });
});
