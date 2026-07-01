import { test, expect } from '@playwright/test';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { readdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { FIXTURE_DIR } from './global-setup';

const run = promisify(execFile);

const DIST_CONVERT = fileURLToPath(new URL('../../dist/convert/', import.meta.url));

/* The matrix is DISCOVERED from the built pages: every /convert/{from}-to-{to}
   directory in dist becomes a test. This enforces the governance rule directly —
   every generated conversion page must have a working conversion. */
const pairs = readdirSync(DIST_CONVERT, { withFileTypes: true })
  .filter((d) => d.isDirectory() && d.name.includes('-to-'))
  .map((d) => {
    const [from, to] = d.name.split('-to-');
    return { slug: d.name, from: from ?? '', to: to ?? '' };
  });

// ffprobe `format_name` groups several extensions together — accept any token
// in the target's group as proof the container is correct.
const FORMAT_TOKENS: Record<string, string[]> = {
  mp4: ['mp4', 'mov', 'm4a'],
  mov: ['mov', 'mp4'],
  mkv: ['matroska', 'webm'],
  webm: ['matroska', 'webm'],
  avi: ['avi'],
  flv: ['flv'],
};

async function probe(path: string): Promise<{ format: string; hasVideo: boolean }> {
  const { stdout } = await run('ffprobe', [
    '-v', 'error',
    '-show_entries', 'format=format_name:stream=codec_type',
    '-of', 'json',
    path,
  ]);
  const info = JSON.parse(stdout) as {
    format?: { format_name?: string };
    streams?: { codec_type?: string }[];
  };
  return {
    format: info.format?.format_name ?? '',
    hasVideo: (info.streams ?? []).some((s) => s.codec_type === 'video'),
  };
}

test.describe('conversion matrix', () => {
  test(`discovered ${pairs.length} conversion pages`, () => {
    expect(pairs.length).toBeGreaterThan(0);
  });

  for (const { slug, from, to } of pairs) {
    test(slug, async ({ page }) => {
      await page.goto(`/convert/${slug}`);
      // The island is server-rendered; wait until React has hydrated enough to
      // accept a file (the Convert button reacts to selection).
      const convert = page.getByRole('button', { name: /convert/i });
      await expect(convert).toBeVisible();

      await page.setInputFiles('input[type="file"]', `${FIXTURE_DIR}sample.${from}`);
      await expect(convert).toBeEnabled();
      await convert.click();

      const download = page.locator('a[download]');
      await expect(download).toBeVisible();
      const href = await download.getAttribute('href');
      expect(href, 'download link should have an href').toBeTruthy();

      const bytes = await page.evaluate(async (url) => {
        const res = await fetch(url);
        const buf = await res.arrayBuffer();
        return Array.from(new Uint8Array(buf));
      }, href as string);

      expect(bytes.length, 'output should be non-trivial').toBeGreaterThan(256);

      const outPath = `${FIXTURE_DIR}out-${slug}.${to}`;
      writeFileSync(outPath, Buffer.from(bytes));

      const { format, hasVideo } = await probe(outPath);
      const tokens = FORMAT_TOKENS[to] ?? [to];
      expect(
        tokens.some((t) => format.includes(t)),
        `output format "${format}" should match target ${to.toUpperCase()}`,
      ).toBe(true);
      expect(hasVideo, 'output should contain a video stream').toBe(true);
    });
  }
});
