import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  // Canonicals + sitemap point at the eventual custom domain (khinkali.cc).
  site: 'https://khinkali.cc',
  // Served from a GitHub project sub-path for now. Switch back to '/' when the
  // khinkali.cc custom domain is live — all internal links use withBase(), so
  // no other change is needed.
  base: '/ffmpeg-web/',
  integrations: [react(), sitemap()],
  vite: {
    // ffmpeg packages ship their own workers/wasm — don't pre-bundle them.
    optimizeDeps: {
      exclude: ['@ffmpeg/ffmpeg', '@ffmpeg/util'],
    },
  },
});
