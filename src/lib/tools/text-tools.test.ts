import { describe, it, expect } from 'vitest';
import { escapeDrawtext, drawtextFilter, CAPTION_FONT } from './drawtext';
import { addTextOverlay } from './add-text-overlay';
import { memeCaption } from './meme-caption';
import { gifMaker } from './gif-maker';

describe('escapeDrawtext', () => {
  it('escapes filtergraph and drawtext specials', () => {
    expect(escapeDrawtext("a:b,c'd")).toBe("a\\:b\\,c\\'d");
    expect(escapeDrawtext('50%')).toBe('50\\%');
    expect(escapeDrawtext('a[b];c')).toBe('a\\[b\\]\\;c');
  });
});

describe('drawtextFilter', () => {
  it('builds a font-based drawtext string', () => {
    const f = drawtextFilter({ text: 'Hi', fontsize: 48, color: 'white', x: '(w-text_w)/2', y: '40' });
    expect(f).toContain('fontfile=font.ttf');
    expect(f).toContain('text=Hi');
    expect(f).toContain('fontsize=48');
    expect(f).toContain('expansion=none');
  });
  it('adds border and box when requested', () => {
    const f = drawtextFilter({ text: 'x', fontsize: 20, color: 'white', x: '0', y: '0', borderw: 4, box: true });
    expect(f).toContain('borderw=4');
    expect(f).toContain('box=1');
  });
});

describe('addTextOverlay', () => {
  it('stages the caption font and centers text at the bottom', () => {
    expect(addTextOverlay.assets).toEqual([CAPTION_FONT]);
    const { args, outputName } = addTextOverlay.buildCommand(
      { text: 'Hello', position: 'bottom', fontsize: 48, color: 'white', box: true },
      { name: 'v.mp4' },
    );
    expect(outputName).toBe('v.captioned.mp4');
    const vf = args[args.indexOf('-vf') + 1]!;
    expect(vf).toContain('text=Hello');
    expect(vf).toContain('y=h-text_h-40');
  });
});

describe('memeCaption', () => {
  it('draws uppercased top and bottom text with an outline', () => {
    const { args, outputName } = memeCaption.buildCommand(
      { top: 'top text', bottom: 'bottom text', fontsize: 48 },
      { name: 'v.mp4' },
    );
    expect(outputName).toBe('v.meme.mp4');
    const vf = args[args.indexOf('-vf') + 1]!;
    expect(vf).toContain('text=TOP TEXT');
    expect(vf).toContain('text=BOTTOM TEXT');
    expect(vf).toContain('borderw=4');
    expect(vf.split('drawtext=').length).toBe(3); // two drawtext filters
  });
  it('omits empty positions', () => {
    const { args } = memeCaption.buildCommand({ top: 'only top', bottom: '', fontsize: 48 }, { name: 'v.mp4' });
    const vf = args[args.indexOf('-vf') + 1]!;
    expect(vf.split('drawtext=').length).toBe(2); // one drawtext filter
  });
});

describe('gifMaker', () => {
  it('builds a single-pass palette GIF with trim', () => {
    const { args, outputName } = gifMaker.buildCommand(
      { start: '00:00:03', duration: 4, width: 480, fps: 15, caption: '' },
      { name: 'v.mp4' },
    );
    expect(outputName).toBe('v.gif');
    expect(args.slice(0, 6)).toEqual(['-ss', '00:00:03', '-t', '4', '-i', 'v.mp4']);
    const fc = args[args.indexOf('-filter_complex') + 1]!;
    expect(fc).toBe('[0:v]fps=15,scale=480:-1:flags=lanczos,split[a][b];[a]palettegen=stats_mode=diff[p];[b][p]paletteuse=dither=bayer');
  });
  it('inserts a caption into the graph when provided', () => {
    const { args } = gifMaker.buildCommand(
      { start: '0', duration: 3, width: 480, fps: 12, caption: 'lol' },
      { name: 'v.mp4' },
    );
    const fc = args[args.indexOf('-filter_complex') + 1]!;
    expect(fc).toContain('text=LOL');
    expect(fc).toContain('palettegen');
  });
});
