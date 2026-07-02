import { describe, it, expect } from 'vitest';
import { videoResizer } from './video-resizer';

describe('videoResizer.buildCommand', () => {
  it('scales to the target height with the chosen scaler, keeping even width', () => {
    const { args, outputName } = videoResizer.buildCommand(
      { height: '720', scaler: 'lanczos' },
      { name: 'clip.mkv' },
    );
    expect(outputName).toBe('clip.mp4');
    expect(args).toEqual([
      '-i', 'clip.mkv',
      '-vf', 'scale=-2:720:flags=lanczos',
      '-c:v', 'libx264', '-crf', '20', '-preset', 'veryfast', '-pix_fmt', 'yuv420p',
      '-c:a', 'aac', '-b:a', '128k',
      '-movflags', '+faststart', 'clip.mp4',
    ]);
  });
});
