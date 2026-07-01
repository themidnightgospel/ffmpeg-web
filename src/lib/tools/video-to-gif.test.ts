import { describe, it, expect } from 'vitest';
import { videoToGif } from './video-to-gif';

describe('videoToGif.buildCommand', () => {
  it('builds an fps + scale filter and limits duration', () => {
    const { args, outputName } = videoToGif.buildCommand(
      { duration: 6, fps: '15', width: '480' },
      { name: 'clip.mp4' },
    );
    expect(outputName).toBe('clip.gif');
    expect(args).toEqual([
      '-i', 'clip.mp4', '-t', '6', '-vf', 'fps=15,scale=480:-1:flags=lanczos', 'clip.gif',
    ]);
  });
});
