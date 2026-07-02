import { describe, it, expect } from 'vitest';
import { fitUnderTargetSize } from './fit-under-target-size';

describe('fitUnderTargetSize.buildCommand', () => {
  it('computes a video bitrate from target size and duration', () => {
    // 25 MB, 60s, 128k audio → totalKbits = 25*8*1000*0.95 = 190000; /60 = 3166.6 → 3166; -128 = 3038
    const { args, outputName } = fitUnderTargetSize.buildCommand(
      { targetMB: 25, audioKbps: '128' },
      { name: 'big.mp4', durationSec: 60 },
    );
    expect(outputName).toBe('big.fit.mp4');
    const bv = args[args.indexOf('-b:v') + 1];
    expect(bv).toBe('3038k');
    expect(args).toEqual(expect.arrayContaining(['-c:a', 'aac', '-b:a', '128k']));
    expect(args).toEqual(expect.arrayContaining(['-maxrate', '3038k', '-bufsize', '6076k']));
  });

  it('clamps to a minimum video bitrate for tiny targets', () => {
    const { args } = fitUnderTargetSize.buildCommand(
      { targetMB: 1, audioKbps: '128' },
      { name: 'big.mp4', durationSec: 600 },
    );
    expect(args[args.indexOf('-b:v') + 1]).toBe('100k');
  });

  it('falls back to CRF when duration is unavailable', () => {
    const { args } = fitUnderTargetSize.buildCommand(
      { targetMB: 25, audioKbps: '128' },
      { name: 'big.mp4', durationSec: 0 },
    );
    expect(args).toEqual(expect.arrayContaining(['-crf', '28']));
    expect(args).not.toContain('-b:v');
  });
});
