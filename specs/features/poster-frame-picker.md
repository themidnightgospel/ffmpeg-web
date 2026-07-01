# Poster Frame Picker

**Category:** Extraction & capture
**Status:** Planned

## Description
Interactively scrub a video to find the perfect frame and set it as the poster/cover image — either exported as an image or embedded as the video's poster metadata.

## User Story
As a user, I want to pick a specific frame as my video's cover so that it shows a good still when not playing.

## Inputs
- One video file.

## Outputs
- A poster image (PNG/JPEG), and/or the same video with the chosen frame embedded as its cover.

## Options / Controls
- Frame-accurate scrubber with next/previous-frame stepping.
- Export mode: image only, or embed as cover art in the video.

## FFmpeg Approach
Export the frame:
```
ffmpeg -ss <t> -i input.mp4 -frames:v 1 poster.png
```
Embed as MP4 cover:
```
ffmpeg -i input.mp4 -i poster.png -map 0 -map 1 -c copy -disposition:v:1 attached_pic output.mp4
```

## UI Notes
- Frame-step buttons for precise selection.
- Differentiate this from [thumbnail-generator](./thumbnail-generator.md) by emphasizing embedding.

## Constraints & Edge Cases
- Frame-accurate stepping needs precise seeking (slower).
- Cover-art embedding support varies by container/player.
