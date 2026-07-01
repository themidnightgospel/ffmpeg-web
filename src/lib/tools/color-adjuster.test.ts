import { describe, it, expect } from 'vitest';
import { colorAdjuster } from './color-adjuster';

describe('colorAdjuster.buildCommand', () => {
  it('builds an eq + hue filter from the values', () => {
    const { args, outputName } = colorAdjuster.buildCommand(
      { brightness: 0.06, contrast: 1.1, saturation: 1.2, gamma: 1, hue: 10 },
      { name: 'clip.mov' },
    );
    expect(outputName).toBe('clip.mp4');
    expect(args[2]).toBe('-vf');
    expect(args[3]).toBe('eq=brightness=0.06:contrast=1.1:saturation=1.2:gamma=1,hue=h=10');
  });

  it('is a no-op filter at defaults', () => {
    const { args } = colorAdjuster.buildCommand(
      { brightness: 0, contrast: 1, saturation: 1, gamma: 1, hue: 0 },
      { name: 'clip.mp4' },
    );
    expect(args[3]).toBe('eq=brightness=0:contrast=1:saturation=1:gamma=1,hue=h=0');
  });
});
