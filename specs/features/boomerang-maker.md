# Boomerang Maker

**Category:** GIF & meme tools
**Status:** Planned

## Description
Create an Instagram-style boomerang: play a short clip forward, then in reverse, optionally looping — as a video or GIF.

## User Story
As a user, I want to make a boomerang clip so that I have a fun back-and-forth looping effect.

## Inputs
- One short video file.

## Outputs
- One boomerang video or GIF, downloadable.

## Options / Controls
- Number of loops.
- Speed.
- Output format (MP4 or GIF).
- Mute audio (usual for boomerangs).

## FFmpeg Approach
Forward + reversed concat:
```
ffmpeg -i input.mp4 -filter_complex "[0:v]reverse[r];[0:v][r]concat=n=2:v=1:a=0,setpts=0.5*PTS" -an output.mp4
```

## UI Notes
- Enforce short input (boomerangs are 1–3s).
- Preview the back-and-forth before export.

## Constraints & Edge Cases
- `reverse` buffers the whole clip — keep it very short.
- Composes with [loop-maker](./loop-maker.md) and [reverse-media](./reverse-media.md).
