import type { Tool } from './types';
import { baseName } from '@/lib/format';
import { h264Tail } from './videoEncode';

// App → (max height, CRF). Tuned to keep files small for chat apps.
const APPS: Record<string, { height: number; crf: number }> = {
  whatsapp: { height: 720, crf: 28 },
  telegram: { height: 720, crf: 26 },
  discord: { height: 720, crf: 27 },
  messenger: { height: 720, crf: 28 },
};

/**
 * Messaging Optimizer — compress a video for chat apps. Preset wrapper over the
 * video compressor. See specs/features/messaging-optimizer.md.
 */
export const messagingOptimizer: Tool = {
  slug: 'messaging-optimizer',
  name: 'Messaging Optimizer',
  category: 'Social & platform',
  status: 'live',
  accept: 'video/*',
  desc: 'Compress a video to send quickly on chat apps.',

  options: [
    {
      id: 'app',
      type: 'segmented',
      label: 'App',
      default: 'whatsapp',
      choices: [
        { value: 'whatsapp', label: 'WhatsApp' },
        { value: 'telegram', label: 'Telegram' },
        { value: 'discord', label: 'Discord' },
        { value: 'messenger', label: 'Messenger' },
      ],
    },
  ],

  buildCommand: (values, input) => {
    const preset = APPS[String(values.app)] ?? APPS.whatsapp!;
    const outputName = `${baseName(input.name)}.mp4`;
    const args: string[] = [
      '-i', input.name,
      '-vf', `scale=-2:${preset.height}`,
      ...h264Tail(preset.crf),
      outputName,
    ];
    return { args, outputName };
  },
};
