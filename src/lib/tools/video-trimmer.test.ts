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

  it('precise video mode output-seeks and re-encodes to MP4/H.264', () => {
    const { args, outputName } = videoTrimmer.buildCommand(
      { start: '00:00:10', end: '00:00:25', mode: 'precise' },
      { name: 'clip.webm' },
    );
    // Non-mp4 source still lands as playable MP4 (libx264 can't mux into webm).
    expect(outputName).toBe('clip.trim.mp4');
    expect(args.slice(0, 6)).toEqual(['-i', 'clip.webm', '-ss', '00:00:10', '-to', '00:00:25']);
    expect(args).toEqual(expect.arrayContaining(['-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-c:a', 'aac']));
  });

  it('precise audio mode re-encodes with the container encoder, keeping the extension', () => {
    const { args, outputName } = videoTrimmer.buildCommand(
      { start: '0', end: '5', mode: 'precise' },
      { name: 'song.mp3' },
    );
    expect(outputName).toBe('song.trim.mp3');
    expect(args).toEqual([
      '-i', 'song.mp3', '-ss', '0', '-to', '5', '-vn', '-c:a', 'libmp3lame', 'song.trim.mp3',
    ]);
  });

  it('fast mode preserves the source extension for audio', () => {
    const { args, outputName } = videoTrimmer.buildCommand(
      { start: '0', end: '5', mode: 'fast' },
      { name: 'song.mp3' },
    );
    expect(outputName).toBe('song.trim.mp3');
    expect(args).toEqual(['-ss', '0', '-to', '5', '-i', 'song.mp3', '-c', 'copy', 'song.trim.mp3']);
  });
});
