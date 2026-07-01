import { describe, it, expect } from 'vitest';
import { pitchTempoChanger } from './pitch-tempo-changer';

const input = { name: 'song.wav' };

describe('pitchTempoChanger.buildCommand', () => {
  it('changes tempo with atempo, keeping pitch', () => {
    const { args } = pitchTempoChanger.buildCommand(
      { mode: 'tempo', tempo: 1.5, semitones: 0, format: 'mp3' },
      input,
    );
    expect(args).toEqual(['-i', 'song.wav', '-vn', '-af', 'atempo=1.5', '-c:a', 'libmp3lame', '-b:a', '192k', 'song.mp3']);
  });

  it('shifts pitch up an octave (+12 st) while preserving tempo', () => {
    const { args, outputName } = pitchTempoChanger.buildCommand(
      { mode: 'pitch', tempo: 1, semitones: 12, format: 'wav' },
      input,
    );
    expect(outputName).toBe('song.wav');
    expect(args[4]).toBe('aresample=44100,asetrate=88200,aresample=44100,atempo=0.5');
  });

  it('is a no-op filter chain at 0 semitones', () => {
    const { args } = pitchTempoChanger.buildCommand(
      { mode: 'pitch', tempo: 1, semitones: 0, format: 'wav' },
      input,
    );
    expect(args[4]).toBe('aresample=44100,asetrate=44100,aresample=44100,atempo=1');
  });
});
