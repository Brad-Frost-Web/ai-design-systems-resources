# Git Workflow Checklist

Quick-reference for day-to-day branch and PR discipline. Full rules live in `AGENTS.md` §9.5.

**First, know your integration branch:** `main` on trunk repos (sites, apps, scripts), `develop` on gitflow repos (npm-published libraries). Check `branchModel` in `.bfw-process/config.json`. Below, `<base>` means that branch.

## Before starting work on any issue

- [ ] Read the issue in full (or the spec amendment, or the bug report)
- [ ] Confirm the issue is labeled with a category (`bfw/*`) and severity (`ship-blocker` / `pre-launch` / `nice-to-have` / `someday-maybe`)
- [ ] Switch to `<base>` and pull: `git switch <base> && git pull`
- [ ] Cut a branch linked to the issue:
  - `gh issue develop <N> --checkout --base <base>` (preferred — creates and links), OR
  - `git switch -c feature/<N>-short-slug <base>`
- [ ] Confirm you are NOT on `main` or `develop` before typing any code: `git branch --show-current`
- [ ] **On a hosted harness that assigned the branch before you could read the rules?** The two boxes above are unreachable, not skippable. Follow the recovery in `AGENTS.md` §9.5.6, *When the branch name is not yours to choose* — the issue is still required.

## While working

- [ ] Commit early, commit often. Small, scoped commits with clear messages.
- [ ] Use conventional-commit prefixes with **`feature`** spelled out (not `feat`):
  - `feature(scope): ... (#<N>)` — new functionality
  - `fix(scope): ... (#<N>)` — bug fixes
  - `chore(scope): ... (#<N>)` — tooling, deps
  - `docs(scope): ... (#<N>)` — documentation only
  - `refactor(scope): ... (#<N>)` — restructure without behavior change
  - `test(scope): ... (#<N>)` — test additions or fixes
  - `perf(scope): ... (#<N>)` — performance improvement
- [ ] Reference the issue number in every commit message
- [ ] Do NOT force-push shared branches (`main`, `develop`). Feature/fix branches can be rewritten pre-merge if needed.
- [ ] Split commits with `git add <paths>` / `git add -p` — **not** `git stash`. The stash stack is shared with every branch, worktree, and background writer in the repo (§9.5.10)
- [ ] Before the commit that closes the issue: run the two-axis review (Standards + Spec, independent, reported separately — §8.1)

## When ready for review

- [ ] All tests pass locally (`npm test` or equivalent)
- [ ] Phase 4 guardrails are satisfied (`.bfw-process/checklists/phase-4-build-guardrails.md`)
- [ ] **Public repo? Scrub before posting, not after** — no credentials, NDA'd client names, money, personal data or blame by name in the PR body, in the commits you're about to push, or in anything committed beside them. The finding still gets filed; the sanitised version is what's public, naming the private channel that holds the specifics (§9.1a)
- [ ] Push the branch: `git push -u origin <branch-name>`
- [ ] Open a PR with `gh pr create --base <base> ...`:
  - **Base branch:** the integration branch — `main` on trunk repos, `develop` on gitflow repos
  - **Title:** matches commit convention, e.g., `feature(process): encode Git Flow branch discipline`
  - **Body:** starts with `Fixes #<N>`, includes summary + test plan. Use `.github/PULL_REQUEST_TEMPLATE.md` — it prompts for the four things reviews actually need:
    - Two-axis review findings — fixed, or disclosed with reasoning ("not run" is an acceptable answer; silence is not) (§8.1)
    - The caller for each new interface or seam — "tests only" is valid and useful (§8.2)
    - Deltas, if the change claims to be behaviour-preserving. No list means nobody diffed it (§9.5.5)
    - Real-binary coverage, if the change fakes an external process (§2.13)
- [ ] Review:
  - **Team work:** wait for explicit approval from someone other than the author
  - **Solo work:** re-read the diff one last time on the PR page before merging. The branch + PR ceremony is the deliberate pause. No approval comment required.
- [ ] Merge via `gh pr merge <PR> --squash` or `--merge` per project convention
- [ ] Delete the branch after merge: `git branch -d feature/<N>-slug && git push origin :feature/<N>-slug`
- [ ] **Land it or park it** — close out on the work: done and verified, naming what ran, or parked with the remainder filed and linked. Never on "want me to also…?" (§2.17)

## Releasing (libraries only)

