import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  // TODO: replace with the real custom domain once chosen. Drives canonicals + sitemap.
  site: 'https://ffmpeg.web',
  base: '/',
  integrations: [react(), sitemap()],
  vite: {
    // Cross-origin isolation for ffmpeg.wasm's multithreaded core (dev only;
    // production uses public/coi-serviceworker.js). See docs/tech-stack.md.
    server: {
      headers: {
        'Cross-Origin-Opener-Policy': 'same-origin',
        'Cross-Origin-Embedder-Policy': 'require-corp',
      },
    },
    // ffmpeg packages ship their own workers/wasm — don't pre-bundle them.
    optimizeDeps: {
      exclude: ['@ffmpeg/ffmpeg', '@ffmpeg/util'],
    },
  },
});
