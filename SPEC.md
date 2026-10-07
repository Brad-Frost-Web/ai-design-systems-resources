---
status: draft
owners:
  - Brad Frost
  - Ian Frost
last_updated: 2026-10-07
amendments: []
---

# SPEC.md — ai-design-systems-resources

> **The project spec: what this project is and what it's for.**
>
> **This is not a work order.** It describes the project, not the branch you're on. Work is specified in `FEATURE-SPEC.md` (AGENTS.md §4.1–§4.3). If you're writing about a change you're making right now, you're in the wrong file.
>
> **It is never deleted.** It survives every merge and outlives every feature branch. When what the project *is* changes, amend it — add an entry to `amendments` with the date, author, and a summary — rather than rewriting history.
>
> `status: approved` here means "this accurately describes the project." It does **not** authorise any particular piece of work; only an approved `FEATURE-SPEC.md` does that (§4.2).

## 1. What this project is

The public companion website to the AI & Design Systems online course, at resources.aianddesign.systems. It collects curated articles, videos and tools about AI and design systems (synced from a Notion database and the course Slack), a glossary of terms pulled from the course transcripts with links back to the lessons that teach them, and, increasingly, the course's own teaching artifacts and interactive demos. It is an Eleventy site built with the Eddie Design System.

## 2. Why it exists

Students and practitioners need a trusted, current reference while they work through real AI-and-design-system problems, and the course needs a public front door that shows what it teaches instead of describing it. Without this site the curation lives only in Slack threads and Notion, the glossary stays locked inside transcripts, and demos like "Keep AI on the Rails" exist only as one-off Claude artifacts or inside paywalled video.

## 3. Who it's for

- **Course students** looking up a term, finding the lesson that covers something, or revisiting a demo after watching it.
- **Design system practitioners who aren't students yet**, including designers, developers, and non-technical people on product teams, who arrive through a shared link or a free lesson and judge the course by what they find.
- **Brad, TJ and Ian**, who record lessons against pages on this site, so a page has to work inside a 16:9 recording frame as well as on a phone.

## 4. Goals

- Every resource, term and demo on the site is accurate and current, and its source is traceable.
- Every glossary term and demo points to the course lesson that teaches it.
- The site is itself an example of the course's teaching: 100% Eddie components, recipes and tokens, accessible, and progressively enhanced.
- Teaching demos live here, at stable public URLs, next to the material they belong to (#27).

## 5. Non-goals

- Hosting course video or full transcripts. Lessons are pointers to Thinkific, never copies.
- Accounts, logins, comments or any user-generated content.
- Tracking or personalization that sends visitor data anywhere.
- Being a general-purpose AI news feed. Curation over coverage (#14).

## 6. Shape and constraints

- **Project type:** content-site. Eleventy v3 with Nunjucks templates, SCSS + PostCSS, and esbuild bundling `js/components.js` and `js/scripts.js`.
- **UI layer:** Eddie (`@brad-frost-web/eddie-web-components`, `eddie-recipes`, `eddie-design-tokens`, `eddie-charts`). Patterns Eddie lacks become project-local recipes (`ed-r-c-*`), and the gap is dual-filed upstream (AGENTS.md §9.4.1).
- **Content pipeline:** `scripts/sync-notion.js` pulls resources from Notion into `_data/resources/` as Markdown with frontmatter; the glossary comes from course transcripts. Some resource syncs run as automated commits.
- **Eleventy treats `.md` and `.html` as templates.** Process and rules files are kept out of the build with `.eleventyignore`, so they are never published.
- **Demos live at `/demos/<slug>/`**, starting with `/demos/keep-ai-on-the-rails/` (#33).
- **Interactive layers are progressive enhancement.** Every page reads correctly as server-rendered HTML with JavaScript off.

## 7. Deployment model

Netlify builds `main` with `npm run build` and publishes `_site`. Netlify Functions live in `netlify/functions`. There is no database. Persistent content is the Markdown in `_data/`, which is synced from Notion and committed. Environment variables (Notion and GitHub tokens) live in the Netlify site settings and a local `.env`.

## 8. Canonical sources of truth

- **Resources:** the Notion resources database. `_data/resources/` is a synced copy.
- **Course lessons and their URLs:** the Notion transcripts database and Thinkific.
- **Eddie components, tokens and recipes:** eddie-brain (`ds.bradfrost.com/mcp`) and the published `@brad-frost-web/eddie-*` packages. Never memory.
- **The process:** `@brad-frost-web/bfw-process`, pinned in `devDependencies`. `AGENTS.md` is generated from it.

## 9. Accessibility posture

WCAG 2.1 AA baseline. Known gaps are tracked in #19 (checklist rating control). Animated demos must honour `prefers-reduced-motion`, and any canvas or visual-only layer must be decorative (`aria-hidden`), with the same information available as text.

## 10. Open questions

- What happens to `design/13-chameleon-resources`: promote, promote part, or freeze (#25)?
- Where do demos beyond the first live, and is there a `/demos/` index (#27)?
