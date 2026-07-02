/* Prefix an internal, root-relative path with the configured base path so links
   work under a project sub-path (e.g. /ffmpeg-web/) as well as at the root (/).
   `import.meta.env.BASE_URL` is '/' or '/ffmpeg-web/' — driven by astro.config
   `base`, so this stays correct whichever base is set (no code changes needed
   when switching between github.io and a root custom domain). */
export function withBase(path: string): string {
  const base = import.meta.env.BASE_URL || '/';
  return `${base.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
}
