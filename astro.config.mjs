import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  // Custom domain (khinkali.cc). Drives canonicals + sitemap.
  site: 'https://khinkali.cc',
  base: '/',
  integrations: [react(), sitemap()],
  vite: {
    // ffmpeg packages ship their own workers/wasm — don't pre-bundle them.
    optimizeDeps: {
      exclude: ['@ffmpeg/ffmpeg', '@ffmpeg/util'],
    },
  },
});
