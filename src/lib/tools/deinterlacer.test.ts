import { describe, it, expect } from 'vitest';
import { deinterlacer } from './deinterlacer';

const input = { name: 'broadcast.mpg' };

describe('deinterlacer.buildCommand', () => {
  it('uses yadif mode 0 by default', () => {
    const { args, outputName } = deinterlacer.buildCommand(
      { method: 'yadif', doubleRate: false },
      input,
    );
    expect(outputName).toBe('broadcast.mp4');
    expect(args.slice(0, 4)).toEqual(['-i', 'broadcast.mpg', '-vf', 'yadif=mode=0']);
  });

  it('uses bwdif and doubles the rate when selected', () => {
    const { args } = deinterlacer.buildCommand({ method: 'bwdif', doubleRate: true }, input);
    expect(args[3]).toBe('bwdif=mode=1');
  });
});
