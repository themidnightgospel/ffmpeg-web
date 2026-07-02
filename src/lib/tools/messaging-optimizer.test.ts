import { describe, it, expect } from 'vitest';
import { messagingOptimizer } from './messaging-optimizer';

describe('messagingOptimizer.buildCommand', () => {
  it('scales to 720p and encodes H.264 for the chosen app', () => {
    const { args, outputName } = messagingOptimizer.buildCommand({ app: 'whatsapp' }, { name: 'clip.mov' });
    expect(outputName).toBe('clip.mp4');
    expect(args.slice(0, 5)).toEqual(['-i', 'clip.mov', '-vf', 'scale=-2:720', '-c:v']);
    expect(args).toEqual(expect.arrayContaining(['libx264', '-crf', '28']));
    expect(args[args.length - 1]).toBe('clip.mp4');
  });

  it('uses a lower CRF for Telegram', () => {
    const { args } = messagingOptimizer.buildCommand({ app: 'telegram' }, { name: 'clip.mov' });
    expect(args).toEqual(expect.arrayContaining(['-crf', '26']));
  });

  it('falls back to WhatsApp for an unknown app', () => {
    const { args } = messagingOptimizer.buildCommand({ app: 'nope' }, { name: 'clip.mov' });
    expect(args).toEqual(expect.arrayContaining(['-crf', '28']));
  });
});
