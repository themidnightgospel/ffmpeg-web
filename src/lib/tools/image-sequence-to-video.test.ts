import { describe, it, expect } from 'vitest';
import { imageSequenceToVideo } from './image-sequence-to-video';

describe('imageSequenceToVideo.buildCommand', () => {
  it('loops each image and concatenates into a slideshow', () => {
    const { args, outputName } = imageSequenceToVideo.buildCommand(
      { duration: 2, fps: 30, resolution: '1080p' },
      { name: 'a.png', names: ['a.png', 'b.png', 'c.png'] },
    );
    expect(outputName).toBe('a.slideshow.mp4');
    // Each image gets -loop 1 -t 2 -i
    expect(args.filter((a) => a === '-loop')).toHaveLength(3);
    expect(args.filter((a) => a === '-i')).toHaveLength(3);
    const fc = args[args.indexOf('-filter_complex') + 1]!;
    expect(fc).toContain('scale=1920:1080');
    expect(fc).toContain('concat=n=3:v=1:a=0[v]');
    expect(args).toEqual(expect.arrayContaining(['-pix_fmt', 'yuv420p']));
  });

  it('applies the chosen duration and resolution', () => {
    const { args } = imageSequenceToVideo.buildCommand(
      { duration: 0.5, fps: 24, resolution: '720p' },
      { name: 'a.jpg', names: ['a.jpg', 'b.jpg'] },
    );
    expect(args).toEqual(expect.arrayContaining(['-t', '0.5']));
    const fc = args[args.indexOf('-filter_complex') + 1]!;
    expect(fc).toContain('scale=1280:720');
    expect(fc).toContain('fps=24');
  });
});
