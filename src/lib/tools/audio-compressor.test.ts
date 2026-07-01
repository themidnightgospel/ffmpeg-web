import { describe, it, expect } from 'vitest';
import { audioCompressor } from './audio-compressor';

const input = { name: 'podcast.wav' };

describe('audioCompressor.buildCommand', () => {
  it('compresses to Opus at the chosen bitrate by default', () => {
    const { args, outputName } = audioCompressor.buildCommand(
      { codec: 'opus', bitrate: '96', mono: false, samplerate: 'source' },
      input,
    );
    expect(outputName).toBe('podcast.opus');
    expect(args).toEqual(['-i', 'podcast.wav', '-vn', '-c:a', 'libopus', '-b:a', '96k', 'podcast.opus']);
  });

  it('adds mono downmix and sample-rate, and maps AAC → .m4a', () => {
    const { args, outputName } = audioCompressor.buildCommand(
      { codec: 'aac', bitrate: '64', mono: true, samplerate: '22050' },
      input,
    );
    expect(outputName).toBe('podcast.m4a');
    expect(args).toEqual([
      '-i', 'podcast.wav', '-vn', '-c:a', 'aac', '-b:a', '64k', '-ac', '1', '-ar', '22050', 'podcast.m4a',
    ]);
  });
});
