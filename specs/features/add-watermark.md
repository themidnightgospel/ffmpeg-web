# Add Watermark / Logo

**Category:** Subtitles & overlays
**Status:** Planned

## Description
Overlay an image (logo/watermark) onto a video at a chosen position, size, and opacity — for branding or attribution.

## User Story
As a user, I want to add a logo watermark to my video so that it's branded or attributed to me.

## Inputs
- One video file.
- One image file (PNG with transparency recommended).

## Outputs
- One watermarked video file, downloadable.

## Options / Controls
- Position (corners, center, or custom x/y).
- Scale/size of the watermark.
- Opacity.
- Optional margin/padding from edges.

## FFmpeg Approach
```
ffmpeg -i video.mp4 -i logo.png -filter_complex "[1:v]scale=120:-1,format=rgba,colorchannelmixer=aa=0.5[wm];[0:v][wm]overlay=W-w-20:20" -c:a copy output.mp4
```

## UI Notes
- Drag the watermark on a frame preview to set position.
- Sliders for size and opacity with live preview.

## Constraints & Edge Cases
- PNG alpha gives the cleanest results; JPEGs have no transparency.
- Requires re-encoding the video (audio can be copied).
