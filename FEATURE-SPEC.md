---
status: approved
issue: 33
branch: feature/33-keep-ai-on-the-rails-stepper
owners:
  - Brad Frost
  - Ian Frost
last_updated: 2026-10-07
amendments:
  - date: 2026-10-07
    author: Brad Frost
    summary: |
      Approved by Brad in the Claude Code session ("Approved go build").
      The frontmatter flip was transcribed by the agent on that instruction.
---

# FEATURE-SPEC.md — Keep AI on the Rails: a rung-by-rung stepper (#33)

> **Phase 2 spec for one unit of work. Status must be `approved` before Phase 3 begins (AGENTS.md §4.2).**
>
> **This is not the project spec.** `SPEC.md` says what the project is; this says what *this branch* does.
>
> **This file is deleted when the branch merges.**

## 0. Origin

Lesson 4.bf.06, "Keep AI on the Rails of Your Design System," is the most important lesson in the AI & Design Systems course. Its diagram started as a Claude artifact, which Brad copy-edited by hand and committed as `_data/resources/keep-ai-on-the-rails-claude.html` (0c280b4, on `design/13-chameleon-resources`). The finished diagram is too much to take in at once, so this work builds it up one rung at a time, from vibe coding to the full system. Parent: #27 (teaching artifacts onto the site). The working plan and its five decisions (2026-10-07) are in `docs/plan-keep-ai-on-the-rails-stepper.md`. Depends on #31 (bfw-process on `main`) to start and on #32 (ship gate turned on) to ship.

**The scope of THIS spec is limited to** the `/demos/keep-ai-on-the-rails/` page: the stepper, its eleven rungs of copy, the diagram at each rung, the real captured outputs, the View Transitions motion layer, the decorative canvas signal layer, a feature-detected HTML-in-Canvas experiment, and the project-local recipe(s) Eddie lacks. Moving the original artifact HTML onto `main` as the copy source comes along. The `/demos/` index and any other demo are out of scope.

## 1. What it is

A single public page that tells the story of keeping AI on your design system's rails as a spectrum. At the far left, someone types "Build me a pricing page" and gets whatever the model invents. A slider steps right through eleven rungs. Each rung adds one piece: agent settings, rule files and DESIGN.md, the installed design system, eddie-brain over MCP, skills/recipes/page templates, the validation loop, human review, bfw-process, the Steel Curtain, and the feedback loop. At every rung the page shows what was added, what the same prompt actually produced with exactly that much setup, and what still breaks, which motivates the next rung. At the far right the diagram matches today's full artifact, cross-highlighting included.

## 2. Who it's for

- **People seeing the lesson for free**: designers, developers and non-technical product people arriving from a shared link. They need to follow along without knowing what MCP is.
- **Course students** revisiting the lesson, often deep-linked to one rung from a lesson page.
- **Brad, recording the lesson** in a 1920×1080 frame, stepping rung by rung from the keyboard.

## 3. Goals

- A first-time visitor can say, after the last rung, why each piece exists, because each "still breaks" line set it up.
- Every rung fits in a 1920×1080 frame with no scrolling. The view zooms out as pieces arrive.
- The output panel at each rung is a real result of the same prompt with that rung's setup, not a mock.
- The page tells the whole story with JavaScript off, and with reduced motion on.
- Built 100% with Eddie components, recipes and tokens; anything missing becomes a project-local recipe, with the gap filed upstream.

## 4. Non-goals

