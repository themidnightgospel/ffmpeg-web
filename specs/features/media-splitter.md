# Media Splitter

**Category:** Trimming & cutting
**Status:** Planned

## Description
Split a single video or audio file into multiple pieces — by fixed duration, by a target number of equal parts, or at user-defined cut points.

## User Story
As a user, I want to split a long file into segments so that I can upload it in parts or share specific chunks.

## Inputs
- One video or audio file.

## Outputs
- Multiple files, bundled into a downloadable ZIP.

## Options / Controls
- Split mode: by duration (e.g. every 10 min), by count (N equal parts), or by manual timestamps.
- Fast (stream copy) vs. precise (re-encode).

## FFmpeg Approach
Segment by duration (fast):
```
ffmpeg -i input.mp4 -c copy -f segment -segment_time 600 -reset_timestamps 1 part_%03d.mp4
```
Manual points: run individual `-ss/-to` cuts.

## UI Notes
- Preview computed segment boundaries and counts before running.
- Bundle results with a client-side ZIP library.

## Constraints & Edge Cases
- Stream-copy segments cut at keyframes, so segment lengths are approximate.
- Many segments = many files in the WASM FS; watch memory.
