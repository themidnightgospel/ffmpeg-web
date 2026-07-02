import { describe, it, expect } from 'vitest';
import { parseMediaInfo } from './mediaInfo';

const SAMPLE = `
Input #0, mov,mp4,m4a,3gp,3g2,mj2, from 'clip.mp4':
  Metadata:
    major_brand     : isom
  Duration: 00:01:23.45, start: 0.000000, bitrate: 1536 kb/s
  Stream #0:0(und): Video: h264 (High), yuv420p, 1920x1080, 1400 kb/s, 30 fps
  Stream #0:1(und): Audio: aac (LC), 48000 Hz, stereo, fltp, 128 kb/s
`;

describe('parseMediaInfo', () => {
  it('extracts duration and overall bitrate', () => {
    const info = parseMediaInfo(SAMPLE);
    expect(info.duration).toBe('00:01:23.45');
    expect(info.bitrate).toBe('1536 kb/s');
  });

  it('extracts video and audio streams', () => {
    const info = parseMediaInfo(SAMPLE);
    expect(info.streams).toHaveLength(2);
    expect(info.streams[0]).toMatchObject({ index: '0:0', kind: 'Video' });
    expect(info.streams[0]!.detail).toContain('1920x1080');
    expect(info.streams[1]).toMatchObject({ index: '0:1', kind: 'Audio' });
    expect(info.streams[1]!.detail).toContain('stereo');
  });

  it('handles logs without recognizable info', () => {
    const info = parseMediaInfo('some unrelated output');
    expect(info.duration).toBeUndefined();
    expect(info.streams).toHaveLength(0);
  });
});
