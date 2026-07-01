# GIF Maker (from video, with editing)

**Category:** GIF & meme tools
**Status:** Planned

## Description
A richer GIF-creation flow than the basic converter: trim a clip, adjust speed, crop, add a caption, and tune size/framerate — all in one guided tool.

## User Story
As a user, I want to make a polished GIF from a video with captions and trimming so that it's share-ready in one step.

## Inputs
- One video file.

## Outputs
- One animated GIF, downloadable.

## Options / Controls
- Trim start/end.
- Speed adjustment.
- Crop / aspect.
- Caption text (top/bottom) with styling.
- Width, framerate, quality/palette.

## FFmpeg Approach
Combines trim + filters + palette in a single filter graph, e.g.:
```
ffmpeg -ss 3 -t 4 -i input.mp4 -vf "fps=15,scale=480:-1:flags=lanczos,drawtext=text='LOL':fontcolor=white:fontsize=36:x=(w-tw)/2:y=h-50,palettegen" palette.png
ffmpeg -ss 3 -t 4 -i input.mp4 -i palette.png -filter_complex "fps=15,scale=480:-1:flags=lanczos,drawtext=...[x];[x][1:v]paletteuse" output.gif
```

## UI Notes
- Single-page editor with live preview of trim, crop, and caption.
- Live size estimate.

## Constraints & Edge Cases
- Extends [video-to-gif](./video-to-gif.md) and [meme-caption](./meme-caption.md); keep short for reasonable size.
- Fonts must be present in the WASM FS.
