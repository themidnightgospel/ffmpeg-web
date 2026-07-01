# Coding Standards

Binding conventions for ffmpeg.web. The bar is **production-grade, clean, maintainable, and SEO-correct**. Architecture: **Astro** (static, zero-JS, SEO-owning `.astro` pages) + **React islands** for interactivity + a **pure TypeScript core** (tool schema, runner, knowledge base). See [`docs/tech-stack.md`](./docs/tech-stack.md) and [`docs/seo.md`](./docs/seo.md).

When a rule isn't written here, follow the spirit: clarity over cleverness, small pure pieces, types that make illegal states unrepresentable, and **static-first** output.

Enforced automatically: **strict TypeScript**, **type-aware ESLint** (`@typescript-eslint` type-checked + `react` + `react-hooks` + `jsx-a11y`), **Prettier**, **`astro check`**. Gate: `npm run typecheck && npm run lint && npm run test`.

---

## 1. Golden rules

1. **Static-first, SEO-first.** Anything indexable is a pre-rendered `.astro` page with real HTML, a correct `<head>`, and zero shipped JavaScript. JS is opt-in per island. If a change makes an indexable page depend on client JS to show its content, it's wrong.
2. **No imperative DOM.** No `document.createElement`, `innerHTML`, or HTML string-building. Static UI is `.astro` templates; interactive UI is React components rendering from state. (The thing we are deliberately leaving behind.)
3. **Make illegal states unrepresentable.** Model data with discriminated unions and precise types so the compiler rejects impossible combinations.
4. **Tools and pages are data.** A tool is a typed `Tool` (options + pure `buildCommand`). Conversion pages are generated from the format **knowledge base** + tool configs. Adding a tool or a conversion pair is adding data, never bespoke page code.
5. **Pure core, effects at the edges.** Business logic (`buildCommand`, `lib/*`, `kb/*`, `seo/*` builders) is pure and unit-tested. Side effects (ffmpeg, object URLs, the DOM) live in islands/hooks and are cleaned up.
6. **Design system is the only styling vocabulary.** Its classes and CSS variables — no hardcoded colors/spacing. Inline `style` only for runtime-computed values (e.g. a progress width).
7. **Accessibility is required.** Semantic elements, labelled controls, keyboard operability, visible focus, correct ARIA, reduced motion. `jsx-a11y` gates the islands; hold `.astro` to the same bar.

---

## 2. Astro & islands

- **`.astro` owns everything static and indexable:** layouts, pages, `<head>`/meta, structured data, hub, `/convert/` landing, and the copy on conversion pages. Frontmatter is build-time only — fetch/derive data there, render HTML; **no client logic**.
- **Islands are the exception, not the default.** Add a React island *only* where genuine interactivity is required (the converter). Keep islands as small as possible — pull static chrome out into `.astro` around the island.
- **Hydration directive by need:** prefer `client:visible` (or `client:idle`) over `client:load` so the island never blocks first paint on an SEO page. Never hydrate something that doesn't need it.
- **Props are the island's inputs.** Astro seeds island state via props (e.g. `target="mov"`). Islands must be pure w.r.t. props — no reading the URL/hash for config.
- **One island entry per interactive feature** (`components/react/Converter.tsx`) that composes the reusable UI/tool components. Don't scatter `client:` directives across many small components on one page.
- **Never put content that must be indexed inside an island** — crawlers won't run it. Body copy, headings, FAQ text, links: `.astro`.

---

## 3. SEO & content (non-negotiable)

- **Every page renders through the `<Seo>` component**: exactly one `<h1>`, a unique `<title>` and meta description, a self-referencing absolute canonical, and OG/Twitter tags.
- **Structured data via typed builders** in `lib/seo/` (`WebApplication`, `HowTo`, `FAQPage`, `BreadcrumbList`) — never hand-written JSON-LD strings in templates.
- **No thin/duplicate content.** A generated page ships only if it carries unique, fact-driven substance from the knowledge base (intro + comparison + when-to-use + FAQ). String-swap templates are forbidden — they get the domain penalized.
- **Content accuracy:** per-format facts are **hand-authored**; FAQ/prose may be **AI-drafted but must be human-reviewed** before publish. No unreviewed generated claims.
- **URLs** follow the taxonomy in `docs/seo.md` (`/convert/{from}-to-{to}`), lowercase-kebab, mirroring the search query. Reverse pairs are distinct pages.
- **Formats derive from tool configs** (single source of truth) — no parallel format lists.

---

## 4. TypeScript

- **Strict everywhere** (`strict`, `noUncheckedIndexedAccess`, `noUnused*`, `noFallthroughCasesInSwitch`). Don't weaken.
- **No `any`** (`no-explicit-any` errors). Use `unknown` + narrowing. `catch (err: unknown)`.
- **No type assertions to silence the compiler.** The only acceptable `as` is a provably-safe boundary narrowing with a comment. Never `as any` / non-null `!` without proof + comment.
- **Types describe data; functions infer.** Annotate exported signatures and props/island-props explicitly; let locals infer.
- **Discriminated unions over flags/enums**, handled by exhaustive `switch` + `assertNever(x: never)`.
- **`readonly` for immutable data.** Never mutate props, state, or inputs.
- **`import type` for type-only imports** (`consistent-type-imports`). Import via the `@/` alias.