- A `/demos/` index page or any other demo (#27 covers those).
- Live model calls from the page. Outputs are captured ahead of time.
- Depending on HTML-in-Canvas. It is a Chrome/Edge origin trial that expires around October 2026; it may add one signature moment, behind feature detection, and nothing breaks without it.
- Rewriting the lesson's argument. Copy comes from Brad's edited artifact; new copy (DESIGN.md, per-rung beats) is drafted for his review, never shipped unreviewed.
- Settling the final rung count up front. All eleven get built; merging rungs is a later amendment.

## 5. User flows

### Flow A — Step through the story

1. A visitor lands on `/demos/keep-ai-on-the-rails/` at rung 0: a prompt, a result, and the empty spectrum ahead, with future pieces as faint ghosts.
2. They drag the slider, or press → or Next, to rung 1. The new piece moves into place, the output panel changes to that rung's real result, and the beat card reads Adds / Now you get / Still breaks.
3. They keep going. Each rung adds a piece, and the view zooms out to keep everything in frame.
4. At rung 10 the full diagram is on screen. Hovering or focusing a station lights the concepts, eddie-brain files and packages it uses, as in the original artifact.

### Flow B — Deep link to one rung

1. A lesson page links to `/demos/keep-ai-on-the-rails/?rung=4`.
2. The page opens at rung 4, slider and diagram already in that state.
3. Stepping back or forward updates the URL, so the link in the address bar always matches what's on screen.

### Flow C — Record the lesson

1. Brad opens the page at 1920×1080 in Chrome and presses Home to start at rung 0.
2. He presses → for each beat; number keys jump straight to a rung for retakes.
3. With the HTML-in-Canvas flag on, the signature moment plays; without it, the View Transitions version plays, and the recording still works.

### Flow D — No JavaScript, or reduced motion

1. With JS off, the page is an ordered list of eleven rungs, each with its beat, its output image and its diagram state, readable top to bottom.
2. With `prefers-reduced-motion`, rungs change instantly, with no flying pieces and no canvas signal.

## 6. Data model

No persistent data. The rungs are a build-time data file (`_data/rails/rungs.json` or `.js`): per rung, an id, title, the three beat lines, which diagram pieces are present (station, concept, file and package ids reused from the artifact's `data-uses`/`data-id` vocabulary), and the output image path with its alt text. Output captures are static images in the repo, alongside a short note per rung recording the exact setup used to produce it (prompt, model, which files and tools were present) so the claim "this is what it actually did" can be checked.

## 7. Deployment model

| Environment | Hosting | Persistence | Notes |
|-------------|---------|-------------|-------|
| Local dev   | `npm start` (Eleventy, port 8080) | None | Recording happens here; HTML-in-Canvas via the Chrome flag |
| Production  | Netlify, built from `main` | None (static) | Public; must work in Chrome, Safari and Firefox without the flag |

## 8. Tech decisions

- **Project type:** content-site
- **Framework:** Eleventy (the site's existing stack)
- **Hosting:** Netlify
- **Motion:** same-document View Transitions API, which is Baseline in Chrome, Safari 18+ and Firefox 144+. Without it, the rung changes instantly.
- **Signal layer:** plain 2D `<canvas>`, decorative and `aria-hidden`, showing "guesses" flowing along the rails, caught by stations and stopped at the Steel Curtain. Off under reduced motion.
- **Signature moment (optional):** HTML-in-Canvas (`layoutsubtree` + `drawElementImage`), feature-detected, layered on top. Never the only way something is shown.
- **Deviations:**
  - **Stepper control:** a project-local recipe (`ed-r-c-rung-stepper` or similar, tokens-only, light-DOM Lit). Eddie's `ed-range` guidelines say not to use it for a few named discrete options, and it exposes no change events. Dual-file the missing pattern upstream (§9.4.1).
  - **Diagram connectors and the brushed-steel Curtain:** presentational CSS Eddie doesn't own. Each becomes a token-backed recipe or a disclosed deviation, decided during build with eddie-brain lookups (P3.2).
  - **Early-rung output images** show off-system UI on purpose. They are screenshots, so no off-system CSS ships.

## 9. Accessibility requirements

- The stepper is a single labeled control: arrow keys, Home/End, and number keys. The current rung and its title are announced on change through a polite live region.
- Every output image has alt text describing what's wrong or right with it, not just "pricing page."
- Rung changes move no focus and trap nothing. The beat card is real text, never canvas-only.
- The canvas layers are `aria-hidden`; everything they show also exists as text in the beat card.
- `prefers-reduced-motion`: no View Transitions animation, no canvas signal, no HTML-in-Canvas effect.
- Contrast holds in light and dark Eddie themes, including on the steel surface.

## 10. Open questions

All four answered by Brad on 2026-10-07. Kept here as the record until approval.

1. **Capturing the outputs:** an agent drives the eleven runs, setting up each rung's exact environment, running the same prompt, screenshotting the result and logging the setup. Brad picks the final frame for each rung. One current Claude model is held constant across all rungs, and the setup note records which one.
2. **DESIGN.md at rung 2:** any prose file that describes the design language. Google Stitch's DESIGN.md is named as one example, not as the format.
3. **Copy source:** `_data/resources/keep-ai-on-the-rails-claude.html` was cherry-picked onto this branch (from 0c280b4 on `design/13`), so Brad's edits reach `main` with this work. The resources loader reads only `.md` and the build publishes nothing from it.
4. **Course CTA:** reworked for free visitors. A stronger CTA closes rung 10 ("that's one lesson; here's what else the course does"), and the lede keeps its course link. Copy is drafted in Brad's voice for his edit before it ships.

## 11. Success criteria

- `/demos/keep-ai-on-the-rails/` builds and renders all eleven rungs; `?rung=0` through `?rung=10` each open in the right state.
- At 1920×1080, every rung fits without scrolling (checked by the responsive verify script).
- Every rung's output image has a recorded setup note.
- With JS disabled, all eleven rungs are readable in order.
- axe reports no violations at rung 0, 5 and 10, in light and dark themes.
- Keyboard-only: every rung is reachable, and the change is announced.
- With reduced motion, no animation runs.
- No hardcoded design values; every Eddie surface was grounded in an eddie-brain lookup.
- `npm run bfw:ship` passes with the gate turned on (#32).
