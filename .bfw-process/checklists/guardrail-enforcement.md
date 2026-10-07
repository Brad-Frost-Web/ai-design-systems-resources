# Guardrail enforcement ledger

**What this file is:** an honest register of which BFW guardrails a command actually
enforces, and which ones depend on a human or an agent choosing to comply.

**Why it exists (#170):** `ed-r-theme-customizer` — a recipe inside the Eddie design
system's own repository — was built from 9 raw `<input>`, 2 `<select>`, 3 `<button>`,
8 `<label>`, a hand-rolled `<aside role="dialog">`, and 574 lines of bespoke SCSS
across 48 custom classes. It accumulated across many sessions and many PRs, under
this process, and **every executable gate was green the whole time.** Of §8's build
guardrails, tokens-only and a11y have executable gates and Eddie-first does not — so
the rules that ran got followed, and the rule that only read well did not.

The dangerous part is not that the gates missed it. It is that they **certified** it:
raw controls styled entirely with `--ed-*` tokens and named in correct BEM pass the
token validator and the naming validator cleanly. A green check was available to be
read as "this complies," and it meant nothing of the kind.

So every row below carries a fourth column — *what a green result does not mean* —
because that is the column the incident actually needed.

## How to read a status

There are two, and the line between them is deliberately sharp:

| Status | Means |
|---|---|
| **enforced** | Violating it makes a command **exit non-zero**. Name the command. |
| **advisory** | Everything else — including rules that a tool *detects and warns about*. |

A `doctor` warning is advisory: warnings never change `doctor`'s exit code. So is a
`⊘ skipped` result — a check `doctor` could not evaluate at all, counted separately
since #244 so that a clean summary means evaluated-and-clean rather than unasked.
That is not a criticism of warnings, it is a description of them. The question this ledger
answers is *"does violating this fail something?"*, and for a warning the answer is
no. Where an advisory rule has a detector anyway, the Mechanism column names it —
knowing a rule is watched but not gated is more useful than knowing only that it is
ungated.

**Advisory is not a bug.** Most of these rules cannot be mechanically checked, and
pretending otherwise is how you get a gate whose green means nothing. The point of
writing the status down is that an ungated rule becomes a **known, sized hole**
rather than an assumed protection.

## Always-on rules (AGENTS.md §2)

| § | Rule | Status | Mechanism | A green result does NOT mean |
|---|---|---|---|---|
| §2.1 | Eddie-first discipline | **advisory** | `bfw-process doctor` → `design-system compose check` **warning**; `npm run bfw:ship` prints the same advisory. Neither fails for its absence — but a project that **wires** `designSystem.composeCheck` gets it run by the gate, and its failure does fail. **Scope:** full mode and UI-bearing project types only; quick mode and `script`/`experiment` are exempt, and doctor prints that exemption rather than staying silent. | **This is the #170 hole.** The token and naming validators pass raw `<input>` / `<select>` / `<button>` markup that is correctly tokenised and correctly named. Nothing anywhere compares the markup against the Eddie catalog, so a fully green run says nothing about whether the UI composes from the design system or reimplements it. Catalog-aware measurement exists (`eddie_analyze_product`, `eddie_adoption_report`) but no gate calls it. Upstream: `Brad-Frost-Web/eddie-design-system#1551`. The advisory names the gap; it does not close it. |
| §2.1a | Third-party library evaluation | advisory | none | — |
| §2.1b | "Primitive or app?" package placement | advisory | none | — |
| §2.2 | Design tokens only | **enforced** *(conditional)* | `.bfw-process/hooks/eddie-validate.mjs` → `eddie-brain validate` on PostToolUse + Stop; blocks with exit 2 on error-severity violations | Only `.scss` and `.ts` are scanned (the hook's own filter). `.njk`, `.vue`, `.html` and template files are **not** — see #97. The hook **fails open** when `EDDIE_ROOT` / `config.eddieRoot` is unresolvable, so silence is not the same as clean. It also allows every write when `config.eddieIntegration === false` (#87) — so a project exempted by the #166 detection artifact below gets no token validation either. Wired only in `content-site` and `app` projects. |
| §2.3 | Accessibility baseline | **enforced** *(partial, UI types)* | `bfw:verify:a11y`, required by `npm run bfw:ship` for every project type with a user-facing surface | Automated a11y catches a minority of WCAG failures. Keyboard operability, focus management on state change, meaningful alt text, and heading order in context are largely not machine-checkable. `script` and `experiment` types owe no a11y script at all. |
| §2.4 | Icons come from `@brad-frost-web/eddie-icons` | advisory | none | — |
| §2.5 | Ground Eddie work in `eddie-brain` | advisory | none | Nothing records whether a catalog lookup happened before markup was written. A session that guessed every prop from memory is indistinguishable, afterwards, from one that looked them all up. |
| §2.5a | Spacing and containment doctrine | **advisory** | The `eddie_validate_file` **MCP tool** hard-errors on a `margin` on `:host` or a component root. Nothing in a consumer project's gate set calls it. | The margin rule is the only half with a checker at all, and the checker is not the one that runs automatically: the `eddie-validate` PostToolUse hook shells out to the `eddie-brain validate` **CLI**, which runs four of six validators and omits the spacing check despite a source comment claiming it mirrors the MCP tool. So a green hook says nothing about host margins. **Unfiled upstream as of this row — verify before citing an issue number.** The containment half — exactly one `ed-layout-container` per path — has **no detector anywhere**: both the zero-container (edge-hugging) and two-container (double-padding) bugs render wrong while every gate passes. Eddie's own boilerplates and website violated it (`Brad-Frost-Web/eddie-design-system#1666`, open), which is the evidence that prose alone doesn't hold this. Eddie's adjacency check lives in its own `bfw:verify:responsive`; consumers inherit the script slot, not the check. |
| §2.6 | Component complexity discipline | advisory | none | The thresholds are explicitly smell detectors, "not hard lint rules". |
| §2.7 | Migration discipline | advisory | none | — |
| §2.8 | Dependency freshness | advisory | `bfw-process doctor` → registry-currency **warning** | A doctor warning does not fail `doctor`. Offline runs skip the check silently, so "no currency finding" can mean the registry was unreachable. |
| §2.8a | Never `npx` a declared dependency | advisory | `bfw-process doctor` → `findNpxDeclaredDeps` **warning** | Warning only; `doctor` still exits 0. Detects `npx` in `package.json` scripts, not in CI YAML, Makefiles, or docs. |
| §2.9 | Evaluate before adding to Eddie | advisory | none | — |
| §2.10 | Agent skills are versioned artifacts in-repo | advisory | none | — |
| §2.10a | Global agent settings are versioned artifacts too | advisory | none | The widest-blast-radius artifact class has no detector at all (#158). |
| §2.11 | One component instance per story | advisory | none | — |
| §2.12 | Progressive enhancement / HTML Web Components | advisory | none | No check renders a page with JS disabled. |
| §2.13 | Verify against the real thing at least once | advisory | none | A suite can be fully green with every external binary faked — which is the exact condition this rule exists to forbid. |
| §2.13a | Verification means naming what ran | **advisory** | none | The rule exists because exit 0 is not evidence — and nothing checks that a report names its suites. `bfw:verify:tests` exits 0 whether five suites ran or one; the eddie CI job named `Test (unit + storybook + a11y)` that only ever ran `unit` is the worked case. A green test line tells you a command finished, not which checks executed inside it (#96). |
| §2.14 | A safety flag needs a layer to land at | advisory | none | A passing dry-run test proves nothing if the flag never reached the layer that performs the effects; the test and the hole are compatible. |
| §2.16 | Cold start: pull the rules when the harness didn't push them | **advisory** | `bfw-process rules` exists and is named in `CLAUDE.md`, `.microagents/repo.md` and the PR template. Nothing checks it was run. | Nothing anywhere records whether a session read the rules. This is deliberate, not an oversight: a marker an unoriented agent can type would certify precisely what it claims to measure, which is the pathology this ledger exists to name. The hole is real and stays open on purpose. |
| §2.15 | Absorbed methods stay connected to upstream | advisory | `bfw-process doctor` → upstream-drift **warnings** | Report-only in every direction, by design. Reports nothing when no upstream plugin is installed to compare against. |
| §2.17 | Sessions end definitively — land it or park it | **advisory** | none | Nothing here observes how a session ends. A close-out that files its loose ends and one that trails three unrequested suggestions are indistinguishable to every gate in this register. The *parked* half is only as real as the issues actually filed — nothing counts them, so a session can report that it parked the work and have left nothing behind, which is §11's "a TODO in code is not tracking" one layer up. |

## Gates and build guardrails (AGENTS.md §4.2, §5.2, §7, §8, §9.5)

| § | Rule | Status | Mechanism | A green result does NOT mean |
|---|---|---|---|---|
| §4.2 | The Phase 2 feature-spec gate | **advisory** | none | Prose only. Nothing blocks an edit made while `FEATURE-SPEC.md` is `draft` or missing. A blocking hook is proposed in #143. Nothing checks that an approved spec describes *this* branch's work (#102). |
| §5.2 | Quick mode owes no ship-readiness verification — and `hardGates.shipReadiness`, not `mode`, decides whether the gate runs | **advisory** | `bfw-process doctor` → `mode vs hardGates.shipReadiness` **warning**, and `npm run bfw:ship` prints the same finding as a note when it runs under `mode: "quick"`. Both surfaces take it from one `assessModeGateContradiction()` result, so neither can state it differently from the other | **The contradiction is detected and never resolved: `hardGates.shipReadiness` is the authority, and a green from either surface does not mean the two config keys agree.** §5.2 says Quick mode has "no ship-readiness verification"; `runShipGate` decides whether to run from `hardGates.shipReadiness` alone. When they disagree the gate follows `hardGates` — which is why `Brad-Frost-Web/we-are-here`, labelled quick and declaring the gate, went red on every PR (#194). The fix #194 proposed — skip the gate whenever `mode: "quick"` — was **rejected by Brad on 2026-09-22**: that repo commits `mode: "quick"` on its default branch while being worked on as a Full-mode app, so the label is the stale half, and a gate that switches itself off from a stale label is §2.13a's inert gate. So the report names which setting the gate obeys and both fixes (`bfw-process mode full`, or `hardGates.shipReadiness: false`), guesses at neither, and **edits nothing**. What it still does not cover: **nothing anywhere checks that a mode label still describes its repo** — the input this whole row depends on, unverifiable by construction; the mirror case (`mode: "full"` with the gate declared off) has no detector of its own beyond the `ship gate declared` warning #71 added; the scope of "the gate does not read `mode`" is the decision to *run* — one advisory inside a run, the design-system compose check, is separately mode-gated and says so in words this row contradicts (#278); and **`CLAUDE.md`, `.microagents/repo.md` and §5.2 itself still tell a reader Quick mode means "ship checks off"** (#278), so the surfaces an agent reads first remain the ones that disagree with the tool |
| §7 | The Phase 5 ship-readiness hard gate | **enforced** *(conditional)* | `npm run bfw:ship` → `bfw-process verify-phase ship`; in CI via `.github/workflows/bfw-verify.yml` | Enforced **only when `hardGates.shipReadiness` is true and `bfw:ship` actually resolves.** A repo that declares the gate and cannot run it is the failure mode of `eddie-design-system#1548`; `bfw-process doctor` now **fails** on that mismatch (`hard gates runnable`), which is the only place it can surface — when the gate can't run, the gate isn't running. **Since #71 a freshly-`init`ed project usually starts with the gate declared OFF** — `init` writes `hardGates.shipReadiness: false` when the project does not yet define the `bfw:verify:*` scripts its type owes, because nothing scaffolds them and a gate that can never pass is a red X everyone learns to merge through. So on a new consumer this row is enforcing **nothing** until a human writes the scripts and sets the key, and the CI check installed by `bfw-verify.yml` exits 0 having run no legs — a green "BFW verify" on such a repo means *no gate ran*, and only the job log says so (#276). `doctor` warns on every run while a full-mode project has no declared gate (`ship gate declared`), and names the moment the scripts are all present and the gate can be turned on; that warning is the only standing signal, and it is advisory. Owner bypass (`BFW_OWNER_OVERRIDE=1`) exits 0 on a failing gate — it logs, but the exit code alone will not tell you. **A green gate is not "CI will pass":** the gate runs its required table, and typecheck and lint are not in it, so a consumer whose CI runs `bfw:verify:types` / `bfw:verify:lint` can be green here and red there (`eddie-slides#260`, #225). When it reaches its legs, the gate now closes by naming every `bfw:verify:*` script in `package.json` it did not run — read that line, not the exit code. It also says how many of the five legs ran and names the ones `projectType` removed, because a `script` or `experiment` project reaches a green having run `bfw:verify:tests` alone (#215); **that line reports the reduced set, it does not change it** — the type still decides which legs are owed, and a no-UI project that ships real UI is still never asked for them (see the Promotions table). CI steps that are not `bfw:verify:*` scripts are invisible to it. |
| §8 (tests) | Tests alongside code | **enforced** | `bfw:verify:tests`, required of every project type by the ship gate | Exit 0 does not name which suites ran. A configured project that silently did not run still exits 0 (#96) — the eddie CI job named `Test (unit + storybook + a11y)` that only ever ran `unit` is the worked example. |
| §8.1 | The two-axis review | **advisory** | none | §8.1 says so of itself: *"The reviewer is advisory — this is a soft gate."* Every adopted repo therefore inherits a rule that runs when someone remembers. The Spec half is proposed for hardening in #169. |
| §8.2 | Name the caller for every new seam | **advisory** | none | A type checker verifies a definition is *consistent*, never that it is *reached*. The reference epic shipped a seam plus a test double with zero callers, and 1,800 green tests said nothing. |
| §8.4 | Keep the change to what the task asks for | **advisory** | none mechanical — the §8.1 Spec axis asks the question at review time, itself advisory | A green suite proves the extras work, not that anyone asked for them. Nothing counts committed test files against the neighbouring ones, and nothing reads the PR body for the follow-ups a rider fix should have been. |
| §8 (commits) | Commit frequently, conventional prefixes | advisory | none | — |
| §9.5.6 | The branch-first ceremony — never author on the integration branch | **advisory** | `bfw-process doctor` → `branch-first ceremony (§9.5.6)` **warning** when the working tree is dirty on the integration branch (`main` on trunk, `develop` on gitflow), added in #217. Nothing blocks the edit or the commit. | **Nothing stops work being authored on `main` or `develop`** — the check reports, and only when someone runs `doctor` while the changes are still uncommitted. Commit them and it goes quiet: a commit already made on the integration branch is invisible to it, as is one already pushed. It also cannot see *which* branch a commit was authored on, so a green run says nothing about the history, only about the working tree at that moment. A detached HEAD is reported as **skipped** rather than passed, because there is no branch to judge the work against; the dirty test is `git status --porcelain`, which ignores gitignored files but counts untracked ones, so a scratch file on the integration branch warns like an edit does. Every other enforcement point is too early (§9.5.6 lives in `AGENTS.md`, read during Phase 1 — a request that never triggers Phase 1 never reaches the rule) or too late (the ship gate runs at Phase 5 and never asks where the work was written). The blocking form — a `pre-commit` hook installed by `init`, with a carve-out for §9.5.12 sync commits — is #217 part 2 and is **not implemented**; it is an owner decision, not a pending task. |
| §2.8 / §7 | The tree the gate judges is the tree the lockfile describes | **advisory** | `npm run bfw:ship` → `dependencies vs lockfile` line, printed before any leg runs; `bfw-process doctor` → `node_modules matches the lockfile` **warning**. Both read `src/lib/dependency-drift.mjs`, which compares each installed package's version against the lockfile's `packages` map and names the packages that differ. Neither fails for drift (#249; Brad's decision of 2026-09-22 — see Promotions). | **Versions only.** Nothing compares `resolved` or `integrity`, so a package at the right version from the wrong registry or a tampered tarball passes; nothing checks that the lockfile itself satisfies `package.json`'s ranges. A tick is a verdict about the packages it could compare and **silently excludes the rest** — linked workspace members, optional, `devOptional`, peer and platform-restricted absences, versionless entries, and installed manifests it could not read are set aside and counted, not judged. `n/a` means **it could not look**, never that the tree is clean: no lockfile, no `node_modules`, an unparseable or lockfileVersion 1 lockfile, and an uninstalled tree (every fresh `git worktree`, §2.8a) all land there, and only the printed reason distinguishes them. It reads the project root's lockfile only, so a workspace member whose lockfile lives at the workspace root reports `n/a`. In the gate it sits *inside* `runShipGate`, so a project with `hardGates.shipReadiness: false` sees nothing — `doctor` is the only reader that covers those. |
| Phase 6 (docs) | Documentation is part of Done — a change that ships gets a CHANGELOG entry | **advisory** *(enforceable)* | `npm run bfw:ship` → changelog completeness check (#203). Compares the branch against its merge base with the integration branch: shipped files changed + nothing added under `## [Unreleased]` → a printed finding. Runs on every PR through `.github/workflows/bfw-verify.yml`. **Fails for its absence only when a project sets `changelog.enforce: true`** — otherwise it prints and the gate stays green. | It is a check on *presence, not accuracy*: one line under `[Unreleased]` satisfies it, however little it describes and however wrong it is. Nothing verifies an entry corresponds to what the branch actually did. The check also **fails toward silence by design** — no CHANGELOG.md, no resolvable base ref, a shallow clone or a detached HEAD all yield `n/a`, so "no changelog finding" can mean "could not look" rather than "documented." CI checkouts were the common shallow case until #233 gave `bfw-verify.yml` `fetch-depth: 0`; on a repo still carrying an older template they remain one, and a missing base still yields `n/a` anywhere. A detached HEAD no longer blinds the branch-name rules inside a GitHub Actions run — the head branch comes from `GITHUB_HEAD_REF` and the base from the pull request's target when that target is a standing branch (#251) — but a detached HEAD anywhere else is still a branch the check cannot name, and a run that is not a pull request (`workflow_dispatch`) still takes its base from the branch model rather than from anything declared. The reason is always printed, so read the line rather than the exit code. Exempt path classes (`tests/`, `.github/`, `docs/`, …) are skipped wholesale, so a change confined to them is never asked for an entry even when it ships behaviour. Two more silences by design: a `release/*` branch is exempt by name (#206) — any author of a branch in the repo can claim it, and in CI a fork PR's branch name is refused only when the event payload can be read and says the head is a fork, so an unreadable payload leaves the name trusted (#251) — and on a branch that merged the default branch in, the paths whose content matches it are discounted as arriving with the merge (#230) — which is content identity standing in for provenance, so it cannot see a revert: a conflict resolved in `main`'s favour, or a deletion of a path `main` never had, reads as incoming. |

## §8 bullets that carry no section reference

Most of §8's build guardrails cite the §2 rule they restate (`§2.13`, `§2.14`,
`§2.8a`, `§8.1`, `§8.2`) and are covered by that rule's row above. Six do not
cite anything, so they are mapped explicitly here — otherwise "every §8
guardrail has a row" would be a claim nothing checks, which is the failure this
whole file is about.

| Bullet (leading words) | Covered by |
|---|---|
| No custom presentational CSS | §2.1 (composition) + §2.2 (the styling itself) |
| No hardcoded color, spacing, or type values | §2.2 |
| No Google Fonts | §2.2 |
| Accessibility at every step | §2.3 |
| Progressive enhancement | §2.12 |
| Commit frequently with clear messages | §8 (commits) |

Adding a bullet to §8 without either citing a §-rule that has a row, or adding
it to this map, fails the drift test.

## Keeping this file honest

`tests/unit/guardrail-ledger.test.mjs` asserts the drift guard:

- every `### 2.N` heading in `AGENTS.md` has a row here;
- every `§N.N` cross-reference cited in §8's guardrail list has a row here;
- every §8 bullet that cites nothing is in the map above;
- every row's status is exactly `enforced` or `advisory`;
- every row has all five cells, and none of them is blank;
- every row key is distinct;
- an `enforced` row names a command, and any `bfw:verify:*` script it names is
  one the ship-script table actually knows.

**What it does not assert: that a status is *true*.** Nothing compares the word
"enforced" against the behaviour of the command named beside it, so a row could
claim a gate that does not gate. The statuses are maintained by hand and
reviewed like any other prose. The guard stops the register falling *behind*
the rule set; it does not verify the register's claims.

Adding a guardrail to `AGENTS.md` without recording its enforcement status fails
that test. That is the point: the register cannot quietly fall behind the rules it
registers, which is the same failure the rules themselves fell to.

## Promotions

When an advisory rule gains an executable form, move its row and record the release
here. A promotion that lives only in someone's intention is indistinguishable from
one that never happened.

| Rule | From → to | Release | Note |
|---|---|---|---|
| §2.1 Eddie-first (compose check) | advisory → enforced | **pending** | `designSystem.composeCheck` shipped **advisory** (#170): `doctor` warns and the ship gate prints the gap, neither fails for its absence. A project that wires the script has it executed by `shipScriptPlan()` today, and a failing compose check fails the gate. Promotion means moving it from that plan's `run` list into `requiredShipScripts()` so its *absence* also fails — blocked on a catalog-aware check existing upstream (`eddie-design-system#1551`), then one release after it. **A promotion that lives only in someone's intention is indistinguishable from one that never happened — when #1551 lands, this row is the reminder.** |
| Phase 6 changelog completeness | advisory → enforced | **pending** | Shipped **advisory** in the #203 release: the ship gate prints the finding, and only a project setting `changelog.enforce: true` has it fail. Promotion means flipping that default so an unconfigured project is held to it. Blocked on nothing technical — the gate is written and tested — but deliberately staged, because turning it on for every consumer at sync time reds each repo carrying a backlog of undocumented merges, and a gate that goes red on arrival gets switched off rather than satisfied. **Promote one release after the first consumer runs it enforced without false findings.** `eddie-design-system#1765` is that consumer and the reason this exists. |
| §7 a11y/responsive/flows/perf for no-UI types | advisory → enforced | **pending** | **Staged 2026-09-22**, on Brad's decision *report honestly now, require later*. `script` and `experiment` owe `bfw:verify:tests` alone, so their absence of an a11y script fails nothing, and the gate reached *"All ship-readiness checks passed"* having never run a11y, responsive, flows or perf — §2.13a's inert gate. Only the **reporting** half shipped (#215): the gate's head already named the exempted legs, and now its *closing* note says how many of the five ran and the headline drops its unqualified "Safe to deploy"; `doctor` names the same four legs beside the compose check. **What did not change: which legs are required, which run, and the exit code.** Promotion means keying the reduced set off an **explicit signal** — a project declaring what it actually puts in front of a human — instead of inferring it from `projectType`, so an `experiment` that serves a UI is asked for the legs it owes and a genuine CLI still is not. The evidence that it is needed already exists: `Brad-Frost-Web/keynote-connection-map` is typed `experiment`, ships an attendee form and a projector view, and is green with a11y unrun (#215). What is missing is the signal itself — it has not been designed, so there is nothing for a consumer to declare. **Promote one release after that signal ships and a fleet sweep shows every `script`/`experiment` repo has declared it** — turning it on before that reds each repo on arrival, and a gate that goes red on arrival gets switched off rather than satisfied. |
| Installed `node_modules` vs `package-lock.json` | advisory → enforced | **pending** | Shipped **advisory by Brad's decision of 2026-09-22, for one release** (#249): `bfw-process doctor` warns and `npm run bfw:ship` prints the same finding from the same assessor (`src/lib/dependency-drift.mjs`), naming each package with its installed and locked versions. Neither changes an exit code, and nothing installs anything — a gate that mutates the tree to pass is worse than the problem. The issue asked for it to *refuse a verdict* (exit non-zero before any leg, on §7's "a gate that cannot execute is not enforcing anything"); Brad chose advisory first, because the false-positive surface is the whole npm install matrix — optional and platform-specific packages, peers, workspace links, `--omit=dev` trees — and a check that reds a correct tree in week one gets switched off in week one. **What would promote it:** one release of advisory output across the consumer fleet with no false finding reported, evidenced by the printed advisories rather than by nobody complaining. Promotion means the ship gate exits non-zero on `drifted` before running a single leg; every `n/a` path stays silent-with-a-reason either way. |
| §2.1 opt-out via `eddieIntegration: false` | — | — | That key is normally set by *detection* at init, and detection only probes `package.json` (#166) — so a project using Eddie from a CDN is exempted by an artifact rather than a decision. The exemption stands; `doctor` names #166 when it reports it, so it is not silent. Closing #166 closes this. |
