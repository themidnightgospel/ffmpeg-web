import { test, expect, type Page, type BrowserContext } from '@playwright/test';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { readdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { FIXTURE_DIR } from './global-setup';

const run = promisify(execFile);
const DIST_CONVERT = fileURLToPath(new URL('../../dist/convert/', import.meta.url));

/* Discovered from the built pages: every /convert/{from}-to-{to} directory is a
   case. Each shard drives ONE page (the generic /convert/ converter) and runs
   its conversions on it, so the ffmpeg core loads once per shard (fast). Between
   conversions we pick the target format and a new source file, then wait for a
   *fresh* result. If a conversion ever crashes the tab, we recreate the page. */

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

const pairs: Pair[] = process.env.MATRIX_SAMPLE === '1' ? onePerSource(allPairs) : allPairs;

const SHARDS = Math.max(1, Math.min(Number(process.env.MATRIX_SHARDS ?? 4), pairs.length || 1));
const shards = shard(pairs, SHARDS);

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

    test(`shard ${i + 1}/${shards.length} — ${batch.length} conversions`, async ({ context }) => {
      test.setTimeout(batch.length * 30_000 + 120_000);

      let page = await openConverter(context);
      const failures: string[] = [];
      let firstRun = true;

      for (const { slug, from, to } of batch) {
        // Each conversion gets one retry: the shared-page converter can, rarely,
        // surface a stale result for a slow source (e.g. avi) — a fresh attempt
        // clears it. A genuine failure fails both attempts.
        let lastError = '';
        for (let attempt = 0; attempt < 2; attempt++) {
          try {
            const output = await convert(page, from, to, firstRun);
            firstRun = false;

            if (output.length <= 256) {
              lastError = `${slug}: output too small (${output.length} bytes)`;
              continue;
            }
            const outPath = `${FIXTURE_DIR}out-${slug}.${to}`;
            writeFileSync(outPath, output);
            const { format, hasVideo } = await probe(outPath);
            const tokens = FORMAT_TOKENS[to] ?? [to];
            if (!tokens.some((t) => format.includes(t))) {
              lastError = `${slug}: output format "${format}" doesn't match target ${to}`;
              continue;
            }
            if (!hasVideo) {
              lastError = `${slug}: output has no video stream`;
              continue;
            }
            lastError = ''; // success
            break;
          } catch (err) {
            const msg = (err as Error).message.split('\n')[0];
            lastError = `${slug}: ${msg}`;
            // If the tab died, recreate it (and reload the core on next run).
            if (page.isClosed() || /crash|closed|Target/i.test(msg)) {
              await page.close().catch(() => undefined);
              try {
                page = await openConverter(context);
                firstRun = true;
              } catch {
                lastError = `${slug}: context lost`;
                break; // context is gone — stop retrying
              }
            }
          }
        }
        if (lastError) failures.push(lastError);
      }

      await page.close().catch(() => undefined);
      expect(failures, `Failed conversions:\n  ${failures.join('\n  ')}`).toEqual([]);
    });
  });
});

async function openConverter(context: BrowserContext): Promise<Page> {
  const page = await context.newPage();
  await page.goto('/convert/');
  await expect(page.getByRole('button', { name: /convert/i })).toBeVisible();
  return page;
}

// One conversion on the shared generic converter page.
async function convert(page: Page, from: string, to: string, firstRun: boolean): Promise<Buffer> {
  const download = page.locator('a[download]');

  // Pick the target format (value-based; independent of label text) and confirm
  // it actually took effect — otherwise a racing click can leave the previous
  // target selected, producing the wrong container.
  const formatRadio = page.locator(`input[name="format"][value="${to}"]`);
  await page.locator(`label.seg:has(input[name="format"][value="${to}"])`).click();
  await expect(formatRadio).toBeChecked();
  // Clear then set so a `change` always fires (even when consecutive conversions
  // use the same source file) — that resets any previous result/error…
  const input = page.locator('input[type="file"]');
  await input.setInputFiles([]);
  await input.setInputFiles(`${FIXTURE_DIR}sample.${from}`);
  await expect(download).toBeHidden(); // …so we don't read a stale download.

  const convertBtn = page.getByRole('button', { name: /convert/i });
  await expect(convertBtn).toBeEnabled();
  await convertBtn.click();

  const error = page.locator('.action__error');
  // First run pays the one-time core load; later runs are quick.
  await expect(download.or(error)).toBeVisible({ timeout: firstRun ? 120_000 : 60_000 });
  if (await error.isVisible()) {
    throw new Error((await error.textContent())?.trim() || 'conversion failed');
  }

  // The output filename is `sample.<to>`; assert the visible download is for THIS
  // target so we never validate a stale result from the previous conversion.
  await expect(download).toHaveAttribute('download', new RegExp(`\\.${to}$`));

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
