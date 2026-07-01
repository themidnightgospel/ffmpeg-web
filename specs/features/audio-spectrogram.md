# Audio Spectrogram Generator

**Category:** Advanced / niche
**Status:** Planned

## Description
Generate a spectrogram — a frequency-over-time visualization — from an audio file, as a static image or an animated video. Useful for audio analysis and striking visuals.

## User Story
As a user, I want to generate a spectrogram of my audio so that I can analyze its frequencies or use it as a visual.

## Inputs
- One audio file.

## Outputs
- A spectrogram image (PNG) or spectrogram video (MP4).

## Options / Controls
- Dimensions.
- Color scheme.
- Frequency scale (linear/log).
- Static image vs. animated video.

## FFmpeg Approach
Static image:
```
ffmpeg -i input.mp3 -lavfi "showspectrumpic=s=1200x600:legend=1" spectrogram.png
```
Animated:
```
ffmpeg -i input.mp3 -filter_complex "showspectrum=s=1200x600:mode=combined" -c:v libx264 spectrogram.mp4
```

## UI Notes
- Preview the image before download.
- Color-scheme and scale selectors with live preview.

## Constraints & Edge Cases
- Animated spectrogram videos scale in cost with audio length.
- Long audio compresses time detail in a fixed-width image.
