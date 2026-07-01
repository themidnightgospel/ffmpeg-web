# Reverse Video / Audio

**Category:** Resize & transform
**Status:** Planned

## Description
Play a video and/or its audio backwards. Useful for creative effects and reverse-audio gags.

## User Story
As a user, I want to reverse a clip so that it plays backwards.

## Inputs
- One video or audio file (short recommended).

## Outputs
- One reversed file, downloadable.

## Options / Controls
- Reverse video, audio, or both.
- Keep or mute audio.

## FFmpeg Approach
```
ffmpeg -i input.mp4 -vf reverse -af areverse output.mp4
```
Audio only:
```
ffmpeg -i input.mp3 -af areverse output.mp3
```

## UI Notes
- Strongly recommend short clips.
- Offer separate toggles for video vs. audio reversal.

## Constraints & Edge Cases
- `reverse` buffers the entire stream in memory — hard-limit clip length to avoid crashes.
- Very memory-intensive; warn clearly for anything beyond a few seconds at high resolution.
