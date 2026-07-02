import { describe, it, expect } from 'vitest';
import { podcastPrep } from './podcast-prep';

describe('podcastPrep.buildCommand', () => {
  it('loudnorm + MP3 at the target loudness', () => {
    const { args, outputName } = podcastPrep.buildCommand(
      { lufs: '-16', bitrate: '128', mono: false },
      { name: 'ep1.wav' },
    );
    expect(outputName).toBe('ep1.podcast.mp3');
    expect(args).toEqual([
      '-i', 'ep1.wav', '-vn', '-af', 'loudnorm=I=-16:TP=-1.5:LRA=11',
      '-c:a', 'libmp3lame', '-b:a', '128k', 'ep1.podcast.mp3',
    ]);
  });

  it('adds mono downmix when selected', () => {
    const { args } = podcastPrep.buildCommand({ lufs: '-19', bitrate: '96', mono: true }, { name: 'ep.wav' });
    expect(args).toEqual(expect.arrayContaining(['-ac', '1']));
  });
});
