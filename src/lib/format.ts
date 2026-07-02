/** Human-readable byte size, e.g. 248 MB. */
export function humanSize(bytes: number): string {
  if (!Number.isFinite(bytes)) return '';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let n = bytes;
  let i = 0;
  while (n >= 1024 && i < units.length - 1) {
    n /= 1024;
    i += 1;
  }
  const decimals = n >= 10 || i === 0 ? 0 : 1;
  return `${n.toFixed(decimals)} ${units[i] ?? 'B'}`;
}

/** Convert a display name to a URL/file-safe slug. */
export function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Strip the extension from a filename. */
export function baseName(filename: string): string {
  return filename.replace(/\.[^.]+$/, '');
}

/** File extension (lowercase, no dot), or '' if none. */
export function extension(filename: string): string {
  const m = /\.([^.]+)$/.exec(filename);
  return m ? m[1]!.toLowerCase() : '';
}

/** Parse a flexible time string ("90", "1:30", "01:02:03.5") to seconds, or NaN. */
export function timeToSeconds(input: string): number {
  const trimmed = input.trim();
  if (trimmed === '') return NaN;
  const parts = trimmed.split(':');
  if (parts.some((p) => p === '' || !/^\d*\.?\d*$/.test(p))) return NaN;
  const nums = parts.map(Number);
  if (nums.some((n) => !Number.isFinite(n))) return NaN;
  return nums.reduce((acc, n) => acc * 60 + n, 0);
}

/** Format seconds as "HH:MM:SS" or "HH:MM:SS.mmm" (withMs). Clamps negatives to 0. */
export function secondsToTime(totalSeconds: number, withMs = false): string {
  const s = Math.max(0, totalSeconds);
  const hh = Math.floor(s / 3600);
  const mm = Math.floor((s % 3600) / 60);
  const whole = Math.floor(s % 60);
  const pad = (n: number) => String(n).padStart(2, '0');
  const base = `${pad(hh)}:${pad(mm)}:${pad(whole)}`;
  if (!withMs) return base;
  const ms = Math.round((s - Math.floor(s)) * 1000);
  return `${base}.${String(ms).padStart(3, '0')}`;
}

/** Normalize any accepted time string to canonical form, or '' if unparseable. */
export function normalizeTime(input: string, withMs = false): string {
  const seconds = timeToSeconds(input);
  return Number.isNaN(seconds) ? '' : secondsToTime(seconds, withMs);
}
