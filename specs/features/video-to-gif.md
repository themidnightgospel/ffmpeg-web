# Video → GIF

**Category:** Format conversion
**Status:** Planned

## Description
Convert a video (or a segment of it) into an animated GIF, with control over size, framerate, and quality. Uses a two-pass palette technique for good color quality.

## User Story
As a user, I want to turn a video clip into a GIF so that I can share it easily anywhere GIFs are supported.

## Inputs
- One video file.

## Outputs
- One animated GIF, downloadable.

## Options / Controls
- Trim start/end (GIFs should be short).
- Output width (height auto-scales to preserve aspect ratio).
- Framerate (e.g. 10/15/24 fps — lower = smaller file).
- Quality vs. size preset.

## FFmpeg Approach
Two-pass with palette for better quality:
```
ffmpeg -i input.mp4 -vf "fps=15,scale=480:-1:flags=lanczos,palettegen" palette.png
ffmpeg -i input.mp4 -i palette.png -filter_complex "fps=15,scale=480:-1:flags=lanczos[x];[x][1:v]paletteuse" output.gif
```

## UI Notes
- Strongly encourage short clips (< 10s) and modest widths to keep file size sane.
- Live estimate of output size; warn if it's likely to be large (multi-MB).

## Constraints & Edge Cases
- GIF has only 256 colors — gradients may band; palette pass mitigates this.
- Long/high-res inputs produce huge GIFs; enforce or suggest sensible caps.
