import { describe, it, expect } from 'vitest';
import { videoTrimmer } from './video-trimmer';

describe('videoTrimmer.buildCommand', () => {
  it('fast mode input-seeks and stream-copies', () => {
    const { args, outputName } = videoTrimmer.buildCommand(
      { start: '00:00:10', end: '00:00:25', mode: 'fast' },
      { name: 'clip.mp4' },
    );
    expect(outputName).toBe('clip.trim.mp4');
    expect(args).toEqual(['-ss', '00:00:10', '-to', '00:00:25', '-i', 'clip.mp4', '-c', 'copy', 'clip.trim.mp4']);
  });

  it('precise mode output-seeks and re-encodes', () => {
    const { args } = videoTrimmer.buildCommand(
      { start: '00:00:10', end: '00:00:25', mode: 'precise' },
      { name: 'clip.mp4' },
    );
    expect(args).toEqual([
      '-i', 'clip.mp4', '-ss', '00:00:10', '-to', '00:00:25',
      '-c:v', 'libx264', '-c:a', 'aac', 'clip.trim.mp4',
    ]);
  });

  it('preserves the source extension', () => {
    const { outputName } = videoTrimmer.buildCommand(
      { start: '0', end: '5', mode: 'fast' },
      { name: 'song.mp3' },
    );
    expect(outputName).toBe('song.trim.mp3');
  });
});
