# Video Resizer / Rescaler

**Category:** Resize & transform
**Status:** Planned

## Description
Change a video's resolution — downscale to 720p/480p, upscale, or set custom dimensions — with presets for common targets.

## User Story
As a user, I want to change a video's resolution so that it fits a size, platform, or bandwidth requirement.

## Inputs
- One video file.

## Outputs
- One resized video file, downloadable.

## Options / Controls
- Resolution presets (2160p, 1080p, 720p, 480p, 360p) and custom width/height.
- Lock aspect ratio (auto-compute the other dimension).
- Scaling algorithm (e.g. lanczos for quality, bilinear for speed).

## FFmpeg Approach
```
ffmpeg -i input.mp4 -vf "scale=1280:-2:flags=lanczos" -c:a copy output.mp4
```
`-2` keeps the height divisible by 2 for codec compatibility.

## UI Notes
- Show source resolution and warn on upscaling (no real detail is added).
- Preset buttons plus a custom field.

## Constraints & Edge Cases
- Keep dimensions even for H.264 (`-2` trick).
- Upscaling increases size without improving quality — inform the user.
