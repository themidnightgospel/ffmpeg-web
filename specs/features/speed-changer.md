# Speed Changer

**Category:** Resize & transform
**Status:** Planned

## Description
Speed up or slow down a video/audio clip (e.g. 0.5× slow-mo to 4× fast-forward), keeping audio and video in sync and pitch-corrected.

## User Story
As a user, I want to change playback speed so that I can make slow-motion or time-compressed clips.

## Inputs
- One video or audio file.

## Outputs
- One speed-adjusted file, downloadable.

## Options / Controls
- Speed multiplier (0.25×–4×) via slider/presets.
- Keep-audio toggle and pitch-correction option.
- Mute audio option (common for extreme speeds).

## FFmpeg Approach
2× faster (video + audio):
```
ffmpeg -i input.mp4 -filter_complex "[0:v]setpts=0.5*PTS[v];[0:a]atempo=2.0[a]" -map "[v]" -map "[a]" output.mp4
```
`atempo` accepts 0.5–2.0; chain multiple for larger factors.

## UI Notes
- Show resulting duration as the user adjusts speed.
- Note that slow-mo doesn't add frames (may look choppy without interpolation).

## Constraints & Edge Cases
- `atempo` must be chained for factors outside 0.5–2.0.
- True smooth slow-motion needs frame interpolation (minterpolate — slow), optional advanced toggle.
