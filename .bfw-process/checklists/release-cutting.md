# Release-Cutting Checklist

**Trigger:** load this file, in full, the moment a human says **"it's time to cut a new release."** This list of near-synonyms is canonical — every other file that mentions the trigger points here rather than keeping its own copy:

> *"it's time to cut a new release" · "let's cut a release" · "time for a release round" · "publish a new version" · "ship 0.24.0" · "let's get this released"*

No further prompting is needed, and no phase gate has to be open first. This is an **utterance-bound** ceremony: the other checklists are phase-bound (`phase-5-ship-readiness.md`) or topic-bound (`git-workflow.md`), and a release is neither.

**Don't reconstruct these steps from memory.** The 0.17.0 release was cut from recollection and shipped a lockfile `npm ci` refused (#148), discovered only after the merge to `main` — past the point of no return.

**Scope: gitflow repos only** (npm-published libraries — Eddie packages, bfw-process itself). Read `branchModel` in `.bfw-process/config.json`; **when the key is absent, the model is inferred — gitflow if a `develop` branch exists, trunk otherwise** (§9.5), which is why this repo qualifies despite `projectType: "script"`. On a **trunk** repo (sites, apps, scripts, experiments) there is no release ceremony at all: merging the reviewed PR into `main` *is* the deploy (§9.5.3), and this file does not apply.

**Which publishing model does this repo use?** Every phase below splits on it, and getting it wrong is how a release ends up merged but never published:

```bash
ls .github/workflows/publish.yml
```

