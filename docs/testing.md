# Automated Testing Strategy

Status: **proposed** · Last updated: 2026-07-01

The goal is a fast, deterministic safety net that protects the two things that matter most: **correct conversions** and **SEO**. We follow the testing pyramid — many cheap tests low down, few expensive tests up top — plus a layer this project needs that most don't: **SEO/output audits**.

## Layers at a glance

| Layer | Tool | Scope | Speed | Runs |
| --- | --- | --- | --- | --- |
| 0. Static analysis | `astro check`, ESLint (type-aware + jsx-a11y), Prettier | Types, lint, format | ⚡ instant | every commit / PR |
| 1. Unit | Vitest (node) | Pure core: `buildCommand`, `lib/format`, `kb/*`, `seo/*` | ⚡ ms | every PR |
| 2. Component | Vitest + React Testing Library + jsdom + `vitest-axe` | Island UI, `ToolRunner`, `useConversion` (with a fake runner) | 🙂 fast | every PR |
| 3. Build-output audit | Vitest over `dist/**/*.html` (+ `node-html-parser`) | SEO invariants, JSON-LD, links, sitemap | 🙂 seconds | every PR (post-build) |
| 4. E2E | Playwright (+ `@axe-core/playwright`) | Real-browser user journeys, prefill, a11y | 🐢 slow | PR (subset) + nightly |
| 5. Conversion matrix | Playwright + native `ffprobe` | **Every** conversion actually runs & output is valid | 🐢 slow | **release gate** + nightly |
| 6. Performance/SEO budget | Lighthouse CI (`@lhci/cli`) | Core Web Vitals + SEO/a11y scores | 🐢 slow | PR (key pages) + nightly |

The gate for a green PR: **layers 0–3**. Layers 4–6 run on a schedule and pre-release (they touch the network/browser and are slower and occasionally flaky).

---

## Layer 1 — Unit (the pure core)

The core is pure and side-effect-free by design (a standard we enforce), which makes it the cheapest, highest-leverage place to test. Vitest is already wired.

- **`buildCommand` per tool** — the single most important unit. Assert exact ffmpeg argv + output filename for each branch (default, remux, keep-original, each codec). Table-driven. Every new tool ships with a `buildCommand` test. *(Have it for the video converter.)*
- **`lib/format`** — `humanSize`, `slugify`, `baseName`, `extension` edge cases. *(Have it.)*
- **`kb/pairs`** — pair count derives from the converter's format list; slugs are `from-to`; `relatedPairs` puts the reverse first and excludes self. *(Have it.)*
- **`kb/content`** — invariants over *every* generated pair: FAQ count ≥ 4, non-empty intro/comparison/when-to-use, exactly 3 how-to steps, and no unreplaced template fragments (e.g. no literal `undefined`/`${`). This is our first thin-content guard.
- **`seo/jsonld`** — builders produce valid shapes: `@context`/`@type` set, `HowTo.step` non-empty and positioned, `FAQPage.mainEntity` maps Q→A, `BreadcrumbList` positions monotonic. Type the builders with **`schema-dts`** so schema errors are caught at compile time too.

