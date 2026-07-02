import { describe, it, expect } from 'vitest';
import { videoConverter } from './video-converter';

const input = { name: 'clip.mov' };

describe('videoConverter.buildCommand', () => {
  it('transcodes to MP4 / H.264 / AAC by default', () => {
    const { args, outputName } = videoConverter.buildCommand(
      { format: 'mp4', vcodec: 'h264', acodec: 'aac', remux: false, crf: 23 },
      input,
    );
    expect(outputName).toBe('clip.mp4');
    expect(args).toEqual([
      '-i', 'clip.mov',
      '-c:v', 'libx264',
      '-crf', '23',
      '-c:a', 'aac',
      'clip.mp4',
    ]);
  });

  it('copies streams when remuxing (no re-encode, no CRF)', () => {
    const { args, outputName } = videoConverter.buildCommand(
      { format: 'mp4', vcodec: 'h264', acodec: 'aac', remux: true, crf: 23 },
      input,
    );
    expect(outputName).toBe('clip.mp4');
    expect(args).toEqual(['-i', 'clip.mov', '-c', 'copy', 'clip.mp4']);
  });

  it('omits CRF when keeping the original video codec', () => {
    const { args } = videoConverter.buildCommand(
      { format: 'mkv', vcodec: 'copy', acodec: 'opus', remux: false, crf: 23 },
      input,
    );
    expect(args).toEqual(['-i', 'clip.mov', '-c:v', 'copy', '-c:a', 'libopus', 'clip.mkv']);
  });

  it('forces VP8 + Opus for WebM, overriding incompatible codec choices', () => {
    const { args, outputName } = videoConverter.buildCommand(
      { format: 'webm', vcodec: 'h264', acodec: 'aac', remux: false, crf: 30 },
      input,
    );
    expect(outputName).toBe('clip.webm');
    expect(args).toEqual([
      '-i', 'clip.mov',
      '-c:v', 'libvpx', '-crf', '10', '-b:v', '1M',
      '-c:a', 'libopus',
      'clip.webm',
    ]);
  });
});
