# Audio Compressor

**Category:** Compression & optimization
**Status:** Planned

## Description
Shrink an audio file by lowering its bitrate and/or sample rate, or converting to a more efficient codec (e.g. Opus). Useful for voice memos, podcasts, and attachments.

## User Story
As a user, I want to reduce an audio file's size so that it's easier to store or send.

## Inputs
- One audio file.

## Outputs
- One compressed audio file, downloadable.

## Options / Controls
- Target bitrate (e.g. 320 → 128 → 96 → 64 kbps).
- Optional sample-rate reduction (48 kHz → 44.1 → 22.05).
- Optional mono downmix (halves size for voice content).
- Codec choice (MP3, AAC, Opus — Opus is most efficient at low bitrates).

## FFmpeg Approach
```
ffmpeg -i input.wav -c:a libopus -b:a 64k -ac 1 output.opus
ffmpeg -i input.mp3 -c:a libmp3lame -b:a 96k output.mp3
```

## UI Notes
- Recommend Opus for speech/low-bitrate use; note compatibility trade-offs.
- Show before/after size and estimated quality impact.

## Constraints & Edge Cases
- Recompressing already-lossy audio degrades quality further — warn.
- Mono downmix is destructive for stereo music; default off, on for voice.
