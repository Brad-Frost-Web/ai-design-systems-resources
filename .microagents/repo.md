---
name: bfw-process-repo
type: repo
agent: CodeActAgent
---

# BFW Repo Microagent (Always-On)

You are working in a Brad Frost Web project. This microagent loads on every agent session in this repo. The authoritative source for all rules is `AGENTS.md` at the repo root — read it in full on your first turn. This file summarizes the must-know rules so they're in context immediately.

## Cold start: pull the rules if they weren't pushed to you

If this session did not automatically load `AGENTS.md`, run `bfw-process rules`
(add `--json` for a machine-readable bundle). It prints mode, branch, lane,
which gates apply, spec status, the §2 always-on rules, and which guardrails
actually fail a command versus which are advisory. A harness that can't be
handed the rules can still fetch them (AGENTS.md §2.16). It does not replace
reading `AGENTS.md` in full, and nothing verifies that you did.

## Non-negotiables (even in Quick mode)

1. **Eddie Design System is the UI layer.** Use `@brad-frost-web/eddie-web-components` and `@brad-frost-web/eddie-recipes`. Never write one-off components in a consumer project. Never use Tailwind, Bootstrap, Material UI, Chakra, or shadcn. If a pattern is missing, create a recipe in `eddie-recipes`.
2. **Design tokens only.** All values come from `@brad-frost-web/eddie-design-tokens` as `--ed-*` CSS custom properties. No hardcoded colors, spacing, type, radii, or shadows. No Google Fonts `<link>` tags.
3. **Accessibility baseline is WCAG 2.1 AA.** Semantic HTML, keyboard-reachable, contrast, alt text, progressive enhancement. a11y during, not after.

## Modes

This project has a mode set in `.bfw-process/config.json` (`full` or `quick`).

- **Full mode:** Six-phase process enforced. `FEATURE-SPEC.md` must have `status: approved` before Phase 3 begins, for work meeting the §4.3 threshold. Phase 5 → 6 is a hard gate via `npm run bfw:ship`.
- **Quick mode:** Phase gates skipped, `FEATURE-SPEC.md` optional, ship-readiness checks off. The three non-negotiables above **still apply**.

## "Do it for real now"

If the human says "do it for real now" (or any clear variant meaning "promote this quick-mode project to Full mode"), don't rewrite the existing code. Instead:

1. Generate `FEATURE-SPEC.md` from the current state of the working directory using `.bfw-process/templates/FEATURE-SPEC.md`.
2. Set `status: draft`. Stop.
3. Wait for human to promote to `status: approved`.
4. Then proceed through Phase 3 → 4 → 5 → 6 as refinement of the existing code.

## The Phase 2 gate

In Full mode, **do not begin implementation** (Phase 3+) until `FEATURE-SPEC.md` has `status: approved` in its frontmatter. If it's `draft`, wait. If it's missing and the work meets the §4.3 threshold, write it from the template and stop. An approved project `SPEC.md` does not satisfy this gate (AGENTS.md §4.1).

## The Phase 5 hard gate

