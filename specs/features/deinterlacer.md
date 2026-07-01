# Deinterlacer

**Category:** Advanced / niche
**Status:** Planned

## Description
Remove interlacing artifacts (combing lines) from older/broadcast footage, producing clean progressive video.

## User Story
As a user, I want to deinterlace my video so that it looks clean and progressive instead of showing combing lines.

## Inputs
- One interlaced video file.

## Outputs
- One deinterlaced (progressive) video file, downloadable.

## Options / Controls
- Deinterlace method (yadif, bwdif).
- Field order (auto/top-first/bottom-first).
- Optional double-rate (each field → a frame).

## FFmpeg Approach
```
ffmpeg -i input.mp4 -vf "yadif=mode=0" -c:a copy output.mp4
ffmpeg -i input.mp4 -vf "bwdif" -c:a copy output.mp4
```

## UI Notes
- Auto-detect interlacing if possible and recommend enabling.
- Before/after preview of a motion frame.

## Constraints & Edge Cases
- Applying deinterlace to already-progressive video softens it — detect/warn.
- Double-rate doubles the framerate and file size.
