import { describe, it, expect } from 'vitest';
import { speedChanger } from './speed-changer';

const input = { name: 'clip.mp4' };

describe('speedChanger.buildCommand', () => {
  it('doubles speed with setpts + single atempo', () => {
    const { args, outputName } = speedChanger.buildCommand({ speed: 2, muteAudio: false }, input);
    expect(outputName).toBe('clip.mp4');
    expect(args[2]).toBe('-filter_complex');
    expect(args[3]).toBe('[0:v]setpts=PTS/2[v];[0:a]atempo=2[a]');
    expect(args).toEqual(expect.arrayContaining(['-map', '[v]', '-map', '[a]']));
  });

  it('chains atempo for 4× (2×2)', () => {
    const { args } = speedChanger.buildCommand({ speed: 4, muteAudio: false }, input);
    expect(args[3]).toBe('[0:v]setpts=PTS/4[v];[0:a]atempo=2,atempo=2[a]');
  });

  it('chains atempo for 0.25× (0.5×0.5)', () => {
    const { args } = speedChanger.buildCommand({ speed: 0.25, muteAudio: false }, input);
    expect(args[3]).toBe('[0:v]setpts=PTS/0.25[v];[0:a]atempo=0.5,atempo=0.5[a]');
  });

  it('mutes audio with -an and a simple -vf', () => {
    const { args } = speedChanger.buildCommand({ speed: 1.5, muteAudio: true }, input);
    expect(args).toEqual(expect.arrayContaining(['-vf', 'setpts=PTS/1.5', '-an']));
    expect(args).not.toContain('-filter_complex');
  });
});
