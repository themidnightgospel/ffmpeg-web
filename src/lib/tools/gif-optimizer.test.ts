import { describe, it, expect } from 'vitest';
import { gifOptimizer } from './gif-optimizer';

describe('gifOptimizer.buildCommand', () => {
  it('builds a single-command palette pipeline', () => {
    const { args, outputName } = gifOptimizer.buildCommand(
      { fps: '12', width: '480', colors: '128' },
      { name: 'big.gif' },
    );
    expect(outputName).toBe('big.min.gif');
    expect(args[0]).toBe('-i');
    expect(args[2]).toBe('-filter_complex');
    expect(args[3]).toBe(
      'fps=12,scale=480:-1:flags=lanczos,split[s0][s1];[s0]palettegen=max_colors=128[p];[s1][p]paletteuse',
    );
  });
});
