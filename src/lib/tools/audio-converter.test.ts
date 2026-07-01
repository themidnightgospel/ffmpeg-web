import { describe, it, expect } from 'vitest';
import { audioConverter } from './audio-converter';

const input = { name: 'song.wav' };

describe('audioConverter.buildCommand', () => {
  it('encodes MP3 with a bitrate by default', () => {
    const { args, outputName } = audioConverter.buildCommand(
      { format: 'mp3', bitrate: '192', samplerate: 'source' },
      input,
    );
    expect(outputName).toBe('song.mp3');
    expect(args).toEqual(['-i', 'song.wav', '-vn', '-c:a', 'libmp3lame', '-b:a', '192k', 'song.mp3']);
  });

  it('omits bitrate for lossless targets (FLAC/WAV)', () => {
    const { args } = audioConverter.buildCommand(
      { format: 'flac', bitrate: '192', samplerate: 'source' },
      { name: 'clip.m4a' },
    );
    expect(args).toEqual(['-i', 'clip.m4a', '-vn', '-c:a', 'flac', 'clip.flac']);
  });

  it('applies a sample-rate override and maps Opus/OGG encoders', () => {
    const { args } = audioConverter.buildCommand(
      { format: 'opus', bitrate: '96', samplerate: '48000' },
      { name: 'voice.wav' },
    );
    expect(args).toEqual([
      '-i', 'voice.wav', '-vn', '-c:a', 'libopus', '-b:a', '96k', '-ar', '48000', 'voice.opus',
    ]);
  });
});
