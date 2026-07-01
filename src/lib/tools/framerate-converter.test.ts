import { describe, it, expect } from 'vitest';
import { framerateConverter } from './framerate-converter';

const input = { name: 'clip.mp4' };

describe('framerateConverter.buildCommand', () => {
  it('uses the fps filter by default', () => {
    const { args, outputName } = framerateConverter.buildCommand(
      { fps: '30', method: 'drop' },
      input,
    );
    expect(outputName).toBe('clip.mp4');
    expect(args.slice(0, 4)).toEqual(['-i', 'clip.mp4', '-vf', 'fps=30']);
  });

  it('uses minterpolate when interpolation is chosen', () => {
    const { args } = framerateConverter.buildCommand({ fps: '60', method: 'interpolate' }, input);
    expect(args[3]).toBe('minterpolate=fps=60');
  });
});
