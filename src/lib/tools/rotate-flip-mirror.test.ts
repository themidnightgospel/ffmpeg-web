import { describe, it, expect } from 'vitest';
import { rotateFlipMirror } from './rotate-flip-mirror';

const input = { name: 'phone.mov' };

describe('rotateFlipMirror.buildCommand', () => {
  it('rotates 90° clockwise via transpose', () => {
    const { args, outputName } = rotateFlipMirror.buildCommand({ op: '90cw' }, input);
    expect(outputName).toBe('phone.mp4');
    expect(args.slice(0, 5)).toEqual(['-i', 'phone.mov', '-vf', 'transpose=1', '-c:v']);
  });

  it('rotates 180° with two transposes', () => {
    const { args } = rotateFlipMirror.buildCommand({ op: '180' }, input);
    expect(args[3]).toBe('transpose=2,transpose=2');
  });

  it('mirrors horizontally with hflip', () => {
    const { args } = rotateFlipMirror.buildCommand({ op: 'hflip' }, input);
    expect(args[3]).toBe('hflip');
  });
});
