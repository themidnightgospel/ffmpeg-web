# Design Guidelines

Product/UX principles for building pages. Complements `CODING_STANDARDS.md` (how to code) and `design-system/` (the components). Read this before designing a new page.

## Tool pages: the tool is the hero

On any tool page (`/convert/…`, `/tools/…`, and every future tool), the **actual tool — upload, options, action — is the primary focus** and should be as close to the top / above the fold as possible. The chrome around it stays minimal.

- **Compact title.** The page `<h1>` is a modest heading, **not** a giant hero. It orients the user; it doesn't dominate. (Enforced by `.tool-head` — small size + tight padding.)
- **No decorative sub-copy above the tool.** Don't add a "lead" paragraph that just restates what the tool does ("Change a video's container and codec…"). It adds no value and pushes the tool down. The header is: breadcrumb + compact H1 (+ optional tiny category index).
- **Explanatory / SEO prose goes _below_ the tool**, in the content section — never above it. This keeps the tool front-and-centre while preserving the fact-driven copy search engines need. (H1 keeps its keyword for SEO; visual size is irrelevant to ranking, so a small H1 is fine.)
- **Order on a tool page:** header (breadcrumb + small H1) → **the tool** → supporting prose (comparison / when-to-use / how-to / FAQ) → related links → footer.

Rationale: users arrive to *do the thing*. Every pixel of hero title and marketing blurb above the tool is a pixel of friction between them and the upload box.

## Primary actions (CTAs) must be prominent

The primary action on a page — the thing the user came to do (Convert, Download, Export) — must be **impossible to miss**. The user should never hunt for it.

- **Large and full-width.** Use the `btn--lg` + `btn--block` treatment (large padding, bold, full-width within its column). A primary CTA is not a normal-sized button.
- **One clear primary per view.** Exactly one dominant action; everything else is secondary (outline) or tertiary (text). Don't dilute with competing loud buttons.
- **Obvious placement in the flow.** It sits where the user's eye lands after completing the inputs (e.g. below the options), in a constrained column so it reads as *the* action.
- **Communicate blocked state.** When it's disabled, say why (e.g. "Add a file to get started") rather than leaving a dead grey button.
- **Result/next actions get the same weight.** The follow-up action (e.g. Download) is also large and prominent once available.

## General

- **Minimalism with intent** (Swiss design system): whitespace and hairlines over boxes/shadows; one accent (signal red) used sparingly for what matters.
- **Content earns its space.** If a piece of text doesn't help the user act or doesn't add unique value, cut it.
- **Consistency via components.** Reuse shared components (see `CODING_STANDARDS.md` §2); a new page is composed from existing pieces, not bespoke markup.
- **Accessibility and reduced-motion are non-negotiable** (see standards §10).
