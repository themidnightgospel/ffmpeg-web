import { describe, it, expect } from 'vitest';
import { contactSheet } from './contact-sheet';

describe('contactSheet.buildCommand', () => {
  it('samples frames and tiles them into one image', () => {
    const { args, outputName } = contactSheet.buildCommand(
      { grid: '4x4', interval: 10, thumbWidth: '240' },
      { name: 'movie.mp4' },
    );
    expect(outputName).toBe('movie.contact.png');
    expect(args).toEqual([
      '-i', 'movie.mp4', '-frames:v', '1', '-vf',
      'fps=1/10,scale=240:-1,tile=4x4', 'movie.contact.png',
    ]);
  });
});
