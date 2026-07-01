import type { Tool } from './types';
import { videoConverter } from './video-converter';
import { audioConverter } from './audio-converter';
import { videoToAudioExtractor } from './video-to-audio-extractor';
import { videoCompressor } from './video-compressor';
import { audioCompressor } from './audio-compressor';
import { videoResizer } from './video-resizer';
import { rotateFlipMirror } from './rotate-flip-mirror';

/* Registry of implemented ("live") tools. Add a tool's config here to wire it up.
   The catalogue metadata for all tools (including planned ones) lives in @/data/tools. */
const LIVE_TOOLS: Tool[] = [
  videoConverter,
  audioConverter,
  videoToAudioExtractor,
  videoCompressor,
  audioCompressor,
  videoResizer,
  rotateFlipMirror,
];

const bySlug = new Map<string, Tool>(LIVE_TOOLS.map((t) => [t.slug, t]));

export function getTool(slug: string): Tool | undefined {
  return bySlug.get(slug);
}

export function liveSlugs(): Set<string> {
  return new Set(bySlug.keys());
}
