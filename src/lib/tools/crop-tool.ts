import type { Tool, OptionValues } from './types';
import { baseName } from '@/lib/format';
import { h264Tail } from './videoEncode';

// Aspect presets → width/height ratio as a decimal.
const RATIOS: Record<string, number> = {
  '1:1': 1,
  '4:3': 4 / 3,
  '16:9': 16 / 9,
  '9:16': 9 / 16,
  '4:5': 4 / 5,
};

const isEdges = (v: OptionValues) => v.mode !== 'edges';
const isAspect = (v: OptionValues) => v.mode !== 'aspect';

/**
 * Crop Tool — crop a rectangular region from a video. Resolution-independent:
 * either a centered aspect-ratio crop (max area) or a per-edge trim in pixels.
 * All crop sizes are floored to even numbers for H.264 safety.
 * See specs/features/crop-tool.md.
 */
export const cropTool: Tool = {
  slug: 'crop-tool',
  name: 'Crop Tool',
  category: 'Resize & transform',
  status: 'live',
  accept: 'video/*',
  desc: 'Crop a rectangular region from a video.',

  options: [
    {
      id: 'mode',
      type: 'segmented',
      label: 'Crop by',
      default: 'aspect',
      choices: [
        { value: 'aspect', label: 'Aspect ratio' },
        { value: 'edges', label: 'Trim edges' },
      ],
    },
    {
      id: 'ratio',
      type: 'segmented',
      label: 'Aspect ratio',
      default: '1:1',
      disabledWhen: isAspect,
      choices: [
        { value: '1:1', label: '1:1' },
        { value: '4:3', label: '4:3' },
        { value: '16:9', label: '16:9' },
        { value: '9:16', label: '9:16' },
        { value: '4:5', label: '4:5' },
      ],
    },
    { id: 'top', type: 'stepper', label: 'Trim top (px)', min: 0, max: 4096, step: 2, default: 0, disabledWhen: isEdges },
    { id: 'bottom', type: 'stepper', label: 'Trim bottom (px)', min: 0, max: 4096, step: 2, default: 0, disabledWhen: isEdges },
    { id: 'left', type: 'stepper', label: 'Trim left (px)', min: 0, max: 4096, step: 2, default: 0, disabledWhen: isEdges },
    { id: 'right', type: 'stepper', label: 'Trim right (px)', min: 0, max: 4096, step: 2, default: 0, disabledWhen: isEdges },
  ],

  buildCommand: (values, input) => {
    const outputName = `${baseName(input.name)}.crop.mp4`;
    let cropExpr: string;

    if (values.mode === 'edges') {
      const l = Number(values.left);
      const r = Number(values.right);
      const t = Number(values.top);
      const b = Number(values.bottom);
      // crop=W:H:X:Y — floor W/H to even; offsets already even (step 2).
      cropExpr = `crop=floor((iw-${l}-${r})/2)*2:floor((ih-${t}-${b})/2)*2:${l}:${t}`;
    } else {
      const target = RATIOS[String(values.ratio)] ?? 1;
      // Centered max-area crop at the target ratio. Commas escaped for the
      // filtergraph parser; x/y default to centered when omitted.
      const w = `floor(if(gt(a\\,${target})\\,ih*${target}\\,iw)/2)*2`;
      const h = `floor(if(gt(a\\,${target})\\,ih\\,iw/${target})/2)*2`;
      cropExpr = `crop=${w}:${h}`;
    }

    return {
      args: ['-i', input.name, '-vf', cropExpr, ...h264Tail(20), outputName],
      outputName,
    };
  },
};
