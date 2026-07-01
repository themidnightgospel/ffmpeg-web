# Video Compressor

**Category:** Compression & optimization
**Status:** Planned

## Description
Reduce a video's file size by re-encoding at a lower bitrate or higher CRF. Aimed at shrinking videos to meet upload/attachment limits while keeping acceptable quality.

## User Story
As a user, I want to compress a video so that it's small enough to upload, email, or send on chat apps.

## Inputs
- One video file.

## Outputs
- One compressed video file, downloadable.

## Options / Controls
- Quality mode: CRF slider (e.g. 18 = high quality, 28 = smaller) **or** target bitrate.
- Encoder preset (faster ↔ smaller).
- Optional downscale resolution to help shrink further.
- Original vs. estimated new size display.

## FFmpeg Approach
CRF-based (quality-targeted):
```
ffmpeg -i input.mp4 -c:v libx264 -crf 28 -preset medium -c:a aac -b:a 128k output.mp4
```

## UI Notes
- Explain CRF in plain language (lower number = better quality, bigger file).
- Show before/after size once complete.

## Constraints & Edge Cases
- CRF gives predictable quality but unpredictable size; for exact size targets, see [fit-under-target-size](./fit-under-target-size.md).
- Slower presets improve compression but cost time — balance for WASM.
