# SEO Plan

Status: **decided** · Last updated: 2026-07-01

SEO is priority #1. The strategy is **programmatic long-tail SEO**: a real, individually-rankable page for each high-demand conversion (e.g. *"mp4 to mov"*), each backed by genuinely unique, fact-driven content. This document is the source of truth for how we do that without tripping thin-content penalties.

## 1. Why static rendering

Search engines must receive **real HTML with the right `<title>`, meta, and body content per URL**. A client-rendered SPA with hash routes (`/#/tools/...`) collapses every page into one indexable URL and hides content behind JS — fatal for long-tail ranking. So every indexable page is **pre-rendered to static HTML at build time** (Astro SSG), shipping **zero JavaScript**. The interactive converter is a React island that loads only on interaction and never affects the crawled content. See [`tech-stack.md`](./tech-stack.md).

## 2. URL taxonomy

| Path | Purpose |
| --- | --- |
| `/` | Hub — all tools |
| `/convert/` | Generic converter landing (broad intent, links to all pairs) |
| `/convert/{from}-to-{to}` | One page per conversion pair (the money pages) |
| `/tools/{slug}` | Non-conversion tools |

- Flat `/convert/` namespace across **video, audio, and image** — no media type in the path.
- Slugs mirror the search query exactly: `mp4-to-mov`, `webm-to-mp4`, `mp3-to-wav`, `png-to-webp`.
- `from ≠ to`; reverse pairs are **distinct** pages (`mp4-to-mov` vs `mov-to-mp4`) — both are real, different queries.

## 3. Programmatic scope (curated, not exhaustive)

Generate a **curated, demand-driven** set — quality density over volume. Naive full permutation (~100–150 pages of near-duplicate content) invites thin-content/doorway penalties.

Launch set (~40–60 pages):
- Common **video↔video** (mp4, webm, mkv, mov, avi, flv)
- Common **audio↔audio** (mp3, wav, flac, aac, ogg, m4a, opus)
- Common **image↔image** (png, jpg, webp, avif, bmp, tiff)
- High-demand **cross-type**: `*-to-mp3` (e.g. `mp4-to-mp3`), `*-to-gif`

Expand based on **Search Console** demand. Every added pair must clear the content bar below.

**Guardrail:** no page ships unless it has unique, substantive content. Volume without value hurts the whole domain.

## 4. The content moat — per-format knowledge base

Pages are **not** string-swap templates. Uniqueness comes from a typed **knowledge base** (`src/lib/kb/`):

- **`formats.ts`** — one hand-authored entry per format: `name`, `longName`, container, codecs, `lossy`/lossless, `useCases`, `pros`, `cons`, `compatibility`.
- **Pair pages assemble** from *both* formats' facts: a pair-specific intro, a "**{FROM} vs {TO} — what actually changes**" section, when-to-use guidance, and a pair/format **FAQ**.
- Formats are **derived from the tool configs** (the converter's format choices), not a parallel list — add a format once, it flows everywhere.

**Authoring rules:**
- **Per-format facts: hand-authored** (only ~15–20 formats; accuracy is the credibility layer). Wrong facts = lost trust = lost rankings.
- **FAQ/prose: AI-drafted, human-reviewed.** Never publish unreviewed generated claims.

## 5. Prefill behavior on pair pages

- The `-to-{to}` half **preselects the target format** in the converter island (via Astro props: `<Converter target="mov" sourceHint="mp4" client:visible />`).
- The `{from}-` half is a **soft hint** ("Drop your MP4") — the tool still **accepts any input**. No hard rejection.
- The **full converter** is reused (advanced options intact), not a stripped widget.

## 6. On-page meta

A reusable `<Seo>` Astro component renders, per page:

- **`<title>`** — `Convert MP4 to MOV — Free, In-Browser | ffmpeg.web` (keyword-first, benefit, brand).
- **Meta description** — ~150 chars, fact-driven, includes the query phrase + "no upload, runs in your browser, free".
- **One `<h1>`** — "Convert MP4 to MOV".
- **Self-referencing absolute `<link rel="canonical">`** (from the `site` config).
- **Open Graph + Twitter Card** (title/description/image/url).

## 7. Structured data (JSON-LD)

Typed builders in `src/lib/seo/`:

- **`WebApplication`** (site-wide) — browser app, `offers` price `0` (surfaces "Free"), privacy/no-server angle.
- **`HowTo`** (conversion pages) — "How to convert {FROM} to {TO}": drop file → pick {TO} → download. HowTo rich-result eligible.
- **`FAQPage`** (conversion pages) — the pair FAQ from the KB. FAQ rich-result eligible.
- **`BreadcrumbList`** — `Home › Convert › {FROM} to {TO}`.

## 8. Social images

- **Now:** one static branded OG image for all pages.
- **Phase 2:** per-page OG images generated at build (Satori/`astro og`) — "MP4 → MOV" — for better CTR. Not blocking.

## 9. Internal linking & crawlability

- **Related conversions** block on every pair page: reverse pair + a few same-source + a few same-target.
- **`/convert/` landing** lists **all** curated pairs, grouped by media type — every pair is one click from the hub.
- **Breadcrumbs** on every pair page (matches `BreadcrumbList`).
- **Phase 2:** per-format hubs (`/convert/mp4` → all `mp4-to-*`) as an extra linking layer, capturing "mp4 converter" queries.

## 10. Sitemap, robots, canonical, domain

- **`@astrojs/sitemap`** auto-generates `sitemap.xml` from all routes at build.
- **`public/robots.txt`** allows all, references the sitemap.
- **Canonicals** are absolute, self-referencing, built from the `site` config.
- **Custom domain at root** (`base: '/'`). `site` is a single config value (placeholder until the domain is chosen); designing around a custom domain avoids a later domain migration and lost ranking equity.
- Submit the sitemap to **Google Search Console** and **Bing Webmaster Tools** at launch.

## 11. Core Web Vitals

Ranking factor, and easy wins here: indexable pages are static, zero-JS HTML (fast LCP/INP), self-hosted font (no render-blocking third-party), ffmpeg loaded only on interaction. Keep images optimized and avoid layout shift.

## 12. Definition of done (per conversion page)

- Real static HTML at its own clean URL, unique title/description/H1.
- Substantive, fact-driven body from the KB (intro + comparison + when-to-use + FAQ).
- HowTo + FAQPage + BreadcrumbList JSON-LD, canonical, OG tags.
- Target format preselected; source soft-hinted; converter works.
- Linked from `/convert/` and from related pairs; present in the sitemap.
