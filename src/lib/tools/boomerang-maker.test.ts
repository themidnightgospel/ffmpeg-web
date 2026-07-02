import { describe, it, expect } from 'vitest';
import { boomerangMaker } from './boomerang-maker';

const input = { name: 'clip.mp4' };

describe('boomerangMaker.buildCommand', () => {
  it('concats forward + reversed video, muted, to MP4', () => {
    const { args, outputName } = boomerangMaker.buildCommand({ format: 'mp4' }, input);
    expect(outputName).toBe('clip.boomerang.mp4');
    expect(args[3]).toBe('[0:v]reverse[r];[0:v][r]concat=n=2:v=1:a=0[v]');
    expect(args).toEqual(expect.arrayContaining(['-map', '[v]', '-an']));
  });

  it('supports GIF output', () => {
    const { args, outputName } = boomerangMaker.buildCommand({ format: 'gif' }, input);
    expect(outputName).toBe('clip.boomerang.gif');
    expect(args[3]).toContain('fps=15,scale=480:-1:flags=lanczos');
  });
});
