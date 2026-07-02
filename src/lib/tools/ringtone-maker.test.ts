import { describe, it, expect } from 'vitest';
import { ringtoneMaker } from './ringtone-maker';

describe('ringtoneMaker.buildCommand', () => {
  it('trims, fades, and exports M4R by default', () => {
    const { args, outputName } = ringtoneMaker.buildCommand(
      { start: '00:00:30', duration: 30, format: 'm4r', fade: true, normalize: false },
      { name: 'song.mp3' },
    );
    expect(outputName).toBe('song.m4r');
    expect(args).toEqual([
      '-ss', '00:00:30', '-t', '30', '-i', 'song.mp3', '-vn',
      '-af', 'afade=t=in:st=0:d=1,afade=t=out:st=29:d=1',
      '-c:a', 'aac', 'song.m4r',
    ]);
  });

  it('omits the filter chain when nothing is applied', () => {
    const { args } = ringtoneMaker.buildCommand(
      { start: '0', duration: 20, format: 'mp3', fade: false, normalize: false },
      { name: 'song.mp3' },
    );
    expect(args).not.toContain('-af');
    expect(args).toEqual(expect.arrayContaining(['-c:a', 'libmp3lame']));
  });

  it('prepends loudnorm when normalize is on', () => {
    const { args } = ringtoneMaker.buildCommand(
      { start: '0', duration: 25, format: 'ogg', fade: false, normalize: true },
      { name: 'song.wav' },
    );
    const af = args[args.indexOf('-af') + 1];
    expect(af).toBe('loudnorm=I=-16:TP=-1.5:LRA=11');
    expect(args).toEqual(expect.arrayContaining(['-c:a', 'libvorbis']));
  });
});
