# Waveform Image Generator

**Category:** Audio tools
**Status:** Planned

## Description
Render a static waveform image (PNG) from an audio file, or a waveform video for audiograms. Useful for thumbnails, social audio posts, and visualizations.

## User Story
As a user, I want to generate a waveform image from my audio so that I can use it as artwork or a social post.

## Inputs
- One audio file.

## Outputs
- A waveform image (PNG), or optionally a waveform video (MP4).

## Options / Controls
- Image dimensions.
- Colors (waveform + background).
- Style: filled waveform, line, or bars.
- Optional: animated waveform video synced to the audio.

## FFmpeg Approach
Static image:
```
ffmpeg -i input.mp3 -filter_complex "showwavespic=s=1200x400:colors=#3498db" -frames:v 1 waveform.png
```
Animated audiogram (video):
```
ffmpeg -i input.mp3 -filter_complex "showwaves=s=1200x400:mode=line" -c:v libx264 waveform.mp4
```

## UI Notes
- Live color pickers with preview.
- Offer transparent-background PNG option.

## Constraints & Edge Cases
- Animated waveform videos take real encoding time proportional to duration.
- Very long audio compresses detail in a fixed-width image.
