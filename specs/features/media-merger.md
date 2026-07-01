# Media Merger / Concatenator

**Category:** Trimming & cutting
**Status:** Planned

## Description
Join multiple video (or audio) clips into a single continuous file, in a user-defined order.

## User Story
As a user, I want to merge several clips into one file so that they play back as a single video.

## Inputs
- Multiple video or audio files.

## Outputs
- One merged file, downloadable.

## Options / Controls
- Reorderable list of input clips.
- Mode: fast concat (stream copy, requires matching codecs/params) or re-encode (handles mismatched inputs).

## FFmpeg Approach
Concat demuxer (fast, same codec/params):
```
# filelist.txt: file 'a.mp4' \n file 'b.mp4'
ffmpeg -f concat -safe 0 -i filelist.txt -c copy output.mp4
```
Concat filter (re-encode, mismatched inputs):
```
ffmpeg -i a.mp4 -i b.mp4 -filter_complex "[0:v][0:a][1:v][1:a]concat=n=2:v=1:a=1[v][a]" -map "[v]" -map "[a]" output.mp4
```

## UI Notes
- Drag-and-drop ordering with thumbnails.
- Detect codec/resolution mismatches and auto-select re-encode mode with a note.

## Constraints & Edge Cases
- Fast concat fails or glitches if inputs differ in codec, resolution, or framerate — normalize first or re-encode.
- Re-encoding all inputs is slow in WASM.
