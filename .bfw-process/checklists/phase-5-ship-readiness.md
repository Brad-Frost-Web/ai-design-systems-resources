# Phase 5 Ship-Readiness Checklist (the HARD gate)

This is the one checklist with teeth. `npm run bfw:ship` (added to every scaffolded project by `bfw-process init`, and pinned via `devDependencies`) runs these programmatically by shelling out to `npm run bfw:verify:*` scripts in the consumer's `package.json`.

## Required `npm run bfw:verify:*` scripts

Your consumer project must define these scripts in `package.json`. Missing scripts cause `verify-phase ship` to fail loudly rather than silently pass.

| Script | Purpose |
|---|---|
| `bfw:verify:tests` | Run the full unit test suite; exit non-zero on any failure |
| `bfw:verify:a11y` | Run axe / Lighthouse a11y check against built output |
| `bfw:verify:responsive` | Smoke-test representative breakpoints (or a screenshot diff) |
| `bfw:verify:flows` | Run spec user-flow verifications (e.g., Playwright or a checklist the human confirms) |
| `bfw:verify:perf` | Lighthouse performance score; fail on obvious regression from baseline |

### Which scripts your project actually owes

The required set follows `projectType` in `.bfw-process/config.json`. A CLI has no built output to run axe against and no Lighthouse score; demanding those scripts anyway buys a stub that always passes, which is an always-green gate wearing the costume of coverage.

| `projectType` | Required |
|---|---|
| `content-site`, `app`, `recipe` | All five. Recipes are included deliberately — Eddie components are where an a11y regression does the most downstream damage. |
| `script`, `experiment` | `bfw:verify:tests` only. No user-facing surface. |
| absent or unrecognized | All five (safe default — declare your type to be asked for less). |

`bfw:verify:tests` is required of every project type. "We have no tests" is a finding, not an exemption (AGENTS.md §1.5). `bfw-process doctor` reads the same table, so its advisory and this gate can't disagree.

### Turning the gate on (#71)

Nothing scaffolds these scripts — what each one should do is per-project work, and a stub that passes by echoing "n/a" is an always-green gate in disguise. So **`bfw-process init` declares `hardGates.shipReadiness: false` when the project doesn't yet define the scripts its type owes**, and `true` when it does. It says which way it went, and names what's still owed.

A `false` there is an honest statement that this project has no Phase 5 gate — not a gate that's been switched off. The alternative was worse: declaring a gate the repo cannot pass hands every fresh consumer a permanently-red required check, and a required check that is always red teaches everyone to merge past it (AGENTS.md §7).

When you've written the scripts, **turn the gate on yourself**: set `hardGates.shipReadiness: true` in `.bfw-process/config.json`. `bfw-process doctor` tells you when every required script is present and the gate is ready to declare. `bfw-process sync` deliberately never touches `hardGates` in either direction — the file is hand-owned, sync runs unattended from a `postinstall` hook, and a gate is a policy declaration a human makes.

## Manual checks (not automated, but still required)

- [ ] No `@brad-frost-web/*` dependency is more than 1 minor version behind the latest published on npm (`npm outdated @brad-frost-web/eddie-design-tokens @brad-frost-web/eddie-web-components @brad-frost-web/eddie-recipes @brad-frost-web/eddie-icons`); no pre-release versions in production dependencies unless intentional and documented (AGENTS.md §2.8)
- [ ] Each user flow from `SPEC.md` has been walked through by a human
- [ ] Cross-browser spot check completed (Chrome + Firefox minimum)
- [ ] Empty states handled
- [ ] Error states handled
- [ ] Loading states handled
- [ ] No-JS fallback tested
- [ ] Edge cases from the spec (if any) tested
- [ ] Design-quality review completed on screenshots of key views: visual hierarchy, theme energy matches content tone, intentional spacing — reviewed by a human or an AI vision pass, findings resolved or waived with rationale (compliance ≠ quality; see `phases/5-test-and-verify.md` step 8)

## Built-in checks (run by the gate itself, before your scripts)

- **Rules freshness (#183)** — `config.lastSyncedVersion` vs the running bfw-process version. Stale or unmarked rules FAIL the gate on blocker-tier types (`app`, `content-site`, `recipe`, `script`) and print an advisory on `experiment`. Remedy: `npx --no bfw-process sync`. The canonical repo reports itself as the source and passes. `doctor` reads the same assessment, so the advisory and the enforcement cannot drift apart.

- **Mode vs `hardGates.shipReadiness` (#194)** — when `mode: "quick"` and `hardGates.shipReadiness: true`, the gate prints an advisory naming the disagreement: AGENTS.md §5.2 says Quick mode owes no ship-readiness verification, but `hardGates.shipReadiness` is the key this gate reads, so the gate is running. **Reporting only** — the note names both fixes (`bfw-process mode full`, or set `hardGates.shipReadiness: false`) and picks neither, changes no leg, and changes no exit code. `hardGates` stays the authority on purpose: a gate that switched itself off from a `mode` label nobody had updated would be §2.13a's inert gate. `doctor` reports the same contradiction from the same module, so the two cannot drift apart.

## Gate behavior

- All automated scripts must exit 0
- All manual checks must be checked off by a human (recorded in commit or PR description)
- If any automated script is **missing** from `package.json`, `verify-phase ship` fails with a clear error telling the user which script to add
- **The gate names the `bfw:verify:*` scripts it did not run (#225).** When the gate gets as far as running its legs, its closing line lists every `bfw:verify:*` script in `package.json` that this run did not execute — typically `types` and `lint`, which are not in the required table above, plus any leg skipped as CI-covered, marked `(skipped as CI-covered)`. A green gate is a verdict on the scripts it ran, not a prediction that CI will pass. The line is informational and never changes the exit code; on a run that reached its legs, no line means every `bfw:verify:*` script ran. An early failure (missing required scripts, a malformed `shipGate.ciCovers`) prints no such line
- **The gate names the legs your `projectType` removed (#215).** A type with no user-facing surface owes one leg of five, so the closing note opens with `Ship legs: 1 of 5 ran — a11y, responsive, flows, perf skipped by project type "script"`, and the headline reads *"Safe to deploy as far as the checks that ran"* rather than a bare *"Safe to deploy"*. A leg your type removed that you define in `package.json` anyway is marked `(skipped by project type)` in the not-run list. Reporting only: the required table above is unchanged, and so is the exit code. **The type is still a proxy for "has a UI", and it is wrong for any `experiment` that is a web page** — keying the legs off an explicit signal instead is staged, with its promotion condition, in `guardrail-enforcement.md`
- **The recorded result names what actually ran** — which suites or projects executed and how many tests, not just that the gate exited 0 (AGENTS.md §2.13a). A configured suite that did not run is reported as a finding and filed; it does not pass silently because the exit code was 0

## Owner bypass

```bash
BFW_OWNER_OVERRIDE=1 npm run bfw:ship
```

Requires matching `owners[].email` in `.bfw-process/config.json`. Logged to `.bfw-process/overrides.log`.

**Agents: do not run this unilaterally. Only on explicit owner instruction.**
