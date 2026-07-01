# Video Stabilization

**Category:** Advanced / niche
**Status:** Planned

## Description
Reduce camera shake in handheld footage using two-pass motion analysis and correction (vidstab).

## User Story
As a user, I want to stabilize shaky footage so that it looks smoother and more professional.

## Inputs
- One shaky video file.

## Outputs
- One stabilized video file, downloadable.

## Options / Controls
- Smoothing strength.
- Optional crop/zoom to hide edge movement.

## FFmpeg Approach
Two-pass with vidstab:
```
ffmpeg -i input.mp4 -vf vidstabdetect=shakiness=5:accuracy=15 -f null -
ffmpeg -i input.mp4 -vf vidstabtransform=smoothing=30,unsharp=5:5:0.8:3:3:0.4 output.mp4
```

## UI Notes
- Explain the two-pass process and that it takes longer.
- Optional side-by-side before/after preview.

## Constraints & Edge Cases
- **Requires vidstab compiled into the ffmpeg.wasm core** — verify availability; may need a custom core build. If unavailable, hide this tool.
- Two-pass + filtering is compute-heavy; keep clips short in WASM.
