# Crop Tool

**Category:** Resize & transform
**Status:** Planned

## Description
Crop a rectangular region from a video using a visual selection overlay. Removes unwanted borders, watermarks, or reframes the shot.

## User Story
As a user, I want to crop out part of a video frame so that only the region I care about remains.

## Inputs
- One video file.

## Outputs
- One cropped video file, downloadable.

## Options / Controls
- Visual drag-to-select crop rectangle on a frame preview.
- Numeric width/height/x/y inputs.
- Optional aspect-ratio lock on the crop box.

## FFmpeg Approach
```
ffmpeg -i input.mp4 -vf "crop=w:h:x:y" -c:a copy output.mp4
```

## UI Notes
- Overlay a resizable/movable rectangle on a representative frame.
- Show live crop dimensions; snap to even numbers for codec safety.

## Constraints & Edge Cases
- Crop dimensions must fit within the source; clamp the selection.
- Keep width/height even for H.264.
