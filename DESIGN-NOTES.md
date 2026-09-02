# Design exploration: the chameleon resources site

**Branch:** `design/13-chameleon-resources` · **Issue:** #13 (Explore: adaptive UI)
**Status:** exploratory sketch — never merges; promote via `bfw-process design promote`

## What this is

The resources homepage rebuilt as a working demo of the Chapter 5 material —
radically adaptive UI on design-system rails. Everything runs client-side
(zero server AI, zero tracking) as progressive enhancement over the existing
static page.

| Move | Where | Chapter 5 idea |
|---|---|---|
| **Concierge** — free-text ask + persona lens → ranked results with fit scores | `js/recipes/concierge.js`, `js/intent-engine.js` | Felix's "problem → matched options with fit score", Vincent's profile lenses |
| **Adaptive stage** — engine emits a declarative JSON spec; renderer maps it onto Eddie components only, refuses anything off-catalog; spec + reasoning + confidence are one disclosure away | `js/recipes/adaptive-stage.js` | A2UI (agents speak JSON, not code), generative UI with tokens/catalog as guardrail, ephemeral UI |
| **Constellation** — topic graph, stars sized by reference count, co-occurrence edges, click-to-ask | `js/recipes/constellation.js` | The "supercharged tag cloud" from the Resource Page Huddle (Notion, Jun 17) |
| **Chameleon** — all published Eddie themes runtime-switchable via `data-theme`, phrased as encounters, with a sensation→system token diff | `js/recipes/chameleon-conductor.js`, `scripts/build-themes.js` | Jem Gold's encounter-language, tokens as the safety rail |
| **Pixels demo** — same card as DOM vs canvas + capability table | `js/recipes/pixels-demo.js` | Diffusion/pixel interfaces (Wes Bos "what if websites were felt?") and their a11y price |
| **Machine-readable corpus** — `/intel.json` (284 resources + 115 glossary terms w/ lesson links) | `_data/intel.js`, `intel.njk` | Make your own content machine-readable; the "living appendix" |

Superposition idle state, diffusion-style settle animation (opacity/translate
only — animating `filter` stalls compositors on tall pages), freshness badges
("this week/month/quarter") per the community's recency asks, no-JS floor
preserved (collection is server-rendered semantic HTML).

## Deviation / gap cohort (file as issues on promotion — dual-file per §9.4.1)

1. **Upstream, eddie-web-components:** `ed-radio-field-item` swallows its
   native change event (preventDefault, no re-dispatch) and doesn't reflect
   `checked` — consumers can't react to selection. Worked around with
   container-level click/keyup + checked-state polling (see
   `chameleon-conductor.js`, `concierge.js`). Same pattern issue:
   `ed-search-form` exposes no submit/search event; consumers must wire
   Enter + shadow-button clicks by hand (its docs say as much, but an event
   would be kinder).
2. **Upstream, eddie-recipes packaging:** eddie-brain indexes `ed-r-stat-card`
   and `ed-r-theme-customizer`, but the published npm package ships neither.
   Stat cards were composed per the canonical pattern project-locally
   (`adaptive-stage.js` statRow).
3. **Upstream, eddie-design-tokens:** every theme's `fonts.css` `@import`s
   Google Fonts — pre-existing pattern (prod bfw theme included), but worth an
   upstream conversation about self-hosting. Also: theme tokens are scoped to
   `:root`, so runtime theming requires the rescoping build step in
   `scripts/build-themes.js` — candidate for upstream `[data-theme]` builds.
4. **Local:** `--ed-theme-color-text-knockout` (used by the shipped
   course-hero recipe) doesn't exist in the token set — the real token is
   `--ed-theme-color-content-knockout`. Course-hero currently inherits by
   luck.
5. **Recipe candidates for upstreaming if this promotes:** concierge,
   adaptive-stage (A2UI-style renderer), constellation, chameleon-conductor —
   all follow `ed-r-c-*` conventions, tokens-only, light-DOM Lit.

## 2026-09-02 — the generative UI lesson build

Recorded as the example for the Chapter 5 generative UI lesson. What changed:

| Move | Where | Idea |
|---|---|---|
| **A2UI envelope** — the engine emits `beginRendering` → `surfaceUpdate` (flat adjacency list) → `dataModelUpdate`; the agent speaks structure + ids, the corpus fills the data model (`hydrate()`), Eddie renders | `js/intent-engine.js`, `js/recipes/adaptive-stage.js` | A2UI's own vocabulary, so the "relates to A2UI" claim is a side-by-side, not a metaphor |
| **Catalog from eddie-brain** — `scripts/build-catalog.js` asks `ds.bradfrost.com/mcp` for each component's intent + guidelines and writes `_data/catalog.json`; the stage refuses anything not in it and shows the manifest in "The catalog" panel | `scripts/build-catalog.js`, `_data/catalog.json` | The design system defines the vocabulary; the agent chooses from it |
| **Model path** — `netlify/functions/compose.mjs` sends Claude (Sonnet 5, cached system prompt) the catalog + a compact corpus digest and gets the same spec back; opt-in per visitor ("Compose with Claude"); a second toggle attaches eddie-brain through the Messages API MCP connector so Claude can call `eddie_search` / `eddie_get_component` live, and the stage shows the trace | `netlify/functions/compose.mjs`, `js/recipes/concierge.js` | Heuristics are the floor, the model is the enhancement, the contract is identical |
| **Nine shapes** — summary (always first, one paragraph), videoGrid, definition, resourceTimeline, table, tabs, barChart (eddie-charts), statRow (`ed-r-stat-card`), note | `js/recipes/adaptive-stage.js` | The question leads the way: numbers → chart, comparison → table, path → tabs, recency → timeline |
| **Course lessons as pointers** — `_data/lessons/` (title, number, chapter, Thinkific URL, presenters, tags, summary; never transcripts) synced from the Notion Transcripts DB by `scripts/sync-lessons.js`; lessons outrank everything in ranking | `_data/lessons.js`, `scripts/sync-lessons.js` | Point students at the right video without publishing the course |
| **Essential reading** — `Essential` checkbox in the resources Notion DB → `essential: true` frontmatter → +4 in ranking + "Essential reading" tag | `scripts/sync-notion.js`, `_data/resources.js` | Human judgment as a ranking signal |
| **Eddie 0.38 → 0.60** — `ed-badge` → `ed-tag`, timeline nodes → `ed-r-timeline-node-link`, self-hosted fonts passthrough, `eddie-charts` added | `js/components.js`, `eleventy.config.js` | Unlocked charts and the composable timeline |

Recording runs on localhost. The on-device path needs nothing; the model
path needs `ANTHROPIC_API_KEY` in `.env` and `netlify dev` (port 8888, which
proxies the Eleventy server on 8080 so `/.netlify/functions/compose` resolves).

## Known rough edges

- The on-device engine is deterministic keyword heuristics — the honest floor.
  The Netlify compose function is the real-model path on the same contract.
- The compose function's rate limit and daily cap are in-memory per function
  instance — a floor against casual abuse, not a wall. A durable counter
  (Netlify Blobs) is the next step if the model path goes public.
- Lesson tags were backfilled once by an agent pass and are maintained by the
  nightly transcript sweep skill; the sweep's tag vocabulary and the resources
  DB's tag options must be kept in step by hand.
- The `/intel.json` payload is ~400KB unminified; fine locally, worth trimming
  (drop definitions?) before anything public.
- Theme CSS adds ~185KB raw (5 extra themes); gzips well, but a
  `<link media>`/lazy-load strategy would be nicer.
