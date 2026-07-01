# Video Comparison (Side-by-Side / Stacked)

**Category:** Advanced / niche
**Status:** Planned

## Description
Place two videos next to each other (horizontally or vertically) in a single frame — for before/after, reaction, or comparison clips.

## User Story
As a user, I want to show two videos side by side so that I can compare them or make a reaction/before-after clip.

## Inputs
- Two video files.

## Outputs
- One combined comparison video file, downloadable.

## Options / Controls
- Layout: horizontal (hstack) or vertical (vstack).
- Scale each input to match dimensions.
- Optional divider/gap.
- Audio: pick one source or mix.

## FFmpeg Approach
```
ffmpeg -i left.mp4 -i right.mp4 -filter_complex "[0:v]scale=640:-1[l];[1:v]scale=640:-1[r];[l][r]hstack" -map 0:a output.mp4
```

## UI Notes
- Preview the composed layout.
- Handle differing durations (loop/pad/cut policy).

## Constraints & Edge Cases
- Inputs must be scaled to compatible heights (hstack) or widths (vstack).
- Two decodes at once are heavy; keep clips short.
