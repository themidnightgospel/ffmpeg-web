# Framerate Converter

**Category:** Resize & transform
**Status:** Planned

## Description
Change a video's frame rate — e.g. 60fps → 30fps to shrink files, or standardize footage to a target fps before merging.

## User Story
As a user, I want to change a video's framerate so that it's smaller or matches other footage.

## Inputs
- One video file.

## Outputs
- One framerate-adjusted video file, downloadable.

## Options / Controls
- Target fps (presets: 24, 25, 30, 50, 60; plus custom).
- Method: drop/duplicate frames (fast) or motion interpolation (smooth, slow).

## FFmpeg Approach
Simple fps change:
```
ffmpeg -i input.mp4 -r 30 output.mp4
```
Filter-based:
```
ffmpeg -i input.mp4 -vf "fps=30" output.mp4
```
Interpolated (slow):
```
ffmpeg -i input.mp4 -vf "minterpolate=fps=60" output.mp4
```

## UI Notes
- Explain that lowering fps reduces size and smoothness; raising it doesn't add real detail without interpolation.
- Default to simple frame drop/dup.

## Constraints & Edge Cases
- `minterpolate` is very slow in WASM — mark as advanced.
- Changing fps alone doesn't change playback speed (frames are resampled to real time).
