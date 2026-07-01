# Image Sequence → Video

**Category:** Format conversion
**Status:** Planned

## Description
Combine a series of images (PNG/JPEG) into a video — for timelapses, slideshows, stop-motion, or rendering frame exports back into a clip.

## User Story
As a user, I want to stitch a folder of images into a video so that I can make a timelapse or slideshow.

## Inputs
- Multiple image files (selected together; sorted by filename or user-defined order).

## Outputs
- One video file, downloadable.

## Options / Controls
- Framerate (images per second).
- Output resolution / scale.
- Output format (MP4/WebM).
- Optional per-image duration (for slideshows).

## FFmpeg Approach
Numbered sequence at a given fps:
```
ffmpeg -framerate 24 -i frame_%04d.png -c:v libx264 -pix_fmt yuv420p output.mp4
```
Glob-style or explicit concat list for arbitrary names/durations.

## UI Notes
- Let the user reorder images via drag-and-drop; show a filmstrip preview.
- Warn if images have inconsistent dimensions (they'll need scaling/padding).

## Constraints & Edge Cases
- All frames should share dimensions; auto-scale or pad mismatches.
- Writing many files into the WASM virtual FS uses memory — cap the count or stream where possible.
