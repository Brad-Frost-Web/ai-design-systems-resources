# CLAUDE.md — Brad Frost Web Software Creation Process

> **You are Claude Code working in a Brad Frost Web (BFW) project.** Your rules of engagement live in `AGENTS.md` at the repo root. **Read `AGENTS.md` in full on your first tool call this session.** That file is the canonical cross-agent source of truth and supersedes any general habits or defaults you have.
>
> This file exists because Claude Code looks for `CLAUDE.md` specifically. The content is a pointer — the actual rules are in `AGENTS.md` so they never drift between Claude Code, OpenHands, Cursor, Cline, and any other harness.

---

## Cold start on any harness: `bfw-process rules`

If this session did **not** automatically load `AGENTS.md` — a cloud surface, a
harness without repo-file injection, anything where you're unsure — run:

```bash
bfw-process rules
```

It prints the orientation bundle: mode, branch, lane, which gates apply, the
spec status, the §2 always-on rules, and which guardrails actually fail a
command versus which are advisory. `--json` for machine consumption. It is a
*pull*, so it works where ambient injection doesn't. It does not replace reading
`AGENTS.md` in full, and nothing verifies that you did (§8, #170).

## Quick reference (until you've read `AGENTS.md`)

These are the non-negotiables. They apply in **both** Full and Quick modes:

1. **Eddie Design System is the UI layer.** `@brad-frost-web/eddie-web-components` + `@brad-frost-web/eddie-recipes`. No custom components in consumer projects. No Tailwind/Bootstrap/Material UI/Chakra/shadcn. If Eddie doesn't cover it, you create a recipe in `eddie-recipes`.
2. **Design tokens only.** All values come from `@brad-frost-web/eddie-design-tokens` as `--ed-*` CSS custom properties. No hardcoded colors, spacing, type. No Google Fonts `<link>` tags.
3. **WCAG 2.1 AA accessibility baseline.** Semantic HTML, keyboard-reachable, contrast, alt text, progressive enhancement. a11y during, not after.

## Modes

This project has a mode in `.bfw-process/config.json`:

- **Full mode** — six-phase process enforced. `FEATURE-SPEC.md` must have `status: approved` before Phase 3 begins, for work meeting the §4.3 threshold. Phase 5 → 6 is a hard gate via `npm run bfw:ship`.
- **Quick mode** — phase gates skipped, `FEATURE-SPEC.md` optional, ship checks off. The three non-negotiables above still apply.

## "Do it for real now"

If the user says **"do it for real now"** (or a clear variant like "promote to full" or "run the gauntlet"), it's a mode-switch instruction. Don't rewrite the existing code. Instead:

1. Generate `FEATURE-SPEC.md` from the current state of the working directory using `.bfw-process/templates/FEATURE-SPEC.md`
2. Set `status: draft`, stop, and wait for human approval
3. Once approved, run Phase 3 → 4 → 5 → 6 as refinement of the existing code

If you're on a `design/*` branch and the user says **"let's promote this"**, **"make this real"**, **"spec this out"**, **"let's build this for real now"**, or similar, that's a *design-branch promotion* (not a Quick → Full mode switch). The next move is `bfw-process design promote` — see the "Design branches" section below and AGENTS.md §5.3.

## "It's time to cut a new release"

If the user says **"it's time to cut a new release"** — or a near-synonym like "let's cut a release," "publish a new version," "ship 0.24.0" — that's the release ceremony's trigger. **Load `.bfw-process/checklists/release-cutting.md` in full before running anything** (`checklists/release-cutting.md` in the bfw-process repo itself). It carries the canonical trigger list and Phases 0–6; don't cut a release from memory. Libraries only — trunk repos (sites, apps, scripts) have no release ceremony. See AGENTS.md §9.5.13.

**A human merges the release PR**, always. On repos with `.github/workflows/publish.yml`, that merge *is* the publish.

## Design branches

A `design/<N>-<slug>` branch is for exploratory, sketch-first work. Different rules apply:

- **No phase gates while on the branch.** `FEATURE-SPEC.md` not required until promotion. `npm run bfw:ship` will refuse on a design branch.
- **Never merges to the integration branch** (`main` on trunk repos, `develop` on gitflow repos — check `branchModel` in `.bfw-process/config.json`; AGENTS.md §9.5.2). Promotion via `bfw-process design promote` produces fresh `feature/*` branches off the integration branch; the design branch is archived as a git tag.
- **Eddie-first is still the default**, but the user can invite exploration with phrases like *"don't use Eddie here,"* *"color outside the lines,"* *"dream up a new theme,"* or *"sketch this fresh."* When you hear an exploration trigger, ask one short confirming question — **"Do you want to use Eddie, or color outside the lines?"** — and operate under the confirmed mode for that line of work. Per line of work, conversational, revocable.
- **"Let 'er rip" is NOT an exploration trigger.** It can mean "go, stop asking questions." Only treat phrases that explicitly signal *bypassing Eddie or tokens* as exploration triggers. When in doubt, ask.
- **a11y baseline stays on.** Semantic HTML, keyboard reach, contrast — always.

See AGENTS.md §5.3 for the full design-branch contract.

## The Phase 2 gate (Full mode only)

Do not begin implementation until `FEATURE-SPEC.md` has `status: approved`. If draft, wait. If missing and the work meets the §4.3 threshold, write it from the template and stop.

This is the **branch-scoped** spec. An approved project `SPEC.md` authorises nothing — it says what the project is, not that this work is agreed (AGENTS.md §4.1). For work below the threshold — a single-cause bug fix, a dependency bump, a doc correction — there's no feature spec and the issue body is the spec.

## The Phase 5 hard gate

Before shipping, run `npm run bfw:ship` (the canonical invocation; it runs `bfw-process verify-phase ship` via the pinned devDependency). If it exits non-zero, do not deploy. Only BFW co-owners (listed in `.bfw-process/config.json` → `owners`) can bypass with `BFW_OWNER_OVERRIDE=1`, and only on explicit human instruction.

**You must not run `BFW_OWNER_OVERRIDE=1` unilaterally.** Only on explicit owner instruction.

## When in doubt, ask

Unclear spec? Ambiguous project type? Hard-to-parse intent? **Stop and ask.** Don't make consequential decisions unilaterally.

---

## Now read the rest

Your next action should be to read `AGENTS.md` in full, then `SPEC.md` (the project spec, if it exists), then any `FEATURE-SPEC.md` on the current branch, then `.bfw-process/config.json` for the current mode and owner list. After that, proceed with whatever the human asked for.

- `AGENTS.md` — full cross-agent rules
- `SPEC.md` — the project spec: what this project is and what it's for
- `FEATURE-SPEC.md` — the feature spec for the current branch, when present
- `.bfw-process/config.json` — mode, owners, project type
- `.bfw-process/phases/` — expanded guidance for each of the six phases
- `.bfw-process/checklists/` — checklists used by `verify-phase`
