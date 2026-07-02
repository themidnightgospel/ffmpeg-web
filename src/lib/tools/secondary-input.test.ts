import { describe, it, expect } from 'vitest';
import { replaceAudioTrack } from './replace-audio-track';
import { addWatermark } from './add-watermark';
import { burnSubtitles } from './burn-subtitles';
import { pictureInPicture } from './picture-in-picture';
import { chromaKey } from './chroma-key';
import { videoComparison } from './video-comparison';

const vid = { name: 'clip.mkv', secondaryName: 'extra.dat' };

describe('replaceAudioTrack', () => {
  it('declares an audio secondary input', () => {
    expect(replaceAudioTrack.secondary?.accept).toBe('audio/*');
  });
  it('replace maps video + new audio with -shortest', () => {
    const { args, outputName } = replaceAudioTrack.buildCommand({ mode: 'replace' }, { name: 'v.mp4', secondaryName: 'a.mp3' });
    expect(outputName).toBe('v.newaudio.mp4');
    expect(args).toEqual(['-i', 'v.mp4', '-i', 'a.mp3', '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-shortest', 'v.newaudio.mp4']);
  });
  it('mix uses amix', () => {
    const { args } = replaceAudioTrack.buildCommand({ mode: 'mix' }, { name: 'v.mp4', secondaryName: 'a.mp3' });
    expect(args).toEqual(expect.arrayContaining(['-filter_complex', '[0:a][1:a]amix=inputs=2:duration=first[a]']));
  });
});

describe('addWatermark', () => {
  it('scales + fades the logo and overlays bottom-right by default', () => {
    const { args } = addWatermark.buildCommand(
      { position: 'bottom-right', scale: 120, opacity: 50, margin: 20 }, vid,
    );
    const f = args[args.indexOf('-filter_complex') + 1]!;
    expect(f).toBe('[1:v]scale=120:-1,format=rgba,colorchannelmixer=aa=0.5[wm];[0:v][wm]overlay=W-w-20:H-h-20[v]');
    expect(args).toEqual(expect.arrayContaining(['-map', '[v]', '-map', '0:a?']));
  });
  it('supports center position', () => {
    const { args } = addWatermark.buildCommand({ position: 'center', scale: 100, opacity: 100, margin: 10 }, vid);
    const f = args[args.indexOf('-filter_complex') + 1]!;
    expect(f).toContain('overlay=(W-w)/2:(H-h)/2');
  });
});

describe('burnSubtitles', () => {
  it('uses subtitles filter with force_style for SRT', () => {
    const { args, outputName } = burnSubtitles.buildCommand({ fontsize: 28 }, { name: 'm.mp4', secondaryName: 'subs.srt' });
    expect(outputName).toBe('m.subbed.mp4');
    expect(args).toEqual(expect.arrayContaining(['-vf', "subtitles=subs.srt:force_style='FontSize=28'"]));
  });
  it('uses ass filter for ASS files', () => {
    const { args } = burnSubtitles.buildCommand({ fontsize: 24 }, { name: 'm.mp4', secondaryName: 'subs.ass' });
    expect(args).toEqual(expect.arrayContaining(['-vf', 'ass=subs.ass']));
  });
});

describe('pictureInPicture', () => {
  it('mixes audio when requested', () => {
    const { args } = pictureInPicture.buildCommand(
      { position: 'top-left', scale: 320, margin: 20, audio: 'mix' },
      { name: 'main.mp4', secondaryName: 'cam.mp4' },
    );
    const f = args[args.indexOf('-filter_complex') + 1]!;
    expect(f).toBe('[1:v]scale=320:-2[pip];[0:v][pip]overlay=20:20[v];[0:a][1:a]amix=inputs=2[a]');
    expect(args).toEqual(expect.arrayContaining(['-map', '[a]']));
  });
  it('maps overlay audio only', () => {
    const { args } = pictureInPicture.buildCommand(
      { position: 'bottom-right', scale: 320, margin: 20, audio: 'overlay' },
      { name: 'main.mp4', secondaryName: 'cam.mp4' },
    );
    expect(args).toEqual(expect.arrayContaining(['-map', '1:a?']));
  });
});

describe('chromaKey', () => {
  it('keys the foreground green screen over the background', () => {
    const { args, outputName } = chromaKey.buildCommand(
      { color: 'green', similarity: 0.1, blend: 0.2 },
      { name: 'fg.mp4', secondaryName: 'bg.jpg' },
    );
    expect(outputName).toBe('fg.keyed.mp4');
    const f = args[args.indexOf('-filter_complex') + 1]!;
    expect(f).toBe('[0:v]chromakey=0x00FF00:0.1:0.2[ck];[1:v][ck]overlay[v]');
  });
  it('loops a still-image background and bounds it with -shortest', () => {
    const { args } = chromaKey.buildCommand(
      { color: 'green', similarity: 0.1, blend: 0.2 },
      { name: 'fg.mp4', secondaryName: 'bg.png' },
    );
    expect(args.slice(0, 5)).toEqual(['-i', 'fg.mp4', '-loop', '1', '-i']);
    expect(args).toContain('-shortest');
  });
  it('does not loop a video background', () => {
    const { args } = chromaKey.buildCommand(
      { color: 'blue', similarity: 0.1, blend: 0.2 },
      { name: 'fg.mp4', secondaryName: 'bg.mp4' },
    );
    expect(args).not.toContain('-loop');
    expect(args).not.toContain('-shortest');
  });
});

describe('videoComparison', () => {
  it('hstack scales to shared height', () => {
    const { args, outputName } = videoComparison.buildCommand(
      { layout: 'hstack', size: 480 },
      { name: 'a.mp4', secondaryName: 'b.mp4' },
    );
    expect(outputName).toBe('a.compare.mp4');
    const f = args[args.indexOf('-filter_complex') + 1]!;
    expect(f).toBe('[0:v]scale=-2:480[l];[1:v]scale=-2:480[r];[l][r]hstack[v]');
  });
  it('vstack scales to shared width', () => {
    const { args } = videoComparison.buildCommand({ layout: 'vstack', size: 640 }, { name: 'a.mp4', secondaryName: 'b.mp4' });
    const f = args[args.indexOf('-filter_complex') + 1]!;
    expect(f).toBe('[0:v]scale=640:-2[l];[1:v]scale=640:-2[r];[l][r]vstack[v]');
  });
});
