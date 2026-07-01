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
