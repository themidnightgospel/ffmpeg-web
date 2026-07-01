# Audio Fader

**Category:** Audio tools
**Status:** Planned

## Description
Add fade-in and/or fade-out to audio (or a video's audio track) to smooth the start and end and avoid abrupt cuts.

## User Story
As a user, I want to fade my audio in and out so that it starts and ends smoothly.

## Inputs
- One audio or video file.

## Outputs
- One file with fades applied, downloadable.

## Options / Controls
- Fade-in duration and fade-out duration.
- Fade curve (linear, exponential, logarithmic).

## FFmpeg Approach
```
ffmpeg -i input.mp3 -af "afade=t=in:st=0:d=3,afade=t=out:st=57:d=3" output.mp3
```
Fade-out start = duration − fade length (computed from probed duration).

## UI Notes
- Auto-fill the fade-out start from the file's duration.
- Preview waveform with fade envelopes drawn on it.

## Constraints & Edge Cases
- Needs accurate duration to place the fade-out — probe first.
- For video, apply the same to the video edges via `fade` if desired (optional).
