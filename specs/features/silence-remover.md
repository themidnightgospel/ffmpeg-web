# Silence Remover

**Category:** Trimming & cutting
**Status:** Planned

## Description
Detect and remove silent sections from audio or video — useful for tightening podcasts, voiceovers, and screen recordings.

## User Story
As a user, I want to automatically cut out silent gaps so that my recording is tighter and shorter.

## Inputs
- One audio or video file.

## Outputs
- One file with silent sections removed, downloadable.

## Options / Controls
- Silence threshold (dB) — how quiet counts as silence.
- Minimum silence duration to remove.
- Optional padding to keep a short buffer around speech.

## FFmpeg Approach
Audio-only via `silenceremove`:
```
ffmpeg -i input.mp3 -af "silenceremove=stop_periods=-1:stop_duration=1:stop_threshold=-40dB" output.mp3
```
For video, detect silence with `silencedetect`, then cut/concat the non-silent ranges.

## UI Notes
- Show detected silent segments on a timeline before applying.
- Provide sensible defaults (e.g. −40 dB, 1s) with an "aggressiveness" slider.

## Constraints & Edge Cases
- Video is harder: requires detecting silence then re-cutting/concatenating segments (slower, re-encode).
- Overly aggressive settings clip the start of words — padding helps.
