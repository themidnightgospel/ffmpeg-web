import { describe, it, expect } from 'vitest';
import { channelTools } from './channel-tools';

const input = { name: 'track.wav' };

describe('channelTools.buildCommand', () => {
  it('downmixes to mono with -ac 1', () => {
    const { args, outputName } = channelTools.buildCommand({ op: 'mono', format: 'mp3' }, input);
    expect(outputName).toBe('track.mp3');
    expect(args).toEqual(['-i', 'track.wav', '-vn', '-ac', '1', '-c:a', 'libmp3lame', '-b:a', '192k', 'track.mp3']);
  });

  it('swaps L/R with a pan filter', () => {
    const { args } = channelTools.buildCommand({ op: 'swap', format: 'wav' }, input);
    expect(args).toEqual(['-i', 'track.wav', '-vn', '-af', 'pan=stereo|c0=c1|c1=c0', '-c:a', 'pcm_s16le', 'track.wav']);
  });
});
