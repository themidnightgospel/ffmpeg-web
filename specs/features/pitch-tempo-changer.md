# Pitch / Tempo Changer

**Category:** Audio tools
**Status:** Planned

## Description
Change the pitch of audio without changing tempo, or change tempo without changing pitch (independent time/pitch manipulation).

## User Story
As a user, I want to change pitch or tempo independently so that I can transpose a track or slow it down without the "chipmunk" effect.

## Inputs
- One audio file (or video's audio).

## Outputs
- One adjusted audio file, downloadable.

## Options / Controls
- Pitch shift (semitones) — keep tempo.
- Tempo change (%) — keep pitch.
- Optional combined mode.

## FFmpeg Approach
Tempo only (pitch preserved):
```
ffmpeg -i input.mp3 -af "atempo=1.25" output.mp3
```
Pitch only (using rubberband if available, else asetrate+atempo trick):
```
ffmpeg -i input.mp3 -af "asetrate=44100*1.06,aresample=44100,atempo=1/1.06" output.mp3
```

## UI Notes
- Present pitch in semitones and tempo in percent; hide the math.
- Note quality trade-offs of the resample trick vs. a dedicated pitch library.

## Constraints & Edge Cases
- High-quality pitch shifting needs the `rubberband` filter — only if compiled into the core.
- The asetrate trick can introduce artifacts at large shifts.
