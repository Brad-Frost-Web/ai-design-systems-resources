---
status: approved
owners:
  - Brad Frost
  - Ian Frost
last_updated: 2026-06-30
amendments:
  - date: 2026-06-30
    author: Brad Frost
    summary: |
      Quick→Full promotion. Retroactive audit filed 5 local findings as
      Brad-Frost-Web/ai-design-systems-resources#16–#20 and 3 upstream recipe
      requests as Brad-Frost-Web/eddie-design-system#943–#945.
      Dual-filed: #16 ↔ eddie-design-system#943/#944/#945 (recipe gaps);
      #17 relates to eddie feedback-token verification (pending Phase 3).
      Ship-blockers: #16 (Eddie-first), #17 (tokens).
---

# SPEC.md — AI-ready design system inspection checklist

> **Phase 2 spec. Status must be `approved` before Phase 3 begins.**
>
> Scope note: this spec covers the `/checklist/` interactive inspection tool — the feature being brought through the BFW process as a retroactive Quick→Full promotion. It lives inside the broader `ai-design-systems-resources` content site (glossary, community resources, etc.), which predates bfw-process adoption and is out of scope here except where the checklist page touches shared layout/nav.

## 1. What it is

An interactive, student-facing page at `/checklist/` that turns Chapter 3 of the AI & Design Systems course — the "DS inspection checklist" — into a hands-on self-assessment tool. It presents five qualities of an AI-ready design system (Complete, Sound, Synchronized, Extensible, AI-Ready) broken into ten inspection "stations." Each station is framed as a question with non-exhaustive examples, warning lights, and a "how AI helps" note. Learners rate each station with a green/yellow/red traffic light, jot notes, and get a live health score ("greens out of 10"). Ratings and notes persist in `localStorage` so an inspection survives a reload. Without JavaScript the page is still a fully readable checklist (progressive enhancement); the scoring layer is additive.

## 2. Who it's for

Students of the AI & Design Systems course, and design-system practitioners generally, who want to audit the health of their own design system. Use context: someone works through the ten stations while looking at their real Figma library, codebase, and docs — likely in one focused sitting, possibly revisited on a cadence (quarterly deep inspection). Single-user, single-device; no accounts, no sharing, no server.

## 3. Goals

- A learner can rate all ten stations and see their green score update live, in under a couple of minutes of interaction.
- The inspection state (ratings + notes) survives a page reload without any account or network.
- The page is fully usable and readable with JavaScript disabled or failed.
- Every rating control is operable by keyboard and announced correctly to screen readers.
- The presentation layer is 100% Eddie: Eddie components + recipes + `--ed-*` tokens, zero bespoke presentational CSS, zero hardcoded design values.
- The page reads as unmistakably BFW/Eddie and stays on-brand across all Eddie themes.

## 4. Non-goals

- **No persistence beyond the local browser.** No accounts, no server storage, no cross-device sync, no export/share of results (print is the only "export").
- **No scoring authority.** The score is a conversation starter, not a grade or certification. No pass/fail thresholds beyond the informal "fix reds, schedule yellows."
- **No editing of the checklist content by end users.** The ten stations come from the course; this is not a checklist builder.
- **Not a re-spec of the wider resources site.** Glossary, resource sync, and existing pages are untouched except for the shared nav entry and base layout.
- **No new third-party libraries.** Everything is achievable with Eddie + vanilla JS.

## 5. User flows

### Flow A — Run an inspection

1. Learner lands on `/checklist/`, reads the five-qualities overview and the "how to use" legend.
2. For each of the ten stations, they read the question, examples, and (expanding the disclosure) the warning lights and "how AI helps."
3. They set a green/yellow/red rating on each station; the sticky dashboard tallies greens/yellows/reds and updates the "X / 10 green" score live.
4. They optionally type notes into each station ("what did you find? what's the plan?").
5. The results table at the bottom mirrors every rating; they read their score and the interpretation guidance.

### Flow B — Resume a saved inspection

1. Learner returns to `/checklist/` later (same browser).
2. Prior ratings and notes are restored from `localStorage`; the dashboard and results table reflect the saved state on load.
3. They adjust ratings, or use **Reset** (with confirm) to clear and start over.

### Flow C — No-JS / assistive-tech reading

1. The page loads as a semantic document: headings in order, the ten stations as readable content with their warning lights and guidance.
2. Rating controls degrade gracefully (no dead interactive affordances presented as usable); the checklist is still fully consumable and printable.

## 6. Data model

No persistent server data. Two client-side data shapes:

