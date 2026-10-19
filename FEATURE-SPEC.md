---
status: approved
issue: 40
branch: feature/40-glossary-gap-analysis
owners:
  - Brad Frost
  - Ian Frost
last_updated: 2026-10-19
amendments:
  - date: 2026-10-19
    author: Brad Frost (answers given in chat; frontmatter applied by Claude Code)
    summary: >-
      Approved with §10 answered. 1) Ship Tier 1 + Tier 2. 2) Steel Curtain and
      Design Branch are public. 3) Ship terms citing lessons without URLs; backfill
      tracked in #41. 4) Intro copy changes. 5) Amend SPEC.md §1/§4 in this branch.
      6) Owner spot-checks copy; TJ Pitre and Ian Frost review the PR.
---

# FEATURE-SPEC.md — Glossary gap analysis and expansion (#40)

> **Phase 2 spec for one unit of work. Status must be `approved` before Phase 3 begins (AGENTS.md §4.2).**
>
> **This file is deleted when the branch merges.**

## 0. Origin

The glossary shipped in June 2026 (#4): 115 terms AI-extracted from early course transcripts, each linked to its lessons. On 2026-10-19 Brad flagged that it doesn't even define "harness" and asked for a gap analysis across course videos, jam sessions, the course Slack, internal working sessions, and broader industry trends. That analysis is in `docs/research/2026-10-glossary-gap-analysis.md`. The scope of THIS spec is limited to adding the Tier 1 and Tier 2 terms from that note, updating the stale existing entries it lists, and the minimum data/template/copy changes needed to source terms from beyond the course transcripts.

## 1. What it is

A content expansion of `/glossary/`, from 115 to roughly 145 terms. New terms come from five evidence sources ranked in the research note. The glossary gains a second kind of provenance: alongside course lessons, a term can cite **public references** (a vendor doc, a spec, a public demo page) when the course doesn't teach it directly.

## 2. Who it's for

Course students looking up a word they heard in a lesson, a jam session or Slack; practitioners arriving cold from a shared link who judge the course by whether its reference is current; Brad, TJ and Ian, who point people to entries while teaching.

## 3. Goals

- Someone who hears "harness", "evals", "component contract", "drift" or "A2UI" in a jam session can find a definition in the course's own framing.
- Every entry remains traceable to where it's taught or where the field defines it. No entry cites nothing.
- Existing entries don't contradict what later chapters teach.
- The page tells readers truthfully where terms come from.

## 4. Non-goals

- Tier 3 candidates (listed in the research note) — a later round.
- Search/typeahead integration (#8, #9).
- Linking jam-session recordings or Slack threads. Those aren't public; the glossary never points readers at private material.
- Redesigning the glossary page. Template change is limited to rendering the new reference field.

## 5. User flows

### Flow A — Look up a jam-session term

1. A student hears "harness" in a jam session and opens `/glossary/`.
2. They jump to **H** and find **Harness**, defined in the course's framing.
3. The entry cites the lesson where it comes up (6.01), plus the public primary source that defines it, so they can go deeper.

### Flow B — Look up an industry term the course doesn't teach

1. A practitioner searches the page for "llms.txt".
2. The entry defines it, says why it matters for design systems, and links its public spec. There's no lesson link because no lesson teaches it, and the entry doesn't pretend otherwise.

## 6. Data model

Per-term Markdown in `_data/glossary/` (loaded by `_data/glossary.js`). Changes:

- `source.type` gains values beyond `"course"`: `"jam-session"`, `"community"`, `"industry"`. Existing 115 entries are untouched (`"course"`).
- New optional `references` list: `{ label, url }`. Only public URLs, each verified live before commit.
- `lessons` stays as-is and becomes optional in practice. A term must carry at least one of `lessons` or `references`.
- `_data/glossary.js` passes `references` through (defaults `[]`).

## 7. Deployment model

| Environment | Hosting | Persistence | Notes |
|-------------|---------|-------------|-------|
| Local dev   | `npm start` (Eleventy) | Markdown in `_data/glossary/` | Full `npx @11ty/eleventy` build to verify |
| Production  | Netlify, builds `main` | Committed Markdown | Merge to `main` deploys |

## 8. Tech decisions

- **Project type:** content-site
- **Framework:** Eleventy
- **Hosting:** Netlify
- **Deviations:** none. Template change uses existing markup patterns on the page; any Eddie markup touched is grounded in eddie-brain first (AGENTS.md §2.5). `glossary.njk` declares its Eddie template per §2.5 rule 6 if the ship gate requires it for a changed page.

## 9. Accessibility requirements

WCAG 2.1 AA baseline. Reference links get descriptive text (the source's name, not "link"). The A–Z index picks up any new starting letters automatically.

## 10. Open questions

Resolved 2026-10-19 (see `amendments`):

1. **Scope:** Tier 1 + Tier 2 ship in this branch; Tier 3 deferred.
2. **Course coinages:** Steel Curtain and Design Branch ship as public entries.
3. **Lesson URLs:** terms citing lessons with no URL ship anyway; those lessons render as unlinked text. Backfill is #41.
4. **Intro copy:** changes to say terms come from the course, its community, and the field.
5. **SPEC.md amendment:** §1 and §4 amended in this branch.
6. **Voice:** owner spot-checks; TJ Pitre and Ian Frost review the PR.

## 11. Success criteria

- Tier-approved terms exist in `_data/glossary/`, each with at least one lesson or verified public reference.
- The listed stale entries are updated and no lesson URL in the glossary is unverified.
- `/glossary/` builds and renders references for non-course terms; a full Eleventy build passes.
- No private source (Slack thread, meeting, jam recording, client name, community member name) appears anywhere on the page.
- `npm run bfw:ship` result quoted in the PR.
