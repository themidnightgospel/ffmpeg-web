# Coding Standards

Binding conventions for ffmpeg.web. The bar is **production-grade, clean, maintainable, reusable, and SEO-correct**. Architecture: **Astro** (static, zero-JS, SEO-owning `.astro` pages) + **React islands** for interactivity + a **pure TypeScript core** (tool schema, runner, knowledge base). See [`docs/tech-stack.md`](./docs/tech-stack.md), [`docs/seo.md`](./docs/seo.md), and [`docs/testing.md`](./docs/testing.md).

When a rule isn't written here, follow the spirit: clarity over cleverness, small reusable pieces, types that make illegal states unrepresentable, and **static-first** output.

Enforced automatically: **strict TypeScript**, **type-aware ESLint** (`@typescript-eslint` type-checked + `react` + `react-hooks` + `jsx-a11y`), **Prettier**, **`astro check`**. Gate: `npm run typecheck && npm run lint && npm run test`.

---

## 1. Golden rules

1. **Static-first, SEO-first.** Anything indexable is a pre-rendered `.astro` page with real HTML, a correct `<head>`, and zero shipped JavaScript. JS is opt-in per island. If a change makes an indexable page depend on client JS to show its content, it's wrong.
2. **Maximum reusability — components, not copy-paste.** Every reusable piece of UI, logic, or style lives **once** in a shared location and is **imported**. Never duplicate markup, styling, or logic across files. Ad-hoc code that re-implements something we already have is a defect. (See § 2.)
3. **No imperative DOM.** No `document.createElement`, `innerHTML`, or HTML string-building. Static UI is `.astro` templates; interactive UI is React components rendering from state.
4. **Make illegal states unrepresentable.** Model data with discriminated unions and precise types so the compiler rejects impossible combinations.
5. **Tools and pages are data.** A tool is a typed `Tool` (options + pure `buildCommand`). Conversion pages are generated from the format **knowledge base** + tool configs. Adding a tool or a conversion pair is adding data, never bespoke page code.
6. **Pure core, effects at the edges.** Business logic (`buildCommand`, `lib/*`, `kb/*`, `seo/*` builders) is pure and unit-tested. Side effects (ffmpeg, object URLs, the DOM) live in islands/hooks and are cleaned up.
7. **Design system is the only styling vocabulary.** Its classes and CSS variables — no hardcoded colors/spacing. Inline `style` only for runtime-computed values (e.g. a progress width).
8. **Accessibility is required.** Semantic elements, labelled controls, keyboard operability, visible focus, correct ARIA, reduced motion. `jsx-a11y` gates the islands; hold `.astro` to the same bar.

---

## 2. Reusability & DRY (build components, not ad-hoc code)

This is a first-class goal, not an afterthought. Aim for **maximum reuse**.

- **One source of truth per thing.** A given button, card, field, header, wordmark, helper, or type is defined in exactly one place and imported everywhere it's used. If you find yourself pasting markup/logic/styles, stop and extract.
- **Check before you write.** Before adding any UI or helper, look for an existing component/hook/util. If a near-match exists, **extend it via props** — don't fork or re-implement it.
- **Extract on the second use (and often the first).** If something is used in ≥2 places — or is clearly about to be — it becomes a shared component/hook/util. Small, obvious duplications (a wordmark, a page header, a link-styled-as-button) count.
- **Prefer flexible components over variants.** Add props (size, variant, `as`/`href` polymorphism) rather than creating parallel copies. Example: a `Button` that can render as `<button>` or `<a>` — never hand-write `<a class="btn …">` to reuse button styling.
- **Never re-implement an existing look with raw markup.** Reusing a class the design system defines is fine; duplicating a component's internal structure inline is not — use the component.
- **Data/schema-driven over repeated blocks.** Repeated structure is rendered by mapping over data (tools, options, pages, catalogue) through one shared renderer — never N hand-written copies.
- **Where shared things live** (import via `@/`):
  - Reusable React UI primitives → `src/components/ui/`
  - Tool interaction (runner/controls/hook) → `src/components/tool/`
  - Static/layout chrome (header, footer, SEO, cards, breadcrumbs) → `src/components/*.astro`
  - Cross-cutting pure helpers/types → `src/lib/`
  - Catalogue/config data → `src/data/`
  - Shared styles → `design-system/ffmpeg-web.css` (documented in the styleguide)
- **Balance:** DRY *within reason* — don't build a configurable abstraction for a genuinely single use, and don't couple unrelated things just because they look similar today. But when reuse is real, extraction is the default, not the exception.
- **When you touch duplicated code, de-duplicate it.** Leave the campsite cleaner: fold repeated blocks into the shared component as you go.

