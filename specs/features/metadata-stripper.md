# Metadata Stripper

**Category:** Extraction & capture
**Status:** Planned

## Description
Remove metadata (title, artist, comments, GPS location, creation date, software tags) from a media file for privacy, without re-encoding the content.

## User Story
As a user, I want to strip metadata from a file so that I don't leak personal or location info when I share it.

## Inputs
- One media file.

## Outputs
- One cleaned file with metadata removed, downloadable.

## Options / Controls
- Strip all metadata, or select which fields to remove.
- Optionally also remove chapters and attachments.

## FFmpeg Approach
```
ffmpeg -i input.mp4 -map_metadata -1 -c copy output.mp4
```
`-c copy` avoids re-encoding, so it's fast and lossless.

## UI Notes
- Show the detected metadata (from the viewer) before and after so users can confirm removal.
- Emphasize the privacy benefit (e.g. GPS in phone videos/photos).

## Constraints & Edge Cases
- Some container-level fields may persist; verify by re-reading metadata after.
- Doesn't remove visible on-screen info (that's baked into pixels).
