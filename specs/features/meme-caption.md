# Meme Caption Tool

**Category:** GIF & meme tools
**Status:** Planned

## Description
Add classic meme captions (top/bottom bold text, or a white caption bar above the video) to a video or GIF.

## User Story
As a user, I want to add meme-style captions to a clip so that I can create and share memes.

## Inputs
- One video or GIF.
- Caption text (top and/or bottom, or a header bar).

## Outputs
- One captioned video or GIF, downloadable.

## Options / Controls
- Caption style: Impact top/bottom overlay, or white header bar with black text.
- Font, size, outline.
- Text for each position.

## FFmpeg Approach
Classic overlay text:
```
ffmpeg -i input.mp4 -vf "drawtext=text='TOP TEXT':fontfile=/impact.ttf:fontsize=48:fontcolor=white:borderw=3:bordercolor=black:x=(w-tw)/2:y=20,drawtext=text='BOTTOM TEXT':...:y=h-th-20" -c:a copy output.mp4
```
Header bar via `pad` + `drawtext` in the padded area.

## UI Notes
- Preset the Impact-style look; live preview.
- Toggle between overlay and header-bar styles.

## Constraints & Edge Cases
- Bundle an Impact-like font (licensing-friendly alternative).
- Escaping special characters in the text.
