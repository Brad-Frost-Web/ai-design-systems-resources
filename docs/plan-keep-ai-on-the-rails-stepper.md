# Plan: Keep AI on the Rails, built one rung at a time

**Status:** planning draft, not a spec · **Parent:** #27 (migrate teaching artifacts onto the site)
**Source of copy and shape:** `_data/resources/keep-ai-on-the-rails-claude.html` (commit `0c280b4`)

## The idea in one line

A spectrum from **vibe coding** to **designing with AI and design systems**. You
drag a slider and the system assembles itself. Each step adds one piece, shows
what it fixes, and names what still breaks, because that failure is why the
next piece exists.

## The ladder

Every rung has the same three beats. That repetition lets people follow along:

- **Adds:** the new piece
- **Now you get:** what the output looks like
- **Still breaks:** the failure that motivates the next rung

| # | Rung | Adds (maps to the artifact) | Still breaks → next rung |
|---|---|---|---|
| 0 | **Prompt → UI** | Nothing. "Build me a pricing page." | You get *someone's* UI: AI-default gradients, invented cards. Not yours. |
| 1 | **Agent settings** | Always-on user settings ("use our blue, our font") · `cfg-standing` | Describing a brand is not using a system. Colors move closer, but the components are still invented. |
| 2 | **Rule files + DESIGN.md** | `AGENTS.md → CLAUDE.md`, a DESIGN.md describing the design language · `cfg-project` *(DESIGN.md is new copy)* | Prose about a system is still a copy of it. Hex codes come from the prose, and the copy drifts from the real system. |
| 3 | **Install the design system** | Tokens + web components as real packages · the Eddie DS Packages row | Real components show up, but the model *remembers* their API: invented `slot="eyebrow"`, fake props, dropped content. |
| 4 | **Give the agent the brain (MCP)** | eddie-brain over MCP: ground + consult · `cfg-mcp`, stations 1 & 3, the brain files | Correct parts, assembled from primitives: stacked card grids, hand-rolled page chrome. |
| 5 | **Skills, recipes, page templates** | Compose from ingredients · `cfg-skills`, station 4 | Nothing checks the work, so a slip ships quietly. |
| 6 | **Validation loop + render check** | Hook + `validate_file` + render-check · `cfg-hook`, stations 5 & 6 | Correct is not the same as *good*. |
| 7 | **You review it** | Human review loop · station 7 | One-off judgment, with no spec, no phases, and nothing to measure "right problem" against. |
| 8 | **A real process underneath** | bfw-process: spec gate, phases, rule files · the bedrock band | Good work still needs a wall before main. |
| 9 | **The Steel Curtain** | CI gates, tests, two-axis evals + your merge approval · stations 8 & 9 | It works, but the system learns nothing from what shipped. |
| 10 | **The feedback loop** | eddie-reporter → brain · the loop card | Nothing. This is the full diagram. |

Eleven states is a lot. Rungs 7 and 9 could merge ("humans hold two gates"),
and so could 5 and 6, which would bring it to 9. Decide once the stepper is in
your hands, not on paper.

## What's on screen at every rung (must fit 1920×1080)

1. **The spectrum slider** across the bottom, labeled at both ends ("Vibe coding" ↔
   "AI + design systems") with tick labels per rung.
2. **The system**: the diagram as it exists at this rung. Future pieces show as
   faint dashed ghosts, so the gap stays visible.
3. **The output**: the *same* pricing-page prompt, as it actually came back at
   this rung. Watching this panel improve is the payoff.
4. **The beat card**: Adds / Now you get / Still breaks, in your voice.

**Fitting the frame:** early rungs have few pieces, drawn big. As pieces
arrive, the view zooms out until rung 10 matches today's artifact. This
zoom-out keeps every rung inside the 16:9 recording frame.

## Animation: what to use, layered

| Layer | Tech | Does | Why |
|---|---|---|---|
| 1. Floor | Semantic HTML + Eddie, no JS | All rungs as ordered sections; readable, linkable, indexable | Progressive enhancement, a11y, works everywhere |
| 2. Motion | **View Transitions API** (same-document) | Pieces fly into place, the camera zooms out, the output morphs between rungs | Baseline across Chrome, Safari 18+, Firefox 144+. This delivers most of the "fluid" feel. |
| 3. Signal | Plain 2D `<canvas>` overlay, decorative | "Guesses" stream from the model along the rails; more get caught each rung; they bounce off the Steel Curtain | Hallucination becomes something you watch get stopped. `aria-hidden`, off under reduced motion |
| 4. Signature (optional) | **HTML-in-Canvas**, feature-detected | One wow moment on real DOM, e.g. the generic UI dissolving and re-forming as Eddie UI, or a real brushed-steel shader on the Curtain | See the caveat below |

