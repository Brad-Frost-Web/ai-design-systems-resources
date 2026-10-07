---
status: draft
owners:
  - Brad Frost
  - Ian Frost
last_updated: YYYY-MM-DD
amendments: []
---

# SPEC.md — {{project_name}}

> **The project spec: what this project is and what it's for.**
>
> **This is not a work order.** It describes the project, not the branch you're on. Work is specified in `FEATURE-SPEC.md` (AGENTS.md §4.1–§4.3). If you're writing about a change you're making right now, you're in the wrong file.
>
> **It is never deleted.** It survives every merge and outlives every feature branch. When what the project *is* changes, amend it — add an entry to `amendments` with the date, author, and a summary — rather than rewriting history.
>
> `status: approved` here means "this accurately describes the project." It does **not** authorise any particular piece of work; only an approved `FEATURE-SPEC.md` does that (§4.2).
>
> Instructions: fill in every section. If a section doesn't apply, write "N/A" with a one-line explanation — don't leave it empty or as `TODO`.

## 1. What this project is

_One paragraph, plain English. If someone lands in this repo knowing nothing, this is the paragraph that orients them. What is it, and what does it do?_

## 2. Why it exists

_The crux. What problem does this solve, or what would be worse without it? A project whose reason for existing can't be stated in a few sentences is a project nobody can prioritise correctly._

## 3. Who it's for

_Target users and the context they're in. Be specific — "developers" is not an audience, "agents composing Eddie markup in consumer repos" is._

## 4. Goals

_Durable outcomes that define success for the project as a whole — not this quarter's roadmap. If a goal would be finished and removed in a month, it belongs in an issue, not here._

-

## 5. Non-goals

_What this project deliberately does not do. Often more valuable than the goals: it's what stops scope creep years from now, when the original reasoning has been forgotten._

-

## 6. Shape and constraints

_The architecture and the boundaries it lives inside. Project type (§6), stack deviations from the §3 defaults and why, external dependencies, and any constraint a newcomer would otherwise have to rediscover the hard way._

## 7. Deployment model

_Where it runs, how it ships, what environments exist, and where persistent state lives (if any)._

## 8. Canonical sources of truth

_External parameters this project depends on and does not own — API endpoints, design token packages, upstream schemas, accounts, dashboards. Name where each lives, so nobody guesses at a value that's authoritative somewhere else._

## 9. Accessibility posture

_WCAG 2.1 AA is the baseline (§2.3) and is not negotiable. Record here anything project-specific: known gaps with issues tracking them, assistive-tech targets, or an explanation of why the project has no interactive surface._

## 10. Open questions

_Genuinely unsettled things about the project itself. Move them out as they're decided — an open question that's been answered is exactly the kind of stale content that misleads._
