# Contact Sheet / Storyboard

**Category:** Extraction & capture
**Status:** Planned

## Description
Generate a single image grid of thumbnails sampled evenly across a video — a "contact sheet" that previews the whole video at a glance.

## User Story
As a user, I want a grid of thumbnails from my video so that I can preview its contents in one image.

## Inputs
- One video file.

## Outputs
- One montage image (PNG/JPEG), downloadable.

## Options / Controls
- Grid dimensions (columns × rows) or total thumbnail count.
- Thumbnail size and spacing/padding.
- Optional timestamp label on each tile.

## FFmpeg Approach
```
ffmpeg -i input.mp4 -vf "fps=1/10,scale=320:-1,tile=4x5" -frames:v 1 contact_sheet.png
```
Adjust the `fps` fraction and `tile` grid to control sampling/layout.

## UI Notes
- Preview the sheet before download.
- Compute sampling interval from duration and requested tile count.

## Constraints & Edge Cases
- Very long videos need coarse sampling to fit the grid.
- Large grids produce big images; cap dimensions.
