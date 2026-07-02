import { describe, it, expect } from 'vitest';
import { metadataViewer } from './metadata-viewer';

describe('metadataViewer', () => {
  it('is an inspection tool with no options', () => {
    expect(metadataViewer.inspect).toBe(true);
    expect(metadataViewer.options).toHaveLength(0);
  });

  it('builds a read-only probe command', () => {
    const { args, outputName } = metadataViewer.buildCommand({}, { name: 'clip.mp4' });
    expect(args).toEqual(['-i', 'clip.mp4']);
    expect(outputName).toBe('');
  });
});
