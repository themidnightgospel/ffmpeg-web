# Color / Brightness / Contrast Adjuster

**Category:** Advanced / niche
**Status:** Planned

## Description
Adjust a video's visual properties — brightness, contrast, saturation, gamma, and hue — for basic color correction and grading.

## User Story
As a user, I want to adjust my video's color and brightness so that it looks better or matches a desired look.

## Inputs
- One video file.

## Outputs
- One color-adjusted video file, downloadable.

## Options / Controls
- Brightness, contrast, saturation, gamma, hue sliders.
- Optional presets (warm, cool, vivid, B&W).

## FFmpeg Approach
```
ffmpeg -i input.mp4 -vf "eq=brightness=0.06:contrast=1.1:saturation=1.2:gamma=1.0,hue=h=10" -c:a copy output.mp4
```
Black & white: `hue=s=0`.

## UI Notes
- Live before/after frame preview as sliders move.
- Reset-to-default and preset buttons.

## Constraints & Edge Cases
- Requires full re-encode (audio can be copied).
- Extreme values can clip highlights/shadows.
