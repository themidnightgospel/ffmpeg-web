import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  // Custom domain (khinkali.cc). Drives canonicals + sitemap.
  site: 'https://khinkali.cc',
  base: '/',
  integrations: [react(), sitemap()],
  // Cross-origin isolation for ffmpeg.wasm's multithreaded core in dev/preview
  // (production uses public/coi-serviceworker.js). See docs/tech-stack.md.
  server: {
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
    },
  },
  vite: {
    // ffmpeg packages ship their own workers/wasm — don't pre-bundle them.
    optimizeDeps: {
      exclude: ['@ffmpeg/ffmpeg', '@ffmpeg/util'],
    },
  },
});
