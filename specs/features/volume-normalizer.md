# Volume Adjuster / Normalizer

**Category:** Audio tools
**Status:** Planned

## Description
Adjust the loudness of audio (or a video's audio track) — either by a fixed gain, or by normalizing to a broadcast loudness standard (EBU R128 / loudnorm) for consistent perceived volume.

## User Story
As a user, I want to make my audio louder/quieter or evenly leveled so that it sounds consistent and clear.

## Inputs
- One audio or video file.

## Outputs
- One volume-adjusted file, downloadable.

## Options / Controls
- Mode: fixed gain (dB or ×), peak normalize, or loudness normalize (LUFS target).
- Target LUFS (e.g. −14 for streaming, −16 for podcasts, −23 for broadcast).

## FFmpeg Approach
Fixed gain:
```
ffmpeg -i input.mp3 -af "volume=6dB" output.mp3
```
Loudness normalize:
```
ffmpeg -i input.mp3 -af "loudnorm=I=-14:TP=-1.5:LRA=11" output.mp3
```

## UI Notes
- Offer platform LUFS presets (Spotify/YouTube/podcast).
- Note that two-pass loudnorm is more accurate (measure then apply).

## Constraints & Edge Cases
- Boosting can clip; suggest a limiter/true-peak ceiling.
- Two-pass loudnorm requires reading measured values from the first pass.
