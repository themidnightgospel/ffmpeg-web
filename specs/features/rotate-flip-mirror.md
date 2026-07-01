# Rotate / Flip / Mirror

**Category:** Resize & transform
**Status:** Planned

## Description
Rotate a video by 90/180/270°, or flip it horizontally (mirror) or vertically. Fixes sideways phone videos and creates mirror effects.

## User Story
As a user, I want to rotate or flip my video so that it's oriented correctly.

## Inputs
- One video file.

## Outputs
- One transformed video file, downloadable.

## Options / Controls
- Rotate 90° CW / 90° CCW / 180°.
- Flip horizontal (mirror) / flip vertical.
- Optional: fix orientation via metadata only (fast) vs. actually re-encode pixels.

## FFmpeg Approach
```
ffmpeg -i input.mp4 -vf "transpose=1" output.mp4          # 90° CW
ffmpeg -i input.mp4 -vf "hflip" output.mp4                 # mirror
ffmpeg -i input.mp4 -vf "vflip" output.mp4                 # vertical flip
ffmpeg -i input.mp4 -metadata:s:v rotate=90 -c copy out.mp4 # metadata-only
```

## UI Notes
- Preview the transform before applying.
- Offer the fast metadata-only rotation where players honor it.

## Constraints & Edge Cases
- Metadata-only rotation isn't respected by all players; re-encode for guaranteed results.
- Rotating swaps width/height — reflect that in any size estimates.
