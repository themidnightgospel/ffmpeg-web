# Video → Audio Extractor

**Category:** Format conversion
**Status:** Planned

## Description
Extract the audio track from a video file and save it as a standalone audio file. Useful for ripping music, dialogue, or podcast audio out of a video.

## User Story
As a user, I want to pull the audio out of a video so that I can listen to it or edit it without the video.

## Inputs
- One video file.

## Outputs
- One audio file, downloadable.

## Options / Controls
- Output format (MP3, WAV, AAC, M4A, Opus, FLAC).
- "Copy without re-encoding" toggle (extracts the original stream losslessly when the container/format allows).
- Bitrate selector when re-encoding.
- Optional trim (start/end) to grab just a segment.

## FFmpeg Approach
Lossless stream copy (fast, keeps original codec):
```
ffmpeg -i input.mp4 -vn -c:a copy output.m4a
```
Re-encode to MP3:
```
ffmpeg -i input.mp4 -vn -c:a libmp3lame -b:a 192k output.mp3
```

## UI Notes
- Detect and display the source audio codec so the user knows what "copy" will produce.
- Default to MP3 for broad compatibility, offer "copy" as the lossless option.

## Constraints & Edge Cases
- Videos with multiple audio tracks: let the user pick which track (`-map 0:a:N`).
- Videos with no audio track: detect and show a clear message.
