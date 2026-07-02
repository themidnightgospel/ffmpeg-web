import { describe, it, expect } from 'vitest';
import { videoToImageSequence } from './video-to-image-sequence';
import { mediaSplitter } from './media-splitter';

describe('videoToImageSequence.buildCommand', () => {
  it('extracts frames at the chosen fps and collects them as a ZIP', () => {
    const { args, outputName, collectPrefix } = videoToImageSequence.buildCommand(
      { fps: 2, format: 'png' },
      { name: 'clip.mp4' },
    );
    expect(outputName).toBe('clip.frames.zip');
    expect(collectPrefix).toBe('frame_');
    expect(args).toEqual(['-i', 'clip.mp4', '-vf', 'fps=2', 'frame_%04d.png']);
  });

  it('supports JPG output', () => {
    const { args } = videoToImageSequence.buildCommand({ fps: 1, format: 'jpg' }, { name: 'clip.mp4' });
    expect(args[args.length - 1]).toBe('frame_%04d.jpg');
  });
});

describe('mediaSplitter.buildCommand', () => {
  it('segments by duration with stream copy, preserving extension', () => {
    const { args, outputName, collectPrefix } = mediaSplitter.buildCommand(
      { seconds: 60 },
      { name: 'movie.mkv' },
    );
    expect(outputName).toBe('movie.parts.zip');
    expect(collectPrefix).toBe('part_');
    expect(args).toEqual([
      '-i', 'movie.mkv', '-c', 'copy', '-f', 'segment',
      '-segment_time', '60', '-reset_timestamps', '1', 'part_%03d.mkv',
    ]);
  });
});
