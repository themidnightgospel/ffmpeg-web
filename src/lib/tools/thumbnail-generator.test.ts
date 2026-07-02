import { describe, it, expect } from 'vitest';
import { thumbnailGenerator } from './thumbnail-generator';

describe('thumbnailGenerator.buildCommand', () => {
  it('seeks to the timestamp and grabs one JPG frame', () => {
    const { args, outputName } = thumbnailGenerator.buildCommand(
      { time: 7, format: 'jpg' },
      { name: 'movie.mp4' },
    );
    expect(outputName).toBe('movie.thumb.jpg');
    expect(args).toEqual(['-ss', '7', '-i', 'movie.mp4', '-frames:v', '1', '-q:v', '2', 'movie.thumb.jpg']);
  });

  it('supports PNG output', () => {
    const { args, outputName } = thumbnailGenerator.buildCommand(
      { time: 0, format: 'png' },
      { name: 'movie.mp4' },
    );
    expect(outputName).toBe('movie.thumb.png');
    expect(args).toEqual(['-ss', '0', '-i', 'movie.mp4', '-frames:v', '1', 'movie.thumb.png']);
  });
});