**The release ceremony lives in one file: [`release-cutting.md`](release-cutting.md)** (`.bfw-process/checklists/release-cutting.md` in consumers; AGENTS.md §9.5.13). It is **trigger-bound** — load it in full the moment a human says *"it's time to cut a new release"* or any near-synonym. That file carries the canonical trigger list, and Phases 0–6: survey, prove `develop` green, cut and bump, verify the artifacts, the release PR a human merges, verify against npm, then back-merge and close the issues that shipped.

No step is repeated here on purpose. Two copies of a release sequence is two copies to drift, and a release cut from the stale one is the failure the ceremony exists to prevent.

## Deploying (apps / websites)

Apps and websites are trunk repos (§9.5.3): there is no `develop` and no second hop. Merging the reviewed `feature/*` or `fix/*` PR into `main` *is* the deploy.

- [ ] Phase 5 ship gate passes on the branch: `npm run bfw:ship`
- [ ] Merge the PR into `main` (see *When ready for review* above)
- [ ] Netlify (or equivalent) builds from `main` and deploys
- [ ] Confirm the live URL behaves as expected
- [ ] Update `SPEC.md` status: `approved` → `shipped`

## Emergency hotfix

Only for production-critical bugs that can't wait for the normal flow.

- [ ] Cut from `main`: `git switch -c hotfix/<N>-slug main`
- [ ] Do the minimum fix. Small, surgical, well-tested.
- [ ] Open a PR to `main` — **even in an emergency, even for a one-line fix.** A direct merge skips the checks that run on the PR (on the automated model, `npm ci` and the publish preflight), and a hotfix is exactly when you're least able to afford a second mistake.
- [ ] Merge the PR. On the automated model, if the fix bumps the version, merging publishes it, and [`release-cutting.md`](release-cutting.md) Phase 5 covers what to verify and what to do when the publish fails. (Where `release-preflight.yml` is installed, its `hotfix/*` arm runs `npm ci` on this PR too.) If the fix doesn't bump the version, the publish workflow no-ops, which is correct.
- [ ] Tag only on the manual model (`git tag v<version>`); on the automated model the workflow owns the tag
- [ ] **Gitflow repos: back-merge `main` → `develop`** so the fix doesn't regress on the next release (§9.5.3). Trunk repos have no `develop`; nothing to back-merge.
- [ ] Delete the hotfix branch
- [ ] Write up what went wrong — file as a `bfw/process` issue for the retrospective

## Push at milestones

- [ ] Push after every meaningful milestone: phase gate, batch of fixes, passing test suite, completed audit
- [ ] If you wouldn't want to redo the work, push it. Unpushed work is invisible and unrecoverable.

## Branch for major surgery

Before starting a large rewrite, migration, or architectural change:

- [ ] Ensure the current branch is stable and pushed
- [ ] Cut a new branch from the current one: `git switch -c feature/<N>-next-phase`
- [ ] The parent branch becomes the rollback point

**When to cut a new branch:**
- Transitioning between process phases (e.g., Phase A done → Phase B migration)
- Starting a rewrite of a major component or subsystem
- Beginning work that will touch >50% of the codebase
- Any change where "revert to before we started this" should be cheap

## Anti-patterns

- ❌ Working on `main` or `develop` directly. Always branch first.
- ❌ Using `feat:` instead of `feature:` in commit messages. Spell it out.
- ❌ Opening PRs against `main` for feature/fix work on a gitflow repo. Against `develop` there; trunk repos PR to `main`.
- ❌ Force-pushing `main` or `develop`.
- ❌ Merging your own PR without an explicit approval comment (even solo).
- ❌ "Small" changes that skip the branch ceremony. The five-second `git switch -c` has saved more work than any other discipline.
- ❌ Branches that don't reference an issue number.
- ❌ Unclear or history-free commit messages. Say what and why, not just what.
- ❌ Accumulating local commits without pushing. Push at milestones.
- ❌ Starting major surgery on a branch that has stable, shippable work. Cut a new branch first.

## Gitflow repos only — the two standing obligations (§9.5.3)

- [ ] After every hotfix or release: back-merge `main → develop` immediately. A `develop` behind `main` silently poisons every branch cut from it.
- [ ] Blessed work is not aging on `develop` — 30+ days unreleased means a release round is due (`bfw-process doctor` reports both).
- [ ] On gitflow repos, `Fixes #N` does NOT auto-close on the `develop` merge — close the issue manually or at release.
