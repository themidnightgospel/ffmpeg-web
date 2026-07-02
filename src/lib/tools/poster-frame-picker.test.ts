import { describe, it, expect } from 'vitest';
import { posterFramePicker } from './poster-frame-picker';

describe('posterFramePicker.buildCommand', () => {
  it('exports a PNG cover frame at the timestamp', () => {
    const { args, outputName } = posterFramePicker.buildCommand({ time: 12 }, { name: 'film.mkv' });
    expect(outputName).toBe('film.poster.png');
    expect(args).toEqual(['-ss', '12', '-i', 'film.mkv', '-frames:v', '1', 'film.poster.png']);
  });
});
