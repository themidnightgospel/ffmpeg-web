// Shared audio format → ffmpeg encoder mapping, used by the audio-producing tools.
export const AUDIO_ENCODERS: Record<string, string> = {
  mp3: 'libmp3lame',
  wav: 'pcm_s16le',
  flac: 'flac',
  aac: 'aac',
  ogg: 'libvorbis',
  m4a: 'aac',
  opus: 'libopus',
};

export const LOSSLESS_AUDIO = new Set(['wav', 'flac']);

export function audioEncoder(format: string): string {
  return AUDIO_ENCODERS[format] ?? 'libmp3lame';
}