Before shipping, run `npm run bfw:ship` (the canonical invocation; it runs `bfw-process verify-phase ship` via the pinned devDependency). If it exits non-zero, do not deploy. Only BFW co-owners (in `.bfw-process/config.json`'s `owners` array) can bypass via `BFW_OWNER_OVERRIDE=1`, and only on explicit human instruction.

**Agents: do not run `BFW_OWNER_OVERRIDE=1` unilaterally.**

## GitHub issues are the paper trail

Every BFW-rule violation, bug, feature idea, or audit finding goes into the project's GitHub issue tracker using the templates in `.github/ISSUE_TEMPLATE/`. Never write inline punch lists in `SPEC.md`, never bury TODOs in code. The full audit → issue → branch → PR → merge cycle is documented in `AGENTS.md` §9. If you find something wrong, file an issue. If you want to pick up work, `gh issue list --label bfw/<category> --state open`.

**Most BFW repos are public — file the sanitised version.** Issue bodies, PR bodies, commit messages and anything committed beside them are readable by anyone, indefinitely, and a public repo has no undo. Ask whether you'd be comfortable with a stranger reading it before you post; where the answer is no, the finding is still filed, with the specifics kept in the private channel the public copy names (`AGENTS.md` §9.1a).

## Git Flow branch discipline

BFW picks the branch model by project type (`branchModel` in `.bfw-process/config.json`): **trunk** for sites, apps, scripts and experiments, **Git Flow** for libraries. **Every unit of work starts on a new branch cut from the integration branch** — `main` on trunk repos, `develop` on gitflow repos (never work directly on either). Branch names: `feature/<N>-slug`, `fix/<N>-slug`. Trunk: PRs go straight to `main`, and that merge deploys. Git Flow: PRs go to `develop`, then `develop` → `release/<version>` → `main` tagged. Commit prefixes: `feature:` (spelled out — not `feat:`), `fix:`, `chore:`, `docs:`. Every commit body references the issue: `(#42)`. Final commit on a branch may say `Closes #42`. PRs include `Fixes #42` in the body (it only auto-closes on trunk repos; gitflow issues are closed by hand — §9.6). **Never work on `main` or `develop` directly.** Full rules: `AGENTS.md` §9.5.

## Sessions end definitively — land it or park it

Every session ends **done** (the requested work complete and verified, naming what ran) or **parked** (what remains filed, and linked in the close-out). Nothing ends "open" and nothing ends on "want me to also…?" — the task that started the session is the task that ends it, and loose ends are filed rather than dangled. Full rule: `AGENTS.md` §2.17.

## When in doubt, ask

If the spec is unclear, the project type is ambiguous, or the human's intent is hard to parse, **stop and ask**. Don't make consequential decisions unilaterally.

## Methods — how-to prose behind the rules

`AGENTS.md` says what BFW requires. Where the *decision* is the hard part rather than the rule, a method says how to do it well. Methods live in the canonical `bfw-process` repo only — they are never synced into consumer projects, so reach them at the URLs below when their trigger fires. (Working inside `bfw-process` itself? They're on disk at `methods/`, and that is the only place they are ever edited.)

- **Scoping ambiguous work before it has a spec** → [`grilling.md`](https://github.com/Brad-Frost-Web/bfw-process/blob/main/methods/grilling.md). Map the work as a design tree, ask the whole settled frontier in one round with a recommended answer each, find facts yourself rather than asking the human. This is the Phase 1 interview, and it is the right move instead of guessing.
- **A bug whose cause isn't obvious, or a performance regression** → [`diagnosing-bugs.md`](https://github.com/Brad-Frost-Web/bfw-process/blob/main/methods/diagnosing-bugs.md). Build a tight, red-capable feedback loop *before* forming any theory.
- **Designing a module's interface or placing a seam** → [`deep-modules.md`](https://github.com/Brad-Frost-Web/bfw-process/blob/main/methods/deep-modules.md). Also the shared vocabulary — module, interface, depth, seam, adapter — for any conversation about code shape.
- **Deciding what to test** → [`test-quality.md`](https://github.com/Brad-Frost-Web/bfw-process/blob/main/methods/test-quality.md).
- **Writing or editing anything an agent reads** — `AGENTS.md`, a skill, a microagent, a checklist → [`writing-for-agents.md`](https://github.com/Brad-Frost-Web/bfw-process/blob/main/methods/writing-for-agents.md).

A method is prose you read and apply with judgement — never a gate, never a checklist. When a method and `AGENTS.md` disagree, **`AGENTS.md` wins**, and the disagreement is a finding worth filing.

---

**Read `AGENTS.md` for the full rules. Read `SPEC.md` for what this project is, and any `FEATURE-SPEC.md` for what the current branch is doing. Check `.bfw-process/config.json` for mode and owners.**
