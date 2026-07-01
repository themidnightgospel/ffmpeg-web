# Audio Joiner

**Category:** Audio tools
**Status:** Planned

## Description
Concatenate multiple audio files into one continuous track, in a chosen order, with an optional crossfade between clips.

## User Story
As a user, I want to join several audio files into one so that they play back as a single track.

## Inputs
- Multiple audio files.

## Outputs
- One joined audio file, downloadable.

## Options / Controls
- Reorderable clip list.
- Optional crossfade duration between clips.
- Output format/bitrate.

## FFmpeg Approach
Simple concat (matching formats):
```
ffmpeg -f concat -safe 0 -i list.txt -c copy output.mp3
```
Crossfade between two:
```
ffmpeg -i a.mp3 -i b.mp3 -filter_complex "acrossfade=d=3" output.mp3
```

## UI Notes
- Drag-to-reorder with per-clip durations.
- Note that mismatched sample rates/codecs require re-encoding.

## Constraints & Edge Cases
- Concat demuxer needs consistent codec/sample-rate; otherwise re-encode.
- Crossfade chaining across many files needs a nested filter graph.
