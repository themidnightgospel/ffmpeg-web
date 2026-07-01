# Messaging Optimizer

**Category:** Social-media / platform helpers
**Status:** Planned

## Description
Optimize a video for messaging apps (WhatsApp, Telegram, Messenger, Discord) — compressing and formatting it to send quickly and stay under app size limits.

## User Story
As a user, I want to prep a video for a chat app so that it sends fast and doesn't get rejected for being too large.

## Inputs
- One video file.
- Target app selection.

## Outputs
- One optimized video file, downloadable.

## Options / Controls
- App preset (WhatsApp, Telegram, Discord free/nitro, Messenger).
- Quality vs. size balance.
- Optional resolution cap.

## FFmpeg Approach
Reuses the size-targeting and compression recipes with app-specific caps, e.g. WhatsApp-friendly:
```
ffmpeg -i input.mp4 -vf "scale=-2:720" -c:v libx264 -crf 28 -preset veryfast -c:a aac -b:a 128k -movflags +faststart output.mp4
```

## UI Notes
- Show each app's size limit and the estimated output size.
- Fall back to [fit-under-target-size](./fit-under-target-size.md) logic for hard caps.

## Constraints & Edge Cases
- App limits change; keep them in config.
- Overlaps with [video-compressor](./video-compressor.md); this is the preset-driven convenience layer.
