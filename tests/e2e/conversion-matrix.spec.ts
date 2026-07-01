import { test, expect, type Page } from '@playwright/test';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { readdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { FIXTURE_DIR } from './global-setup';

const run = promisify(execFile);
const DIST_CONVERT = fileURLToPath(new URL('../../dist/convert/', import.meta.url));

/* The matrix is DISCOVERED from the built pages: every /convert/{from}-to-{to}
   directory in dist becomes a case, so every generated page is exercised.

   Speed: instead of one test (fresh page) per pair — which reloads the ~30 MB
   ffmpeg core every time — we drive MANY conversions on a SINGLE page (the core
   loads once per worker) and shard the work across workers. See docs/testing.md. */

interface Pair {
  slug: string;
  from: string;
  to: string;
}

const allPairs: Pair[] = readdirSync(DIST_CONVERT, { withFileTypes: true })
  .filter((d) => d.isDirectory() && d.name.includes('-to-'))
  .map((d) => {
    const [from, to] = d.name.split('-to-');
    return { slug: d.name, from: from ?? '', to: to ?? '' };
  });

// PR runs a sample (one pair per source format); release runs the full matrix.
const pairs: Pair[] =
  process.env.MATRIX_SAMPLE === '1' ? onePerSource(allPairs) : allPairs;

const SHARDS = Math.max(1, Math.min(Number(process.env.MATRIX_SHARDS ?? 2), pairs.length || 1));
const shards = shard(pairs, SHARDS);

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

test.describe('conversion matrix', () => {
  test('discovered conversion pages', () => {
    expect(allPairs.length).toBeGreaterThan(0);
  });

  shards.forEach((batch, i) => {
    if (batch.length === 0) return;

    test(`shard ${i + 1}/${shards.length} — ${batch.length} conversions`, async ({ page }) => {
      // Generous budget: first conversion pays the one-time core load.
      test.setTimeout(batch.length * 20_000 + 90_000);

      await page.goto('/convert/');
      await expect(page.getByRole('button', { name: /convert/i })).toBeVisible();

      const failures: string[] = [];
      let firstRun = true;

      for (const { slug, from, to } of batch) {
        try {
          const output = await convert(page, from, to, firstRun);
          firstRun = false;

          if (output.length <= 256) {
            failures.push(`${slug}: output too small (${output.length} bytes)`);
            continue;
          }

          const outPath = `${FIXTURE_DIR}out-${slug}.${to}`;
          writeFileSync(outPath, output);
          const { format, hasVideo } = await probe(outPath);
          const tokens = FORMAT_TOKENS[to] ?? [to];

          if (!tokens.some((t) => format.includes(t))) {
            failures.push(`${slug}: output format "${format}" doesn't match target ${to}`);
          } else if (!hasVideo) {
            failures.push(`${slug}: output has no video stream`);
          }
        } catch (err) {
          failures.push(`${slug}: ${(err as Error).message.split('\n')[0]}`);
        }
      }

      expect(failures, `Failed conversions:\n  ${failures.join('\n  ')}`).toEqual([]);
    });
  });
});

// Run one conversion on the already-loaded /convert/ page and return the bytes.
async function convert(page: Page, from: string, to: string, firstRun: boolean): Promise<Buffer> {
  // Select the target format (value-based, so we don't depend on label text).
  await page.locator(`label.seg:has(input[name="format"][value="${to}"])`).click();

  // Choosing a new file resets any previous result and re-enables Convert.
  await page.setInputFiles('input[type="file"]', `${FIXTURE_DIR}sample.${from}`);

  const convertBtn = page.getByRole('button', { name: /convert/i });
  await expect(convertBtn).toBeEnabled();
  await convertBtn.click();

  const download = page.locator('a[download]');
  // First run includes the one-time core load; later runs are quick.
  await expect(download).toBeVisible({ timeout: firstRun ? 120_000 : 45_000 });

  const href = await download.getAttribute('href');
  if (!href) throw new Error('download link has no href');

  const bytes = await page.evaluate(async (url) => {
    const res = await fetch(url);
    return Array.from(new Uint8Array(await res.arrayBuffer()));
  }, href);

  return Buffer.from(bytes);
}

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

function onePerSource(list: Pair[]): Pair[] {
  const seen = new Set<string>();
  return list.filter((p) => (seen.has(p.from) ? false : (seen.add(p.from), true)));
}

function shard<T>(list: T[], n: number): T[][] {
  const out: T[][] = Array.from({ length: n }, () => []);
  list.forEach((item, i) => out[i % n]!.push(item));
  return out;
}
