---
name: testing
type: knowledge
agent: CodeActAgent
triggers:
  - test
  - tests
  - unit test
  - integration test
  - vitest
  - jest
  - playwright
  - coverage
---

# Testing at BFW

Tests are **part of the task definition**, not a bonus. You write them alongside the code, not after.

## The rule

If you're closing a Phase 4 task without a test, you're closing it wrong. This applies to every task that has logic, behavior, or user-facing state. Boilerplate-only tasks (scaffolding, pure config) are exempt.

## Default test stack

- **Unit tests:** Vitest (Eleventy projects, Nuxt projects, any ESM Node codebase). Jest if a project already uses it, but prefer Vitest for new work.
- **Component tests:** `@web/test-runner` for web-component tests (Eddie land). Vitest for Vue component tests (Nuxt land).
- **Integration / E2E:** Playwright. Use it for user-flow verification against a running dev server.
- **a11y automation:** `axe-core` integrated into Playwright or as a standalone Lighthouse run in CI.

## What to test

- **Logic:** pure functions, data transforms, state machines. Full coverage of edge cases.
- **Behavior:** user interactions on components. Click, type, submit — does the right thing happen?
- **Spec flows:** each user flow in `SPEC.md` has at least one Playwright test walking through it.
- **a11y:** axe assertions on key pages and components.
- **Regressions:** every bug fix includes a test that would have caught the bug.
- **External processes, for real, at least once:** if a module shells out to `git`, `gh`, `npm`, a CLI, or a daemon, **at least one test executes that binary for real** against a throwaway fixture, in the default suite. Fakes test decisions; they can never test the command line, because argv-matching asserts the command you *meant* to send. See `AGENTS.md` §2.13.
- **Safety flags, end to end:** a `--dry-run` / `--check` / observe-mode flag gets a test asserting **zero effects** with the flag set and every grant live — no files written, no processes spawned, no network mutations, no money spent. Assert against the layer that performs the effects, not against the CLI's output. See `AGENTS.md` §2.14.

## Deciding *what* to test

When the hard part is choosing what deserves a test — not writing the assertion — read [`methods/test-quality.md`](https://github.com/Brad-Frost-Web/bfw-process/blob/main/methods/test-quality.md) in the canonical `bfw-process` repo. It covers what makes a test worth keeping, where seams go and when they get agreed, the four anti-patterns (implementation-coupled, tautological, horizontal slicing, argv-matching-as-proof), where mocking stops, and the two rules above in full.

## What NOT to test

- Don't test the framework. Don't test that Vue renders a prop. Don't test that Eleventy writes HTML. Test your code.
- Don't test CSS visual output with unit tests. Use Playwright or a screenshot tool for visual regressions if you need them.
- Don't aim for 100% coverage for its own sake. Aim for full coverage of risk-bearing code.

## Reporting a test run: name what ran

**Exit code 0 is not evidence.** It says the command finished, not that the checks you believe in executed. A suite can be filtered out, misconfigured, renamed, or silently unavailable and still leave a green summary behind.

- Report **which suites or projects ran and how many tests** — "142 tests across the unit and a11y projects; the storybook project did not run" — never a bare "all tests pass".
- A configured suite that **did not run is a finding**. Say so and file it; don't drop it from the report because the exit code was 0.
- Running tests locally to predict CI? **Run what CI runs** — read the workflow, not the job name — or name the part you couldn't cover.
- A **CI job's name and comments are claims** that must match the commands beneath them. A job named `Test (unit + storybook + a11y)` whose script is `vitest run --project unit` is a defect worth filing.

See `AGENTS.md` §2.13a. This is always on — it applies in Quick mode too, where there's no Phase 5 gate and the test report is the only signal anyone gets.

## Phase 5 ties this together

`npm run bfw:ship` (which runs `bfw-process verify-phase ship` via the pinned devDependency) runs `npm run bfw:verify:tests` which should execute your full test suite. If it exits non-zero, you don't ship. See `checklists/phase-5-ship-readiness.md` for the full list of required `bfw:verify:*` scripts.

## Quick mode note

In Quick mode, tests are **optional but encouraged** for anything that might get promoted to Full later. Every test you write in Quick mode is one less test to write during "do it for real now" promotion.
