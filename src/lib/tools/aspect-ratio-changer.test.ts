import { describe, it, expect } from 'vitest';
import { aspectRatioChanger } from './aspect-ratio-changer';

const input = { name: 'wide.mp4' };

describe('aspectRatioChanger.buildCommand', () => {
  it('pads to fit the target ratio by default', () => {
    const { args, outputName } = aspectRatioChanger.buildCommand(
      { ratio: '9:16', method: 'pad' },
      input,
    );
    expect(outputName).toBe('wide.mp4');
    expect(args[3]).toBe(
      'scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2',
    );
  });

  it('crops to fill when selected', () => {
    const { args } = aspectRatioChanger.buildCommand({ ratio: '1:1', method: 'crop' }, input);
    expect(args[3]).toBe('scale=1080:1080:force_original_aspect_ratio=increase,crop=1080:1080');
  });
});
