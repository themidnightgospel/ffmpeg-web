import { describe, it, expect } from 'vitest';
import { timeToSeconds, secondsToTime, normalizeTime } from './format';

describe('timeToSeconds', () => {
  it('parses bare seconds', () => expect(timeToSeconds('90')).toBe(90));
  it('parses MM:SS', () => expect(timeToSeconds('1:30')).toBe(90));
  it('parses HH:MM:SS with fraction', () => expect(timeToSeconds('01:02:03.5')).toBe(3723.5));
  it('rejects garbage', () => expect(Number.isNaN(timeToSeconds('abc'))).toBe(true));
  it('rejects empty', () => expect(Number.isNaN(timeToSeconds('  '))).toBe(true));
  it('rejects empty segments', () => expect(Number.isNaN(timeToSeconds('1::2'))).toBe(true));
});

describe('secondsToTime', () => {
  it('formats HH:MM:SS', () => expect(secondsToTime(3723)).toBe('01:02:03'));
  it('formats milliseconds', () => expect(secondsToTime(3723.5, true)).toBe('01:02:03.500'));
  it('clamps negatives', () => expect(secondsToTime(-5)).toBe('00:00:00'));
});

describe('normalizeTime', () => {
  it('canonicalizes loose input', () => expect(normalizeTime('1:30')).toBe('00:01:30'));
  it('returns empty for garbage', () => expect(normalizeTime('nope')).toBe(''));
});
