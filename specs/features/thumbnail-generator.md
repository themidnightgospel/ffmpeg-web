# Thumbnail Generator

**Category:** Extraction & capture
**Status:** Planned

## Description
Grab a single frame from a video at a chosen timestamp and export it as an image. Useful for poster images and previews.

## User Story
As a user, I want to capture a frame from my video so that I can use it as a thumbnail or still image.

## Inputs
- One video file.

## Outputs
- One image file (PNG/JPEG), downloadable.

## Options / Controls
- Timestamp (scrubber + numeric input).
- Output format and quality.
- Optional resize.

## FFmpeg Approach
```
ffmpeg -ss 00:00:07 -i input.mp4 -frames:v 1 -q:v 2 thumb.jpg
```

## UI Notes
- Scrub the video and click "capture this frame".
- Show the captured frame full-size before download.

## Constraints & Edge Cases
- Seeking accuracy vs. speed: fast seek (`-ss` before `-i`) may land on a keyframe; precise seek is slower.
- For multiple frames, see [contact-sheet](./contact-sheet.md).
