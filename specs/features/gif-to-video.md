# GIF → Video

**Category:** Format conversion
**Status:** Planned

## Description
Convert an animated GIF into a real video file (MP4/WebM). Video is far smaller than GIF for the same content and plays inline on most platforms.

## User Story
As a user, I want to convert a GIF into an MP4 so that it's smaller and plays properly on social media and messaging apps.

## Inputs
- One animated GIF.

## Outputs
- One video file (MP4 or WebM), downloadable.

## Options / Controls
- Target format (MP4/H.264 or WebM/VP9).
- Optional loop behavior note (GIFs loop; video may not — informational).
- Quality/CRF slider (advanced).

## FFmpeg Approach
```
ffmpeg -i input.gif -movflags +faststart -pix_fmt yuv420p -vf "scale=trunc(iw/2)*2:trunc(ih/2)*2" output.mp4
```
The scale filter forces even dimensions (H.264 requirement); `yuv420p` ensures broad player compatibility.

## UI Notes
- Explain the size/compatibility benefit up front (many users don't know MP4 beats GIF).
- Default to MP4 with faststart for web streaming.

## Constraints & Edge Cases
- Odd-dimension GIFs must be padded/scaled to even numbers for H.264.
- Transparency is lost (video formats generally have no alpha) — warn if the GIF uses transparency.
