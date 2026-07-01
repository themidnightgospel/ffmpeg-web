# Add Text Overlay

**Category:** Subtitles & overlays
**Status:** Planned

## Description
Draw custom text onto a video (title, caption, timestamp) with control over font, size, color, position, and timing — using the `drawtext` filter.

## User Story
As a user, I want to add text on top of my video so that I can label it, add a title, or caption it.

## Inputs
- One video file.
- Text content (typed by the user).

## Outputs
- One video file with text overlay, downloadable.

## Options / Controls
- Text string, font, size, color, background box/opacity.
- Position (presets + custom x/y).
- Optional start/end time so text appears only during a window.
- Optional scrolling/animation.

## FFmpeg Approach
```
ffmpeg -i input.mp4 -vf "drawtext=text='Hello':fontfile=/font.ttf:fontsize=48:fontcolor=white:box=1:boxcolor=black@0.5:x=(w-tw)/2:y=h-100" -c:a copy output.mp4
```
Timed appearance via `enable='between(t,2,5)'`.

## UI Notes
- Live frame preview with draggable text.
- Font picker (bundle a few fonts; allow upload).

## Constraints & Edge Cases
- `drawtext` needs a font file present in the WASM FS.
- Special characters must be escaped in the filter string.
