# GIF Optimizer

**Category:** Compression & optimization
**Status:** Planned

## Description
Reduce the size of an existing animated GIF by lowering framerate, reducing dimensions, and optimizing the color palette — without converting it away from GIF.

## User Story
As a user, I want to make a GIF smaller so that it uploads within size limits and loads faster.

## Inputs
- One animated GIF.

## Outputs
- One optimized GIF, downloadable.

## Options / Controls
- Reduce framerate (drop frames).
- Downscale width/height.
- Palette color count (e.g. 256 → 128 → 64).
- Optional frame skipping.

## FFmpeg Approach
```
ffmpeg -i input.gif -vf "fps=12,scale=400:-1:flags=lanczos,palettegen=max_colors=128" palette.png
ffmpeg -i input.gif -i palette.png -filter_complex "fps=12,scale=400:-1:flags=lanczos[x];[x][1:v]paletteuse" output.gif
```

## UI Notes
- Show before/after size prominently.
- Provide quick presets: "Aggressive", "Balanced", "Light".

## Constraints & Edge Cases
- Suggest GIF → MP4 (see [gif-to-video](./gif-to-video.md)) when the user cares more about size than the GIF format itself.
- Very reduced palettes can visibly band; preview before download.
