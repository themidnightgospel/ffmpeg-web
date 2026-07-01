import type { FormatInfo } from './formats';
import { getFormat } from './formats';
import { videoConverter } from '@/lib/tools/video-converter';

/* Conversion pairs are derived from the converter tool's own format choices —
   single source of truth (docs/seo.md § 4). We only generate pairs the live
   tool can actually perform, so no page ships with a non-working converter. */

export interface ConversionPair {
  slug: string; // e.g. "mp4-to-mov"
  from: FormatInfo;
  to: FormatInfo;
  /** The tool that performs this conversion. */
  toolSlug: string;
}

function converterFormatIds(): string[] {
  const option = videoConverter.options.find((o) => o.id === 'format');
  return option && option.type === 'segmented' ? option.choices.map((c) => c.value) : [];
}

export const PAIRS: ConversionPair[] = (() => {
  const ids = converterFormatIds();
  const pairs: ConversionPair[] = [];
  for (const fromId of ids) {
    for (const toId of ids) {
      if (fromId === toId) continue;
      const from = getFormat(fromId);
      const to = getFormat(toId);
      if (!from || !to) continue;
      pairs.push({ slug: `${fromId}-to-${toId}`, from, to, toolSlug: videoConverter.slug });
    }
  }
  return pairs;
})();

const bySlug = new Map<string, ConversionPair>(PAIRS.map((p) => [p.slug, p]));

export function getPair(slug: string): ConversionPair | undefined {
  return bySlug.get(slug);
}

/** Reverse pair first, then a few same-source and same-target pairs. */
export function relatedPairs(pair: ConversionPair, limit = 6): ConversionPair[] {
  const reverse = getPair(`${pair.to.id}-to-${pair.from.id}`);
  const sameSource = PAIRS.filter((p) => p.from.id === pair.from.id && p.slug !== pair.slug);
  const sameTarget = PAIRS.filter((p) => p.to.id === pair.to.id && p.slug !== pair.slug);

  const ordered: ConversionPair[] = [];
  const seen = new Set<string>([pair.slug]);
  const push = (p: ConversionPair | undefined) => {
    if (p && !seen.has(p.slug)) {
      seen.add(p.slug);
      ordered.push(p);
    }
  };

  push(reverse);
  for (let i = 0; ordered.length < limit && (i < sameSource.length || i < sameTarget.length); i++) {
    push(sameSource[i]);
    push(sameTarget[i]);
  }
  return ordered.slice(0, limit);
}
