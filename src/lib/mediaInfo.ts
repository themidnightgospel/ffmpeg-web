/* Pure parser for ffmpeg's `-i` stderr banner → structured media info.
   Kept framework-free and unit-tested; consumed by the metadata viewer. */

export interface MediaStream {
  index: string;
  kind: 'Video' | 'Audio' | 'Subtitle' | 'Data';
  detail: string;
}

export interface MediaInfo {
  duration?: string;
  bitrate?: string;
  streams: MediaStream[];
}

const STREAM_KINDS = ['Video', 'Audio', 'Subtitle', 'Data'] as const;

/** Parse the log emitted by `ffmpeg -i <file>`. */
export function parseMediaInfo(log: string): MediaInfo {
  const info: MediaInfo = { streams: [] };

  const dur = /Duration:\s*([0-9:.]+)/.exec(log);
  if (dur && dur[1] !== 'N/A') info.duration = dur[1];

  const br = /bitrate:\s*([0-9]+\s*kb\/s)/.exec(log);
  if (br) info.bitrate = br[1];

  for (const line of log.split('\n')) {
    const m = /Stream #([0-9]+:[0-9]+)[^:]*:\s*(Video|Audio|Subtitle|Data):\s*(.*)$/.exec(line.trim());
    if (m) {
      const kind = m[2] as (typeof STREAM_KINDS)[number];
      info.streams.push({ index: m[1]!, kind, detail: (m[3] ?? '').trim() });
    }
  }

  return info;
}
