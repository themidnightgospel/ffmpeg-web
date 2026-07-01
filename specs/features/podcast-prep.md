# Podcast Prep

**Category:** Social-media / platform helpers
**Status:** Planned

## Description
Prepare a recording for podcast publishing — normalize loudness to podcast standards, optionally trim silence, add intro/outro, and export a properly tagged MP3.

## User Story
As a user, I want to prep my recording for podcast release so that it meets loudness standards and is ready to upload.

## Inputs
- One audio (or video) recording.
- Optional intro/outro audio files.

## Outputs
- One publish-ready MP3 (with metadata tags), downloadable.

## Options / Controls
- Loudness target (default −16 LUFS for podcasts).
- Optional silence trim.
- Optional intro/outro concatenation.
- Metadata tags (title, author, episode).
- Output bitrate (e.g. 128 kbps mono/stereo).

## FFmpeg Approach
Chains normalize + encode + tag:
```
ffmpeg -i input.wav -af "loudnorm=I=-16:TP=-1.5:LRA=11" -c:a libmp3lame -b:a 128k -metadata title="Episode 1" output.mp3
```

## UI Notes
- Bundle the common podcast steps into one guided flow.
- Show measured vs. target loudness.

## Constraints & Edge Cases
- Two-pass loudnorm is more accurate but slower.
- Composes with [volume-normalizer](./volume-normalizer.md), [silence-remover](./silence-remover.md), and [audio-joiner](./audio-joiner.md).
