import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  // Custom domain khinkali.cc serves at the root, so canonicals/sitemap and the
  // base path are both '/'. (All internal links go through withBase(), so this
  // is the only knob to flip if the host ever changes to a project sub-path.)
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
