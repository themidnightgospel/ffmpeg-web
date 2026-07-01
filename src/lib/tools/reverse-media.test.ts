import { describe, it, expect } from 'vitest';
import { reverseMedia } from './reverse-media';

const input = { name: 'clip.mp4' };

describe('reverseMedia.buildCommand', () => {
  it('reverses video and audio by default', () => {
    const { args, outputName } = reverseMedia.buildCommand({ mode: 'both' }, input);
    expect(outputName).toBe('clip.mp4');
    expect(args).toEqual(expect.arrayContaining(['-vf', 'reverse', '-af', 'areverse']));
  });

  it('reverses video and mutes audio in "video only" mode', () => {
    const { args } = reverseMedia.buildCommand({ mode: 'mute' }, input);
    expect(args).toEqual(expect.arrayContaining(['-vf', 'reverse', '-an']));
    expect(args).not.toContain('areverse');
  });
});
