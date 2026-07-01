# Loop Maker

**Category:** Trimming & cutting
**Status:** Planned

## Description
Repeat a video or audio clip a chosen number of times (or to a target total duration) to create a seamless loop.

## User Story
As a user, I want to loop a clip several times so that I have a longer version for backgrounds, music, or ambience.

## Inputs
- One video or audio file.

## Outputs
- One looped file, downloadable.

## Options / Controls
- Number of repeats, or target total duration.
- Optional crossfade between loops (audio) for seamlessness.

## FFmpeg Approach
Stream-loop (fast):
```
ffmpeg -stream_loop 4 -i input.mp4 -c copy output.mp4
```
Loop to a duration:
```
ffmpeg -stream_loop -1 -i input.mp3 -t 600 output.mp3
```

## UI Notes
- Let the user specify either repeat count or total duration.
- Note that `-c copy` keeps it fast and lossless.

## Constraints & Edge Cases
- Large repeat counts produce large files — show estimated output size.
- Crossfading requires re-encoding and filter graphs (slower).
