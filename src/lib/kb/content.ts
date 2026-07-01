import type { ConversionPair } from './pairs';

/* Assembles differentiated, fact-driven page content from BOTH formats' KB
   entries. Branches on real properties (lossy, use cases, compatibility) so no
   two pages are string-swaps. Prose here should be human-reviewed before launch
   (docs/seo.md § 4). */

export interface Faq {
  q: string;
  a: string;
}

export interface PairContent {
  intro: string;
  comparison: string;
  whenToUse: string;
  faqs: Faq[];
  steps: string[];
}

export function buildPairContent(pair: ConversionPair): PairContent {
  const { from, to } = pair;

  const intro =
    `Convert ${from.name} to ${to.name} right in your browser — free, private, and instant. ` +
    `${from.name} (${from.longName}) is ${lower(from.summary)} ${to.name} (${to.longName}) is ${lower(to.summary)} ` +
    `This tool re-wraps and re-encodes your ${from.name} file into ${to.name} entirely on your device, so nothing is ever uploaded.`;

  const comparison =
    `The practical difference: ${to.name} is best for ${joinLower(to.useCases)}, while ${from.name} shines at ` +
    `${joinLower(from.useCases)}. In terms of reach, ${from.name} works with ${lower(from.compatibility)} ` +
    `${to.name} works with ${lower(to.compatibility)} Converting to ${to.name} is worth it when you need its ` +
    `strengths — ${joinLower(to.pros)} — and can accept its trade-offs, such as ${lower(firstOr(to.cons, 'few downsides') + '.')}`;

  const whenToUse =
    `Choose ${to.name} when ${lower(firstOr(to.useCases, 'you need broad compatibility'))} matters most. ` +
    `Keep ${from.name} if you rely on ${lower(firstOr(from.pros, 'its existing support'))}. ` +
    `Because the conversion runs locally with ffmpeg.wasm, it stays completely private and works offline once loaded.`;

  const steps = [
    `Drop your ${from.name} file (or click to browse). It never leaves your device.`,
    `${to.name} is already selected as the target format — adjust codecs or quality if you like.`,
    `Click Convert, then download your new ${to.name} file.`,
  ];

  const faqs: Faq[] = [
    {
      q: `How do I convert ${from.name} to ${to.name}?`,
      a: `Drop your ${from.name} file into the converter above, confirm ${to.name} is selected as the target, and click Convert. Your ${to.name} file is ready to download in seconds.`,
    },
    {
      q: `Is this ${from.name} to ${to.name} converter free?`,
      a: `Yes — it's completely free and open source, with no watermarks, sign-ups, or file-size paywalls.`,
    },
    {
      q: `Are my files uploaded anywhere?`,
      a: `No. The conversion runs entirely in your browser with ffmpeg.wasm. Your ${from.name} file never leaves your device, so it's fully private.`,
    },
    {
      q: `Will converting ${from.name} to ${to.name} reduce quality?`,
      a: qualityAnswer(pair),
    },
    {
      q: `What's the difference between ${from.name} and ${to.name}?`,
      a: `${from.name} is ${lower(from.summary)} ${to.name} is ${lower(to.summary)} ${capitalize(to.name)} is generally preferred for ${joinLower(to.useCases)}.`,
    },
  ];

  return { intro, comparison, whenToUse, faqs, steps };
}

function qualityAnswer(pair: ConversionPair): string {
  const { from, to } = pair;
  if (to.lossy === true) {
    return `Re-encoding to ${to.name} is lossy, so some quality is traded for compatibility and size. You can raise the quality (lower CRF) in the advanced options, or use "Keep original" / remux where the codecs are compatible to avoid re-encoding entirely.`;
  }
  return `You can convert ${from.name} to ${to.name} without re-encoding when the codecs are compatible — use the remux option to change the container losslessly. Otherwise, re-encoding trades a little quality for compatibility, which you control with the CRF setting.`;
}

// --- small text helpers (kept trivial and pure) ---
function lower(s: string): string {
  return s.charAt(0).toLowerCase() + s.slice(1);
}
function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
function joinLower(items: string[]): string {
  const list = items.map((i) => i.toLowerCase());
  if (list.length <= 1) return list[0] ?? '';
  return `${list.slice(0, -1).join(', ')} and ${list[list.length - 1]}`;
}
function firstOr(items: string[], fallback: string): string {
  return items[0] ?? fallback;
}
