---
name: Design exploration
about: Open an exploratory sketch on a design branch (the first half of the double diamond)
title: "[Design] "
labels: design-exploration
assignees: ''
---

> This issue opens a **design branch** — exploratory, sketch-first work. It is NOT a feature spec. The point is to find the intent (what should this even be?) before any production work begins. See AGENTS.md §5.3.

## Parent feature issue

_If this exploration already belongs under a feature issue or epic, name it here as a single line — `Parent: #93` — and `bfw-process design promote` will link the production work to it instead of filing a second parent. Leave it out if there isn't one yet; promotion will file one._

## What we're trying to find out

_What's the open question or design problem? Frame it as a question if you can. "What should the gallery grid feel like on touch devices?" is better than "Implement touch-friendly gallery grid."_

## Why now

_What context makes this worth exploring at this moment? An upcoming release? A user complaint? A new capability that opened up?_

## What we're allowed to ignore (while exploring)

_The default rules still apply — Eddie-first, tokens, a11y. But on this exploration, the human may invite the agent to "color outside the lines" for specific parts. Pre-declare anything you already know you want to bypass:_

- [ ] Eddie components — may sketch without them when invited
- [ ] Design tokens — may use ad-hoc values when invited
- [ ] Default stack — may sketch with a non-default framework/tool

_a11y baseline always stays on. Never relaxable._

## What good looks like at the end of exploration

_Not a spec — a description of what makes this exploration "done enough to promote." Examples: "I can show one or two compelling directions in code, with notes on the trade-offs." "I know which Eddie components need new variants to support this." "I have a prototype I can use in a user-feedback session."_

## Out of scope for THIS exploration

_What we are NOT trying to find out here. Useful for keeping the sketch focused._

## References & inspiration

_Sites, products, articles, prior art, anti-patterns. Same spirit as the feature template, but emphasize what's evocative rather than what's prescriptive. URLs only._

## Promotion notes

_When the exploration matures, the design branch will be promoted via `bfw-process design promote`. That command will:_

1. _Tag the design branch tip as `archive/design-<N>-<slug>`._
2. _Generate a draft `SPEC.md` from the working tree._
3. _Draft a cohort of follow-up issues (recipe-requests, token-gaps, upstream Eddie issues per §9.4.1) — shown to the human for review **before** anything is filed._
4. _On confirm: write the SPEC.md, push the archive tag, file the issues, record a SPEC amendment._
5. _Production work splits into fresh `feature/*` branches off the integration branch (`main` on trunk repos, `develop` on gitflow repos — AGENTS.md §9.5)._

## Related

_Link any related issues, prior explorations, or upstream Eddie issues._
