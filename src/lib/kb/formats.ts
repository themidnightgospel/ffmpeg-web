/* Per-format knowledge base — the content moat. Facts are hand-authored and
   should be kept accurate (they are the credibility layer for the SEO pages).
   Formats consumed by the converter come from its tool config; entries here
   provide the human-facing facts. See docs/seo.md § 4. */

export type MediaKind = 'video' | 'audio' | 'image';

export interface FormatInfo {
  id: string;
  name: string;
  longName: string;
  kind: MediaKind;
  /** Typical encoding: lossy, lossless, or either depending on codec. */
  lossy: boolean | 'either';
  summary: string;
  useCases: string[];
  pros: string[];
  cons: string[];
  compatibility: string;
}

const VIDEO_FORMATS: FormatInfo[] = [
  {
    id: 'mp4',
    name: 'MP4',
    longName: 'MPEG-4 Part 14',
    kind: 'video',
    lossy: true,
    summary:
      'The most widely supported video container, typically holding H.264 video and AAC audio.',
    useCases: ['Web and social video', 'Mobile playback', 'Sharing and streaming'],
    pros: ['Plays virtually everywhere', 'Good compression', 'Ideal for streaming (faststart)'],
    cons: ['Codec licensing (H.264/H.265)', 'Less flexible than MKV for multi-track'],
    compatibility: 'Every modern browser, phone, TV, and editor.',
  },
  {
    id: 'webm',
    name: 'WebM',
    longName: 'WebM (Matroska-based, royalty-free)',
    kind: 'video',
    lossy: true,
    summary: 'An open, royalty-free container built for the web, using VP8/VP9/AV1 and Opus/Vorbis.',
    useCases: ['HTML5 web video', 'Open-source projects', 'Efficient web delivery'],
    pros: ['Free and open', 'Excellent compression with VP9/AV1', 'Native in modern browsers'],
    cons: ['Spotty support on older Apple devices', 'Limited video-editor support'],
    compatibility: 'Chrome, Firefox, Edge, modern Safari, and Android.',
  },
  {
    id: 'mkv',
    name: 'MKV',
    longName: 'Matroska Video',
    kind: 'video',
    lossy: 'either',
    summary:
      'A highly flexible open container that can hold almost any codec plus multiple audio and subtitle tracks.',
    useCases: ['Archival and high-quality video', 'Multi-track films', 'Home media libraries'],
    pros: ['Holds any codec', 'Multiple audio/subtitle tracks', 'Open standard'],
    cons: ['Not natively supported in most browsers', 'Not designed for streaming'],
    compatibility: 'Desktop players (VLC, MPV) and media centers; limited on mobile/browsers.',
  },
  {
    id: 'mov',
    name: 'MOV',
    longName: 'QuickTime Movie',
    kind: 'video',
    lossy: 'either',
    summary: "Apple's QuickTime container, common in editing workflows and often holding ProRes.",
    useCases: ['Apple ecosystem playback', 'Professional video editing', 'ProRes masters'],
    pros: ['High quality', 'Excellent for editing', 'Native on macOS/iOS'],
    cons: ['Larger files', 'Less universal outside Apple'],
    compatibility: 'macOS, iOS, and virtually all professional editors.',
  },
  {
    id: 'avi',
    name: 'AVI',
    longName: 'Audio Video Interleave',
    kind: 'video',
    lossy: 'either',
    summary: "An older Microsoft container with broad legacy support but dated efficiency.",
    useCases: ['Legacy files and devices', 'Simple uncompressed capture'],
    pros: ['Wide legacy support', 'Simple structure'],
    cons: ['Large files', 'Weak compression', 'No modern streaming features'],
    compatibility: 'Windows and legacy media players.',
  },
  {
    id: 'flv',
    name: 'FLV',
    longName: 'Flash Video',
    kind: 'video',
    lossy: true,
    summary: 'A legacy container built for Adobe Flash streaming, now largely deprecated.',
    useCases: ['Legacy Flash content', 'Old web archives'],
    pros: ['Small files', 'Was the web-streaming standard'],
    cons: ['Flash is discontinued', 'Poor modern support'],
    compatibility: 'Legacy players only; unsupported by modern browsers.',
  },
];

export const FORMATS: Record<string, FormatInfo> = Object.fromEntries(
  [...VIDEO_FORMATS].map((f) => [f.id, f]),
);

export function getFormat(id: string): FormatInfo | undefined {
  return FORMATS[id];
}
