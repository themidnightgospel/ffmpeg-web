# Video Converter

**Category:** Format conversion
**Status:** Planned

## Description
Convert a video file from one container/codec to another — MP4, WebM, MKV, MOV, AVI, FLV. The user picks a source file and a target format; the tool transcodes it entirely in the browser and returns a downloadable file.

## User Story
As a user, I want to convert a video into a different format so that it plays on my target device, editor, or platform.

## Inputs
- One video file (drag-and-drop or file picker).

## Outputs
- One converted video file, downloadable.

## Options / Controls
- Target container/format (MP4, WebM, MKV, MOV, AVI, FLV).
- Optional video codec choice (H.264, VP9, etc. — depends on what the core build supports).
- Optional audio codec choice (AAC, Opus, MP3).
- Optional quality/CRF slider (advanced, collapsed by default).

## FFmpeg Approach
Baseline transcode:
```
ffmpeg -i input.avi -c:v libx264 -c:a aac output.mp4
```
Container-only remux when codecs already match (fast, no re-encode):
```
ffmpeg -i input.mkv -c copy output.mp4
```

## UI Notes
- Auto-detect source format and suggest sensible target defaults.
- Offer a "remux (fast, no quality loss)" option when codecs are compatible.
- Show a progress bar driven by ffmpeg's progress output.

## Constraints & Edge Cases
- Some codecs (e.g. H.265/x265) may not be compiled into the default core — hide unsupported options.
- Large/long videos are slow in WASM; warn and allow cancel.
