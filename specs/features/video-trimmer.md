# Video / Audio Trimmer

**Category:** Trimming & cutting
**Status:** Planned

## Description
Cut a clip from a video or audio file by choosing a start and end point. Uses stream copy for a fast, lossless trim when possible, or re-encodes for frame-accurate cuts.

## User Story
As a user, I want to trim a media file to just the part I need so that I can remove unwanted sections.

## Inputs
- One video or audio file.

## Outputs
- One trimmed file, downloadable.

## Options / Controls
- Start time and end time (via draggable range on a timeline, plus numeric input).
- Mode: "Fast (lossless, keyframe-aligned)" or "Precise (re-encode, frame-accurate)".

## FFmpeg Approach
Fast, lossless (may snap to nearest keyframe):
```
ffmpeg -ss 00:00:10 -to 00:00:25 -i input.mp4 -c copy output.mp4
```
Precise (re-encode):
```
ffmpeg -ss 00:00:10 -to 00:00:25 -i input.mp4 -c:v libx264 -c:a aac output.mp4
```

## UI Notes
- Provide a scrubbable preview with in/out markers.
- Explain the trade-off: fast+lossless vs. exact cut point.

## Constraints & Edge Cases
- Stream-copy trims start at the nearest preceding keyframe — the cut may not be exactly at the chosen frame.
- Precise mode is slower but exact.
