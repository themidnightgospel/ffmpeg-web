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
    // Force 4:2:0 so yuv444p / 10-bit sources (screen recordings) stay playable
    // in Safari/QuickTime and all browsers.
    '-pix_fmt',
    'yuv420p',
    '-c:a',
    'aac',
    '-b:a',
    '128k',
    '-movflags',
    '+faststart',
  ];
}