**The HTML-in-Canvas caveat.** It is a Chrome/Edge origin trial. The trial was
extended through Chrome 154 and expires around this month (Edge: Oct 20,
2026), and browser vendors have not agreed it is the right API. Fine for the
recording: run Chrome with the flag on localhost. Not something the public
page can depend on. So it goes in as layer 4 only, behind feature detection,
and the page loses nothing without it. The branch already has prior art in the
pixels demo (DOM vs canvas plus a capability table).

## Building it with Eddie

- **Slider:** `ed-range` exists, but Eddie's own guidance says don't use it for
  a few named discrete options, and it exposes no events (the same
  event-swallowing gap DESIGN-NOTES logs for radio and search). A labeled
  discrete stepper is a missing pattern, so build it as a project-local recipe
  (`ed-r-c-*`, tokens only, light-DOM Lit) and dual-file the gap upstream.
  `ed-p-wizard` (draft) is related but is a form flow, not a scrubber.
- **Everything else:** sections, cards, grid, tags, and text passages come
  from Eddie. The brushed-steel Curtain and the diagram's connectors are
  presentational CSS that Eddie doesn't own, so they need a token-backed
  recipe or a disclosed deviation.
- **Recording affordances:** ← → and number keys step through rungs;
  `?rung=4` deep-links (lesson pages can point at a specific rung, and
  re-takes start clean).
- **Keep the hover cross-highlight** from the artifact (station ↔ concept ↔
  package) at every rung where both ends exist.

## The output panel: real or staged?

**Recommendation: real.** Run the same prompt at each rung with exactly that
much setup, and capture what came back. Lesson 4.bf.05 (footer with and
without guardrails) already does this in miniature. It's honest ("this is
what it actually did"), it's a strong recording beat, and the early "bad" UI
stays a screenshot, which keeps off-system CSS out of an Eddie site. Staged
mock UI is faster but would need hand-written off-system CSS, and the
claim gets weaker.

## Rough effort

- Finalize the ladder and per-rung copy (you): 1–2 hours
- Capture real outputs per rung (you + an agent driving the runs): 2–3 hours
- Layers 1–2 build: 1–2 days
- Layer 3 canvas signal: half a day
- Layer 4 HTML-in-Canvas spike: half a day, optional

## Decisions (answered 2026-10-07)

1. **Lane:** land bfw-process first, then build under Full mode
   (FEATURE-SPEC → approval → build → `bfw:ship`).
2. **Rungs:** build all 11, then merge rungs once they can be clicked through.
3. **Output panel:** real captured runs.
4. **Location:** `/demos/keep-ai-on-the-rails/`.
5. **Audience:** public from day one, as the free lesson. HTML-in-Canvas stays
   an optional extra; the page works fully without it.

### The questions as asked

1. **Lane.** bfw-process (full, content-site) lives only on
   `chore/bfw-process-audit` / `chore/recover-main-wip`. It never landed on
   `main` or `develop`. Either land it first, then build this as
   `feature/<N>` off `develop` under Full mode (FEATURE-SPEC → approval →
   build → `bfw:ship`), or sketch it on a new `design/<N>-rails-stepper`
   branch (no spec until promotion). Not on `design/13`: that branch is
   footage of record for the Chapter 5 lesson, and every new commit there is
   drift.
2. **Rung count:** 11, or merge to about 9.
3. **Output panel:** real captured runs (recommended) or staged.
4. **Where it lives:** `/demos/keep-ai-on-the-rails/` or under the lesson
   pointer (#27's open question).
5. **Public or recording-only first:** if this is the free-outside-the-paywall
   lesson (per the 2026-09-22 launch meeting), layer 4 can't be load-bearing.

## Sources

- [HTML-in-Canvas: Intent to Experiment (blink-dev)](https://groups.google.com/a/chromium.org/g/blink-dev/c/t_nGEmJ_v4s)
- [ICS MEDIA: HTML-in-Canvas, trial extended through Chrome 154](https://ics.media/en/entry/260825/)
- [Microsoft Edge origin trial (expires Oct 20, 2026)](https://developer.microsoft.com/en-us/microsoft-edge/origin-trials/trials/a297467e-0030-4c4c-8739-48e130026c03)
- [Codrops: Exploring the HTML-in-Canvas proposal](https://tympanus.net/codrops/2026/05/13/exploring-the-html-in-canvas-proposal/)
- [Chrome for Developers: What's new in view transitions (2025)](https://developer.chrome.com/blog/view-transitions-in-2025)
- [web.dev: New to the web platform in October 2025 (Firefox 144)](https://web.dev/blog/web-platform-10-2025)