- **Automated** — the file exists (the #110 pipeline, adopted from `templates/.github/workflows/publish.yml`). **Merging the release PR into `main` IS the publish.** The workflow notices a `package.json` version that isn't on the registry, runs `npm ci`, `npm test --if-present` and `npm run build --if-present`, publishes (with provenance when an `NPM_TOKEN` secret is set; via trusted publishing otherwise), creates the `v<version>` tag, builds the GitHub Release from the CHANGELOG, and fans a `bfw-library-published` beacon out to consumers.
- **Manual** — no such file. A human tags and publishes at the end.

---

## Phase 0 — Survey the ground before touching anything

The step that gets skipped, and the one that most often hides a landmine.

- [ ] `git worktree list` — check every worktree for stranded work. Distinguish real stranded work from **aborted-merge debris**: a worktree can show many `UU` files with *no* `MERGE_HEAD`, which is a stale conflicted index, not work. Verify by checking whether its HEAD is already an ancestor of `origin/develop` (`git merge-base --is-ancestor <sha> origin/develop`) and whether every file it touched exists on the remote. **Untracked files are the real risk** — invisible to every merge check, and destroyed by `worktree remove --force`.
- [ ] Compare local `develop` against `origin/develop`. A local-only commit may already have landed under a **different SHA** via PR. Confirm duplication *by content* (`git diff <local> <remote> -- <paths>` empty, no missing files) before resetting — comparing SHAs proves nothing.
- [ ] Confirm no other session is sharing this working directory. A stray build on another branch between the release build and the publish is how a release ends up split across two versions.
- [ ] Confirm every PR this release is meant to carry is **merged to `develop`**. Whether its issue is closed yet doesn't matter — Phase 6 closes the stragglers — but an unmerged PR silently ships nothing.
- [ ] **Reconcile the CHANGELOG against what actually merged — now, not at the tag.** Diff `git log --merges v<lastversion>..develop` against the issue and PR references inside the `[Unreleased]` section, and write the missing entries before going further. Nothing catches this for you: `docs:check-changelog`-style gates only assert that a heading exists for the current version, and `bfw-process`'s own changelog gate exempts `release/*` branches outright. Cutting Eddie v0.58.0, five merged PRs — two of them entirely new recipes — had no entry and every gate was green (#203). It belongs here rather than at the end because reconstructing five entries from other people's PR bodies is unbounded work to discover at the moment downstream is waiting.
- [ ] Pick the version. Semver against what's on `develop`: new capability → minor, fixes only → patch. `npm view <package> version` says what the last published version actually was — npm is the source of truth (§2.8), not git tags and not GitHub Releases.

## Phase 1 — Prove `develop` is green *before* branching

Run the **full** gate suite, not just the tests. Packaging breaks while tests stay green.

- [ ] `git switch develop && git pull`
- [ ] Clean install from the committed lockfile: `npm ci`
- [ ] Full build from clean: `npm run build --if-present` (the `--if-present` matters — a library with no build script is normal, and both BFW workflows use exactly this form)
- [ ] The entire gate suite — `npm run bfw:ship`, plus whatever else this repo wires. In Eddie that is `docs:check`, `check:ssr`, `check:contrast`, `docs:check-changelog`; those are *examples*, not the rule.
- [ ] Full test suite: `npm test`
- [ ] **On any repo that commits generated artifacts, `git status` must be empty afterwards.** Drift means the committed artifacts (knowledge graph, custom-elements manifest, docs output) disagree with source — and that drift would ship. A repo with no build step has nothing to check here.

A branch that has been sitting on `develop` for weeks predates gates that have since landed; its own PR CI being green proves nothing about today's gates.

## Phase 2 — Cut the branch, bump, and **commit**

- [ ] Cut the release branch from `develop`: `git switch -c release/<version> develop`
- [ ] Bump the version: `npm version <version> --no-git-tag-version`
  - **Never `npm install --package-lock-only`.** It re-resolves the dependency graph against *your* machine and silently prunes optional dependencies other platforms need. That is the 0.17.0 failure: run on macOS, it pruned `@emnapi/runtime`, which the Linux runner needs (#148).
  - Check it: the `package-lock.json` diff should touch **only the two `version` fields**. Anything more means the graph was re-resolved — back it out and redo the bump.
- [ ] Move the CHANGELOG's `[Unreleased]` block under a `## [<version>] — <date>` heading, leaving a fresh, empty `[Unreleased]` above it.
  - **The bracketed version is matched mechanically.** On the automated model the publish workflow extracts the release notes with `^## \[<version>\]`; a mistyped heading finds nothing and silently falls back to GitHub's auto-generated notes — a plausible-looking Release, not a blank one. The `— <date>` part is for humans.
- [ ] **Commit the bump.** `npm version --no-git-tag-version` writes the manifests and deliberately does *not* commit, so this step is on you:
  ```bash
  git add package.json package-lock.json CHANGELOG.md
  git commit -m "chore(release): <version>"
  ```
  Skip it and the release branch is byte-identical to `develop`: the PR diff is empty, and on merge the publish workflow finds the old version already on the registry and no-ops green. A silent non-release is the worst possible outcome of this ceremony.
- [ ] Only release-related fixes land here — no new features (§9.5.3). If something new is needed, it goes to `develop` and waits for the next release.
- [ ] Run the ship gate on the release branch: `npm run bfw:ship`
- [ ] **If this release carries a `methods/` landing:** the method pointers in `AGENTS.md` target `blob/main`, which doesn't carry the new files until this release merges. Land the release before advertising a consumer `sync` — a consumer who syncs inside that window gets a rules file whose method links 404 (#145).

**In a multi-package monorepo,** where one tag covers several packages (the rules below come from the Eddie releases that wrote them, #93):

- [ ] Derive the bump list **from the workspace**, never from a hand-maintained package list. A hardcoded list is how `eddie-reporter` silently fell out of every release from the day it shipped.
- [ ] Write **all** manifests *before* any git work. If the root bump commits and tags first, the tag points at a commit where every sub-package still holds the previous version — and building from that tag builds the old packages.
- [ ] Preflight that root and every in-track package already agree; refuse to bump on existing drift rather than widening it.
- [ ] Classify explicitly — **in-track** (rides the shared version) / **own-track** (prerelease, bumped by hand) / **private** (never published) — and print the skipped ones with the reason. Silence is how packages get lost.
- [ ] Single-package patches in a mixed-version monorepo don't use this ceremony at all — see §9.5.8.

## Phase 3 — Verify the artifacts before anything leaves the machine

- [ ] **Verify the lockfile the way CI will:** `npm ci`. It fails when `package.json` and `package-lock.json` disagree — the exact desync a `--package-lock-only` bump introduces.
- [ ] **Rebuild from source *after* the bump**, so build outputs carry the new version (§9.5.9). Never publish a `dist/` that was on disk when you arrived: eddie-recipes@0.27.0 shipped a dist eight days stale relative to a fix already committed to source.
- [ ] Wire the rebuild into `prepublishOnly` where the package publishes from a build directory, so a human can't forget it. The automated pipeline already rebuilds on the runner immediately before publishing.
- [ ] Push the branch: `git push -u origin release/<version>`

## Phase 4 — The release PR (the human merges it)

**The release reaches `main` through a PR, not a direct merge** (§9.5.3).

- [ ] Open it: `gh pr create --base main --head release/<version> --title "chore(release): <version>"`, with the CHANGELOG section for this version as the body.
- [ ] **Confirm which checks actually run on this PR — don't assume a net that isn't there.** `ls .github/workflows/` and read the triggers:
  - `bfw-verify.yml` (shipped to every consumer by `sync`) runs on every `pull_request` and starts with `npm ci`, so it reds on a desynced lockfile too.
  - `release-preflight.yml` asserts `npm ci` on PRs into `main` from `release/*` and `hotfix/*` only. **It exists in the bfw-process repo and is not part of the consumer template set** — a library that has never copied it has one fewer gate here.
  - Either way, **this PR is the last place a desynced lockfile fails recoverably.** After the merge it fails on the publish runner, with the version already on `main`, un-tagged and un-published, and recovery costs a hotfix (#148).
- [ ] **A human merges.** The review already happened on the feature PRs; this merge is the irreversible outward action, and on the automated model it *is* the publish. An agent prepares the PR and stops. Never `BFW_OWNER_OVERRIDE=1` — owner bypass of the ship gate is non-delegable human authority (§7).
- [ ] Do **not** tag by hand and do **not** `npm publish` by hand on the automated model. You would race the workflow, and hand-tagging from a local clone is how a tag lands on the wrong commit.

## Phase 5 — Watch the publish, then verify it against the registry

### Automated model

- [ ] Find the run, then watch it rather than assuming it:
  ```bash
  gh run list --workflow=publish.yml --limit 1 --json databaseId,headSha,status
  gh run watch <run-id> --exit-status
  ```
- [ ] Verify the outcomes, not the green check:
  - `npm view <package> version` → the new version. **npm is where BFW libraries are actually deployed** (§2.8). The pipeline does poll the registry before it goes green, so this is a second reading rather than the only one — but it is the reading that matches what a consumer's `npm install` will see.
  - `git fetch --tags && git tag -l v<version>` → the tag exists
  - `gh release view v<version>` → the body is the CHANGELOG section for this version, not GitHub's auto-notes (see the heading trap in Phase 2). The pipeline creates this Release itself — there is no hand-written release-notes step in this ceremony.

**If the publish fails — capture the output before you do anything else,** including read-only commands. npm keeps only about a dozen debug logs in `~/.npm/_logs`, and ordinary `npm view` calls are enough to rotate the relevant one out. Diagnosing the v0.46.0 partial publish was materially harder for exactly this reason. Save the terminal output to a file first; diagnose second.

Then: the version is merged but unpublished. Fix the cause on a `hotfix/<N>-slug` branch and open a PR to `main` — merging it re-triggers the workflow. `workflow_dispatch` is the documented catch-up path for a version already merged and never published. Nothing about the merge needs undoing. (`bfw-process doctor`'s registry-currency check reports this **on the canonical bfw-process repo**, where the anchor is its own `package.json` version; in a consumer the same check compares that repo's *bfw-process pin* against npm and will not notice the repo's own unpublished release.)

### Manual model

Publishing is the **owner's** step, always — the one irreversible outward action.

- [ ] Merge and tag from `main`, so the tag lands on the merge commit rather than the branch tip:
  ```bash
  git switch main && git pull
  git merge --no-ff release/<version>
  git tag v<version> && git push origin main --tags
  ```
- [ ] Owner publishes: `npm publish --access public`
- [ ] The publish command must be **idempotent** (skip versions already on the registry, so a partial failure is fixed by re-running the identical command — no hand-assembled "publish these six but not that one" list), **non-chaining** (no `&&` across packages — one failure must not strand the rest half-published), and **self-preflighting** (stale-artifact and auth checks before the first upload). The v0.46.0 publish failed for six of seven packages while the last one succeeded; idempotent re-run was the entire recovery path.
- [ ] **Nothing may touch the working directory between the release build and publish confirmation.** A stray build on another branch silently clobbers the build output.
- [ ] Verify on the registry: `npm view <package> version`

## Phase 6 — Close the loop

- [ ] **Back-merge `main` → `develop` and push.** Without it the release-prep commits strand on `main` and everything cut from `develop` starts behind production (§9.5.3's standing obligation, which `doctor` checks).
  - `git switch develop && git pull && git merge --no-ff main && git push`
- [ ] Verify both remotes are in sync and the two trees agree afterwards — don't trust push output, which can report a protection warning and a successful ref update in the same breath.
- [ ] Delete the release branch: `git branch -d release/<version> && git push origin :release/<version>`
- [ ] **Close the issues that shipped.** Gitflow does not auto-close: GitHub honours `Fixes #N` only into the default branch, and these PRs landed on `develop` (§9.6). Per issue: `gh issue close <N> --comment "Shipped in v<version>."`
- [ ] Consumers: on the automated model the beacon fans a `bfw-library-published` dispatch out to every org repo that pins the package, so their upgrade PRs open within minutes. It is **best-effort** — absent a `BFW_FANOUT_TOKEN` it skips with a notice, and it can fail per repo. The named backstops are `bfw-process doctor`'s freshness reporting and a reconciliation sweep that is **filed but not yet built** (#113), so until it exists, a missed beacon is caught by someone looking. A missed beacon is not a failed release.

---

## What this ceremony does *not* automate

| Step | Who does it | Why not automated |
|---|---|---|
| Merging the release PR into `main` | **A human** | On the automated model that merge is the publish — the irreversible outward action. An agent prepares and stops. |
| `BFW_OWNER_OVERRIDE=1` | **A BFW co-owner, on explicit instruction** | Bypassing the ship gate is non-delegable human authority (§7). An agent never runs it, in any phase, for any reason. |
| `npm publish` on the manual model | **The owner** | Same reason: publishing is outward and irreversible. |
| Reconciling the CHANGELOG against merged PRs | A human or agent, by hand (Phase 0) | The changelog gates assert a heading, not completeness, and they exempt release branches (#203). |
| Closing the shipped issues | A human or agent, by hand | Gitflow merges into `develop` never fire closing keywords (§9.6). Nothing closes them for you. |
| The consumer beacon | The pipeline, best-effort | It can skip (no token) or fail per repo, and the reconciliation sweep meant to backstop it is not built yet (#113). |

## Anti-patterns

- ❌ Cutting the release from memory instead of from this file. That is the 0.17.0 failure (#148).
- ❌ `npm install --package-lock-only` for the bump. Use `npm version <v> --no-git-tag-version`.
- ❌ Bumping and pushing without committing. An empty release PR merges green and publishes nothing.
- ❌ Reconciling the CHANGELOG at the tag instead of before the branch. That's unbounded work discovered at the worst moment.
- ❌ Merging `release/*` into `main` directly, skipping the PR. The PR is where `npm ci` and the ship gate run; after the merge, nothing can fail recoverably.
- ❌ Hand-tagging or hand-publishing on the automated model. The workflow owns the tag and the upload.
- ❌ Running anything — even `npm view` — after a failed publish before the output is saved.
- ❌ Skipping the back-merge. A `develop` behind `main` silently poisons every branch cut from it.
- ❌ Leaving the shipped issues open because "the PR said `Fixes #N`." On gitflow it didn't fire.
- ❌ Landing new features on the release branch. They go to `develop`.
