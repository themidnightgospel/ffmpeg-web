import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const run = promisify(execFile);

export const FIXTURE_DIR = fileURLToPath(new URL('./.fixtures/', import.meta.url));

// A tiny valid clip per source format, synthesized with the native ffmpeg the CI
// runner installs. Kept small so the matrix stays fast; deterministic inputs.
const COMMON = [
  '-f', 'lavfi', '-i', 'testsrc=duration=1:size=160x120:rate=10',
  '-f', 'lavfi', '-i', 'sine=frequency=440:duration=1',
  '-shortest', '-pix_fmt', 'yuv420p',
];

const RECIPES: Record<string, string[]> = {
  mp4: [...COMMON, '-c:v', 'libx264', '-c:a', 'aac'],
  mov: [...COMMON, '-c:v', 'libx264', '-c:a', 'aac'],
  mkv: [...COMMON, '-c:v', 'libx264', '-c:a', 'aac'],
  webm: [...COMMON, '-c:v', 'libvpx-vp9', '-b:v', '200k', '-c:a', 'libopus'],
  avi: [...COMMON, '-c:v', 'mpeg4', '-c:a', 'libmp3lame'],
  flv: [...COMMON, '-c:v', 'flv', '-c:a', 'libmp3lame'],
};

export default async function globalSetup(): Promise<void> {
  await mkdir(FIXTURE_DIR, { recursive: true });
  for (const [ext, args] of Object.entries(RECIPES)) {
    const out = `${FIXTURE_DIR}sample.${ext}`;
    if (existsSync(out)) continue;
    await run('ffmpeg', ['-y', ...args, out]);
    // eslint-disable-next-line no-console
    console.log(`[fixtures] created sample.${ext}`);
  }
}
