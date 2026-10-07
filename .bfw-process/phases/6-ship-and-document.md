# Phase 6 — Ship & Document

> **Goal:** Get the build into the world and leave behind enough documentation that the next person (including future-you) can pick it up.

## Inputs

- Phase 5 passed (or bypassed by an owner)
- Build artifacts ready to deploy

## Activities

1. **Merge the PRs that Phase 4 work landed on.** Every task in Phase 4 should have been worked on a branch linked to a GitHub issue, per `AGENTS.md` §9.5. Phase 6 is when those branches get reviewed, PR-approved, and merged into the **integration branch** — which one depends on `branchModel` in `.bfw-process/config.json` (`AGENTS.md` §9.5.3):
   - **Trunk** (sites, apps, scripts, experiments): merge `feature/*` and `fix/*` **straight into `main`**. There is no `develop`. Netlify watches `main`, so that merge *is* the deploy. Merged PRs auto-close their referenced issues.
   - **Gitflow** (libraries): merge **into `develop`**, not directly into `main`. `Fixes #N` doesn't fire on a `develop` merge, so close each issue by hand, after the `develop` merge (naming where it landed) or at release (`AGENTS.md` §9.5.5).

   Delete the feature/fix branches after merge.
2. **Cut the release to `main`** — gitflow only. On a trunk repo, step 1's merge already reached `main`; skip to step 3.

   **The release ceremony lives in one file: [`checklists/release-cutting.md`](../checklists/release-cutting.md)** (`.bfw-process/checklists/release-cutting.md` in consumers; `AGENTS.md` §9.5.13). Load it in full — it is **trigger-bound**, so *"it's time to cut a new release"* or any near-synonym loads it without a phase gate needing to be open, and that file carries the canonical trigger list and every phase of the sequence.

   Not one of its steps is restated here, and its phase list isn't summarised here either. Two copies of a release sequence is two copies to drift, and a release cut from the stale one is the failure the ceremony exists to prevent — 0.17.0 was cut from recollection and shipped a lockfile `npm ci` refused (#148).
3. **Deploy.**
   - **Apps and websites:** confirm Netlify build succeeds and the live URL behaves as expected.
   - **Libraries (npm packages):** a release is not shipped until consumers can install it — a version that exists only in git is invisible to every project that depends on it. Eddie's `0.25.0` was released in the monorepo and never published, leaving consumers on `0.20.0-pre.0` for months. Verifying the publish against the registry is Phase 5 of the release-cutting checklist; it is the same file as step 2, and there is no second publish sequence to follow.
   - **One-time setup, not ceremony:** a library with no `.github/workflows/publish.yml` yet adopts the automated pipeline (#110/#112) by copying the ~10-line caller from `.bfw-process/templates/.github/workflows/publish.yml` and configuring npm auth — trusted publishing preferred, or an `NPM_TOKEN` secret — plus the org-level `BFW_FANOUT_TOKEN` the consumer beacon needs. The checklist assumes this is already done, and splits on whether the file exists.
   - **Without that pipeline, nobody downstream is told.** The checklist's consumer step is the beacon, which only the automated model fires. On the **manual** model, notify known consumers by hand — comment on or open the upgrade issue in each repo that depends on this package (e.g. `eddie-slides` on `eddie-design-tokens`) — or their upgrade work stays blocked on a release they never heard about. Either way, the upgrade PRs the beacon opens are merged by a human; nothing merges them for you.
4. **Close remaining tracked issues.** Run `gh issue list --state open --milestone <current>` (or equivalent filter). Every issue targeted at this milestone should be either merged-and-closed or explicitly moved to a later milestone with a comment. No silent carries.
5. **Update docs.**
   - **New recipes** → PR to `eddie-recipes` with a Storybook story. Reference the PR from the closing comment on the `process-finding.md` issue that triggered the extraction.
   - **New patterns or decisions** → update the relevant Notion SOP page.
   - **Stack deviations** → document in the project's `README.md`: what changed, and why.
   - **Spec amendments** → ensure every amendment is captured in `SPEC.md` frontmatter, with references to the issues or PRs that prompted the change.
6. **Capture follow-ups as GitHub issues, not as mental notes.** Any future features, known debt, or "we'll get to it" items → file them immediately using `feature.md`, `bug.md`, or `process-finding.md` with `someday-maybe` or `nice-to-have` severity. Future-you will never remember; future-agent will never find a TODO comment.
7. **Update `SPEC.md` status.** `status: approved` → `status: shipped`.
8. **Process retrospective (mandatory).** The process itself gets audited — not the project. This is how bfw-process improves. Answer these questions and file issues for anything actionable:

   - **What did bfw-process get right?** Which rules, checklists, or phase gates caught real problems or guided good decisions?
   - **What was missing?** Where did the process have no guidance and you had to improvise? What did a human have to call out that the process should have surfaced?
   - **What was friction without value?** Any rules that felt like ceremony without catching real issues?
   - **What should change for the next project?** Concrete improvements — new rules, new checklist items, new template sections, new failure modes.

   For each finding, file an issue against `Brad-Frost-Web/bfw-process` using the `process-finding.md` template with the `bfw/process` label. A project that ships without feeding back into the process is a missed learning opportunity. This step can be brief — even a single issue saying "nothing to improve" — but the question must be asked.
9. **Land it or park it.** The session ends in one of two states: **done** — shipped and verified, naming what ran (§2.13a) — or **parked**, with everything left filed (step 6, sanitised per §9.1a where the tracker is public and dual-filed per §9.4.1 where the cause is upstream) and linked from the close-out. Nothing ends "open", and nothing ends on "want me to also…?": the task that started the session is the task that ends it. A genuine blocker is not a parked loose end — ask the question, and the answer finishes the task. Write the close-out so someone who wasn't here can follow it from the links alone — what landed, what was filed and where, and what a human still has to do. See `AGENTS.md` §2.17.

## Output

- A live, deployed build at the expected URL
- Documentation updated in all the places it needs to be
- Follow-ups captured where future-you will find them
- `SPEC.md` status updated
- A close-out that stands on its own: done, or parked with the remainder filed and linked (§2.17)

## Quick mode note

In Quick mode, Phase 6 is **skipped** unless there's a real artifact to ship. If the code was a demo, it gets committed (or not) and the session ends. If it gets promoted to Full later, Phase 6 runs normally.

Step 9 is the exception: §2.17 binds in every mode and on every branch, so a skipped Phase 6 still ends done or parked, never open.
