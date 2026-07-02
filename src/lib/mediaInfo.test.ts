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

  it('ignores an N/A duration', () => {
    const info = parseMediaInfo('  Duration: N/A, start: 0.000000, bitrate: N/A');
    expect(info.duration).toBeUndefined();
    expect(info.bitrate).toBeUndefined();
  });

  it('parses Subtitle and Data streams', () => {
    const log = [
      '  Stream #0:2(eng): Subtitle: subrip',
      '  Stream #0:3: Data: bin_data (text)',
    ].join('\n');
    const info = parseMediaInfo(log);
    expect(info.streams.map((s) => s.kind)).toEqual(['Subtitle', 'Data']);
  });

  it('handles CRLF line endings', () => {
    const log = 'Duration: 00:00:05.00, bitrate: 800 kb/s\r\n  Stream #0:0: Video: vp9, yuv420p\r\n';
    const info = parseMediaInfo(log);
    expect(info.duration).toBe('00:00:05.00');
    expect(info.streams).toHaveLength(1);
    expect(info.streams[0]!.detail).toContain('vp9');
  });
});
