import { describe, it, expect } from 'vitest';
import { videoToAudioExtractor } from './video-to-audio-extractor';

const input = { name: 'movie.mp4' };

describe('videoToAudioExtractor.buildCommand', () => {
  it('re-encodes to MP3 with a bitrate by default', () => {
    const { args, outputName } = videoToAudioExtractor.buildCommand(
      { format: 'mp3', bitrate: '192', copy: false },
      input,
    );
    expect(outputName).toBe('movie.mp3');
    expect(args).toEqual(['-i', 'movie.mp4', '-vn', '-c:a', 'libmp3lame', '-b:a', '192k', 'movie.mp3']);
  });

  it('copies the original stream losslessly into .mka when "keep original" is on', () => {
    const { args, outputName } = videoToAudioExtractor.buildCommand(
      { format: 'mp3', bitrate: '192', copy: true },
      input,
    );
    expect(outputName).toBe('movie.mka');
    expect(args).toEqual(['-i', 'movie.mp4', '-vn', '-c:a', 'copy', 'movie.mka']);
  });

  it('omits bitrate for lossless FLAC', () => {
    const { args } = videoToAudioExtractor.buildCommand(
      { format: 'flac', bitrate: '192', copy: false },
      input,
    );
    expect(args).toEqual(['-i', 'movie.mp4', '-vn', '-c:a', 'flac', 'movie.flac']);
  });
});
