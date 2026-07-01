# Social-Media Presets

**Category:** Social-media / platform helpers
**Status:** Planned

## Description
One-click optimization of a video for a specific platform — automatically applying the correct resolution, aspect ratio, codec, bitrate, and duration limits for Twitter/X, Instagram (Feed/Reels/Stories), TikTok, YouTube (Shorts/standard), and Facebook.

## User Story
As a user, I want to prep my video for a specific platform in one click so that it uploads cleanly and looks right.

## Inputs
- One video file.
- A platform/format selection.

## Outputs
- One platform-optimized video file, downloadable.

## Options / Controls
- Platform + placement preset (e.g. "Instagram Reels", "YouTube Shorts", "X post").
- Fit method for aspect changes (crop/pad).
- Optional trim to meet duration limits.

## FFmpeg Approach
Each preset encapsulates a known-good recipe, e.g. TikTok/Reels 1080×1920 H.264:
```
ffmpeg -i input.mp4 -vf "scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2" -c:v libx264 -b:v 6M -c:a aac -b:a 128k -movflags +faststart output.mp4
```

## UI Notes
- Show each preset's target specs (resolution, max length, aspect).
- Warn when the source exceeds duration limits and offer to trim.

## Constraints & Edge Cases
- Platform specs change over time — keep presets in a single, easily updated config.
- Composes with [aspect-ratio-changer](./aspect-ratio-changer.md) and [fit-under-target-size](./fit-under-target-size.md).
