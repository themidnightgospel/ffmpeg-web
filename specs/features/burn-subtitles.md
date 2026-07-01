# Burn Subtitles

**Category:** Subtitles & overlays
**Status:** Planned

## Description
Hardcode (burn) subtitles from an SRT/ASS file permanently into the video frames, so they display everywhere without a separate subtitle track.

## User Story
As a user, I want to burn subtitles into my video so that captions always show, including on platforms that ignore subtitle tracks.

## Inputs
- One video file.
- One subtitle file (SRT or ASS).

## Outputs
- One video with burned-in subtitles, downloadable.

## Options / Controls
- Font, size, color, outline, position (for SRT styling).
- ASS files carry their own styling (respected as-is).
- Optional time offset to sync subtitles.

## FFmpeg Approach
```
ffmpeg -i input.mp4 -vf "subtitles=subs.srt:force_style='FontSize=24,PrimaryColour=&Hffffff&'" output.mp4
ffmpeg -i input.mp4 -vf "ass=subs.ass" output.mp4
```

## UI Notes
- Preview a frame with subtitles overlaid before rendering.
- Provide styling controls for SRT; note ASS is styled internally.

## Constraints & Edge Cases
- Fonts must be available in the WASM FS — bundle common fonts and let users upload custom ones.
- Burning requires full re-encode (slow); it's irreversible in the output.
