import { describe, it, expect } from 'vitest';
import { mediaMerger } from './media-merger';
import { audioJoiner } from './audio-joiner';

describe('mediaMerger.buildCommand', () => {
  it('normalizes and concatenates all clips', () => {
    const { args, outputName } = mediaMerger.buildCommand(
      { resolution: '1080p' },
      { name: 'a.mp4', names: ['a.mp4', 'b.mov', 'c.webm'] },
    );
    expect(outputName).toBe('a.merged.mp4');
    // Three -i inputs
    expect(args.filter((a) => a === '-i')).toHaveLength(3);
    const fc = args[args.indexOf('-filter_complex') + 1]!;
    expect(fc).toContain('scale=1920:1080');
    expect(fc).toContain('concat=n=3:v=1:a=1[v][a]');
    expect(args).toEqual(expect.arrayContaining(['-map', '[v]', '-map', '[a]']));
  });

  it('honors the 720p preset', () => {
    const { args } = mediaMerger.buildCommand({ resolution: '720p' }, { name: 'a.mp4', names: ['a.mp4', 'b.mp4'] });
    const fc = args[args.indexOf('-filter_complex') + 1]!;
    expect(fc).toContain('scale=1280:720');
    expect(fc).toContain('concat=n=2:v=1:a=1');
  });
});

describe('audioJoiner.buildCommand', () => {
  it('concatenates audio-only streams to MP3', () => {
    const { args, outputName } = audioJoiner.buildCommand(
      { format: 'mp3' },
      { name: 't1.wav', names: ['t1.wav', 't2.mp3'] },
    );
    expect(outputName).toBe('t1.joined.mp3');
    const fc = args[args.indexOf('-filter_complex') + 1]!;
    expect(fc).toContain('concat=n=2:v=0:a=1[a]');
    expect(args).toEqual(expect.arrayContaining(['-c:a', 'libmp3lame']));
  });

  it('supports M4A output', () => {
    const { args, outputName } = audioJoiner.buildCommand(
      { format: 'm4a' },
      { name: 't1.wav', names: ['t1.wav', 't2.wav', 't3.wav'] },
    );
    expect(outputName).toBe('t1.joined.m4a');
    expect(args).toEqual(expect.arrayContaining(['-c:a', 'aac']));
    const fc = args[args.indexOf('-filter_complex') + 1]!;
    expect(fc).toContain('concat=n=3:v=0:a=1');
  });
});
