# Extract Subtitles

**Category:** Subtitles & overlays
**Status:** Planned

## Description
Pull embedded subtitle tracks out of a video container (e.g. MKV/MP4) and save them as standalone SRT/ASS files.

## User Story
As a user, I want to extract subtitles from a video so that I can edit, translate, or reuse them separately.

## Inputs
- One video file with embedded subtitle track(s).

## Outputs
- One or more subtitle files (SRT/ASS), downloadable.

## Options / Controls
- Track selector (when multiple subtitle streams exist).
- Output subtitle format (SRT, ASS, VTT).

## FFmpeg Approach
```
ffmpeg -i input.mkv -map 0:s:0 subs.srt
```
Enumerate subtitle streams first (parse the `ffmpeg -i` log output — ffmpeg.wasm has no `ffprobe`) to populate the track picker.

## UI Notes
- Enumerate available subtitle tracks with language labels.
- Offer conversion between subtitle formats on export.

## Constraints & Edge Cases
- Image-based subtitles (PGS/VobSub) can't be converted to text without OCR — detect and warn.
- Some containers embed no subtitles — show a clear empty state.
