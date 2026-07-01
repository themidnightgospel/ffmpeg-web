# Image Format Converter

**Category:** Format conversion
**Status:** Planned

## Description
Convert single images between formats — PNG, JPEG, BMP, TIFF, WebP — using ffmpeg. A lightweight utility for quick one-off conversions.

## User Story
As a user, I want to convert an image to a different format so that it meets a size, compatibility, or transparency requirement.

## Inputs
- One (or a batch of) image file(s).

## Outputs
- Converted image(s); ZIP when batching.

## Options / Controls
- Target format (PNG, JPEG, BMP, TIFF, WebP).
- JPEG/WebP quality slider.
- Optional resize.

## FFmpeg Approach
```
ffmpeg -i input.png -q:v 2 output.jpg
ffmpeg -i input.jpg output.webp
```

## UI Notes
- Note that for heavy image workloads a dedicated codec library (e.g. Squoosh/wasm codecs) often outperforms ffmpeg — this tool is for convenience and consistency with the suite.
- Warn when converting to a format without transparency (e.g. PNG → JPEG flattens alpha).

## Constraints & Edge Cases
- WebP encode/decode support depends on the core build.
- Not intended as a high-volume batch image optimizer; keep batches modest.
