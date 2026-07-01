import { describe, it, expect } from 'vitest';
import { PAIRS, getPair, relatedPairs } from './pairs';

describe('conversion pairs', () => {
  it('generates every ordered video pair (6 formats → 30 pairs)', () => {
    expect(PAIRS).toHaveLength(30);
    expect(PAIRS.every((p) => p.from.id !== p.to.id)).toBe(true);
  });

  it('uses from-to slugs and points at the video converter', () => {
    const pair = getPair('mp4-to-mov');
    expect(pair).toBeDefined();
    expect(pair?.from.id).toBe('mp4');
    expect(pair?.to.id).toBe('mov');
    expect(pair?.toolSlug).toBe('video-converter');
  });

  it('lists the reverse pair first among related conversions', () => {
    const pair = getPair('mp4-to-mov');
    expect(pair).toBeDefined();
    const related = relatedPairs(pair!);
    expect(related[0]?.slug).toBe('mov-to-mp4');
    expect(related.every((p) => p.slug !== pair!.slug)).toBe(true);
  });
});