**Coverage philosophy:** aim for ~100% branch coverage on `src/lib/**` (it's pure and cheap). Don't chase a global number.

---

## Layer 2 — Component (islands)

The interactive surface is small (one island) but stateful, so test **behavior, not implementation**, with Testing Library. Inject a **fake `ConversionRunner`** — never load ffmpeg here.

- **`useConversion`** (via a host component or `renderHook`): file selection seeds state; `initialValues` preselects the target; `start` transitions idle→running→done; a rejecting runner → `error` phase; an `AbortError` → back to idle; the output object URL is revoked on replace/unmount (assert `revokeObjectURL` called).
- **`ToolRunner`**: dropping a file enables Convert; a segmented choice updates the value; toggling **Remux** disables the codec groups + CRF; clicking Convert shows progress then a working download link; the `sourceHint` renders "Drop your MP4".
- **UI primitives**: `Segmented` (roving selection, disabled state), `Slider` (value readout, aria), `DropZone` (click/keyboard/drag, filename display), `TimeField` (clamp, zero-pad, auto-advance, arrow keys).
- **Accessibility**: run `vitest-axe` (axe-core) against each rendered component — zero violations. Complements the static `jsx-a11y` lint with runtime checks (focus order, live regions).

---

## Layer 3 — Build-output audit (the SEO safety net)

SEO is priority #1, so we assert it directly against the **built HTML** in `dist/` (run after `astro build`). This is the layer that catches a template change silently tanking rankings. Implemented as Vitest tests that glob `dist/**/*.html` and parse with `node-html-parser`.

Per-page invariants (every page):
- Exactly **one `<h1>`**.
- `<title>` present, non-empty, ≤ 60 chars, ends with the brand.
- `meta[name=description]` present, length 50–160.
- `link[rel=canonical]` present, **absolute**, and equal to the page's own URL (self-referencing).
- OG + Twitter tags present.
- Every JSON-LD block **parses** and has `@context` + `@type`.

Site-wide invariants:
- **No duplicate** titles or descriptions across all pages.
- **Internal link integrity**: every internal `href` resolves to an emitted file (no internal 404s).
- **Sitemap completeness**: every indexable route appears in `sitemap-index.xml`/child sitemaps; `robots.txt` references the sitemap.
- Nothing indexable carries `noindex`.

Conversion-page invariants (thin-content guards):
- Body word count ≥ ~250 (excluding nav/footer).
- Present `HowTo`, `FAQPage`, `BreadcrumbList` JSON-LD; `FAQPage` has ≥ 4 Q&A.
- The island props seed the correct `target` (e.g. `mp4-to-mov` seeds `format: "mov"`).

---

## Layer 4 — E2E user journeys (Playwright)

Real browser, real routing, real islands. Keep these **few and high-value**; use a **fake/stubbed runner** for most (intercept the ffmpeg core network request or inject a test runner) so they stay fast and deterministic.

- **Hub → tool**: filter/anchor nav works; a "Live" tool opens the converter; a planned tool shows "coming soon".
- **Pair prefill**: visit `/convert/mp4-to-mov` → MOV is preselected; the drop zone says "Drop your MP4".
- **Convert flow (stubbed)**: choose file → Convert → progress → download link has a valid `download` attribute and a non-empty blob.
- **Cross-origin isolation**: the page reaches `crossOriginIsolated === true` after the `coi-serviceworker` reload.
- **Runtime a11y**: `@axe-core/playwright` on the hub, a pair page, and the converter mid-flow — zero serious/critical violations.

---

## Layer 5 — Conversion matrix (the release gate)

**This is what guarantees "all conversions work before release."** Unit tests prove we generate the right ffmpeg argv; they do not prove ffmpeg produces a valid file. This layer runs **every** conversion for real and validates the output with an independent tool.

### Pipeline (per pair)

1. **Enumerate `PAIRS`** — the same single source of truth the pages are generated from. The matrix therefore covers every conversion automatically; a new format/tool can't be added without being tested.
2. **Load the source fixture** — a tiny, valid committed sample for the pair's `from` format.
3. **Use the app's real argv** — call `tool.buildCommand(values, input)` with `values.format = to`. We test the production code path, not a hand-written command.
4. **Run in a real browser** — execute through the real `ffmpegRunner` under headless **Playwright**, cross-origin isolated, against the **self-hosted core**.
5. **Validate independently** — download the output blob and run native **`ffprobe`** in CI (`-show_format -show_streams -print_format json`). Assert:
   - output is non-empty and above a sane minimum size,
   - the detected **container/codecs match the target** format,
   - the file **decodes** without error.
6. **Report** — emit a pass/fail **conversion health report** (one row per pair) as a CI artifact.

### Why this is trustworthy

- It exercises the exact production path (`buildCommand` → `ffmpegRunner` → real core), so it can't drift from what users run.
- It validates with an **independent** tool (native ffprobe), so an empty, corrupt, or mislabeled output cannot pass.
- It's derived from the single source of truth, so coverage is complete by construction.

### Governance rule (closes the loop)

**The set of generated conversion pages MUST equal the set of matrix-passing conversions.** If a pair fails (e.g. an encoder isn't in the current core build), we either fix it or **exclude that format/pair from generation** — we never ship a `/convert/x-to-y` page whose conversion is broken. A test asserts `generated-pages ⊆ passing-conversions`. The matrix is also the source of truth for *what the core actually supports*.

### Determinism & scale

- **Self-host `@ffmpeg/core(-mt)`** (pinned version) in `public/` — removes the unpkg network dependency and makes the matrix offline-deterministic (also required for reliable prod under COEP).
- **Commit tiny deterministic fixtures** — one valid sample per source format, generated once with native ffmpeg.
- **Parallelize** across Playwright workers; per-conversion timeout; one retry on failure.
- **Full matrix on release; sampled subset per PR** (e.g. one pair per source format) to keep PRs fast while still catching gross breakage early.

### CI

A required `conversion-matrix` job in the **release** workflow (pre-release / on `release/*` or version tags). **Release is blocked if any pair fails.** The health report is attached to the release. A lighter sampled run is part of the nightly build.

---

## Layer 6 — Performance & SEO budgets (Lighthouse CI)

Since SEO and Core Web Vitals are ranking factors, gate them.

- **`@lhci/cli`** against the built preview server on representative URLs: `/`, `/convert/`, one `/convert/{pair}`, one `/tools/{slug}`.
- Budgets (assertions): **SEO ≥ 100**, **Accessibility ≥ 100**, Performance ≥ 90, LCP/CLS/TBT within thresholds. SEO/a11y at 100 is realistic because the pages are static, zero-JS HTML.

---

## CI pipeline (GitHub Actions)

```
PR / push:
  1. install (cache node_modules)
  2. astro check   ─┐
  3. eslint         ├─ fail fast, parallel
  4. prettier --check
  5. vitest run  (unit + component)        # layers 1–2
  6. astro build
  7. vitest run tests/seo  (build audit)   # layer 3
  8. playwright test --grep @pr            # layer 4 subset (stubbed)
  9. lhci autorun  (key pages)             # layer 6

Nightly (schedule):
  - full playwright journeys                          # layer 4
  - sampled conversion matrix (1 pair per source fmt) # layer 5 subset
  - full lighthouse across a sampled set of pair pages

Release (pre-release / version tag) — BLOCKING:
  - FULL conversion matrix over every pair            # layer 5
  - assert generated-pages ⊆ passing-conversions      # governance rule
  - attach conversion health report to the release
```

PRs must pass 1–7 (+ the stubbed E2E subset). Nightly guards browser/network-dependent checks. **No release ships unless the full conversion matrix is green** — that is the guarantee that every conversion works.

---

## Conventions

- **Test file placement:** unit/component tests co-locate as `*.test.ts(x)` next to the unit. Cross-cutting suites live in `tests/` (`tests/seo/`, `tests/e2e/`).
- **Tag slow/independent E2E** with `@pr`, `@nightly`, `@slow` so the runner can select subsets.
- **Fakes over mocks of internals:** inject a `ConversionRunner` fake; don't mock React internals. Test what a user observes.
- **Every bug fix ships a failing→passing test.** Every new tool ships a `buildCommand` test; every new page type ships a build-audit assertion.
- **Determinism:** no real network in layers 1–4 (stub the ffmpeg core fetch); reserve real I/O for layer 5.

---

## Phased rollout (recommended order)

1. **Phase 1 — Unit + SEO audit (highest value, cheapest).** Extend Vitest: `kb/content` invariants, `seo/jsonld` shape tests, and the `tests/seo/` build-output audit. Protects the #1 priority immediately, no new browser tooling.
2. **Phase 2 — Component + a11y.** Add RTL + jsdom + `vitest-axe`; cover `useConversion`, `ToolRunner`, and the UI primitives.
3. **Phase 3 — E2E + Lighthouse.** Add Playwright journeys (stubbed runner) + `@axe-core/playwright` + `@lhci/cli` SEO/a11y budgets, and the GitHub Actions workflow.
4. **Phase 4 — Conversion matrix (release gate) + coverage gates.** Self-host the ffmpeg core, commit per-format fixtures, build the Playwright + ffprobe matrix over every pair, wire it as a **blocking release job** with the `generated-pages ⊆ passing-conversions` assertion, and turn on `src/lib/**` coverage thresholds. This is the phase that delivers "all conversions verified before release."
```
