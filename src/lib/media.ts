/* Browser-only media helpers (used inside React islands, never during SSR). */

/** Read a media file's duration (seconds) via a throwaway media element.
    Resolves 0 if the browser can't decode/probe it. Best-effort. */
export function getMediaDuration(file: File): Promise<number> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const isAudio = file.type.startsWith('audio');
    const el = document.createElement(isAudio ? 'audio' : 'video');
    el.preload = 'metadata';
    const done = (value: number) => {
      URL.revokeObjectURL(url);
      resolve(Number.isFinite(value) && value > 0 ? value : 0);
    };
    el.onloadedmetadata = () => done(el.duration);
    el.onerror = () => done(0);
    el.src = url;
  });
}
