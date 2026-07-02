import type { Tool } from './types';
import { videoConverter } from './video-converter';
import { audioConverter } from './audio-converter';
import { videoToAudioExtractor } from './video-to-audio-extractor';
import { videoCompressor } from './video-compressor';
import { audioCompressor } from './audio-compressor';
import { videoResizer } from './video-resizer';
import { rotateFlipMirror } from './rotate-flip-mirror';
import { speedChanger } from './speed-changer';
import { framerateConverter } from './framerate-converter';
import { reverseMedia } from './reverse-media';
import { volumeNormalizer } from './volume-normalizer';
import { channelTools } from './channel-tools';
import { pitchTempoChanger } from './pitch-tempo-changer';
import { metadataStripper } from './metadata-stripper';
import { loopMaker } from './loop-maker';
import { colorAdjuster } from './color-adjuster';
import { deinterlacer } from './deinterlacer';
import { aspectRatioChanger } from './aspect-ratio-changer';
import { imageFormatConverter } from './image-format-converter';
import { gifToVideo } from './gif-to-video';
import { videoToGif } from './video-to-gif';
import { gifOptimizer } from './gif-optimizer';
import { silenceRemover } from './silence-remover';
import { audioFader } from './audio-fader';
import { waveformGenerator } from './waveform-generator';
import { audioSpectrogram } from './audio-spectrogram';
import { thumbnailGenerator } from './thumbnail-generator';
import { posterFramePicker } from './poster-frame-picker';
import { contactSheet } from './contact-sheet';
import { boomerangMaker } from './boomerang-maker';
import { extractSubtitles } from './extract-subtitles';
import { podcastPrep } from './podcast-prep';
import { messagingOptimizer } from './messaging-optimizer';
import { socialMediaPresets } from './social-media-presets';

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
  speedChanger,
  framerateConverter,
  reverseMedia,
  volumeNormalizer,
  channelTools,
  pitchTempoChanger,
  metadataStripper,
  loopMaker,
  colorAdjuster,
  deinterlacer,
  aspectRatioChanger,
  imageFormatConverter,
  gifToVideo,
  videoToGif,
  gifOptimizer,
  silenceRemover,
  audioFader,
  waveformGenerator,
  audioSpectrogram,
  thumbnailGenerator,
  posterFramePicker,
  contactSheet,
  boomerangMaker,
  extractSubtitles,
  podcastPrep,
  messagingOptimizer,
  socialMediaPresets,
];

const bySlug = new Map<string, Tool>(LIVE_TOOLS.map((t) => [t.slug, t]));

export function getTool(slug: string): Tool | undefined {
  return bySlug.get(slug);
}

export function liveSlugs(): Set<string> {
  return new Set(bySlug.keys());
}
