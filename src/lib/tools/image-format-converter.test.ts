import { describe, it, expect } from 'vitest';
import { imageFormatConverter } from './image-format-converter';

const input = { name: 'photo.png' };

describe('imageFormatConverter.buildCommand', () => {
  it('converts to PNG with no quality flag', () => {
    const { args, outputName } = imageFormatConverter.buildCommand(
      { format: 'png', quality: 90 },
      { name: 'shot.jpg' },
    );
    expect(outputName).toBe('shot.png');
    expect(args).toEqual(['-i', 'shot.jpg', 'shot.png']);
  });

  it('maps quality to mjpeg -q:v for JPG', () => {
    const { args, outputName } = imageFormatConverter.buildCommand(
      { format: 'jpg', quality: 90 },
      input,
    );
    expect(outputName).toBe('photo.jpg');
    expect(args).toEqual(['-i', 'photo.png', '-q:v', '5', 'photo.jpg']);
  });

  it('uses -quality for WebP', () => {
    const { args } = imageFormatConverter.buildCommand({ format: 'webp', quality: 80 }, input);
    expect(args).toEqual(['-i', 'photo.png', '-quality', '80', 'photo.webp']);
  });
});
