import type { ToolMeta } from '@/lib/tools/types';
import { withBase } from '@/lib/url';

/* Catalogue metadata for all 54 tools, in display order (defines the 01..54 numbering).
   `status: 'live'` tools have a config in @/lib/tools/registry and a working page;
   the rest render a "coming soon" placeholder until implemented. */
export const TOOLS: readonly ToolMeta[] = [
  // Format conversion
  { slug: 'video-converter', name: 'Video Converter', category: 'Format conversion', desc: 'Change container and codec of any video.', status: 'live' },
  { slug: 'audio-converter', name: 'Audio Converter', category: 'Format conversion', desc: 'Convert between MP3, WAV, FLAC, Opus.', status: 'live' },
  { slug: 'video-to-audio-extractor', name: 'Video → Audio Extractor', category: 'Format conversion', desc: 'Pull the audio track out of a video.', status: 'live' },
  { slug: 'video-to-gif', name: 'Video → GIF', category: 'Format conversion', desc: 'Turn a clip into an animated GIF.', status: 'live' },
  { slug: 'gif-to-video', name: 'GIF → Video', category: 'Format conversion', desc: 'Convert animated GIFs to MP4 or WebM.', status: 'live' },
  { slug: 'image-sequence-to-video', name: 'Image Sequence → Video', category: 'Format conversion', desc: 'Stitch frames into a video file.', status: 'live' },
  { slug: 'video-to-image-sequence', name: 'Video → Image Sequence', category: 'Format conversion', desc: 'Export every frame as an image.', status: 'live' },
  { slug: 'image-format-converter', name: 'Image Format Converter', category: 'Format conversion', desc: 'PNG, JPG, WebP, AVIF, and back.', status: 'live' },

  // Compression
  { slug: 'video-compressor', name: 'Video Compressor', category: 'Compression', desc: 'Shrink file size, keep it watchable.', status: 'live' },
  { slug: 'audio-compressor', name: 'Audio Compressor', category: 'Compression', desc: 'Reduce bitrate for smaller audio files.', status: 'live' },
  { slug: 'gif-optimizer', name: 'GIF Optimizer', category: 'Compression', desc: 'Cut GIF weight with smart palettes.', status: 'live' },
  { slug: 'fit-under-target-size', name: 'Fit Under Target Size', category: 'Compression', desc: 'Hit an exact megabyte budget.', status: 'live' },

  // Trimming & cutting
  { slug: 'video-trimmer', name: 'Video/Audio Trimmer', category: 'Trimming & cutting', desc: 'Cut a clean start and end.', status: 'live' },
  { slug: 'media-splitter', name: 'Media Splitter', category: 'Trimming & cutting', desc: 'Slice one file into many parts.', status: 'live' },
  { slug: 'media-merger', name: 'Media Merger', category: 'Trimming & cutting', desc: 'Join multiple clips end to end.', status: 'live' },
  { slug: 'silence-remover', name: 'Silence Remover', category: 'Trimming & cutting', desc: 'Strip out dead air automatically.', status: 'live' },
  { slug: 'loop-maker', name: 'Loop Maker', category: 'Trimming & cutting', desc: 'Repeat a clip a set number of times.', status: 'live' },

  // Resize & transform
  { slug: 'video-resizer', name: 'Video Resizer', category: 'Resize & transform', desc: 'Scale to any width and height.', status: 'live' },
  { slug: 'aspect-ratio-changer', name: 'Aspect-Ratio Changer', category: 'Resize & transform', desc: 'Reframe to 16:9, 9:16, 1:1.', status: 'live' },
  { slug: 'rotate-flip-mirror', name: 'Rotate / Flip / Mirror', category: 'Resize & transform', desc: 'Fix orientation in one click.', status: 'live' },
  { slug: 'crop-tool', name: 'Crop Tool', category: 'Resize & transform', desc: 'Trim the frame to any region.', status: 'live' },
  { slug: 'speed-changer', name: 'Speed Changer', category: 'Resize & transform', desc: 'Speed up or slow down playback.', status: 'live' },
  { slug: 'framerate-converter', name: 'Framerate Converter', category: 'Resize & transform', desc: 'Retime between 24, 30, 60 fps.', status: 'live' },
  { slug: 'reverse-media', name: 'Reverse Media', category: 'Resize & transform', desc: 'Play video or audio backwards.', status: 'live' },

  // Audio tools
  { slug: 'volume-normalizer', name: 'Volume Normalizer', category: 'Audio tools', desc: 'Even out loudness to a target level.', status: 'live' },
  { slug: 'audio-fader', name: 'Audio Fader', category: 'Audio tools', desc: 'Add smooth fade-in and fade-out.', status: 'live' },
  { slug: 'channel-tools', name: 'Channel Tools', category: 'Audio tools', desc: 'Mono, stereo, and channel mixing.', status: 'live' },
  { slug: 'pitch-tempo-changer', name: 'Pitch / Tempo Changer', category: 'Audio tools', desc: 'Shift pitch or tempo independently.', status: 'live' },
  { slug: 'audio-joiner', name: 'Audio Joiner', category: 'Audio tools', desc: 'Concatenate tracks into one file.', status: 'live' },
  { slug: 'ringtone-maker', name: 'Ringtone Maker', category: 'Audio tools', desc: 'Cut a short loop for your phone.', status: 'live' },
  { slug: 'waveform-generator', name: 'Waveform Generator', category: 'Audio tools', desc: 'Render audio as a waveform image.', status: 'live' },
  { slug: 'replace-audio-track', name: 'Replace Audio Track', category: 'Audio tools', desc: "Swap a video's soundtrack.", status: 'live' },

  // Subtitles & overlays
  { slug: 'burn-subtitles', name: 'Burn Subtitles', category: 'Subtitles & overlays', desc: 'Hard-code captions into the video.', status: 'live' },
  { slug: 'extract-subtitles', name: 'Extract Subtitles', category: 'Subtitles & overlays', desc: 'Pull embedded subtitle tracks out.', status: 'live' },
  { slug: 'add-watermark', name: 'Add Watermark', category: 'Subtitles & overlays', desc: 'Overlay a logo or image mark.', status: 'live' },
  { slug: 'add-text-overlay', name: 'Add Text Overlay', category: 'Subtitles & overlays', desc: 'Place titles and captions on video.', status: 'live' },
  { slug: 'picture-in-picture', name: 'Picture-in-Picture', category: 'Subtitles & overlays', desc: 'Composite one video over another.', status: 'live' },

  // Extraction & capture
  { slug: 'thumbnail-generator', name: 'Thumbnail Generator', category: 'Extraction & capture', desc: 'Grab a still from any timestamp.', status: 'live' },
  { slug: 'contact-sheet', name: 'Contact Sheet', category: 'Extraction & capture', desc: 'Build a grid of preview frames.', status: 'live' },
  { slug: 'poster-frame-picker', name: 'Poster Frame Picker', category: 'Extraction & capture', desc: 'Choose the perfect cover frame.', status: 'live' },
  { slug: 'metadata-viewer', name: 'Metadata Viewer', category: 'Extraction & capture', desc: 'Inspect codecs, streams, and tags.', status: 'live' },
  { slug: 'metadata-stripper', name: 'Metadata Stripper', category: 'Extraction & capture', desc: 'Remove hidden metadata for privacy.', status: 'live' },

  // Social & platform
  { slug: 'social-media-presets', name: 'Social-Media Presets', category: 'Social & platform', desc: 'One-tap exports for every platform.', status: 'live' },
  { slug: 'messaging-optimizer', name: 'Messaging Optimizer', category: 'Social & platform', desc: 'Right size for chat apps and DMs.', status: 'live' },
  { slug: 'podcast-prep', name: 'Podcast Prep', category: 'Social & platform', desc: 'Clean, level, and export episodes.', status: 'live' },

  // GIF & meme
  { slug: 'gif-maker', name: 'GIF Maker', category: 'GIF & meme', desc: 'Craft a GIF with fine control.', status: 'live' },
  { slug: 'meme-caption', name: 'Meme Caption', category: 'GIF & meme', desc: 'Add top and bottom meme text.', status: 'live' },
  { slug: 'boomerang-maker', name: 'Boomerang Maker', category: 'GIF & meme', desc: 'Loop forward then reverse.', status: 'live' },

  // Advanced
  { slug: 'color-adjuster', name: 'Color Adjuster', category: 'Advanced', desc: 'Tune brightness, contrast, saturation.', status: 'live' },
  { slug: 'deinterlacer', name: 'Deinterlacer', category: 'Advanced', desc: 'Remove combing from interlaced video.', status: 'live' },
  { slug: 'video-stabilization', name: 'Video Stabilization', category: 'Advanced', desc: 'Smooth out shaky handheld footage.', status: 'live' },
  { slug: 'chroma-key', name: 'Chroma Key', category: 'Advanced', desc: 'Remove a green or blue background.', status: 'live' },
  { slug: 'video-comparison', name: 'Video Comparison', category: 'Advanced', desc: 'Side-by-side before/after view.', status: 'live' },
  { slug: 'audio-spectrogram', name: 'Audio Spectrogram', category: 'Advanced', desc: 'Visualize frequency over time.', status: 'live' },
];

const bySlug = new Map<string, ToolMeta>(TOOLS.map((t) => [t.slug, t]));

export function getToolMeta(slug: string): ToolMeta | undefined {
  return bySlug.get(slug);
}

/** 1-based catalogue index, zero-padded to 2 digits (e.g. "07"). */
export function toolNumber(slug: string): string {
  const i = TOOLS.findIndex((t) => t.slug === slug);
  return i < 0 ? '00' : String(i + 1).padStart(2, '0');
}

/** Hub link for a tool. The video converter is the generic /convert/ landing;
    other tools get their own /tools/{slug} page. */
export function toolHref(tool: ToolMeta): string {
  return withBase(tool.slug === 'video-converter' ? '/convert/' : `/tools/${tool.slug}`);
}
