# Replace / Mute Audio Track

**Category:** Audio tools
**Status:** Planned

## Description
Swap a video's audio for a new track, mute it entirely, or mix in additional audio. Useful for adding music, dubbing, or removing sound.

## User Story
As a user, I want to replace or mute a video's audio so that it has the soundtrack I want (or none).

## Inputs
- One video file.
- Optionally, one audio file (the replacement/added track).

## Outputs
- One video file with modified audio, downloadable.

## Options / Controls
- Mode: replace audio, mute audio, or mix new audio over existing.
- Trim/loop the new audio to match video length.
- Volume balance when mixing.

## FFmpeg Approach
Replace:
```
ffmpeg -i video.mp4 -i audio.mp3 -map 0:v -map 1:a -c:v copy -shortest output.mp4
```
Mute:
```
ffmpeg -i video.mp4 -an -c:v copy output.mp4
```
Mix:
```
ffmpeg -i video.mp4 -i music.mp3 -filter_complex "[0:a][1:a]amix=inputs=2:duration=first" -c:v copy output.mp4
```

## UI Notes
- Handle length mismatch (trim, loop, or `-shortest`).
- Copy video stream to keep it fast and lossless.

## Constraints & Edge Cases
- New audio shorter/longer than video needs a policy (loop vs. cut).
- Mixing levels may clip — offer volume controls.
