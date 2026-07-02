import { describe, it, expect } from 'vitest';
import { defaultValues, type ToolOption } from './types';
import { h264Tail } from './videoEncode';
import { audioEncoder, AUDIO_ENCODERS, LOSSLESS_AUDIO } from './audioEncoders';

describe('defaultValues', () => {
  it('derives a default for every option type, incl. time/text fallbacks', () => {
    const options: ToolOption[] = [
      { id: 'seg', type: 'segmented', label: 'Seg', default: 'b', choices: [{ value: 'a', label: 'A' }, { value: 'b', label: 'B' }] },
      { id: 'sld', type: 'slider', label: 'Sld', min: 0, max: 10, default: 5 },
      { id: 'stp', type: 'stepper', label: 'Stp', min: 0, max: 10, default: 3 },
      { id: 'tog', type: 'toggle', label: 'Tog', default: true },
      { id: 'tm', type: 'time', label: 'Time', default: '00:00:05' },
      { id: 'tmNoDefault', type: 'time', label: 'Time2' },
      { id: 'txt', type: 'text', label: 'Text', default: 'hi' },
      { id: 'txtNoDefault', type: 'text', label: 'Text2' },
    ];
    expect(defaultValues(options)).toEqual({
      seg: 'b',
      sld: 5,
      stp: 3,
      tog: true,
      tm: '00:00:05',
      tmNoDefault: '00:00:00.000',
      txt: 'hi',
      txtNoDefault: '',
    });
  });
});

describe('h264Tail', () => {
  it('defaults to CRF 20 and pins yuv420p', () => {
    const tail = h264Tail();
    expect(tail).toEqual([
      '-c:v', 'libx264', '-crf', '20', '-preset', 'veryfast',
      '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '128k', '-movflags', '+faststart',
    ]);
  });

  it('honors a custom CRF', () => {
    expect(h264Tail(28)).toEqual(expect.arrayContaining(['-crf', '28']));
  });
});

describe('audioEncoder', () => {
  it('maps known formats', () => {
    expect(audioEncoder('mp3')).toBe('libmp3lame');
    expect(audioEncoder('m4a')).toBe('aac');
    expect(audioEncoder('flac')).toBe('flac');
    expect(audioEncoder('ogg')).toBe('libvorbis');
  });
  it('falls back to libmp3lame for unknown formats', () => {
    expect(audioEncoder('xyz')).toBe('libmp3lame');
  });
  it('marks only wav/flac lossless', () => {
    expect(LOSSLESS_AUDIO.has('wav')).toBe(true);
    expect(LOSSLESS_AUDIO.has('flac')).toBe(true);
    expect(LOSSLESS_AUDIO.has('mp3')).toBe(false);
  });
  it('has an encoder for every lossless format', () => {
    for (const fmt of LOSSLESS_AUDIO) expect(AUDIO_ENCODERS[fmt]).toBeDefined();
  });
});