---

## 3. Astro & islands

- **`.astro` owns everything static and indexable:** layouts, pages, `<head>`/meta, structured data, hub, `/convert/` landing, and the copy on conversion pages. Frontmatter is build-time only — derive data there, render HTML; **no client logic**.
- **Islands are the exception, not the default.** Add a React island *only* where genuine interactivity is required (the converter). Keep islands small — pull static chrome out into `.astro` around the island.
- **Hydration by need:** prefer `client:visible`/`client:idle` over `client:load` so an island never blocks first paint on an SEO page.
- **Props are the island's inputs.** Astro seeds island state via props (e.g. `target="mov"`). Islands are pure w.r.t. props — no reading the URL/hash for config.
- **One island entry per interactive feature** (`components/Converter.tsx`) that composes the reusable UI/tool components. Don't scatter `client:` directives across a page.
- **Never put indexable content inside an island** — crawlers won't run it. Body copy, headings, FAQ text, links: `.astro`.

---

## 4. SEO & content (non-negotiable)

- **Every page renders through `<Seo>`**: exactly one `<h1>`, a unique `<title>` and meta description, a self-referencing absolute canonical, OG/Twitter tags.
- **Structured data via typed builders** in `lib/seo/` (`WebApplication`, `HowTo`, `FAQPage`, `BreadcrumbList`) — never hand-written JSON-LD strings in templates.
- **No thin/duplicate content.** A generated page ships only with unique, fact-driven substance from the knowledge base. String-swap templates are forbidden.
- **Content accuracy:** per-format facts are **hand-authored**; FAQ/prose may be **AI-drafted but human-reviewed** before publish.
- **URLs** follow `docs/seo.md` (`/convert/{from}-to-{to}`), lowercase-kebab, mirroring the query. Reverse pairs are distinct pages.
- **Formats derive from tool configs** (single source of truth) — no parallel lists.

---

## 5. TypeScript

- **Strict everywhere** (`strict`, `noUncheckedIndexedAccess`, `noUnused*`, `noFallthroughCasesInSwitch`). Don't weaken.
- **No `any`** (`no-explicit-any` errors). Use `unknown` + narrowing. `catch (err: unknown)`.
- **No type assertions to silence the compiler.** The only acceptable `as` is a provably-safe boundary narrowing with a comment. Never `as any` / non-null `!` without proof + comment.
- **Types describe data; functions infer.** Annotate exported signatures and props explicitly; let locals infer.
- **Discriminated unions over flags/enums**, handled by exhaustive `switch` + `assertNever(x: never)`.
- **`readonly` for immutable data.** Never mutate props, state, or inputs.
- **`import type` for type-only imports** (`consistent-type-imports`). Import via the `@/` alias.

---

## 6. React (islands)

- **Function components + hooks only.** The sole class is `ErrorBoundary` (React requires it) — documented as such.
- **No `React.FC`.** Explicit `interface XProps`, destructured. `children: ReactNode` only when used.
- **Single responsibility; small components.** Stateful logic goes in a custom hook (`useX`); presentational components take data + callbacks.
- **Derive, don't duplicate.** No copying props/derivable values into state. `useMemo`/`useCallback` only when a measurement or referential-stability need demands it.
- **Effects are a last resort** — only to sync with something outside React; every resource-acquiring effect returns cleanup.
- **Stable keys** (domain id, never index). **Handlers** are `handleX` locally, exposed as `onX`. No logic in JSX.
- **Events + promises:** DOM handlers are `() => void`; start async work in a sync handler, don't hand a promise-returning fn to `onClick` (`no-misused-promises`).
- **State:** local `useState` first, `useReducer` when transitions get complex, Context only for genuinely cross-cutting state. No global store until proven necessary.

---

## 7. Functions & clean code

- **Small, single-purpose, one level of abstraction.** Extract when it stops fitting in your head.
- **Few parameters** (>~3 → options object). Boolean params are a smell.
- **Guard clauses over nesting.** Keep the happy path un-indented.
- **Pure by default;** side-effecting functions are named for the effect and isolated.
- **Intention-revealing names** (`isLive`, `hasFile`, `canStart`; verbs for functions, nouns for values). Domain terms (`vcodec`, `crf`) are fine; `tmp`/`data2` are not.
- **Comments explain _why_, not _what_.** Keep intent/trade-off/constraint notes; delete restatements.

---

## 8. Errors & resources

