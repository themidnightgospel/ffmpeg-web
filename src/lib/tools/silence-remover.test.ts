import { describe, it, expect } from 'vitest';
import { silenceRemover } from './silence-remover';

describe('silenceRemover.buildCommand', () => {
  it('builds a silenceremove filter with threshold + min duration', () => {
    const { args, outputName } = silenceRemover.buildCommand(
      { threshold: '-40', minDuration: 1, format: 'mp3' },
      { name: 'talk.wav' },
    );
    expect(outputName).toBe('talk.trimmed.mp3');
    expect(args).toEqual([
      '-i', 'talk.wav', '-vn', '-af',
      'silenceremove=stop_periods=-1:stop_duration=1:stop_threshold=-40dB',
      '-c:a', 'libmp3lame', '-b:a', '192k', 'talk.trimmed.mp3',
    ]);
  });
});
