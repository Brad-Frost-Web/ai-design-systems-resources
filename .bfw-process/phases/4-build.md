# Phase 4 — Build

> **Goal:** Execute against the spec and task list, writing code that passes Phase 5 on the first try.

## Inputs

- `SPEC.md` (approved)
- Phase 3 task list, component inventory, test strategy
- Access to the default stack

## Activities

1. **Work through tasks in dependency order.** Foundation first, features second, polish third.
2. **Follow the always-on rules from `AGENTS.md` §2.** Eddie-first. Tokens only. a11y baseline. Progressive enhancement. **`eddie-brain` before writing any Eddie markup** — query `eddie_get_component` and `eddie_get_token` before using anything you haven't used in the last hour. Never write `<ed-foo>` or `var(--ed-bar)` from memory.
3. **Validate Eddie files with `eddie_validate_file` before every commit** that touches `.ts`, `.scss`, `.vue`, or `.njk` files consuming Eddie. Fix violations or call `eddie_suggest_fix` for guided remediation. Do not commit files that fail validation.
4. **Write tests alongside each task.** Not after. Unit tests are part of the task definition, not a bonus.
5. **Commit frequently.** Small, scoped commits. Clear messages describing what and why. The commit log should read like a narrative of how the project came together.
6. **Surface amendments.** If implementation reveals the spec underspecified something, stop and amend `SPEC.md` (or file a GitHub issue). Do not silently decide around spec gaps.
7. **Escalate to recipes when UI doesn't fit Eddie.** See `AGENTS.md` §2.1. Never write one-off UI code. When `eddie-brain` reveals a gap (missing component, missing recipe, missing token), file a dual-filed issue pair per §9.4.1 and proceed with the best available workaround — documented, not buried.
8. **Execute third-party library proof-of-concepts early.** If Phase 3 identified third-party libraries that need a spike (see `AGENTS.md` §2.1a), build the proof-of-concept before wiring the library into the full feature build. Confirm Eddie token theming works, a11y output is acceptable, and SSR doesn't break. If the spike fails the criteria, go back to the candidate list — don't force-fit a library that doesn't integrate cleanly.
9. **Fake decisions, not command lines.** Any module that shells out to an external binary (`git`, `gh`, `npm`, a CLI, a daemon) gets at least one test that runs the real thing against a throwaway fixture, in the default suite. Fakes stay for decisions and error branches — they just can't prove the argument vector is one the binary accepts. See AGENTS.md §2.13.
10. **Thread safety flags to the layer that performs the effects.** If this task adds a `--dry-run` / `--check` / observe mode, name the function that actually spawns, writes, pushes, or charges, and make sure the flag reaches it. Test for **zero effects** with the flag set and every grant live, and report planned actions as planned (`would file 3 …`), never as done. See AGENTS.md §2.14.
11. **Name the caller for every new interface.** Before calling a seam, hook, or injection point wired, grep for a caller. A definition is not a feature; "tests only" is a valid answer that belongs in the PR body. See AGENTS.md §8.2.
12. **Render and look before committing UI.** Never author a page or view blind. Before committing any UI work: spin up the dev server, load the view in whatever browser/preview tooling the harness provides, and *look at it* — screenshot it if the harness supports screenshots. Critique what you see against the content's tone (Phase 1), visual hierarchy, spacing rhythm, and the theme-fit decision from Phase 3 — then iterate until the render matches the intent, not just the markup contract. Passing `eddie_validate_file` proves token compliance; it cannot prove the page reads well or looks right. Agents that can't render (no browser tooling in the harness) must say so explicitly in the PR so a human looks before merge.
13. **Keep the change to what the task asks for.** A pre-existing bug, a performance concern, or behaviour the task doesn't mention is a follow-up named in the PR body (and filed per §9), not a fix in this diff — unless the requested behaviour can't work without it. Implement the reading its wording and the surrounding code most directly support and state the assumption; don't build for the other readings too. Scratch checks need not be kept; tests for the requested behaviour still ship with it; commit them sized like the neighbouring test files, a focused test per stated behaviour as the floor. See AGENTS.md §8.4.

## Exit condition: the two-axis review (§8.1)

