import { describe, it, expect } from 'vitest';
import { humanSize, slugify, baseName, extension } from './format';

describe('humanSize', () => {
  it('formats zero and bytes', () => {
    expect(humanSize(0)).toBe('0 B');
    expect(humanSize(512)).toBe('512 B');
  });

  it('scales to KB/MB/GB with sensible precision', () => {
    expect(humanSize(1024)).toBe('1.0 KB');
    expect(humanSize(24_700_000)).toBe('24 MB');
    expect(humanSize(3_221_225_472)).toBe('3.0 GB');
  });

  it('returns empty string for non-finite input', () => {
    expect(humanSize(Number.NaN)).toBe('');
    expect(humanSize(Number.POSITIVE_INFINITY)).toBe('');
  });
});

describe('slugify', () => {
  it('lowercases and hyphenates', () => {
    expect(slugify('Video Converter')).toBe('video-converter');
  });

  it('collapses symbols and trims edge hyphens', () => {
    expect(slugify('Video → GIF')).toBe('video-gif');
    expect(slugify('Rotate / Flip / Mirror')).toBe('rotate-flip-mirror');
  });
});

describe('baseName / extension', () => {
  it('splits a filename', () => {
    expect(baseName('clip.final.mov')).toBe('clip.final');
    expect(extension('clip.final.MOV')).toBe('mov');
  });

  it('handles names without an extension', () => {
    expect(baseName('README')).toBe('README');
    expect(extension('README')).toBe('');
  });
});
