import type { Tool } from './types';
import { baseName } from '@/lib/format';
import { h264Tail } from './videoEncode';

// Strength → deshake search range (rx/ry). Larger = corrects bigger shakes but
// crops/warps more.
const STRENGTH: Record<string, number> = {
  low: 8,
  medium: 16,
  high: 32,
};

/**
 * Video Stabilization — smooth out camera shake. The spec's two-pass vidstab
 * pipeline needs libvidstab, which isn't in the single-thread WASM core, so we
 * use the built-in single-pass `deshake` filter instead.
 * See specs/features/video-stabilization.md.
 */
export const videoStabilization: Tool = {
  slug: 'video-stabilization',
  name: 'Video Stabilization',
  category: 'Advanced',
  status: 'live',
  accept: 'video/*',
  desc: 'Reduce camera shake for a smoother-looking video.',

  options: [
    {
      id: 'strength',
      type: 'segmented',
      label: 'Strength',
      default: 'medium',
      choices: [
        { value: 'low', label: 'Low' },
        { value: 'medium', label: 'Medium' },
        { value: 'high', label: 'High' },
      ],
    },
    {
      id: 'edge',
      type: 'segmented',
      label: 'Edges',
      default: 'mirror',
      advanced: true,
      choices: [
        { value: 'mirror', label: 'Mirror' },
        { value: 'clamp', label: 'Clamp' },
        { value: 'blank', label: 'Blank' },
        { value: 'original', label: 'Original' },
      ],
    },
  ],

  buildCommand: (values, input) => {
    const r = STRENGTH[String(values.strength)] ?? 16;
    const edge = String(values.edge);
    const outputName = `${baseName(input.name)}.stabilized.mp4`;
    return {
      args: ['-i', input.name, '-vf', `deshake=rx=${r}:ry=${r}:edge=${edge}`, ...h264Tail(20), outputName],
      outputName,
    };
  },
};
