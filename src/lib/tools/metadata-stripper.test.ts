import { describe, it, expect } from 'vitest';
import { metadataStripper } from './metadata-stripper';

describe('metadataStripper.buildCommand', () => {
  it('strips metadata + chapters losslessly, preserving the container', () => {
    const { args, outputName } = metadataStripper.buildCommand(
      { chapters: true },
      { name: 'phone.mp4' },
    );
    expect(outputName).toBe('phone.cleaned.mp4');
    expect(args).toEqual([
      '-i', 'phone.mp4', '-map_metadata', '-1', '-c', 'copy', '-map_chapters', '-1', 'phone.cleaned.mp4',
    ]);
  });

  it('keeps chapters when the toggle is off', () => {
    const { args } = metadataStripper.buildCommand({ chapters: false }, { name: 'clip.mkv' });
    expect(args).toEqual(['-i', 'clip.mkv', '-map_metadata', '-1', '-c', 'copy', 'clip.cleaned.mkv']);
  });
});
