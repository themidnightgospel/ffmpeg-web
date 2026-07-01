# Aspect-Ratio Changer

**Category:** Resize & transform
**Status:** Planned

## Description
Convert a video to a different aspect ratio (16:9, 9:16, 1:1, 4:5) by cropping or padding — with presets for Instagram, TikTok, YouTube, and Stories.

## User Story
As a user, I want to change my video's aspect ratio so that it fits a specific social platform's format.

## Inputs
- One video file.

## Outputs
- One reframed video file, downloadable.

## Options / Controls
- Target aspect ratio (presets + custom).
- Method: **crop** (fill, cuts edges) or **pad** (fit, adds bars).
- Pad color / optional blurred-background fill.
- Position/anchor for cropping.

## FFmpeg Approach
Pad to 9:16 with blurred background:
```
ffmpeg -i input.mp4 -vf "scale=1080:-1,split[a][b];[b]scale=1080:1920,boxblur=20[bg];[a]scale=1080:-1[fg];[bg][fg]overlay=(W-w)/2:(H-h)/2" output.mp4
```
Simple center crop to 1:1:
```
ffmpeg -i input.mp4 -vf "crop=min(iw\,ih):min(iw\,ih)" output.mp4
```

## UI Notes
- Live preview of the crop/pad framing.
- Platform preset buttons that set both aspect ratio and resolution.

## Constraints & Edge Cases
- Cropping loses content; padding wastes screen space — let the user choose.
- Blurred-background fill is popular but slower (extra filter passes).
