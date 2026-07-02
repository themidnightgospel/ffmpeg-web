# Tech Stack & Architecture

Status: **decided** · Last updated: 2026-07-01

## Summary

ffmpeg.web is a **static, SEO-first, 100% client-side** site: a hub, per-tool pages, and a large set of programmatic "convert X to Y" landing pages. Every indexable page is **pre-rendered to real HTML** at build time; the only JavaScript that ships is the interactive converter, mounted as an island where needed. All media processing runs in the browser via ffmpeg.wasm. Hosted on GitHub Pages.

> SEO is priority #1. This drove the move from a React SPA to Astro — see [`docs/seo.md`](./seo.md) for the full SEO plan.

| Concern | Choice | Why |
| --- | --- | --- |
| Rendering | **Static Site Generation (Astro)** | Real HTML + per-page meta for every URL; indexable long-tail pages. |
| Static/SEO shell | **Astro `.astro` pages & layouts** | Zero JS on indexable pages; first-class `<head>`/meta control. |
| Interactivity | **React island** (`@astrojs/react`), `client:visible` | Reuses our tested converter; loads only on tool/convert pages, not on the SEO-critical paint. |
| Language | **TypeScript** (strict) | Type-safe tool + SEO schema across many generated pages. |
| Styling | **Plain CSS + design tokens** (`design-system/ffmpeg-web.css`) | Single source of truth; framework-agnostic. |
| Media engine | **@ffmpeg/ffmpeg (ffmpeg.wasm)** — single-threaded, lazy, cached | Dependable everywhere; loaded on demand, prefetched + Cache-Storage cached. |
| Sitemap | **@astrojs/sitemap** | Auto `sitemap.xml` from routes. |
| Hosting | **GitHub Pages, custom domain at root** | Clean canonicals/branding; static matches "no backend". |

## Rendering model

- **Indexable pages are static HTML with zero JavaScript.** Hub, `/convert/` landing, and every `/convert/{from}-to-{to}` page render fully at build. Crawlers see complete content, titles, meta, and JSON-LD without executing anything.
- **The converter is a React island.** It hydrates only on pages that have it (`client:visible`), and its ffmpeg weight never touches the static pages. The island seeds its initial state from Astro props (e.g. `target="mov"`).
- **No SPA router.** `HashRouter` is gone. Each URL is a real file; navigation is normal links. (This is the core SEO fix — hash routes and empty-`<div>` SPAs cannot rank the long-tail pages.)

## URL taxonomy

| Path | Page |
| --- | --- |
| `/` | Hub — all 54 tools |
| `/convert/` | Generic converter landing (broad "video converter" intent) |
| `/convert/{from}-to-{to}` | Programmatic conversion pages, e.g. `/convert/mp4-to-mov`, `/convert/mp3-to-wav` |
| `/tools/{slug}` | Non-conversion tools (compressor, trimmer, …) |

Flat `/convert/` namespace across video/audio/image; no media type in the URL. See [`docs/seo.md`](./seo.md) for scope, canonicals, and content rules.

## ffmpeg engine: single-threaded core (no isolation)

We use the **single-threaded** ffmpeg.wasm core. The multithreaded core needs
`SharedArrayBuffer` (cross-origin isolation) and proved **unreliable** — `exec()`
hangs or crashes the tab in several environments, and VP9 encoding OOM-crashed the
renderer. The single-thread core is dependable everywhere and needs **no**
cross-origin isolation, so:

- **No `COOP`/`COEP` headers and no `coi-serviceworker`** — simpler, and no forced
  page reload on first visit.
- The core is **self-hosted** in `public/ffmpeg/core/` (copied from `@ffmpeg/core`
  by `scripts/copy-ffmpeg-core.mjs`) and **cached** in the Cache Storage API
  (versioned) so it downloads once. It's **prefetched on tool-page load** so
  Convert is ready quickly.
- **WebM uses VP8** (`libvpx`), not VP9 (too heavy for wasm).
- The whole conversion path is verified by the release **conversion matrix**
  (docs/testing.md), which runs every conversion for real in a browser.

## Folder structure

```
ffmpeg-web/
  astro.config.mjs             # Astro + @astrojs/react + @astrojs/sitemap; site/base
  tsconfig.json  package.json
  public/
    ffmpeg/core/               # self-hosted single-thread ffmpeg core (copied at build)
    og-default.png             # default social image
    robots.txt  CNAME          # robots.txt + custom domain
  design-system/               # canonical stylesheet + living styleguide (imported by the app)
  specs/features/              # one spec per tool
  docs/                        # tech-stack.md, seo.md, decisions
  src/
    pages/
      index.astro              # hub /
      convert/
        index.astro            # /convert/ generic landing
        [pair].astro           # /convert/{from}-to-{to} via getStaticPaths()
      tools/[slug].astro       # other tools
    layouts/
      BaseLayout.astro         # <head>, <Seo>, design-system import
    components/
      seo/Seo.astro            # title, meta, canonical, OG, JSON-LD slot
      astro/                   # static components: Masthead, Footer, Breadcrumbs, RelatedConversions, CatalogueItem
      react/                   # ISLANDS (React)
        Converter.tsx          # island entry; seeds state from props
        tool/                  # ToolRunner, ToolOptionControl, useConversion
        ui/                    # Button, Segmented, Slider, Checkbox, DropZone, ProgressBar
    lib/
      tools/                   # types, registry, video-converter, … (pure, framework-agnostic)
      runner/                  # types, mockRunner, ffmpegRunner (single-thread + caching)
      seo/                     # JSON-LD builders: webApplication, howTo, faqPage, breadcrumb
      kb/                      # formats knowledge base + pair generation
      format.ts  cx.ts
    data/
      tools.ts                 # catalogue metadata
    styles/
      app.css
```

## What carried over from the React scaffold

**Kept:** design system CSS, the typed **Tool schema + `buildCommand`** configs, the **`ConversionRunner`** interface, **`useConversion`**, the UI components, and the unit tests.
**Retired:** `App.tsx`, `main.tsx`, `HashRouter`, and the React `HubPage`/`ToolPage` (replaced by Astro pages/layouts).

## Commands

```bash
npm install
npm run dev        # astro dev
npm run typecheck  # astro check + tsc --noEmit
npm run lint       # eslint (type-aware) + jsx-a11y
npm run test       # vitest (pure core: buildCommand, kb, seo builders)
npm run build      # astro build -> dist/ (static)
npm run preview    # serve the static build
```

## Deployment

GitHub Actions builds the static site with the official Astro action and publishes `dist/` to GitHub Pages on push to `main`. `site` (custom domain) is set in `astro.config.mjs`; `base: '/'` at root. `@astrojs/sitemap` emits `sitemap.xml`; `public/robots.txt` references it.
