# Picture-in-Picture / Video Overlay

**Category:** Subtitles & overlays
**Status:** Planned

## Description
Overlay one video on top of another (e.g. a webcam cam in the corner of a screen recording), with control over size and position.

## User Story
As a user, I want to overlay a small video on a main video so that I can create picture-in-picture (e.g. reaction or commentary).

## Inputs
- One main (background) video file.
- One overlay (foreground) video file.

## Outputs
- One combined PiP video file, downloadable.

## Options / Controls
- Overlay position (corners/custom) and size/scale.
- Optional rounded corners / border.
- Audio handling: main only, overlay only, or mixed.
- Start offset for the overlay.

## FFmpeg Approach
```
ffmpeg -i main.mp4 -i cam.mp4 -filter_complex "[1:v]scale=320:-1[pip];[0:v][pip]overlay=W-w-20:H-h-20[v];[0:a][1:a]amix=inputs=2[a]" -map "[v]" -map "[a]" output.mp4
```

## UI Notes
- Drag-position the overlay on a preview; resize with a handle.
- Audio-mix controls (which track(s), levels).

## Constraints & Edge Cases
- Two simultaneous decode + scale + overlay is heavy in WASM — keep clips short.
- Differing durations/framerates need a sync policy.