---

## 5. React (islands)

- **Function components + hooks only.** The sole class is `ErrorBoundary` (React requires it) — documented as such.
- **No `React.FC`.** Explicit `interface XProps`, destructured. `children: ReactNode` only when used.
- **Single responsibility; small components.** Stateful logic goes in a custom hook (`useX`); presentational components take data + callbacks.
- **Derive, don't duplicate.** No copying props/derivable values into state. `useMemo`/`useCallback` only when a measurement or a referential-stability dependency demands it.
- **Effects are a last resort** — only to sync with something outside React; every resource-acquiring effect returns cleanup.
- **Stable keys** (domain id, never index). **Handlers** are `handleX` locally, exposed as `onX`. No logic in JSX.
- **Events + promises:** DOM handlers are `() => void`; start async work in a sync handler, don't hand a promise-returning fn to `onClick` (`no-misused-promises`).
- **State:** local `useState` first, `useReducer` when transitions get complex, Context only for genuinely cross-cutting state. No global store until proven necessary.

---

## 6. Functions & clean code

- **Small, single-purpose, one level of abstraction.** Extract when it stops fitting in your head.
- **Few parameters** (>~3 → options object). Boolean params are a smell.
- **Guard clauses over nesting.** Keep the happy path un-indented.
- **Pure by default;** side-effecting functions are named for the effect and isolated.
- **Intention-revealing names** (`isLive`, `hasFile`, `canStart`; verbs for functions, nouns for values). Domain terms (`vcodec`, `crf`) are fine; `tmp`/`data2` are not.
- **DRY within reason;** don't over-abstract a single use.
- **Comments explain _why_, not _what_.** Keep intent/trade-off/constraint notes; delete restatements.

---

## 7. Errors & resources

- **No swallowed errors.** Recover or surface via UI state (an `error` phase) + `console.error`. Never `catch {}`.
- **Distinguish cancellation from failure** (`AbortError` → idle; else visible error).
- **Own your resources.** Every `createObjectURL` has a matching `revokeObjectURL` (on replace and unmount); every listener/timer/`AbortController` is cleaned up. `ffmpegRunner` feature-detects `crossOriginIsolated` and falls back to the single-threaded core.

---

## 8. Styling

- Compose from design-system classes and `var(--…)` tokens. New **shared** styles go into `design-system/ffmpeg-web.css` and are documented in the styleguide. App-only scaffolding goes in `src/styles/app.css` with named classes (`.action__panel`) — not inline styles. Runtime-computed values (progress width) are the only inline styles.

---

## 9. Accessibility checklist (per interactive component)

- Real element or correct `role`; every input has an associated `<label>`.
- Fully keyboard operable, sensible tab order, visible `:focus-visible`.
- State exposed to AT: `aria-pressed`, `role="progressbar"` + `aria-valuenow`, `role="alert"`/`aria-live` for async results/errors.
- Icon/glyph content is `aria-hidden` with a text label elsewhere.
- Motion respects `prefers-reduced-motion` (global in the design system).

---

## 10. Files & structure

- One component per file; filename === component. `.astro` for static, `.tsx` for islands, `useCamelCase.ts` for hooks, `camelCase.ts` for modules, `*.test.ts` next to the unit.
- Grouping: `components/astro/` (static), `components/react/` (islands + ui/tool), `components/seo/`, `lib/{tools,runner,seo,kb}`, `data/`.
- Co-locate helpers with their only consumer; promote to `lib/` when shared. No barrel `index.ts` unless it earns its keep.
- A `.tsx` island module exports components (+ types) only; runtime non-component exports live in `.ts`.

---

## 11. Testing

Full strategy in [`docs/testing.md`](./docs/testing.md). The essentials:

- **Unit-test the pure core** (Vitest): every `buildCommand`, `lib/` helper, `kb/*` derivation/content invariant, and `seo/*` builder. Aim for ~100% branch coverage on `src/lib/**` — it's pure and cheap.
- **Component tests** (Vitest + Testing Library + `vitest-axe`): test **behavior, not implementation**, injecting a **fake `ConversionRunner`** — never load ffmpeg in a component test.
- **SEO is tested, not assumed:** a build-output audit over `dist/**/*.html` enforces the invariants in `docs/seo.md` (one H1, unique title/description, self-referencing canonical, valid JSON-LD, internal-link integrity, sitemap completeness, thin-content word-count floor).
- **E2E** (Playwright) covers a few real-browser journeys + runtime a11y; **one** nightly test runs a real ffmpeg conversion; **Lighthouse CI** gates SEO/a11y/Core Web Vitals.
- **PR gate:** static analysis + unit + component + build + SEO audit. Browser/network-heavy layers run nightly and pre-release.
- Every bug fix ships a failing→passing test; every new tool ships a `buildCommand` test; every new page type ships a build-audit assertion.

---

## 12. Formatting, linting, commits

- **Prettier** owns formatting. **ESLint** (type-aware) + **`astro check`** must pass with zero warnings.
- Run `npm run typecheck && npm run lint && npm run test` before every commit.
- Small, focused commits, imperative subject. Work on a branch; `main` deploys. Never commit `node_modules/` or `dist/`.
