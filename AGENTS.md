# AGENTS.md — Brad Frost Web build rules

<!-- bfw-process 0.26.0 · synced 2026-11-23 · generated file: edit via the canonical repo and `bfw-process sync`, not here -->

You are working in a Brad Frost Web (BFW) repo. This page is the part of the rules to hold in your head while you write code; everything else is one command away, listed below. The rules exist so that what BFW ships is consistent, accessible, and reviewable by a small team. When a situation isn't covered, do what serves that, and say what you did.

## Always

1. **Eddie is the UI layer.** Build with `@brad-frost-web/eddie-web-components` and `eddie-recipes`. When Eddie lacks something, make a recipe.
2. **Tokens only.** Every color, space and type value is an `--ed-*` custom property.
3. **Accessible as you go.** WCAG 2.1 AA: semantic HTML, keyboard reach, contrast, alt text. This holds on every branch, in every mode.
4. **Progressive enhancement.** Start from HTML that works; new components are HTML Web Components.
5. **Branch first.** One issue, one branch, one PR. The integration branch changes only through a PR.
6. **Ship through the gate.** `npm run bfw:ship` decides. `BFW_OWNER_OVERRIDE=1` is an owner's call, given in this session for this command, never yours.
7. **Design branches may relax 1 and 2**, only when the human invites it. Ask once: "Do you want to use Eddie, or color outside the lines?"

## Before you start

- Run `bfw-process rules`: this repo's mode, branch, lane, spec status and gates.
- Read `LOCAL-RULES.md` if this repo has one. Where it differs from a topic below, it wins here.
- In Full mode, work over the spec threshold waits for an approved `FEATURE-SPEC.md` (`bfw-process rules phases`).

## Pull the rule when the work reaches it

`bfw-process rules <topic>` prints one topic; `bfw-process rules 9.5.6` prints one section, so "§9.5.6" anywhere means that command. No shell? Read `node_modules/@brad-frost-web/bfw-process/rules/<topic>.md`.

<!-- topics:start -->
- `charter`: you need the why behind Eddie-first, or the references
- `eddie`: you write or change any UI
- `libraries`: you want a third-party library, or are deciding where a package lives
- `accessibility`: you build or review anything a person uses
- `eddie-brain`: you need a component, token or recipe answer
- `spacing`: you lay out a page or container
- `complexity`: a component is growing props, variants or branches
- `migration`: you port or rebuild something existing
- `dependencies`: you add, bump or run a dependency
- `adding-to-eddie`: you think Eddie needs something new
- `skills`: you write or install an agent skill or global setting
- `verification`: you are about to say something works
- `methods`: you reach for an absorbed method
- `sessions`: you are starting cold or closing out
- `stack`: you choose a framework, database or script layout
- `phases`: you need the six phases or the spec rules
- `modes`: you are in Quick mode, on a design branch, or promoting
- `project-type`: you set up a repo or scope improvement work
- `ship`: you run the ship gate or hear "override"
- `build`: you are building: review, grep for the reader, research, scope
- `issues`: you file, label or audit
- `branches`: you branch, commit, open a PR or merge
- `fleet-sync`: you propagate a release to consumers
- `release`: someone says "cut a release"
- `recap`: you want the whole rulebook on one page
<!-- topics:end -->

## When in doubt

Stop and ask. An unclear spec, an ambiguous project type, or a rule that seems to block the right thing is a question for a human.