- **Content (build-time):** `_data/checklist.js` — a static object: `meta`, `overviewIntro`, `caution`, `howToUse` (heading/body/legend), `qualities[]` (each with `id`, `number`, `name`, `question`, `accent`, `intro`, `stations[]`), `results`, `maintenance`, `crosswalk`. Stations carry `number`, `id`, `name`, `question`, `examples`, `warningLights[]`, `aiHelps`. String fields may contain light inline HTML rendered via the `safe` filter.
- **Inspection state (runtime, `localStorage` key `ds-inspection:v1`):** `{ [stationId]: { status: "green"|"yellow"|"red"|null, notes: string } }`. Written on every rating change and note edit; read on load.

The per-quality `accent` color is currently a hardcoded hex in the data — this must move to an Eddie token reference (see §8 deviations / audit).

## 7. Deployment model

| Environment | Hosting | Persistence | Notes |
|-------------|---------|-------------|-------|
| Local dev   | Eleventy dev server (`npm start`) | Browser `localStorage` only | Static build; no server state |
| Production  | Netlify (watches `main`) | Browser `localStorage` only | Fully static page; no serverless/API needed |

Production filesystem is read-only (Netlify) — irrelevant here since all user state lives in the browser. No environment-specific behavior.

## 8. Tech decisions

- **Project type:** content-site
- **Framework:** Eleventy (11ty) — correct default; no Nuxt escalation signal (no auth, server state, realtime, or DB).
- **Hosting:** Netlify
- **UI layer:** Eddie Design System — `@brad-frost-web/eddie-web-components`, `@brad-frost-web/eddie-recipes`, `@brad-frost-web/eddie-design-tokens`, `@brad-frost-web/eddie-icons`. Category recipes: the UI-documentation tier is a candidate if specimen patterns are needed, but the checklist is primarily interactive-app UI.
- **Interactivity:** vanilla JS (`js/checklist.js`), progressive enhancement, `localStorage`. No framework, no state library.
- **Deviations (current, to be remediated — NOT approved as permanent):**
  - The page as built by an external agent ships ~701 lines of bespoke presentational SCSS (`css/components/_checklist.scss`) with ~30 non-Eddie components and 150+ hardcoded design values, plus inline hardcoded styles in the template. **This violates BFW §2.1/§2.2 and is the primary subject of the retroactive audit.** The target state has zero bespoke presentational CSS.
  - Traffic-light status colors are raw hex (`#1f9d57`/`#e0a020`/`#e5484d`). These must resolve to Eddie semantic tokens; if no green/amber/red semantic status tokens exist in Eddie, that is a token gap to file upstream.

## 9. Accessibility requirements

Baseline WCAG 2.1 AA (BFW non-negotiable), plus specifics for the interactive layer:

- The three-way rating control is a proper single-select group: keyboard operable (arrow keys move/select, re-selecting clears), correct roles/`aria-checked` state, and a visible focus indicator. Color is never the only signal — each status carries a text label (Healthy / Needs attention / The light is ON).
- Traffic-light colors must meet contrast against their background across all Eddie themes (the red/yellow/green must remain distinguishable for color-vision deficiencies — pair color with label/shape).
- Notes textareas have programmatically associated labels.
- Disclosure widgets (warning lights) are keyboard operable and announce expanded/collapsed state.
- Results table uses proper table semantics with header scoping.
- Progressive enhancement: full content readable and printable without JS.

## 10. Open questions

1. **Status color tokens:** Do Eddie's themes expose semantic status tokens (success/warning/danger) that read correctly across all 17 themes? If not, this is an upstream token-gap issue and we need an interim decision. *(Agent to verify via `eddie_get_token` during Phase 3.)*
2. **Recipe home:** Should the three composition gaps (status-rating control, scoring dashboard, inspection station) be built project-local first or authored directly in `eddie-recipes`? (Decision to be driven by the audit; §2.1.1 default is project-local until reuse is proven.)
3. **Per-quality accent:** Is the automotive-inspection accent color per quality a real design requirement, or decorative? If required, it needs a token-backed mechanism rather than inline hex.

## 11. Success criteria

- `eddie_validate_file` reports **zero** errors on all checklist SCSS/TS the project owns (or the file is deleted because the UI is fully Eddie components/recipes).
- No hardcoded colors/spacing/type in checklist markup, data, or styles; no inline `style` with design values; no bespoke presentational component classes.
- All ten stations rate, tally, persist, and restore correctly; Reset clears with confirm.
- Full keyboard operability and screen-reader correctness on the rating controls, disclosures, and results table.
- Page renders and is readable/printable with JS disabled.
- `npm run bfw:ship` (Phase 5 gate) passes without owner override.
- Renders on-brand across Eddie themes with no broken color contrast.

---

*This template is from `@brad-frost-web/bfw-process`. Do not remove the frontmatter.*
