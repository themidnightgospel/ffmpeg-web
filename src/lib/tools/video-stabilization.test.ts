import { describe, it, expect } from 'vitest';
import { videoStabilization } from './video-stabilization';

describe('videoStabilization.buildCommand', () => {
  it('applies deshake at the chosen strength', () => {
    const { args, outputName } = videoStabilization.buildCommand(
      { strength: 'medium', edge: 'mirror' },
      { name: 'shaky.mp4' },
    );
    expect(outputName).toBe('shaky.stabilized.mp4');
    expect(args).toEqual(expect.arrayContaining(['-vf', 'deshake=rx=16:ry=16:edge=mirror']));
    expect(args).toEqual(expect.arrayContaining(['-c:v', 'libx264']));
  });

  it('maps high strength to a wider search range', () => {
    const { args } = videoStabilization.buildCommand({ strength: 'high', edge: 'clamp' }, { name: 'shaky.mp4' });
    expect(args).toEqual(expect.arrayContaining(['-vf', 'deshake=rx=32:ry=32:edge=clamp']));
  });
});
