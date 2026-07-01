# Chroma Key / Green Screen

**Category:** Advanced / niche
**Status:** Planned

## Description
Remove a solid-color background (green/blue screen) from a video and composite the subject over a new background image or video.

## User Story
As a user, I want to remove my green-screen background so that I can place myself over a different scene.

## Inputs
- One foreground (green-screen) video file.
- One background image or video file.

## Outputs
- One composited video file, downloadable.

## Options / Controls
- Key color (picker) — default green.
- Similarity/tolerance and blend/edge softness.
- Background choice (image, video, or solid color).

## FFmpeg Approach
```
ffmpeg -i fg.mp4 -i bg.jpg -filter_complex "[0:v]chromakey=0x00FF00:0.1:0.2[ck];[1:v][ck]overlay" -c:a copy output.mp4
```

## UI Notes
- Color picker to sample the exact key color from a frame.
- Live preview; sliders for similarity/blend to reduce fringing.

## Constraints & Edge Cases
- Poorly lit/uneven screens key badly — results depend on source quality.
- Two-stream compositing is heavy in WASM; keep clips short.
