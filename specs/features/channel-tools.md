# Channel Tools

**Category:** Audio tools
**Status:** Planned

## Description
Manipulate audio channels — downmix stereo to mono, upmix mono to stereo, swap left/right, isolate a single channel, or extract channels.

## User Story
As a user, I want to adjust audio channels so that I can fix a one-sided recording or reduce file size with mono.

## Inputs
- One audio or video file.

## Outputs
- One file with modified channels, downloadable.

## Options / Controls
- Stereo → mono (downmix).
- Mono → stereo (duplicate).
- Swap L/R.
- Isolate left or right channel to both sides.

## FFmpeg Approach
```
ffmpeg -i input.mp3 -ac 1 output.mp3                                  # to mono
ffmpeg -i input.mp3 -af "pan=stereo|c0=c1|c1=c0" output.mp3           # swap L/R
ffmpeg -i input.mp3 -af "pan=stereo|c0=c0|c1=c0" output.mp3           # left → both
```

## UI Notes
- Describe common fixes (e.g. "audio only in one ear" → isolate channel).
- Preview per-channel meters if feasible.

## Constraints & Edge Cases
- Downmix to mono is destructive for true stereo content.
- Channel layouts vary (5.1 etc.); handle or restrict to stereo/mono for v1.
