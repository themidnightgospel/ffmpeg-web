import { describe, it, expect } from 'vitest';
import { socialMediaPresets } from './social-media-presets';

describe('socialMediaPresets.buildCommand', () => {
  it('pads to the 9:16 Reels canvas by default', () => {
    const { args, outputName } = socialMediaPresets.buildCommand(
      { preset: 'reels', fit: 'pad' },
      { name: 'clip.mov' },
    );
    expect(outputName).toBe('clip.reels.mp4');
    expect(args).toEqual(expect.arrayContaining([
      '-vf', 'scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2',
    ]));
    expect(args).toEqual(expect.arrayContaining(['-c:v', 'libx264']));
  });

  it('crops to fill for a square feed post', () => {
    const { args } = socialMediaPresets.buildCommand({ preset: 'square', fit: 'crop' }, { name: 'clip.mov' });
    expect(args).toEqual(expect.arrayContaining([
      '-vf', 'scale=1080:1080:force_original_aspect_ratio=increase,crop=1080:1080',
    ]));
  });

  it('falls back to Reels for an unknown preset', () => {
    const { outputName } = socialMediaPresets.buildCommand({ preset: 'nope', fit: 'pad' }, { name: 'clip.mov' });
    expect(outputName).toBe('clip.nope.mp4');
  });
});