- **No swallowed errors.** Recover or surface via UI state (an `error` phase) + `console.error`. Never `catch {}`.
- **Distinguish cancellation from failure** (`AbortError` → idle; else visible error).
- **Own your resources.** Every `createObjectURL` has a matching `revokeObjectURL` (on replace and unmount); every listener/timer/`AbortController` is cleaned up. `ffmpegRunner` feature-detects `crossOriginIsolated` and falls back to the single-threaded core.

---

## 9. Styling

Hand-authored CSS with design **tokens** (CSS custom properties) in `design-system/ffmpeg-web.css`. No CSS framework. Keep it disciplined and reusable.

**Tokens & values**
- Use `var(--…)` tokens for **all** palette, spacing, type, radius, border, focus, and motion values. Never hardcode a hex color or a raw magic number. If a value is missing, **add a token** — don't inline a literal.
- Reuse an existing token before adding a new one — one value, one token.
- The only literal colors permitted are `#fff` (on-dark text) and `transparent`. Everything else — including greys like a code background — is a token.

**Where styles live (reuse, not duplication)**
- Reusable/component styles → `design-system/ffmpeg-web.css`, in the right numbered section, **documented with a live demo in the styleguide**.
- App-only page scaffolding (not reusable) → `src/styles/app.css` with named classes.
- No scattered per-component `<style>` blocks; no duplicated rule sets. If a style is used twice, it's shared.

**Inline styles**
- Allowed **only** for values computed at runtime (e.g. the progress-bar width). Any static inline style is a defect — move it to a class. (The styleguide `index.html` may use inline styles for demo layout only.)

**Class naming (BEM-lite)**
- kebab-case. Block / element / modifier: `.block`, `.block__element`, `.block--modifier` (e.g. `.stepper`, `.stepper__btn`, `.btn--secondary`).
- Express state with `.is-*` / `.has-*` classes or ARIA-attribute selectors (`[aria-pressed="true"]`, `.has-file`, `.on`), not new base classes.
- Names are **semantic** (what it is), never presentational (`.red`, `.mt-8`).

**Specificity & selectors**
- Keep specificity low and flat: single-class selectors. Avoid IDs for styling, deep descendant chains, and bare element selectors in global scope (base/reset excepted).
- No `!important` except the documented `prefers-reduced-motion` reset.

**Responsive**
- Fluid type/space via `clamp()`; media queries only for actual layout changes, with consistent breakpoints. Content width via `--measure`, insets via `--gutter`.
- Use relative units where they add value (`ch` for measure, `em`/`rem` for scalable type); px is fine for precise structural values in this system.

**Motion & focus (a11y)**
- Transitions use `--dur` / `--dur-slow`; all motion is covered by the global reduced-motion reset.
- Never remove a focus outline without an equivalent; use the `--focus` ring token with `:focus-visible`.

**Organization**
- The design system is split into numbered sections — add shared styles to the correct one and mirror them in the styleguide. Keep declarations minimal and ordered.

---

## 10. Accessibility checklist (per interactive component)

- Real element or correct `role`; every input has an associated `<label>`.
- Fully keyboard operable, sensible tab order, visible `:focus-visible`.
- State exposed to AT: `aria-pressed`, `role="progressbar"` + `aria-valuenow`, `role="alert"`/`aria-live` for async results/errors.
- Icon/glyph content is `aria-hidden` with a text label elsewhere.
- Motion respects `prefers-reduced-motion` (global in the design system).

---

## 11. Files & structure

Actual layout (keep it this way):

```
src/
  layouts/BaseLayout.astro         # <head>, <Seo>, design-system import, coi-serviceworker
  components/
    *.astro                        # static/layout chrome: Masthead, Footer, Seo, ToolCard,
                                   #   Breadcrumbs, RelatedConversions
    Converter.tsx                  # the island entry (composes tool/ui components)
    ErrorBoundary.tsx
    ui/                            # reusable React primitives: Button, Segmented, Slider,
                                   #   Stepper, Checkbox, DropZone, ProgressBar, Field
    tool/                          # ToolRunner, ToolOptionControl, useConversion
  lib/{tools,runner,seo,kb}/       # pure core (framework-agnostic)
  data/tools.ts                    # catalogue metadata
  styles/app.css                   # app-only layout (not reusable design-system styles)
```

- One component per file; filename === component. `.astro` for static, `.tsx` for islands, `useCamelCase.ts` for hooks, `camelCase.ts` for modules, `*.test.ts` next to the unit.
- Co-locate a helper with its only consumer; **promote to `lib/` the moment it's shared**. No barrel `index.ts` unless it earns its keep.
- A `.tsx` island module exports components (+ types) only; runtime non-component exports live in `.ts`.

