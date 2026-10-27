# AI & Design Systems Resources

A curated, living collection of resources about AI and design systems — built as a public companion to the [AI & Design Systems course](https://aianddesign.systems).

The site serves as a trusted reference where practitioners can find quality articles, tools, case studies, and terminology while working through real challenges: design system slots, MCP servers, AI tooling, token pipelines, and more.

**Live site:** [aianddesign.systems](https://aianddesign.systems)

---

## What's here

| Section | Status | Description |
|---|---|---|
| **Resources** | Live | ~300 curated articles, videos, and tools |
| **Glossary** | Live | 145 key terms from the course, its community, and the field |
| **Links** | Planned | Course-specific and community links by chapter |
| **Timeline** | Planned | Resources along a time axis |
| **Graph** | In progress | Knowledge graph of resource relationships |

---

## Tech stack

- **[Eleventy v3](https://www.11ty.dev/)** — static site generator; templates in Nunjucks (`.njk`)
- **[Eddie design system](https://github.com/Brad-Frost-Web/eddie-design-system)** — Brad Frost Web's design system; Lit-based web components (`@brad-frost-web/eddie-web-components`), assembled recipes (`@brad-frost-web/eddie-recipes`), and design tokens (`@brad-frost-web/eddie-design-tokens`)
- **SCSS + PostCSS** — component-level partials in `css/components/`, compiled via `sass` then processed by `postcss`
- **esbuild** — bundles `js/components.js` and `js/scripts.js` as part of the Eleventy `before` hook
- **Notion** — primary content store; resources are scraped and synced via a Notion integration
- **Netlify** — hosting and deploys

---

## Local development

### Prerequisites

- Node.js 22.18+ (tested with Node 24)
- npm 9+

### Setup

```bash
git clone git@github.com:Brad-Frost-Web/ai-design-systems-resources.git
cd ai-design-systems-resources
npm install
```

Copy the environment file and fill in your Notion credentials (only needed if you're running the sync script):

```bash
cp .env.example .env
# edit .env and add your NOTION_TOKEN and NOTION_DATABASE_ID
```

### Run locally

For the generative UI demo:

```bash
npm run demo
```

Open [the local resources demo](http://127.0.0.1:8888). This builds the site and
starts a loopback-only server. Re-run after source changes. Keep your existing
`.env`; add `ANTHROPIC_API_KEY` for Claude and `JEV_API_KEY` for Jev. Keys are read
only by the server. Missing credentials leave the on-device path available and
omit the unavailable engines from the selector. `CLAUDE_MODEL`, `JEV_MODEL`, and
`DEMO_PORT` are optional overrides; defaults are in `.env.example`.

Try a question, then change the engine to compare:

- “What’s new in generative UI?” → dated timeline.
- “Compare MCP resources” → table of recorded facts.
- “Give me a learning path for design tokens” → lessons grouped into chapter tabs.
- “What is context engineering?” → glossary definition and related material.
- “Chart MCP resources by type in 2026” → counts computed from matching records.

**On-device** means deterministic local rules and ranking, not a local language
model. **Jev** chooses a bounded presentation, topic, and perspective; its topic
answer is diagnostic, while explicit user perspective overrides inferred audience.
**Claude** composes sections and selects record IDs from retrieved candidates.
**Auto** tries Jev, then Claude when Jev fails or confidence is below 0.70. Provider
failure or invalid output retains the local result. Every question first paints
that local result, so waiting for a model never leaves an empty page.

The disclosure shows actual engine/model, request path, elapsed time, model
confidence (when supplied), retrieval match status, fallback reason, and emitted
`a2ui-eddie/1.0` messages. Retrieval status is not model confidence. Claude does not
supply a confidence score. Live checks on October 27 returned Jev 1.14.0 in 418 ms
and Claude Sonnet 5.5 in 8.9 s for a generative-UI learning path; these are individual
observations, not latency guarantees.

The compiler binds IDs to 348 resource records, 145 glossary terms, and 185 course
lesson pointers. Lesson metadata was restored from the archived exploration;
transcripts are not included. Charts use UTC dates and explicit topic matching;
tag counts can overlap. The served Chameleon profile still has placeholder
expansions, so its pinned vocabulary is lowered into an allowlisted subset of the
official default catalog. Published `eddie-render` validates and paints every
path. Models never supply HTML or URLs. Catalog snapshots and Eddie packages are
pinned together at 0.72.1; refresh both snapshots from the Eddie Brain when
upgrading. The matching Chameleon names are checked at module load.

The prompt uses Eddie’s `ed-single-field-form` directly because the search-form
recipe does not synchronize its outer value after edits; the upstream fix is
tracked in [Eddie #2647](https://github.com/Brad-Frost-Web/eddie-design-system/issues/2647),
with this consumer’s adaptation tracked under [#26](https://github.com/Brad-Frost-Web/ai-design-systems-resources/issues/26).
No Eddie component source is forked.

The caller chain is `client.mjs → localPlan/compile → createSurfaceHost` for local
composition and `client.mjs → /api/compose → providers.mjs → compile` for live
composition. The browser revalidates the returned plan before painting. A turn
counter and abort controller prevent obsolete responses from replacing new ones.

This is a **local demo milestone**. No paid Netlify endpoint or deployment is
added. `npm start` still provides the original watched static-development mode
(on-device only). Public endpoint controls remain in [#25](https://github.com/Brad-Frost-Web/ai-design-systems-resources/issues/25)
and the disabled ship gate remains in [#32](https://github.com/Brad-Frost-Web/ai-design-systems-resources/issues/32).
On-device ranking is heuristic; a comparison reports known metadata, not invented
product features. Static resource links remain available without JavaScript.

Verify with `npm test` and `npm run build`. Tests cover real-corpus compositions,
unsafe/unknown output, scoped chart counts, UTC boundaries, recency paraphrases,
provider failures, routing, and the actual loopback server. Provider responses in
unit tests are fixtures; the live measurements above were separate real calls.

Verification on October 27: 22 tests passed; build passed; Eddie source validation
reported zero findings for the homepage and SCSS. Independent Standards and Spec
reviews found issues in recency, chart IDs/scope/timezones, and optional capability
loading; all were fixed and independently rechecked. Browser checks covered
375px and 1440px layouts, typed Enter submission, repeated example prompts,
comparison/table semantics, chart data disclosure, chapter tabs, live Claude,
and obsolete request/reset behavior. A script-free copy of the built homepage
retained 1,362 native links. Reduced-motion support was checked in the published
chart implementation; OS preference emulation and a full cross-browser WCAG audit
were not run.

`npm run bfw:ship` exits zero **without checks** because `shipReadiness` is disabled;
this is not a production gate pass. `npm audit` reports 15 inherited advisories
(1 moderate, 12 high, 2 critical); all affected package versions match the prior
lockfile. They are not fixed by this UI milestone.

For watched static development:

```bash
npm start
```

This runs three processes in parallel:
- `eleventy --serve` — builds the site and watches for changes (live reload at `http://localhost:8080`)
- `sass --watch` — compiles SCSS to a temp CSS file
- `postcss --watch` — processes the temp CSS into the final `css/styles.css`

### Build for production

```bash
npm run build
```

---

## Project structure

```
.
├── _data/                  # Eleventy global data
│   ├── nav.js              # Primary nav items (live vs. placeholder)
│   ├── resources/          # One .md file per resource (auto-synced + manual)
│   ├── resources.js        # Loads and sorts resources at build time
│   ├── glossary/           # One .md file per glossary term
│   └── glossary.js         # Loads and sorts glossary terms at build time
├── _includes/              # Nunjucks partials and layouts
│   ├── base.njk            # Root layout (doc shell, head, site header)
│   ├── site-header.njk     # Eddie header + primary nav
│   ├── head.njk            # <head> with meta, canonical, stylesheet
│   └── *.njk               # Resource card, toolbar, category list, etc.
├── css/
│   ├── styles.scss         # Entry point — imports all partials
│   ├── base/               # Reset, tokens, typography, body
│   └── components/         # Per-component SCSS partials
├── js/
│   ├── components.js       # Imports all Eddie web components (esbuild entry)
│   └── scripts.js          # Site behaviour (mobile nav toggle, etc.)
├── scripts/
│   └── sync-notion.js      # Pulls resources from Notion into _data/resources/
├── eleventy.config.js      # Eleventy configuration + esbuild hook
├── glossary.njk            # /glossary/ page
└── index.html              # / (resources) page
```

---

## How resources get added

Resources flow in two ways:

**Automated sync** — `npm run sync` fetches the Notion resources database and writes/updates markdown files in `_data/resources/`. The sync runs twice daily in production (via Netlify scheduled function). It is non-destructive: manually added or enriched files are not overwritten.

**Manual** — Add a `.md` file directly to `_data/resources/`. Frontmatter shape:

```yaml
---
title: "Article Title"
url: "https://example.com/article"
description: "One-sentence description."
date: "2026-01-15"
category: curated        # curated | community | course
tags:
  - mcp
  - design-tokens
source:
  type: slack            # slack | manual | notion
  channel: "#design-systems"
---

Optional body text with more detail about the resource.
```

---

## Contributing

We welcome contributions from the community. The workflow is straightforward:

### 1. Find or create an issue

Browse [open issues](https://github.com/Brad-Frost-Web/ai-design-systems-resources/issues) and pick one that interests you. If you have an idea that isn't tracked, open an issue first so we can discuss it before you build.

### 2. Create a feature branch

We use git-flow. Branch off `develop`, not `main`:

```bash
git checkout develop
git pull origin develop
git checkout -b feature/your-feature-name
```

### 3. Make your changes and open a PR

Push your branch and open a pull request against `develop`. Keep PRs focused — one feature or fix per PR. In your PR description, reference the issue it closes (`Closes #N`).

`main` is protected and requires a PR review before merging. Direct pushes to `main` are blocked.

### Adding resources

If you want to add resources to the collection, add them to the Notion database or open a PR with new `.md` files in `_data/resources/`. See the frontmatter shape above.

### Notes

- Use your **personal email** (not a work email) for commits, since this project is outside your employer's scope
- No pressure — contributions should be curiosity- and enthusiasm-driven
- Ping the team in Slack when you start picking up an issue

---

## Environment variables

| Variable | Required | Description |
|---|---|---|
| `NOTION_TOKEN` | For sync only | Notion integration secret |
| `NOTION_DATABASE_ID` | For sync only | ID of the resources Notion database |

These are only needed if you're running `npm run sync` locally. The site builds fine without them — it reads the already-synced markdown files in `_data/resources/`.

---

## Roadmap

See [open issues](https://github.com/Brad-Frost-Web/ai-design-systems-resources/issues) for the full backlog. Highlights:

- [#10](https://github.com/Brad-Frost-Web/ai-design-systems-resources/issues/10) Resource relationship graph
- [#9](https://github.com/Brad-Frost-Web/ai-design-systems-resources/issues/9) AI-powered contextual search
- [#8](https://github.com/Brad-Frost-Web/ai-design-systems-resources/issues/8) Typeahead search
- [#3](https://github.com/Brad-Frost-Web/ai-design-systems-resources/issues/3) Links section
- [#13](https://github.com/Brad-Frost-Web/ai-design-systems-resources/issues/13) Adaptive / sentient UI

---

## License

ISC
