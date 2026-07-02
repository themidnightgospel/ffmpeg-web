import { describe, it, expect } from 'vitest';
import { extractSubtitles } from './extract-subtitles';

describe('extractSubtitles.buildCommand', () => {
  it('maps the chosen subtitle track to SRT', () => {
    const { args, outputName } = extractSubtitles.buildCommand(
      { track: 0, format: 'srt' },
      { name: 'film.mkv' },
    );
    expect(outputName).toBe('film.srt');
    expect(args).toEqual(['-i', 'film.mkv', '-map', '0:s:0', 'film.srt']);
  });

  it('supports a second track and VTT', () => {
    const { args, outputName } = extractSubtitles.buildCommand(
      { track: 1, format: 'vtt' },
      { name: 'film.mkv' },
    );
    expect(outputName).toBe('film.vtt');
    expect(args).toEqual(['-i', 'film.mkv', '-map', '0:s:1', 'film.vtt']);
  });
});