---

## 12. Testing

Full strategy in [`docs/testing.md`](./docs/testing.md). Essentials:

- **Unit-test the pure core** (Vitest): every `buildCommand`, `lib/` helper, `kb/*` derivation/content invariant, and `seo/*` builder. ~100% branch coverage on `src/lib/**`.
- **Component tests** (Vitest + Testing Library + `vitest-axe`): test **behavior, not implementation**, injecting a **fake `ConversionRunner`** — never load ffmpeg in a component test.
- **SEO is tested, not assumed:** a build-output audit over `dist/**/*.html` enforces the invariants in `docs/seo.md`.
- **Conversion matrix (release gate):** Playwright + native `ffprobe` runs **every** conversion for real; **no release ships unless it's green**, and generated pages ⊆ passing conversions.
- **PR gate:** static analysis + unit + component + build + SEO audit. Browser/network-heavy layers run nightly/pre-release.
- Every bug fix ships a failing→passing test; every new tool ships a `buildCommand` test.

---

## 13. Formatting, linting, commits, secrets

- **Prettier** owns formatting. **ESLint** (type-aware) + **`astro check`** must pass with zero warnings.
- Run `npm run typecheck && npm run lint && npm run test` before every commit.
- **Scan for secrets before every commit/push** — no tokens/keys/`.env`/credentials, and verify `node_modules`, `dist`, `public/ffmpeg`, and fixtures are ignored.
- Small, focused commits, imperative subject. Work on a branch; `main` deploys. Never commit `node_modules/`, `dist/`, or generated assets.

---

## 14. Established best practices — quick reference

A scannable index of the concrete conventions adopted for our stack. Details in the sections above and the `docs/`.

**Architecture & rendering**
- Static-first: indexable pages are zero-JS pre-rendered `.astro`; interactivity is opt-in React islands.
- Clean URLs from Astro file routing (no hash router); one static file per route.
- Single source of truth for data (formats from tool configs; catalogue in `data/tools`; pairs derived, not duplicated).

**Reusability**
- Shared components/hooks/utils in fixed homes; import via `@/`, never copy-paste.
- Extend components via props (variants, `as`/`href` polymorphism) instead of forking.
- Render repeated structure by mapping data through one renderer (tools, options, pages).
- De-duplicate on contact; check for an existing component before writing new UI.

**TypeScript**
- `strict` + `noUncheckedIndexedAccess`; no `any`, no compiler-silencing `as`/`!`.
- Discriminated unions + exhaustive `switch` + `assertNever`.
- `import type`; `@/` alias; `readonly` data; annotate exported/public signatures.

**React islands**
- Function components + hooks; no `React.FC`; explicit `interface XProps`.
- Logic in `useX` hooks; presentational components take data + callbacks.
- Derive don't duplicate; effects only for external sync + cleanup; stable domain-id keys.
- DOM handlers are `() => void` (no misused promises).

**Astro**
- `.astro` owns static/SEO; islands minimal, hydrated `client:visible`, configured by props.
- No indexable content inside islands.

**SEO**
- One `<h1>`/page; unique title+description; self-referencing canonical; OG/Twitter — all via `<Seo>`.
- Typed JSON-LD builders (`WebApplication`/`HowTo`/`FAQPage`/`BreadcrumbList`).
- Unique fact-driven content per page; sitemap + robots; internal-link mesh.

**Styling**
- Design-system classes + `var(--…)` tokens only; shared styles in `ffmpeg-web.css` (documented in the styleguide); inline style only for runtime-computed values.

**ffmpeg / runner**
- UI depends on the `ConversionRunner` interface, never ffmpeg directly (swap real/fake freely).
- `buildCommand` is pure and unit-tested; the runner lazy-loads ffmpeg (SSR-safe).
- Multithreaded core when `crossOriginIsolated`, single-thread fallback; core self-hosted (no CDN).

**Accessibility**
- Semantic elements/roles, labelled inputs, keyboard + visible focus, ARIA state, reduced motion; `jsx-a11y` enforced.

**Testing**
- Pure-core unit tests; behavior-based component tests with a fake runner; build-output SEO audit; Playwright + ffprobe conversion matrix as the blocking release gate.

**Tooling & CI**
- Vite/Astro build; Vitest; Playwright; ESLint (type-aware) + Prettier + `astro check`.
- GitHub Actions: PR checks + sampled matrix; deploy to Pages gated on the full conversion matrix.

**Security & git**
- Secret scan before every commit/push; strict `.gitignore`; branch, small imperative commits; never commit generated/heavy artifacts.
