# Metadata Viewer

**Category:** Extraction & capture
**Status:** Planned

## Description
Inspect a media file's technical metadata — codecs, resolution, bitrate, duration, framerate, streams, and container tags — like a browser-based ffprobe.

## User Story
As a user, I want to see the technical details of a media file so that I understand its format before converting or editing it.

## Inputs
- One media file (video/audio/image).

## Outputs
- A readable report on screen (and optional JSON download). No file is modified.

## Options / Controls
- Toggle between summary and full raw output.
- Copy/download the report as JSON or text.

## FFmpeg Approach
Using ffprobe (or ffmpeg stderr parsing):
```
ffprobe -v quiet -print_format json -show_format -show_streams input.mp4
```

## UI Notes
- Present a clean summary card (duration, resolution, codecs, bitrate) plus an expandable full view.
- Highlight anything unusual (e.g. variable framerate).

## Constraints & Edge Cases
- ffmpeg.wasm exposes ffmpeg; ffprobe-equivalent info may need parsing ffmpeg's `-i` stderr if a separate ffprobe isn't bundled.
- Read-only tool — never writes output files.
