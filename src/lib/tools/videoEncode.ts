// Standard H.264/AAC MP4 encode tail for transform tools that must re-encode
// (rotate, crop, resize, speed, framerate, color, aspect). Keeps output robust
// and playable everywhere. Compressor/converter have their own richer controls.
export function h264Tail(crf = 20): string[] {
  return [
    '-c:v',
    'libx264',
    '-crf',
    String(crf),
    '-preset',
    'veryfast',
    '-c:a',
    'aac',
    '-b:a',
    '128k',
    '-movflags',
    '+faststart',
  ];
}
