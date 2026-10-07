# Phase 4 Build Guardrails

Live checks while coding. If any of these is violated, stop and fix before continuing.

## Eddie-first

- [ ] Every UI element is an Eddie Web Component or Eddie Recipe
- [ ] No `<div class="my-custom-card">` with hand-rolled styles
- [ ] No Tailwind / Bootstrap / Material UI / Chakra / shadcn / etc.
- [ ] No one-off component code in the consumer project
- [ ] If a new pattern was needed, a recipe exists (or is PR'd) in `eddie-recipes`

## Tokens only

- [ ] No hardcoded color values (hex, rgb, hsl, named)
- [ ] No hardcoded spacing values (px, rem, em outside of token aliases)
- [ ] No hardcoded type values (font-size, line-height, weight)
- [ ] No hardcoded radii, shadows, or z-indices
- [ ] No Google Fonts `<link>` tags
- [ ] Every design value references a `--ed-*` token

## Accessibility

- [ ] Semantic HTML throughout (`<button>`, `<a>`, `<nav>`, `<main>`, heading order)
- [ ] Every interactive element is keyboard-reachable and operable
- [ ] Color contrast ≥ WCAG AA
- [ ] Every image has alt text (or `alt=""` if decorative)
- [ ] ARIA used only where HTML semantics don't cover it
- [ ] Forms: labels, error messages, focus management
- [ ] Core functionality works without JS

## Tests

- [ ] Unit tests written alongside each task, not after
- [ ] Tests pass locally before each commit
- [ ] Test coverage is proportional to risk (critical paths covered; boilerplate skipped)

## Verify against the real thing (§2.13)

- [ ] Every module that shells out to an external binary (`git`, `gh`, `npm`, a CLI, a daemon) has **at least one** test that executes that binary for real
- [ ] That test runs against a throwaway fixture (temp dir / scratch repo), not the working checkout, and cleans up after itself
- [ ] It lives in the default suite — not behind a flag, an env var, or a separate script
- [ ] The invocations whose *shape* carries risk (flags, paths, `--` separators, explicit working directory) are the ones covered
- [ ] Fakes remain for decisions and error branches — the real-thing test is in addition, not instead

## Safety flags land somewhere (§2.14)

- [ ] Any `--dry-run` / `--check` / observe-mode flag is threaded to the layer that **performs** the effects, not just to the entry point
- [ ] A test asserts **zero effects** with the flag set and every grant / credential / permission live: no files written, no processes spawned, no network mutations, no money spent
- [ ] Dry-run output reports plans as plans (`would file 3 …`), never as completed actions

## Name the caller (§8.2)

- [ ] Every new interface, seam, hook, or injection point has a caller you can name (one grep)
- [ ] Seams whose only callers are tests are labeled as such in the PR body, not described as wired
- [ ] No code comment claims a reader, consumer, or code path that doesn't exist

## Scope of the change (§8.4)

- [ ] No pre-existing bug, performance concern, or unmentioned behaviour was fixed or extended in this change unless the requested behaviour could not work without it
- [ ] Everything noticed but left alone is filed (§9) and named as a follow-up in the PR body
- [ ] Where the task was ambiguous, one reading was implemented and the assumption is stated in the PR — the other readings were not built
- [ ] Tests for the requested behaviour ship with it; committed test files are sized like the neighbouring ones (a focused test per stated behaviour as the floor) and scratch checks were not promoted to permanent test files
- [ ] Every behaviour the task asked for is implemented, completely

## Two-axis review before the closing commit (§8.1)

- [ ] Two independent reviews of the diff were run in parallel, without seeing each other's output: **Standards** and **Spec**
- [ ] The two reports were kept separate — not merged, not re-ranked into one list
- [ ] The Spec reviewer was told to compare old code against new code and diff the *semantics*, not to read the diff
- [ ] The Spec reviewer was given the explicit out-of-scope list (follow-up tickets, deliberate deferrals)
- [ ] The reviewers were pointed at the highest-risk claim by name ("be adversarial about the 'no behaviour change' claim")
- [ ] Every finding is either fixed or disclosed in the PR body — including "review skipped", if that was the choice

## Commits

- [ ] Small, scoped commits
- [ ] Clear commit messages describing what and why
- [ ] No "WIP" commits in the main branch's history at merge time

## Story coverage (§2.11, when the project ships a component workbench)

- [ ] Every story renders exactly one instance of the component it documents
- [ ] Variation (sizes, variants, states) is spread across stories, not stacked in one canvas
- [ ] The `Default` story is clean canonical usage — no headings, wrapper divs, or sibling copies an agent would copy as scaffolding
- [ ] Each documented configuration is reachable at its own story URL
- [ ] Recipes follow the same rule; a composition recipe's `Default` story is one composition skeleton
- [ ] Pages render one page instance per story
- [ ] Any multi-instance story is one of the two sanctioned exceptions (variance in a single parent's children, or a page-section showpiece) and says so in its doc comment

## Component complexity (§2.6)

- [ ] No single component file exceeds 1,000 lines without a filed decomposition issue
- [ ] No component handles more than 3 distinct responsibilities without review
- [ ] Can describe each component's purpose in one sentence without "and"

## Migration discipline (§2.7, when applicable)

- [ ] If migrating: are you rebuilding intent, or copying implementation?
- [ ] If the old code had a known bug in this area, is the new code fixed?
- [ ] If a feature was half-implemented, is it either complete or cut?
- [ ] Are you using the new framework's idioms, not fighting them?

## Dependency freshness (§2.8)

- [ ] All `@brad-frost-web/*` packages are on latest stable
- [ ] No pre-release versions in production dependencies (unless documented)
- [ ] Verified latest versions are published on npm, not just tagged in git

## Running what you pinned (§2.8a)

- [ ] No npm script invokes a **declared** dependency through `npx` — the binary is called by name
- [ ] Any remaining `npx` is for a package deliberately *not* in `package.json`, and pins what it fetches (`npx pkg@1.2.3`) or uses `npx --no`
- [ ] `bfw-process doctor` reports no "npx for declared deps" warnings

## Spec fidelity

- [ ] If implementation revealed a spec gap, it's been recorded as an amendment or issue
- [ ] No silent decisions around spec gaps

## Know which of the above is enforced (§8, #170)

- [ ] Before treating a green run as compliance, check [`guardrail-enforcement.md`](guardrail-enforcement.md) for the rule you care about
- [ ] Eddie-first is **advisory** — no gate can currently see it; a green token/naming validator says nothing about whether the markup composes from the catalog
- [ ] The token validator scans `.scss` and `.ts` only, and fails **open** when eddie-brain is unresolvable — silence is not "clean"
- [ ] Any guardrail you add to `AGENTS.md` gets a ledger row in the same change