Phase 4 is not done at "working code, tests alongside". **Before the commit that closes the issue, run two independent reviews of the diff, in parallel, that cannot see each other's output:**

- **Standards** — does this follow the repo's documented rules (`AGENTS.md`, these checklists) plus a fixed code-smell baseline: dead code, duplicated logic, swallowed errors, misleading names?
- **Spec** — does this do what the originating issue asked, and *only* that?

Keep the two reports separate. Merging or re-ranking them lets one mask the other — code can follow every convention while implementing the wrong thing, and vice versa.

Three lines in the brief are what make the difference between findings and agreement:

1. Tell the Spec reviewer to **read the old code and the new code and diff the semantics**, not to read the diff.
2. Tell it what is **explicitly out of scope** (the follow-up tickets), or it reports deferred work as missing.
3. **Point it at the highest-risk claim by name** — "be adversarial about the 'no behaviour change' claim" finds things; "review this" doesn't.

Findings are either fixed or disclosed in the PR body. It's a soft gate: the reviewer is advisory, but skipping it is a stated choice rather than a default. On the reference epic this caught four real defects in four uses, in work whose tests were already green — three of which would otherwise have shipped.

## Guardrails (repeat from `AGENTS.md` because these are the failure points)

- No custom presentational CSS. No Tailwind. No Bootstrap. No Material UI. No Chakra. No shadcn.
- No hardcoded color, spacing, or type values. Only `--ed-*` tokens.
- No Google Fonts `<link>` tags. Fonts come from Eddie.
- Accessibility at every step, not as a cleanup pass.
- Progressive enhancement. Core functionality works without JS.
- A seam that fakes an external process is accompanied by at least one test that doesn't (§2.13).
- A "plan everything, perform nothing" flag reaches the layer that performs the effects (§2.14).
- No `git stash` in a checkout with background writers — `git add <paths>` splits a commit without the shared stack (§9.5.10).

## Checklist

See `checklists/phase-4-build-guardrails.md`.

## When migrating frameworks

If Phase 3 identified a framework migration (e.g., vanilla Lit → Nuxt, Eleventy → Nuxt), follow this approach:

1. **Don't do a big-bang rewrite.** Migrate incrementally — install the new framework alongside the existing code, then move features one at a time.
2. **Start with the simplest page or mode.** Get one route working end-to-end before tackling complexity.
3. **Let the new framework's idioms guide decomposition.** A monolithic component that handles routing, state, and rendering doesn't need to be decomposed in the old framework first — the new framework's pages, composables, and server routes *are* the decomposition.
4. **Presentational components (Lit Web Components) stay as-is.** Consume them from the new framework. Don't rewrite `<ed-slide>` in Vue — Vue's `isCustomElement` config handles this.
5. **Data utilities (parsers, serializers) copy directly.** No rewrite needed — they're framework-agnostic.
6. **App orchestration gets rebuilt using new framework idioms.** Routing, state management, API calls, persistence — these are what the migration is *for*. See §2.7.
7. **Delete old infrastructure only after all routes work and all tests pass.** The old code is your reference implementation until the new code fully replaces it.
8. **Apply §2.7 throughout.** Read old code for intent, rebuild with current best practices. Don't port bugs.

## When a required component doesn't exist in Eddie

1. Check `eddie-web-components` — is there a variant or configuration that covers it?
2. Check `eddie-recipes` — has someone already created a product-specific composition?
3. If neither: create a new recipe in `eddie-recipes`. File an issue in the Eddie monorepo if it should graduate to core.
4. **Under no circumstances** write one-off component code in the consumer project.

## Output

- Working code for every task in the Phase 3 list
- Unit tests alongside — including a real-binary test for every faked external process (§2.13)
- Two-axis review run, with findings fixed or written up for the PR body (§8.1)
- A named caller for every new interface or seam (§8.2)
- Commit history telling the story
- Any spec amendments recorded
- Any new recipes PR'd to `eddie-recipes`

## Quick mode note

In Quick mode, you proceed directly here after Phase 1. The always-on rules from `AGENTS.md` §2 still apply. Tests and commits can be relaxed in favor of velocity. Recipes can be postponed as long as the one-off code is obviously extractable later if promotion happens.
