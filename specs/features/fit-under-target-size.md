# Fit Under Target Size

**Category:** Compression & optimization
**Status:** Planned

## Description
Automatically compress a video to fit under a user-specified file size (e.g. "under 25 MB for Discord"). The tool computes the required bitrate from the target size and duration, then encodes to hit it.

## User Story
As a user, I want to make a video fit under a specific size limit so that I can upload it to a platform with a hard cap.

## Inputs
- One video file.
- Target size (MB) — with quick presets (Discord 25 MB, email 25 MB, etc.).

## Outputs
- One video file at or just under the target size, downloadable.

## Options / Controls
- Target size in MB.
- Reserve percentage for container overhead/safety margin.
- Optional audio bitrate lock (subtracted from the budget first).
- Optional resolution downscale if the required bitrate is too low for the resolution.

## FFmpeg Approach
Compute: `video_bitrate = (target_size_bits / duration) − audio_bitrate`, then two-pass encode.
Note: ffmpeg.wasm runs on an in-memory filesystem with no `/dev/null` — discard the first pass with `-f null -`:
```
ffmpeg -i input.mp4 -c:v libx264 -b:v <calc>k -pass 1 -an -f null -
ffmpeg -i input.mp4 -c:v libx264 -b:v <calc>k -pass 2 -c:a aac -b:a 128k output.mp4
```
The first pass writes a stats file (`ffmpeg2pass-0.log`) into the virtual FS; use unique names if runs can overlap.

## UI Notes
- Show the computed target bitrate and warn if it's low enough to look poor (suggest downscaling).
- Read duration before computing. ffmpeg.wasm ships no `ffprobe` — get duration from the browser's `HTMLMediaElement.duration` or by parsing the `ffmpeg -i` log output (see [metadata-viewer](./metadata-viewer.md)).

## Constraints & Edge Cases
- Two-pass doubles encoding time — significant in WASM; offer single-pass as a faster, less precise option.
- Very small targets on long/high-res videos may be unachievable at watchable quality — warn early.
