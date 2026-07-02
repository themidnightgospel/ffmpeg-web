import { describe, it, expect } from 'vitest';
import { cropTool } from './crop-tool';

const base = { mode: 'aspect', ratio: '1:1', top: 0, bottom: 0, left: 0, right: 0 };

describe('cropTool.buildCommand', () => {
  it('builds a centered even-floored aspect crop', () => {
    const { args, outputName } = cropTool.buildCommand({ ...base, ratio: '1:1' }, { name: 'clip.mp4' });
    expect(outputName).toBe('clip.crop.mp4');
    const vf = args[args.indexOf('-vf') + 1]!;
    expect(vf).toBe('crop=floor(if(gt(a\\,1)\\,ih*1\\,iw)/2)*2:floor(if(gt(a\\,1)\\,ih\\,iw/1)/2)*2');
    expect(args).toEqual(expect.arrayContaining(['-c:v', 'libx264']));
  });

  it('builds an edge-trim crop with offsets', () => {
    const { args } = cropTool.buildCommand(
      { ...base, mode: 'edges', top: 10, bottom: 20, left: 4, right: 6 },
      { name: 'clip.mp4' },
    );
    const vf = args[args.indexOf('-vf') + 1]!;
    expect(vf).toBe('crop=floor((iw-4-6)/2)*2:floor((ih-10-20)/2)*2:4:10');
  });

  it('disables ratio in edges mode and edge steppers in aspect mode', () => {
    const ratio = cropTool.options.find((o) => o.id === 'ratio')!;
    const top = cropTool.options.find((o) => o.id === 'top')!;
    expect(ratio.disabledWhen?.({ mode: 'edges' })).toBe(true);
    expect(ratio.disabledWhen?.({ mode: 'aspect' })).toBe(false);
    expect(top.disabledWhen?.({ mode: 'aspect' })).toBe(true);
    expect(top.disabledWhen?.({ mode: 'edges' })).toBe(false);
  });
});
