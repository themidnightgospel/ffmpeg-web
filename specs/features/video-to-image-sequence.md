# Video → Image Sequence

**Category:** Format conversion
**Status:** Planned

## Description
Export frames from a video as individual images — every frame, or at a chosen interval (e.g. 1 frame per second). Output is delivered as a ZIP of images.

## User Story
As a user, I want to extract frames from a video so that I can grab stills, build a dataset, or edit individual frames.

## Inputs
- One video file.

## Outputs
- Multiple image files, bundled into a downloadable ZIP.

## Options / Controls
- Extraction rate: every frame, every N frames, or 1 per second/minute.
- Image format (PNG lossless / JPEG smaller).
- Optional resolution/scale.
- Optional trim range.

## FFmpeg Approach
One frame per second:
```
ffmpeg -i input.mp4 -vf fps=1 frame_%04d.png
```
Every frame:
```
ffmpeg -i input.mp4 frame_%05d.png
```

## UI Notes
- Show an estimated frame count before running (fps × duration) so users don't accidentally export thousands.
- Bundle output with a client-side ZIP library (e.g. JSZip).

## Constraints & Edge Cases
- "Every frame" on a long video can produce thousands of files and exhaust memory — warn and suggest an interval.
- JPEG is much smaller for large exports; default to it for high frame counts.
