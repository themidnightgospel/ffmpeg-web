import { describe, it, expect } from 'vitest';
import { loopMaker } from './loop-maker';

describe('loopMaker.buildCommand', () => {
  it('loops N-1 extra times for N total plays, copying streams', () => {
    const { args, outputName } = loopMaker.buildCommand({ plays: 4 }, { name: 'clip.mp4' });
    expect(outputName).toBe('clip.looped.mp4');
    expect(args).toEqual(['-stream_loop', '3', '-i', 'clip.mp4', '-c', 'copy', 'clip.looped.mp4']);
  });

  it('places -stream_loop before -i', () => {
    const { args } = loopMaker.buildCommand({ plays: 2 }, { name: 'a.mp3' });
    expect(args[0]).toBe('-stream_loop');
    expect(args.indexOf('-stream_loop')).toBeLessThan(args.indexOf('-i'));
  });
});
