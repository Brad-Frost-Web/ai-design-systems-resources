# Common Failure Modes (and how to avoid them)

These are the ways BFW projects go wrong. Read this once, then watch for the patterns in yourself.

| Failure | Why it happens | Prevention |
|---|---|---|
| Building before speccing | Feels faster, is slower | `SPEC.md` is gated — no Phase 3+ without `status: approved` |
| Custom UI components instead of Eddie | Unfamiliarity with Eddie | Always check Eddie docs first; escalate to a recipe if Eddie doesn't cover it |
| Hardcoded design values | Habit | Only `--ed-*` tokens, zero exceptions; missing tokens get filed as issues, not worked around |
| Skipping tests "just this once" | Time pressure | Tests are part of the task definition, not a bonus |
| Reporting "all tests pass" without checking what ran | Exit 0 reads as proof; a suite that was filtered out or silently unavailable prints nothing saying so | Name the suites and counts that actually executed. A configured suite that didn't run is a finding to file (§2.13a) |
| A CI job named for checks it never runs | The name was written from intent and never re-read against its commands | A job's name is a claim. Compare it to the script — a minute of work — and file the mismatch (§2.13a) |
| A build that "hangs" in a fresh worktree, or quietly runs the wrong tool version | A script runs a declared dependency via `npx`, which works for years until `node_modules` is missing — then it downloads a different version and runs that, silently | If it's in `package.json`, don't `npx` it. Call the binary by name; npm puts `node_modules/.bin` on PATH. `bfw-process doctor` reports offenders (§2.8a) |
| Nuxt when Eleventy was right | "Future-proofing" | Check escalation signals strictly; if none apply, Eleventy wins |
| Scope creep mid-build | Spec gaps | Surface gaps as amendments or issues; never silently build around them |
| No docs after shipping | "Will do it later" | Docs are part of Phase 6, not optional |
| A release that merges but never publishes | The version bump was made with `npm install --package-lock-only`, which re-resolves the dependency graph against *your* machine and prunes optional deps other platforms need. Every local check stays green; `npm ci` fails on the runner, after the merge to `main` | Bump with `npm version <v> --no-git-tag-version` and confirm the lockfile diff touches only the two `version` fields. The release PR runs `npm ci` so the failure lands on a red check, not on the publish (§9.5.3, #148) |
| Skipping Phase 1 because the brief "seems obvious" | Overconfidence | Phase 1 is cheap; re-reading the brief costs minutes and prevents rebuilds |
| Agent bypassing ship gate on its own | Over-eagerness | Owner-only, human-initiated only, logged |
| Accessibility as a cleanup pass | "I'll add ARIA at the end" | a11y is during, not after. Semantic HTML first. |
| Quick-mode code shipped to prod without promotion | "It works, let's go" | "Do it for real now" → Phase 2 gate → Phase 5 gauntlet. Every time. |
| Silently rewriting quick-mode code during promotion | Agent over-helpfulness | Promotion is refinement, not rewrite, unless the spec review explicitly demands a rewrite |
| Non-owner asking to bypass ship gate | Social pressure | There is no non-owner bypass. They fix the failing checks. |
| Shipping a defect that a green suite could never have caught | Tests answer "did the code do what I wrote", not "did I write the right thing" | Two-axis review before the closing commit — Standards and Spec, independent, reported separately (§8.1) |
| A "review this diff" pass that finds nothing | The reviewer wasn't told what to be adversarial about, or what was deliberately deferred | Name the highest-risk claim, hand over the out-of-scope list, and have the spec reviewer diff old vs new *semantics* rather than read the diff (§8.1) |
| A seam or injection point nothing ever calls | Type checker passes; the test double makes it look exercised | One grep for the caller before calling it wired. A definition is not a feature (§8.2) |
| A wrong command line that a large passing suite never noticed | Every external-process test faked argv, which asserts the command you *meant* to send | At least one test runs the real binary against a throwaway fixture, in the default suite (§2.13) |
| `--dry-run` that still pushes branches, spawns work, and spends money | The flag never reached the layer that performs the effects — there was no off switch to flip | Name the performing layer, thread the flag to it, test for zero effects with the grant live (§2.14) |
| "No behaviour change" that changed behaviour | The claim was assumed, not checked | Enumerate every accepted delta in the PR body; no list means nobody diffed it (§9.5.5) |
| Improvement work aimed at remembered code rather than hurting code | No brief, so intuition fills the gap | Walk the commit log for hot spots first; churn and fix density are the signal (§6.1) |
| `git stash pop` restoring an unrelated stash from another branch | The stash stack is shared by every branch, worktree, and background writer | Split commits with `git add <paths>` / `git add -p`; if you must stash, name it and list before popping (§9.5.10) |
| A session that closes on "want me to also…?" | The next thing is always visible from here, and offering it reads as helpfulness | Done, or parked with the remainder filed and linked — no third state. Filing is the follow-up (§2.17) |
| Private context posted to a public tracker | The finding reads as internal while you're writing it, and most BFW repos are public | File the sanitised version: technical shape in public, specifics in the private channel it names. Scrub before posting — a public repo has no undo (§9.1a) |
