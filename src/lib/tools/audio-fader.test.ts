import { describe, it, expect } from 'vitest';
import { audioFader } from './audio-fader';

describe('audioFader.buildCommand', () => {
  it('applies fade-in and fade-out (via areverse)', () => {
    const { args, outputName } = audioFader.buildCommand(
      { fadeIn: 2, fadeOut: 2, format: 'mp3' },
      { name: 'song.wav' },
    );
    expect(outputName).toBe('song.faded.mp3');
    expect(args).toContain('-af');
    expect(args[args.indexOf('-af') + 1]).toBe(
      'afade=t=in:st=0:d=2,areverse,afade=t=in:st=0:d=2,areverse',
    );
  });

  it('omits the filter entirely when both fades are 0', () => {
    const { args } = audioFader.buildCommand({ fadeIn: 0, fadeOut: 0, format: 'wav' }, { name: 'a.wav' });
    expect(args).not.toContain('-af');
  });
});
