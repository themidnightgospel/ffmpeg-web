# Feature Specs

This directory holds one spec file per tool/utility planned for the **ffmpeg-web** project — a collection of free, open-source, 100% client-side media tools powered by [ffmpeg.wasm](https://github.com/ffmpegwasm/ffmpeg.wasm) and hosted on GitHub Pages.

## Principles (apply to every feature)

- **100% client-side.** No file ever leaves the browser. All processing runs in WebAssembly on the user's machine.
- **No backend.** Static hosting only (GitHub Pages). No uploads, no accounts, no tracking.
- **Lazy-loaded core.** The ~25–30 MB ffmpeg.wasm core loads on demand, never on initial page load.
- **Multithreading where possible.** Use the `-mt` core with a [`coi-serviceworker`](https://github.com/gzuidhof/coi-serviceworker) shim to enable `SharedArrayBuffer` cross-origin isolation (GitHub Pages can't set COOP/COEP headers directly).
- **Graceful limits.** Warn on large files (browser tabs cap ~2–4 GB RAM). Show progress and allow cancel.
- **Shared architecture.** One landing page + a shared ffmpeg wrapper module; each tool is its own route reusing the same core.

## Known ffmpeg.wasm constraints (apply to every spec)

These bite implementers repeatedly, so they're stated once here rather than in each file:

- **No `ffprobe`.** The `@ffmpeg/ffmpeg` package exposes only the `ffmpeg` command. To read duration/streams/codecs, either use the browser's own `HTMLMediaElement.duration`/track APIs, or parse the `ffmpeg -i` output captured via the `log` event. Specs that mention "probe the duration/streams" mean this — not a separate ffprobe binary.
- **No `/dev/null`.** The in-memory MEMFS has no device files. Discard output (e.g. two-pass pass 1) with `-f null -`, never `-f null /dev/null`.
- **Two-pass writes a log file** (`ffmpeg2pass-0.log`) into the virtual FS — use unique names if runs can overlap, and clean up the FS between jobs.
- **Presets are slow in WASM.** Single-threaded encoding makes `-preset medium`/`slow` painfully slow; prefer `veryfast`/`ultrafast` and lean on multithreading where available. Treat "slower preset = smaller file" advice as an advanced opt-in, not the default.

## Spec template

Each file follows: Description · User Story · Inputs · Outputs · Options · FFmpeg Approach · UI Notes · Constraints.

## Index

### Format conversion
- [video-converter](./video-converter.md)
- [audio-converter](./audio-converter.md)
- [video-to-audio-extractor](./video-to-audio-extractor.md)
- [video-to-gif](./video-to-gif.md)
- [gif-to-video](./gif-to-video.md)
- [image-sequence-to-video](./image-sequence-to-video.md)
- [video-to-image-sequence](./video-to-image-sequence.md)
- [image-format-converter](./image-format-converter.md)

### Compression & optimization
- [video-compressor](./video-compressor.md)
- [audio-compressor](./audio-compressor.md)
- [gif-optimizer](./gif-optimizer.md)
- [fit-under-target-size](./fit-under-target-size.md)

### Trimming & cutting
- [video-trimmer](./video-trimmer.md)
- [media-splitter](./media-splitter.md)
- [media-merger](./media-merger.md)
- [silence-remover](./silence-remover.md)
- [loop-maker](./loop-maker.md)

### Resize & transform
- [video-resizer](./video-resizer.md)
- [aspect-ratio-changer](./aspect-ratio-changer.md)
- [rotate-flip-mirror](./rotate-flip-mirror.md)
- [crop-tool](./crop-tool.md)
- [speed-changer](./speed-changer.md)
- [framerate-converter](./framerate-converter.md)
- [reverse-media](./reverse-media.md)

### Audio tools
- [volume-normalizer](./volume-normalizer.md)
- [audio-fader](./audio-fader.md)
- [channel-tools](./channel-tools.md)
- [pitch-tempo-changer](./pitch-tempo-changer.md)
- [audio-joiner](./audio-joiner.md)
- [ringtone-maker](./ringtone-maker.md)
- [waveform-generator](./waveform-generator.md)
- [replace-audio-track](./replace-audio-track.md)

### Subtitles & overlays
- [burn-subtitles](./burn-subtitles.md)
- [extract-subtitles](./extract-subtitles.md)
- [add-watermark](./add-watermark.md)
- [add-text-overlay](./add-text-overlay.md)
- [picture-in-picture](./picture-in-picture.md)

### Extraction & capture
- [thumbnail-generator](./thumbnail-generator.md)
- [contact-sheet](./contact-sheet.md)
- [poster-frame-picker](./poster-frame-picker.md)
- [metadata-viewer](./metadata-viewer.md)
- [metadata-stripper](./metadata-stripper.md)

### Social-media / platform helpers
- [social-media-presets](./social-media-presets.md)
- [messaging-optimizer](./messaging-optimizer.md)
- [podcast-prep](./podcast-prep.md)

### GIF & meme tools
- [gif-maker](./gif-maker.md)
- [meme-caption](./meme-caption.md)
- [boomerang-maker](./boomerang-maker.md)

### Advanced / niche
- [color-adjuster](./color-adjuster.md)
- [deinterlacer](./deinterlacer.md)
- [video-stabilization](./video-stabilization.md)
- [chroma-key](./chroma-key.md)
- [video-comparison](./video-comparison.md)
- [audio-spectrogram](./audio-spectrogram.md)
