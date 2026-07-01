# Ringtone Maker

**Category:** Audio tools
**Status:** Planned

## Description
Create a phone ringtone by trimming a song to a short segment, adding fades, and exporting to a ringtone format (M4R for iPhone, MP3/OGG for Android).

## User Story
As a user, I want to make a ringtone from a song so that I can use my favorite part as my ringtone.

## Inputs
- One audio file (or video to pull audio from).

## Outputs
- One ringtone file, downloadable (M4R / MP3 / OGG).

## Options / Controls
- Trim start/end (with a length cap, e.g. ≤ 30–40s for iPhone).
- Fade in/out toggles.
- Target format (M4R for iOS, MP3/OGG for Android).
- Volume normalize option.

## FFmpeg Approach
```
ffmpeg -ss 30 -t 30 -i song.mp3 -af "afade=t=in:st=0:d=1,afade=t=out:st=29:d=1" -c:a aac ringtone.m4r
```
(M4R is an AAC/M4A stream renamed.)

## UI Notes
- Enforce the iOS length limit when M4R is selected.
- Include brief instructions on installing the ringtone per platform.

## Constraints & Edge Cases
- iPhone ringtones must be ≤ 40s and AAC in an .m4r container.
- Provide platform-specific defaults automatically.
