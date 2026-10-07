<!--
BFW pull request template. See AGENTS.md §9.5.5 for the conventions this encodes.
Delete any section that genuinely doesn't apply — but delete it deliberately, and
say why. A section left blank reads as "not checked", which is exactly what these
prompts exist to prevent.
-->

Fixes #<!-- issue number. Use `Closes #N`, or `Related: #N` for partial progress. -->

## What changed and why

_Summary in plain language: what this does, and what it's for. The issue says what was asked; this says what landed._

## Orientation (§8, #170)

_Advisory, deliberately. An agent that read nothing can still tick this box, so it is **not** a gate and nothing checks it — a marker that certifies itself is the exact false green #170 is about. It is here because naming the rule set you worked under is cheap and useful to a reviewer._

- [ ] Read `AGENTS.md` (and `CLAUDE.md`, `SPEC.md`) this session — or ran `bfw-process rules`, which prints the mode, lane, gate status and always-on rules on any harness
- Lane this work ran in: <!-- Full | Quick | Design -->

## Test plan

_How this was verified. Commands run, checks performed, what you looked at._

- [ ] Tests pass locally
- [ ] Phase 4 build guardrails satisfied (`checklists/phase-4-build-guardrails.md`)
- [ ] Phase 5 ship gate passes where it applies (`npm run bfw:ship`)

## Two-axis review (§8.1)

_Two independent reviews of the diff, run in parallel without seeing each other's output. Report them separately — merging the lists lets one mask the other._

**Standards** — repo rules plus the code-smell baseline:

-

**Spec** — does this do what the issue asked, and only that:

-

Each finding is fixed, or disclosed here with the reasoning. **"Not run" is an acceptable answer; silence is not.**

## Callers for new interfaces (§8.2)

_For each new interface, seam, hook, or injection point: name the caller. One grep each. "Tests only" is a valid answer and a useful signal — a seam exercised solely by its own test double is scaffolding, not shipped capability._

| New interface / seam | Caller |
|---|---|
|  |  |

<!-- Delete this section if the change introduces no new interfaces. -->

## Behaviour-preserving? Then list the deltas (§9.5.5)

_Only if this change is presented as a refactor / "no behaviour change". List **every** accepted difference and why it's acceptable. No list means nobody diffed it._

| Delta | Why it's acceptable |
|---|---|
|  |  |

<!-- Delete this section if the change intentionally changes behaviour. -->

## External processes and safety flags

- [ ] Any module that shells out to an external binary has at least one test that runs the real binary against a throwaway fixture, in the default suite (§2.13)
- [ ] Any `--dry-run` / `--check` / observe-mode flag reaches the layer that performs the effects, and a test asserts zero effects with the grant live (§2.14)

<!-- Delete this section if the change touches neither. -->

## Public repo? File the sanitised version (§9.1a)

- [ ] This body, its commits, and every artifact committed beside them carry no credentials or internal infrastructure, NDA'd client names, money, personal data, or blame by name — where a finding had specifics that can't be public, they stay in the private channel this PR body names, scrubbed before posting rather than after

## Notes for the reviewer

_Anything that needs a human eye: risky claims worth being adversarial about, deliberate deferrals, follow-up issues filed. If you couldn't render UI in this harness, say so here so a human looks before merge._

-
