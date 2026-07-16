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

## Known rough edges

- Intent engine is deterministic keyword heuristics — the honest floor.
  Swapping in a real model (WebLLM on-device, or a Netlify function) keeps the
  same spec contract; that's the point of the A2UI framing.
- The `/intel.json` payload is ~400KB unminified; fine locally, worth trimming
  (drop definitions?) before anything public.
- Theme CSS adds ~185KB raw (5 extra themes); gzips well, but a
  `<link media>`/lazy-load strategy would be nicer.
