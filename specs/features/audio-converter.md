# Audio Converter

**Category:** Format conversion
**Status:** Planned

## Description
Convert an audio file between formats — MP3, WAV, FLAC, AAC, OGG, M4A, Opus. Handles lossy ⇄ lossless and re-encoding between lossy formats.

## User Story
As a user, I want to convert an audio file to a different format so that it works with my player, DAW, or upload requirements.

## Inputs
- One audio file (also accepts a video file to pull audio from — but see video-to-audio-extractor for that dedicated flow).

## Outputs
- One converted audio file, downloadable.

## Options / Controls
- Target format (MP3, WAV, FLAC, AAC, OGG, M4A, Opus).
- Bitrate / quality selector for lossy targets (e.g. 128/192/256/320 kbps for MP3).
- Sample rate override (e.g. 44.1 kHz, 48 kHz) — optional.

## FFmpeg Approach
```
ffmpeg -i input.wav -c:a libmp3lame -b:a 320k output.mp3
ffmpeg -i input.mp3 -c:a flac output.flac
ffmpeg -i input.m4a -c:a libopus -b:a 96k output.opus
```

## UI Notes
- Warn when converting lossy → lossless (no quality is regained; file just gets bigger).
- Show estimated output size based on bitrate × duration.

## Constraints & Edge Cases
- Available encoders depend on the core build (libmp3lame, libopus, etc.).
- Preserve metadata/tags where possible (`-map_metadata 0`).
