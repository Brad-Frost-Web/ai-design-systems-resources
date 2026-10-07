# Phase 2 — Specification

> **Goal:** Produce a written, reviewed, approved `FEATURE-SPEC.md` that serves as the contract for Phase 3–6 on this branch. No implementation happens until it exists and is approved.
>
> **Which document?** `FEATURE-SPEC.md` — the branch-scoped one. The project's `SPEC.md` is a different artifact with a different job (AGENTS.md §4.1); it is written once at project setup and amended, not produced per unit of work. An approved `SPEC.md` does not satisfy this phase.

## Inputs

- Phase 1 outputs (project type, mode, clarifying decisions)
- The project brief
- `.bfw-process/templates/FEATURE-SPEC.md` (the template)
- The project's `SPEC.md`, as background — what the project is, so this work fits it

## Activities

0. **Check the threshold first (AGENTS.md §4.3).** Below it — a single-cause bug fix, a dependency bump, a doc correction — there is no feature spec and the issue body is the specification. Skip to Phase 3. Writing one anyway is not free: specs nobody needed are how the habit gets discredited.
1. **Copy the template** from `.bfw-process/templates/FEATURE-SPEC.md` to the project root as `FEATURE-SPEC.md`.
1a. **Set `issue` and `branch`** in the frontmatter. These are what let anyone later tell whether this spec describes the branch they're on.
2. **Fill in every section.** Do not leave sections empty or `TODO`. If a section doesn't apply, write "N/A" with a one-line explanation.
3. **Use plain English.** No wireframes, no ASCII mockups, no pseudo-code. Describe user flows and outcomes in sentences a non-engineer can follow.
4. **Lead with outcomes, not features.** "Users can find their receipts in under two clicks" beats "implement receipt search view with filters."
5. **List non-goals explicitly.** What we are NOT building is often more important than what we are.
6. **Surface open questions.** Every unknown gets listed in §Open Questions. Don't decide around them silently.
7. **Set `status: draft`** in the frontmatter. Commit.
8. **Stop.** Ask for review.

## Checklist

See `checklists/phase-2-spec-review.md`.

## The gate

`FEATURE-SPEC.md` must have `status: approved` in its frontmatter before Phase 3 begins. If it says `draft`, you wait. If it's missing and the work meets the §4.3 threshold, you go back to step 1.

An approved project `SPEC.md` does **not** satisfy this gate — it says the project is described, not that this work is agreed.

An **agent must not** self-approve a spec. Only a human promotes `draft` → `approved`.

## Amendments

If the spec changes after Phase 4 has begun, record the change in the `amendments` array in the frontmatter:

```yaml
amendments:
  - date: 2026-04-15
    author: Brad Frost
    summary: Added dark mode as a non-goal; was ambiguous in original spec.
```

Never silently build around a spec gap. Either amend or surface an issue.

## Lifecycle

A feature spec is a working document, not a permanent artifact — see AGENTS.md §4.2 for the full lifecycle. In short: it is **scoped to the unit of work on the current branch**, opens with an **Origin section** linking the broader initiative for context, and is **deleted when the branch merges** to the integration branch (`main` on trunk repos, `develop` on gitflow repos — AGENTS.md §9.5.2). A `FEATURE-SPEC.md` that reaches the integration branch is a bug.

The project's `SPEC.md` is the opposite: durable, amended rather than rewritten, never deleted. Before planning against any spec, check which one you're reading and whether its scope matches the work at hand.

## Quick mode note

In Quick mode, Phase 2 is **skipped**. No `FEATURE-SPEC.md` required. If later someone says "do it for real now," see the Promotion section of `AGENTS.md` §5.4 — a draft spec will be generated from the existing code at that point.

## Design-branch note

On a `design/*` branch, Phase 2 is also **skipped** — but for a different reason. Design branches are *exploratory by design*; a spec would freeze the exploration before it's ready. The spec is generated *at promotion time* by `bfw-process design promote`, which also files the cohort of follow-up issues that the exploration surfaced. See AGENTS.md §5.3. Until promotion, do not write `FEATURE-SPEC.md` on a design branch.

## Output

`FEATURE-SPEC.md` in the project root with `status: approved` (or `status: draft` and a clear signal that a human has been asked to review it) — or, for work below the §4.3 threshold, no feature spec and an issue that fully specifies the work.
