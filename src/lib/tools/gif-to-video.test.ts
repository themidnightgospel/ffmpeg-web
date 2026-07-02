import { describe, it, expect } from 'vitest';
import { gifToVideo } from './gif-to-video';

const input = { name: 'meme.gif' };

describe('gifToVideo.buildCommand', () => {
  it('converts to MP4 with even dimensions + yuv420p + faststart', () => {
    const { args, outputName } = gifToVideo.buildCommand({ format: 'mp4' }, input);
    expect(outputName).toBe('meme.mp4');
    expect(args).toEqual([
      '-i', 'meme.gif',
      '-vf', 'scale=trunc(iw/2)*2:trunc(ih/2)*2',
      '-pix_fmt', 'yuv420p',
      '-c:v', 'libx264', '-crf', '23',
      '-movflags', '+faststart', 'meme.mp4',
    ]);
  });

  it('converts to WebM with VP8', () => {
    const { args, outputName } = gifToVideo.buildCommand({ format: 'webm' }, input);
    expect(outputName).toBe('meme.webm');
    expect(args).toEqual(expect.arrayContaining(['-c:v', 'libvpx']));
  });
});
