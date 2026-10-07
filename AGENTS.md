# AGENTS.md — Brad Frost Web Software Creation Process

<!-- bfw-process 0.24.0 · synced 2026-10-07 · generated file: edit via the canonical repo and `bfw-process sync`, not here -->

> **You are an AI coding agent working on a Brad Frost Web (BFW) project.** This file is the canonical, cross-agent source of truth for how software is built at BFW. Read it in full before writing a single line of code. It supersedes any general habits or defaults you have.
>
> This file works across agent harnesses: Claude Code (`CLAUDE.md`), OpenHands, Cursor, Cline, and any tool that reads `AGENTS.md`. When in doubt, behave as if this file is your only instruction.

---

## 0. What BFW is and why this document exists

Brad Frost Web LLC builds design-system–first web software under the direction of Brad Frost and Ian Frost. BFW has strong, specific opinions about how software should be created — opinions earned through years of client work, teaching, and production hits and misses. This document encodes those opinions so every agent session in a BFW repo starts from the same baseline without a human having to re-explain anything.

**The non-negotiables, in one breath:** spec before build, Eddie is the UI layer, design tokens only, accessibility is a baseline not a stretch goal, tests ship with code, and deviations are documented.

### Foundational dependency: Design System Community Charter

Everything in this document sits on top of the [Design System Community Charter](https://gist.github.com/hereinthehive/bf4053e3721e3395a1b30e30b98a196c) by Dan Donald ([@hereinthehive](https://github.com/hereinthehive)). The charter defines how humans and AI agents collaborate ethically to create, maintain, and evolve design systems. It is the ethical and human-centered foundation beneath BFW's technical rules — the *why* under the *what*.

A snapshot of the charter lives at `.bfw-process/foundations/design-system-community-charter.md`. The canonical, evolving version is the gist linked above. When in doubt, the gist is authoritative.

**What this means in practice:**

- The charter's guiding principles — transparency, respect, learning, stewardship, and inclusion (§4) — are the values that BFW's core principles encode technically. Accessibility isn't just WCAG compliance; it's human dignity (Charter §4.5, §8).
- The agent self-review checklist (Charter §3) applies to all BFW agent work. Before generating examples, documentation, or test data, check for cultural neutrality, inclusive language, and non-assumption.
- The charter's human dignity and non-assumption framework (Charter §8) governs how agents think about the people who will use what we build. We do not assume abilities, identities, circumstances, or contexts.
- Example data, documentation, and test fixtures must follow the charter's inclusive examples guidance (Charter §7.3): diverse names, culturally varied contexts, no Western-centric defaults.

This charter is a living document. BFW will be evolving it further with Dan and a growing community of people and organizations who care deeply about the Web and the trajectory of software development.

---

## 1. Core principles (always on, every mode)

1. **Spec first, build second.** We do not vibe-code into production. We specify, review, then build. Exception: Quick mode (see §5).
2. **Eddie is the UI layer. No exceptions.** Custom HTML/CSS/JS for presentational UI is prohibited. `@brad-frost-web/eddie-web-components` + `@brad-frost-web/eddie-recipes` is the answer.
3. **Simplest stack that satisfies requirements.** No frameworks "because they're cool." Content site → Eleventy. App needing auth/state/realtime → Nuxt. Script → vanilla Node/Python. Component → Eddie monorepo work only.
4. **Accessibility is not optional.** WCAG 2.1 AA is the baseline. Semantic HTML, keyboard navigation, sufficient contrast, ARIA when (and only when) HTML semantics don't cover it.
5. **Tests are part of the build, not an afterthought.** Unit tests are generated alongside code, not after.
6. **Document deviations.** If a project needs to deviate from the defaults, say so in `README.md` and explain why.
7. **Surface, don't assume.** If the spec is unclear on a decision, stop and ask. Don't make consequential choices unilaterally.
8. **Commits are communication.** Small, frequent, clear commit messages describing what changed and why.
9. **Design for human dignity.** The Design System Community Charter (§0) is the ethical foundation beneath these technical rules. Inclusive language, cultural neutrality, non-assumption about abilities/identities/circumstances, and the agent self-review checklist apply to all BFW work.
10. **Strengthen what exists before adding new.** BFW systems are already sophisticated. Most improvements are strengthening, not invention. Before proposing anything new, answer four questions out loud in the deliverable:
    1. **What exists now that can help implement this?**
    2. **What in the current implementation could be *strengthened* to accommodate it?**
    3. **Can anything be *reduced* or *consolidated* to make this more effective?**
    4. **Do we actually need another feature?**

    New things are allowed — they must **earn their keep**, explicitly, by saying what they replace or why nothing existing could carry them. Default to: new *fields* on an existing artifact over a new file; a new *input* to an existing agent over a new agent; *amending* an existing SOP over authoring one; *strengthening* an existing route over adding one. When a spec proposes several new things at once, show the reduction pass as a table — *proposed → already exists? → strengthen / reduce / new (and why it earns it)*.

    The failure this prevents is additive drift: every addition individually reasonable, the accumulation a navigation problem. Its companion failure is the dead channel — a surface that was built, filled with the wrong thing, and then joined by a second surface answering the same question, one of which now lies.

---

## 2. The always-on rules (even in Quick mode)

These rules are **always enforced**, regardless of mode. They're cheap, habitual, and they're what makes BFW projects recognizable:

> **Design branches (§5.3) are the one exception** — and even then, only Eddie-first and token discipline can be relaxed, only *per line of work*, only when the human invites exploration, and only after the agent confirms with one short question. The accessibility baseline (§2.3) is **never** relaxable on any branch, in any mode. It's too cheap to drop and too expensive to retrofit.

### 2.1 Eddie-first discipline

- **Never** write `<div class="my-custom-card">` with inline or hand-rolled styles. That's a recipe.
- **Never** introduce Tailwind, Bootstrap, Material UI, Chakra, shadcn, or any other component/utility CSS framework. Eddie is the only system.
- **Never** write one-off component code in a consumer project. If Eddie doesn't cover it:
  1. Check `@brad-frost-web/eddie-web-components` for a variant or configuration.
  2. Check `@brad-frost-web/eddie-recipes` for an existing product-specific composition.
  3. If neither exists, create a new recipe in `eddie-recipes`. File an issue in the Eddie monorepo if it should eventually graduate to core components.

#### 2.1.1 Recipe tiers and selection

Not every project needs every recipe. Eddie recipes are organized into three tiers:

| Tier | What it contains | When to include |
|---|---|---|
| **Core recipes** (`@brad-frost-web/eddie-recipes`) | General-purpose compositions used across many BFW projects — card grids, form groups, hero sections, navigation patterns, etc. | Always available. Every BFW project can pull from this package. |
| **Category recipes** | Domain-specific recipe libraries for specialized needs — e.g., UI Documentation (token specimens, typography specimens, system docs), Charts & Graphs (data visualization), etc. | Include when the project's spec calls for that domain. A documentation site pulls in UI Documentation recipes; a dashboard pulls in Charts & Graphs recipes; a marketing site may need neither. |
| **Project-local recipes** | Compositions too specific to one project to justify upstreaming. Still follow Eddie conventions (`ed-r-` prefix, tokens only, a11y baseline) but live in the consumer project's own recipe directory. | When a composition is unique to one project and unlikely to recur elsewhere. |

Recipes are also grouped into **functional categories** — Global, Cards, Blocks, Forms, Navigation, Media, Charts, Tools — mirroring the component taxonomy. `eddie_search` returns a recipe's `category` and `projectScope`, so search the family ("cards", "navigation") before assuming a composition doesn't exist.

#### 2.1.1a Composition vs. declarative recipes — never fork a recipe

Orthogonal to tier, every Eddie recipe carries a **`recipeKind`** that tells you how to consume it. `eddie_get_component` leads a recipe's payload with an `agentGuidance` directive derived from it. **Read that directive before writing markup, and follow it:**

| `recipeKind` | What the recipe is | How you consume it |
|---|---|---|
| **`composition`** | An assembly of `ed-*` components supplying only the *chrome* — landmarks, layout, spacing, a11y wrappers (site header, site footer, promo block, page banner). | Start from the `canonicalUsage.default` skeleton and **swap in your real content**, preserving every `<ed-*>` tag, named slot, and nesting relationship. Don't expect content props. |
| **`declarative`** | A genuine single-purpose component whose content is prop-driven — a KPI tile, a project card, a brand mark, a chart. | Configure it via props. Locked-up is correct here. |
| **`exception`** | A composition intentionally locked (e.g. a living demo/reference recipe). | Treat as declarative; the JSDoc `intent` states why it's locked. |

**Never fork a recipe's source to customize its content.** Forking is the failure mode composition-first recipes exist to prevent: a fork snaps the link to upstream, so every fix, a11y correction, and token update after that point stops reaching your project. If a composition recipe can't express what you need through its slots, that's an upstream gap — file it against `Brad-Frost-Web/eddie-design-system` per §9.4, don't copy the file.

#### 2.1.2 Selection signals

Use these signals to decide where a recipe belongs:

- **≥2 BFW projects need the same composition** → upstream it to `eddie-recipes` (core).
- **A composition is domain-specific but reusable across projects in that domain** → category recipe library.
- **A composition is unique to one project** → project-local recipe. If it later appears in a second project, upstream it.

When in doubt, start project-local and promote upstream when reuse materializes. Premature upstreaming creates maintenance burden; late upstreaming just means a one-time extraction.

#### 2.1.3 Recipe graduation to core components

A recipe may graduate from `eddie-recipes` to `eddie-web-components` when it meets all of the following:

1. **Used by ≥3 consumer projects.** Reuse is proven, not speculative.
2. **Stable API.** No breaking changes across 2+ releases. The props, slots, and events are settled.
3. **Passes Eddie's component quality bar.** Full a11y compliance, tokens-only styling, documented with Storybook stories, indexed by eddie-brain.
4. **Filed as a graduation proposal** in the Eddie monorepo issue tracker, citing the consumer projects and usage evidence.

Graduation is not automatic — it's a deliberate decision that adds long-term maintenance to the core package. The bar is intentionally high.

### 2.1a Third-party library evaluation

Eddie covers UI composition, but many projects require capabilities Eddie doesn't provide and shouldn't try to — charting, video editing, drawing/canvas, rich text editing, PDF generation, mapping, 3D rendering, audio processing, and so on. When the spec calls for a capability outside Eddie's scope, a third-party library is justified. But the choice of library and where its integration lives are consequential decisions that deserve the same rigor as any other architectural choice in BFW.

#### When a third-party library is justified

A project needs an external library when it requires a **capability** — not just a UI pattern — that doesn't exist in Eddie and wouldn't make sense as an Eddie component. The distinction matters:

- "I need a bar chart" → capability gap. Eddie doesn't render data visualizations. A library is justified.
- "I need a card with a chart in it" → composition gap. The card is Eddie; the chart is a library; the combination is a recipe.
- "I need a styled button" → Eddie covers this. No library needed. Use `ed-button`.

If you're unsure whether something is a capability gap or just a missing recipe, ask.

#### Evaluation criteria

Every candidate library must be evaluated against these criteria before adoption. The goal is to ensure the library integrates cleanly into the BFW ecosystem rather than fighting it.

| Criterion | What to check | Non-negotiable? |
|---|---|---|
| **Web Component friendly** | Must be vanilla JS, Web Component-native, or easily wrappable in Web Components. No framework-coupled libraries (React-only, Vue-only, Angular-only). Eddie is framework-agnostic Web Components; the library must work in that context. | Yes |
| **Themeable with Eddie tokens** | Must support styling via CSS custom properties or a configuration API that can consume `--ed-*` tokens. Colors, typography, spacing should flow from Eddie's token system — no hardcoded values baked into the library's output. | Yes |
| **Accessible** | Must meet WCAG 2.1 AA. Keyboard navigable, screen reader friendly, sufficient contrast. SVG-based output with proper ARIA attributes preferred over canvas-only rendering. Check the library's own a11y documentation and audit its output. | Yes |
| **Right-sized** | Bundle size proportional to the capability it provides. A 500KB charting library for one pie chart is a red flag. Prefer libraries that support tree-shaking or modular imports. | Strongly preferred |
| **Maintained** | Active maintenance, responsive to security issues, not abandoned. Check last commit date, open issue count, release cadence. A library with no releases in 2+ years is a risk. | Strongly preferred |
| **SSR-compatible** | Must work in both Eleventy (static) and Nuxt (SSR/CSR) contexts, or degrade gracefully. Libraries that crash on `window is undefined` during SSR are disqualifying unless the integration can lazy-load client-side only. | Yes for UI libraries |
| **License-compatible** | MIT, Apache 2.0, BSD, or similarly permissive. No GPL, AGPL, or proprietary licenses without explicit owner approval. | Yes |

If a library fails any non-negotiable criterion, it's out — regardless of how popular or feature-rich it is.

#### §2.1a.1 The shadow-contained framework-coupling exemption

The "Web Component friendly" criterion disqualifies framework-coupled libraries (React-only, Vue-only, Svelte-only, Angular-only) by default. This is the right default: BFW's UI layer is framework-agnostic Web Components, and most of the time a framework-coupled library is fighting that posture.

However, some capabilities — particularly interactive visual primitives like node-based diagrams, rich text editing, or complex state management — are materially better served by libraries that happen to be framework-coupled. When the alternative is building equivalent capability from scratch or accepting a significantly worse user experience, a narrow, documented exemption is preferable to a blanket refusal.

**A framework-coupled library qualifies for the shadow-contained exemption if, and only if, all of the following hold:**

1. **Containment is architectural, not aspirational.** The framework dependency lives inside a BFW-authored Web Component's subtree (shadow root or light-DOM root scoped by custom element). The host never imports the framework directly. Consumer code sees only the Web Component's attributes, properties, methods, and events.
2. **The host framework is a transitive detail.** If in 18 months the underlying library is swapped for a vanilla-JS alternative, the Web Component's public API does not change. This is a design constraint on the integration, not a hope.
3. **The capability is genuinely framework-differentiated.** Easy test: if a vanilla-JS alternative exists with comparable extensibility, accessibility, maintenance, and ecosystem, the exemption does not apply — pick the vanilla option. The exemption is for cases where the framework-coupled library measurably wins on High-weight §2.1a criteria after integration cost is accounted for.
4. **The runtime cost is quantified.** The evaluation reports the bundle cost of the host framework as part of the library's footprint (framework + library + any polyfills). Costs are disclosed in the consuming package's README, not hidden.
5. **The escape-hatch is narrow.** Integration code that is coupled to the host framework's specific APIs (React hooks, Svelte runes, Vue composition API) is quarantined to a single "mount module" within the BFW package. All code above the mount module speaks in Web Component primitives only.
6. **Upstream precedent is filed.** The first integration of a given host framework (first Svelte-coupled library, first React-coupled library, etc.) must land an AGENTS.md amendment documenting the specific library, integration pattern, and migration path, **before** the consuming BFW package publishes. Subsequent integrations within the same host framework reference the established precedent; they don't re-litigate the exemption.

**An integration that qualifies is documented using the evaluation deliverable in §2.1a, plus:**

7. **The mount module's file path** — the single file where the framework-specific code lives.
8. **The containment boundary** — which Web Component encloses the framework, and whether it uses shadow DOM or scoped light DOM (and why).
9. **The API surface exposed to hosts** — full reference of attributes, properties, methods, events. This is the contract the containment protects.

The exemption doesn't loosen the default — a proposal that doesn't meet all six gates is still disqualified, and the default answer to "can we use a React-only library?" remains no. It doesn't back-door framework adoption into Eddie core: `@brad-frost-web/eddie-web-components` remains Lit + vanilla WC; the exemption applies only to BFW packages that wrap capability behind a WC interface. And it isn't retroactive: any existing framework-coupled dependency must clear the six-gate test on review, same as new proposals.

#### §2.1a.2 Established precedents

A living table of adopted framework-coupled libraries and the integration patterns they established. Each row is a reusable reference for future evaluations.

| Host framework | Library | BFW package | Container | Mount module | AGENTS.md issue |
|---|---|---|---|---|---|
| Svelte 5 | `@xyflow/svelte` | `@brad-frost-web/eddie-diagrams` | `<ed-r-diagram>` (light DOM, scoped) | `src/svelte/mount.ts` | [bfw-process#36](https://github.com/Brad-Frost-Web/bfw-process/issues/36) |

New rows are added via follow-up issues as other framework-coupled libraries clear the six-gate test. Reading this table tells you exactly which framework dependencies live in which BFW packages — no hidden transitive reliance on React/Svelte/Vue.

#### Where the integration lives

Once a library passes evaluation, decide where its BFW integration code belongs:

| Integration home | When to use it | Example |
|---|---|---|
| **Eddie category recipe library** | The capability is needed by multiple BFW projects and the integration wraps library primitives as Eddie-styled recipes. | A Charts & Graphs recipe library wrapping a charting library as `ed-r-bar-chart`, `ed-r-line-chart`, etc. |
| **Project-local integration** | Only one project needs this capability, or the integration is too experimental to upstream yet. Still follows Eddie conventions (tokens, a11y) but lives in the consumer project. | A video editor integration built for one specific app. |
| **Eddie core component** | Rare. Only when the capability is so fundamental and the integration so stable that it belongs in `eddie-web-components` itself. Must meet graduation criteria (§2.1.3). | Unlikely for most third-party libraries. |
| **Non-UI utility** | The library has no visual output — it's a data processing, computation, or infrastructure concern. Lives in the app's dependencies directly, no Eddie wrapping needed. | A video transcoding library, a PDF parser, a geospatial computation library. |

The default is **project-local integration** until reuse is proven. Promote to a category recipe library when a second project needs it.

#### The evaluation deliverable

When adopting a third-party library, document the decision during Phase 3 (or as a spec amendment if discovered mid-build). The deliverable is:

1. **Library name and version** — what you're adopting.
2. **Capability it provides** — what gap it fills that Eddie can't.
3. **Evaluation against criteria** — a brief pass/fail on each criterion above. Doesn't need to be a formal report, but the reasoning should be traceable.
4. **Integration home** — where the integration code will live and why.
5. **Eddie gaps surfaced** — any tokens, components, or recipes that need to be created or modified to support the integration. File these as Eddie issues per §9.4.1.
6. **Proof-of-concept** — for non-trivial integrations, a working spike showing Eddie token theming and a11y compliance before committing to the library for the full build.

#### Surfacing gaps back to Eddie

Third-party library integration is one of the richest sources of Eddie gaps. When wrapping a library:

- **Missing tokens?** The library needs a color or spacing value Eddie doesn't provide → file an upstream token gap issue.
- **Missing recipe patterns?** The library's output needs to compose with Eddie components in a way no recipe covers → file an upstream recipe request.
- **Missing component variants?** An Eddie component needs a new slot or prop to house the library's output → file an upstream feature request.

Every gap surfaced this way follows the dual-filing pattern in §9.4.1. The consumer-side issue tracks the local workaround; the upstream issue tracks the systemic fix.

### 2.1b "Primitive or app?" — where BFW packages live

§2.1.1 documents where a **recipe** lives (core / category / project-local), but some BFW packages are Eddie-adjacent without being clearly a recipe — e.g., eddie-diagrams, eddie-slides. When adding a new BFW package that doesn't fit neatly into tokens / web-components / recipes / brain, ask:

> **Does a host embed this, or open it?**

- **Embed** → it's a *primitive*. Lives in the Eddie monorepo as a category recipe package (§2.1.1).
- **Open** → it's an *application*. Lives in its own repo (BFW org, standard BFW process).

Signals a thing is actually an **application**:
- It has an authoring UI, editor chrome, or studio surface.
- It has its own routes / URLs / pages.
- It's a destination, not a component.
- A non-developer "uses" it, not a developer who "includes" it.

Signals a thing is actually a **primitive**:
- It ships as one or more web components consumers drop into HTML.
- It takes source data as props/attributes.
- Its public API is stable and narrow.
- It has no opinion about where or how it's mounted.

#### 2.1b.1 Data lives with consumers, never with primitives

A BFW primitive package **must not ship data**. Templates, example content, teaching material, strategy decks, system maps, now-os entries, content-brain entries — all belong in **consumer repos** (bf-brain, bf-eleventy, project repos) where the authors live and git history is a useful edit trail.

Primitives ship: components, source format schemas, layout engines, theming hooks, APIs.

Primitives do not ship: the author's diagrams, slides, or strategy content, or any business-, teaching-, or project-specific content.

If a primitive package tempts you to include "starter data" or "example content that's actually useful content," that's a signal the primitive and the data should separate.

#### 2.1b.2 When primitives are spiritually related, keep them separate packages

Two BFW primitives that feel close (e.g., eddie-diagrams and eddie-slides) should **not** be combined into one package just because they share a spiritual domain ("both are visual narrative"). Shared values don't imply shared package.

Keep them separate when:
- They're structurally different (one is page-scoped, the other is graph-scoped).
- They have independent release cadences.
- Combining one to serve the other would bend the primitive unhealthily.

Interop between them is achieved through **stable web component APIs**, not through shared internals. If `eddie-slides` wants to embed `eddie-diagrams`, it does so the same way any host does: with an `<ed-r-diagram>` element and a YAML source prop.

#### 2.1b.3 Recipe graduation still applies (§2.1.3)

Nothing here changes §2.1.3. A recipe still graduates from `eddie-recipes` to `eddie-web-components` on the same criteria. A category recipe package (eddie-diagrams, eddie-slides, a future eddie-charts) does not graduate to core — it stays a category package forever, or it gets peeled out when it turns out to be an app (in which case the embed-or-open test above settles the question).

**Precedent:** the eddie-diagrams research phase kept the `<ed-r-diagram>` primitive in the monorepo while peeling the studio surface (properties inspector, edit mode, presenter chrome) into a future `bf-diagram-studio` repo.

### 2.2 Design tokens only

- **Never** hardcode colors, spacing, type, radii, shadows, or any other design value.
- All values come from `@brad-frost-web/eddie-design-tokens` as CSS custom properties prefixed `--ed-*`.
- **Never** use a Google Fonts `<link>` tag. Fonts come from Eddie's token package (`fonts.scss`).
- If a value you need isn't in the token set, that's a token gap — flag it as a GitHub issue in the Eddie monorepo, don't hardcode around it.

### 2.3 Accessibility baseline

- Semantic HTML first. `<button>` for buttons, `<a>` for links, `<nav>` for navigation, headings in order.
- Every interactive element keyboard-reachable and keyboard-operable.
- Color contrast ≥ WCAG AA (4.5:1 for body text, 3:1 for large text and non-text).
- Every image has alt text (or `alt=""` if purely decorative and marked accordingly).
- ARIA only when HTML semantics don't cover the pattern. Never ARIA-first.
- Forms: labels for every input, error messages programmatically associated, focus management on state changes.
- Progressive enhancement: core functionality must work without JS.
- **Logical properties, never physical.** `margin-inline` / `padding-block` / `inset-inline` / `text-align: start|end` — not `margin-left`, not `text-align: right`. Eddie's own component and recipe stylesheets are clean of physical properties as of 0.56.0 (eddie [#1721](https://github.com/Brad-Frost-Web/eddie-design-system/issues/1721)), so under `dir="rtl"` the system mirrors correctly and **consumer CSS is the only thing left that can break it**. Nothing errors when you reach for a physical property; the page just fails to mirror. The one sanctioned exception is symmetric *centring* (`left: 50%` paired with `translateX(-50%)`), which lands off-centre if made logical — the inset flips under `dir="rtl"` and the transform doesn't. `ed-tooltip` is deliberately physical for exactly that reason, and its `--align-left` / `--align-right` variants are an intentionally physical API.

### 2.4 Icons

- Icons come from `@brad-frost-web/eddie-icons`. Don't inline random SVGs from the internet.

### 2.5 Use `eddie-brain` as the source of truth for Eddie

The **`eddie-brain` MCP server** is the authoritative, machine-readable catalog of everything in the Eddie Design System: components, tokens, recipes, relationships, and validation rules. Treat it as the first question you ask for anything Eddie-shaped. Don't guess what `ed-card`'s variants are — ask. Don't assume a token exists — look it up. Don't hand-roll a pattern — search for a recipe.

**Any agent session in a BFW project that touches Eddie must use `eddie-brain` before writing markup or making architectural decisions about Eddie components.** Empty or surprising results are themselves findings: they get filed as issues against `Brad-Frost-Web/eddie-design-system` per the dual-filing pattern in §9.4.

#### The tools

`eddie-brain` currently exposes **fifteen tools** in three families. (This list tracks the eddie-brain MCP surface in `Brad-Frost-Web/eddie-design-system`. When it drifts — a tool added, renamed, or removed — that's a finding: fix it here so consumers pick it up on `bfw-process sync`.)

**Catalog & lookup — the read surface you consult before building:**

| Tool | When to call it |
|---|---|
| `eddie_check_health` | **Start of every Eddie-touching session.** Returns totals for components, tokens, recipes, pages, themes, plus learning-loop stats. Make the numbers part of your working context — a system with few recipes has almost no canonical compositions, so expect to compose from primitives (and file issues for missing recipes). |
| `eddie_search` | Natural-language search across components, tokens, recipes, and boilerplates. First stop for "find me a thing for X". Results carry `category` (the functional family — Cards, Blocks, Forms, Navigation, Media, Charts, Tools, Global) and, for recipes, `projectScope` (`common` vs a product like `we-are-here` / `eddie-slides`) and `recipeKind`. Searching a family name ("cards") surfaces the whole family, so use it to check for an existing composition before rolling your own. Empty results mean either the thing doesn't exist, or the indexer missed it — both are upstream issues. |
| `eddie_list_pages` | List Eddie page templates (`ed-p-*`). Pages are full reference compositions — the recommended **starting point for any new page**. Call this *before* composing a page from primitives. `scope: "common"` (default) is framework-agnostic templates; `"all"` includes project-specific pages. |
| `eddie_get_component` | Look up a specific component by name (`ed-button`, `ed-card`, `ed-r-project-card`). Returns properties, slots, events, intent, guidelines, `canonicalUsage`, paths, plus a `usage` block joined from the activity ledger (which downstream products use the tag, how heavily, how recently). Read `usage` as evidence, not permission — `productCount: 0` carries a `note` saying real-world usage is **unknown, not zero**, since it only reflects what `@brad-frost-web/eddie-reporter` has reported. **Call this before writing any `<ed-*>` markup** so you know what props and slots the component actually supports. For an `ed-r-*` recipe the payload **leads with `agentGuidance`** (backed by a `recipeKind` of `composition` / `declarative` / `exception`) telling you *how* to work with it — read it first and follow it (§2.1.1). "Component not found" = file an upstream issue. |
| `eddie_get_token` | Look up a design token by name (`--ed-theme-color-background-default`, `--ed-spacing-md`). Returns value, tier, category, intent, and which components reference it. "Token not found" plus empty suggestions array = file an upstream issue. **The `usedBy` half requires eddie-brain ≥ 0.61.0** — before that the Brain never read component SCSS for `cssCustomProperties` and reported `[]` for **162 of 163 components**, so the component↔token reverse index was empty catalog-wide: `usedBy` answered "no components use this token" for every token in the system, and the same filter fed the token list on `eddie_get_component`. The `var()` regex also swallowed fallbacks, so a token named only inside `var(--a, var(--b))` went unrecorded (eddie [#1803](https://github.com/Brad-Frost-Web/eddie-design-system/issues/1803)). An empty `usedBy` from an older brain is not evidence a token is unused — it is the only answer it could give. |
| `eddie_get_relationships` | Find canonical composition recipes that involve a specific component. Shows what the component composes with. Empty result for a common component = upstream issue (missing `composesWith` metadata). |
| `eddie_compose_recipe` | Natural-language intent → suggested composition. Use for "I need to build a dashboard / a login form / an error state / a card grid". Irrelevant results = either the corpus is thin (common) or the ranker is broken (also possible) — either way, file an upstream issue. |

**Validate & learn — the guardrail loop around your code:**

| Tool | When to call it |
|---|---|
| `eddie_validate_file` | Validate one file against six validators: token usage, naming conventions, slot contracts, accessibility (placeholder / non-descriptive link text, missing `knockout` on dark bands), theme inheritance, and the spacing doctrine (a `margin` on `:host` or a component root is a hard error — §2.5a). Supported extensions are **`.scss` / `.css`, `.ts` / `.tsx` / `.js` / `.mjs` / `.jsx`, `.html`**, plus Style Dictionary token `.json` (theme-inheritance rule only). Anything else — a `.vue` SFC most commonly — is **refused with a reason rather than silently passing**: extract the `<template>` to a `.ts`/`.js` region or the `<style>` to `.scss` and validate those separately. **Run this before every commit that touches Eddie code** (Phase 4) and as part of the Phase 5 ship gate. **Requires eddie-brain ≥ 0.56.0 to be trustworthy on Lit files** — before that the template extractor tracked `${}` depth *per line*, so the nested `` html` `` inside `${items.map((item) => html`…`)}` read as the outer template closing. Template regions ended early, which reset the prose exemption mid-passage and **left every following line in the file unscanned** — Lit's most common idiom was silently exempt from template validation altogether (eddie [#1727](https://github.com/Brad-Frost-Web/eddie-design-system/issues/1727), fixed with a whole-file stack-based scanner). A clean result from an older brain is not evidence; re-validate on 0.56.0+. |
| `eddie_suggest_fix` | Given a validation issue type and file location, get a suggested fix. Use after `eddie_validate_file` flags a problem. If the suggestion is wrong or useless, reject it — this feeds the learning loop (`acceptanceRate`, `mostRejectedType`). |
| `eddie_record_feedback` | **Close the learning loop.** After you act on (or reject) an `eddie_suggest_fix` result, record what you did (`accepted` / `rejected` / `modified`) so the system learns which suggestion types are actually useful. A suggestion acted on but never recorded is feedback thrown away. |

**Adoption & activity — how Eddie is really being used across BFW (audit/analytics, not per-markup):**

| Tool | When to call it |
|---|---|
| `eddie_get_adoption` | Which repos in the `Brad-Frost-Web` org depend on Eddie (adoption vs coverage) and how far their declared versions have **drifted** from the latest published packages. No arg → org-wide snapshot; repo name → that repo's deps + drift detail. Use it when auditing an org-wide Eddie bump or checking whether a project is on stale foundations (§2.8). **This answers from a committed snapshot, not a live scan** — check its date before treating it as current. The scheduled refresh was scanning the org under the default `GITHUB_TOKEN`, which lists **public repos only**, so it saw 8 repos / 1 adopter against a committed 41 / 16 and would have written the smaller number silently; the snapshot had not moved since 2026-07-13. Fixed in 0.62.0 with a fine-grained PAT plus a **shrink guard** that refuses to write a snapshot whose repo or adopter count falls below half the previous one (eddie [#1832](https://github.com/Brad-Frost-Web/eddie-design-system/issues/1832)). The first honest snapshot since is 47 repos / 19 adopters — and **all 19 were drifted behind 0.61.0**, which is the §2.8 point measured rather than asserted. |
| `eddie_analyze_product` | Product-level coverage profile for a consumer: component coverage (Eddie vs bespoke), correct usage (invented slots / missing required children), token coverage (`var(--ed-*)` vs hardcoded, each mapped to its nearest token), override surface (`!important` / re-styled internals), and a 0–10 score. Pass a repo/file path, or raw `html`/`css`. The product-level companion to `eddie_get_adoption`. Run it as part of an Eddie-adoption audit. |
| `eddie_adoption_report` | The full adoption evidence bundle for a consumer product: everything `eddie_analyze_product` measures **plus** a pattern inventory — bespoke CSS-class families clustered from HTML *and* template sources (`njk`/`liquid`/`hbs`/`vue`/`jsx`/`tsx`/`svelte`/`astro`/`php`/`twig`), each classified as styled+used, dead CSS, or an orphaned hook, with instance counts, file lists, and CSS locations — and ranked Eddie candidates per family. Element coverage only sees `<my-widget>`; this also sees `<div class="notice">`, which is how most bespoke UI actually manifests. Same inputs as `eddie_analyze_product`. Reach for it when planning a migration or adoption push; the per-family Eddie candidates are **advisory** — verify each with `eddie_get_component` before writing markup against it. |
| `eddie_get_activity` | Real usage activity of Eddie assets across downstream products, aggregated from `eddie-reporter` client reports. No arg → org-wide usage + catalog assets never reported used (usage-weighted coverage gap); `product` → that product's roll-up; `component` → which products use a tag and how much. **Trust the hosted Brain's activity answers only from 0.63.0.** The ledger is bundled into the serverless `mcp` function at build time from `main` while the weekly flush lands on `develop`, so ds.bradfrost.com answered "no activity" for days after the first real beacon had been captured, flushed and merged — and before 0.62.0 the beacons were being dropped behind a `200` entirely, so the store the flush drains was empty for the six weeks bradfrost.com had been reporting (eddie [#1840](https://github.com/Brad-Frost-Web/eddie-design-system/issues/1840), [#1847](https://github.com/Brad-Frost-Web/eddie-design-system/issues/1847)). On 0.63.0 the flush publishes a snapshot blob the hosted function reads when it is fresher than the bundle, and **every activity answer now says where it came from** — `source: "blobs" \| "disk"`, `storeConsulted`, `storeReachable`, `snapshotFound`. Read those fields before drawing a conclusion. An empty ledger now answers `available: false` rather than keying on the file's existence. |
| `eddie_record_activity` | Record a usage report (from the `@brad-frost-web/eddie-reporter` client) into the activity ledger, keeping adoption a living feedback loop. Returns the product's updated roll-up. |

#### Always-on rules for eddie-brain usage

1. **Run `eddie_check_health` at the start of every Eddie-touching session.** Make the health summary part of your working context. It tells you how much to trust the recipe and page corpus before you start composing.
2. **Call `eddie_get_component` before writing markup for any component you haven't used in the last hour.** Not from memory, not from a grep, not from guessing — from the catalog.
3. **Call `eddie_get_token` before using any token whose name you didn't just see in the catalog.** Hardcoded fallbacks (`var(--ed-foo, #something)`) are a sign you skipped this step.
4. **Call `eddie_search` and `eddie_compose_recipe` before hand-rolling any pattern that looks like it should already exist** — live indicators, card grids, empty states, loading states, form groups, pagination, nav, etc. Zero results from both is a gap to file, not a license to roll your own. In BFW, the right response is "create a recipe in `eddie-recipes`" (or at least file an issue asking for one).
5. **Call `eddie_validate_file` before committing any file that touches Eddie.** Phase 4 build guardrails depend on it; Phase 5 ship gate depends on it.
6. **Start a new page from a page template, not a blank canvas.** Call `eddie_list_pages` before building any page and begin from the closest `ed-p-*` reference composition, dropping to primitives only for the gaps. Composing a whole page from scratch when a page template exists is the same mistake as hand-rolling a component.
7. **Close the learning loop.** After acting on an `eddie_suggest_fix` result, call `eddie_record_feedback` (`accepted` / `rejected` / `modified`). The suggestion quality metrics are only as good as the feedback fed back — skipping this silently degrades every future suggestion.
8. **Treat every "not found" / "empty" / "wrong" result as a finding.** File it upstream against `Brad-Frost-Web/eddie-design-system` using the `process-finding.md` template. This is how the Eddie corpus improves — through real usage surfacing real gaps.
9. **Never reach for a margin or a wrapper to fix spacing or width.** Both questions are already answered by doctrine — see §2.5a. Adding one is how a 100%-Eddie page still renders wrong.

#### When eddie-brain is unavailable

If the `eddie-brain` MCP server isn't running in the current session (e.g., a non-BFW agent harness without MCP configured), **stop and tell the human**. Do not proceed with Eddie work based on memory or inference. Either the agent harness needs to be reconfigured to connect eddie-brain, or the work needs to pause until a human can ground-truth what's in Eddie. BFW work without eddie-brain is guessing.

### 2.5a Spacing and containment are doctrine, not per-page decisions

§2.5 keeps you honest about *which* component to use. This keeps you honest about *how it sits on the page* — the two questions every consumer and every agent was re-deciding locally, and getting wrong in ways no validator caught. Both are now settled in `eddie-design-system` and enforced:

- **[`docs/SPACING.md`](https://github.com/Brad-Frost-Web/eddie-design-system/blob/main/docs/SPACING.md)** — who owns the space *between* things (eddie #1397, shipped in Eddie 0.53.0).
- **[`docs/LAYOUT.md`](https://github.com/Brad-Frost-Web/eddie-design-system/blob/main/docs/LAYOUT.md)** — who owns the *width* of things (eddie #1663, shipped in Eddie 0.54.0).

Read those for the full decision records. The four rules you need before writing markup:

1. **Components never margin their own host. Zero host margins, no allowlist.** A component doesn't know its context, so it can't know its spacing. The `eddie_validate_file` **MCP tool** treats a `margin` on `:host` or a component root as a **hard error**. Note the asymmetry: the `eddie-brain validate` **CLI** — what the `eddie-validate` PostToolUse hook shells out to — runs only four of the six validators and does *not* include the spacing check, despite a source comment claiming it mirrors the MCP tool. In a consumer project a green hook does not mean this rule held; call the MCP tool.
2. **Containers own rhythm.** `ed-main` spaces its sections, `ed-section`'s body and `ed-band`'s content space by the `block` role, `ed-card`'s body by `flow`; `ed-stack` and `ed-cluster` are the general-purpose rhythm owners for everything else. Space comes from putting content in a rhythm owner — never from stacking margin utilities on the children.
3. **Six role tokens name the gaps** — `--ed-theme-spacing-region` / `-section` / `-block` / `-flow` / `-field` / `-inline`. Ask for the *role*, not a size. When one instance genuinely needs something else, the escape hatches are the rhythm owner's own `flush` attribute (cancels its gap) and its `--ed-<component>-gap` custom property (`--ed-main-gap`, `--ed-section-gap`, `--ed-band-gap`, `--ed-footer-gap`, `--ed-stack-gap`, `--ed-cluster-gap`). Re-adding a margin is never the answer.
4. **Exactly one `ed-layout-container` sits on the path from the viewport to any contained content.** Zero is the edge-hugging bug; two is the double-padding bug. This is per-*path*, not per-page — a page may hold many containers as long as no path holds two. The container **wraps** the section, never the reverse, so a section's header and body share one column.

**Grep before you bump.** Eddie is pre-1.0 and these landed as minor releases (§2.8): 0.53.0 revoked component margins, and 0.54.0 made `ed-section`'s header **centered by default** (`align` is `'left' | 'center'`, default `'center'` — left-aligned sections now need an explicit `align="left"`). Neither errors on an un-migrated page; both change how it renders.

The doctrine follow-through kept that shape through 0.61.0 — every one of these re-renders an un-migrated page without erroring, and the last three are visible **everywhere**, not only where something was already wrong:

| Release | What re-renders | Escape hatch |
|---|---|---|
| 0.59.0 | `ed-media-block` spaced its media **twice** (`gap` + a slotted `margin-inline-end`), for 3rem default / 4rem reversed. Now one `gap` reading `--ed-theme-spacing-inline` (0.5rem) — **every instance tightens noticeably** (eddie [#1713](https://github.com/Brad-Frost-Web/eddie-design-system/issues/1713)). | `--ed-media-block-gap` |
| 0.60.0 | `ed-card variant="bare"` stopped painting a background it was never meant to paint — it reset border, padding, color and shadow but not `background`, so bare cards showed a filled panel on any non-surface page, including through every recipe composing it (eddie [#1456](https://github.com/Brad-Frost-Web/eddie-design-system/issues/1456)). | — (this one only removes a wrong surface) |
| 0.60.0 | `capLinelength` **was a silent no-op** and now actually caps at `68ch`; those passages were rendering full-bleed (eddie [#1624](https://github.com/Brad-Frost-Web/eddie-design-system/issues/1624)). Long `ed-button` labels and an over-wide `ed-primary-nav` now **wrap** instead of forcing horizontal overflow — both were WCAG 1.4.10 Reflow failures. | `--ed-l-linelength-width`; `--ed-button-white-space`; `--ed-primary-nav-wrap` |
| 0.61.0 | **Every form field in every product re-renders tighter** — label → control and control → note gaps shrink across all sizes. This deliberately spends the "`md` is byte-identical" guarantee (eddie [#1829](https://github.com/Brad-Frost-Web/eddie-design-system/issues/1829)). | — |
| 0.61.0 | `display-xl` headlines set on a **shorter line** — the `bfw` / `bfw-dark` line-height primitive behind the largest display step moves 202 → 158 (eddie [#1793](https://github.com/Brad-Frost-Web/eddie-design-system/issues/1793)). | — |

And 0.60.0 carried a **BREAKING** removal in the §2.8 mould: `ed-text-passage` drops `size="xs"`, which was a documented option no stylesheet ever consumed — so it had *already* been rendering as default, and the migration to `size="sm"` is type-level only (eddie [#1716](https://github.com/Brad-Frost-Web/eddie-design-system/issues/1716)). The lesson is the one §2.8 makes: the test asserted the class landed, nothing asserted anything consumed it, so a class-mapping test stood in for a styling test and the gap was invisible from the suite.

### 2.6 Component complexity discipline

Components grow one feature at a time and nobody notices the cliff. Use these thresholds as smell detectors — not hard lint rules, but signals that trigger a conversation:

| Signal | Threshold | Action |
|---|---|---|
| **Single-file length** | > 500 lines | **Review:** can any concern be extracted into a helper, mixin, or child component? |
| **Single-file length** | > 1,000 lines | **Flag:** file a `process-finding` issue. Decomposition plan required before further feature work on this component. |
| **Distinct responsibilities** | > 3 in one component | **Review:** a component that handles layout, data fetching, navigation, AND state management is doing too many jobs. Each of those is a candidate for extraction. |
| **Render method / template complexity** | > 100 lines or > 3 conditional branches at the top level | **Review:** consider extracting sub-templates or child components for readability. |

**What counts as a "distinct responsibility":** rendering/layout, data fetching/transformation, navigation/routing, state management, user input handling, animation/transition orchestration, external API coordination. If a component touches more than three of these, it's an orchestrator that should be delegating.

**The test:** Can you describe what this component does in one sentence without using "and"? If not, it's doing too many things.

These thresholds apply to all component types: Eddie core components, recipes, and application components in consumer projects. They apply regardless of framework — Lit, Nuxt/Vue, or plain Web Components.

**What to do when you hit the flag threshold:**

1. File a `process-finding` issue with the component name, line count, and a list of its distinct responsibilities.
2. Do not add new features to the component until a decomposition plan exists.
3. The decomposition plan can be as simple as "these 3 responsibilities become 3 child components" or as involved as "this component becomes a Nuxt page layout with composables." The plan lives on the issue.
4. Existing code continues to work — this is not a "stop everything" rule. It's a "stop growing" rule.

> **Working out what the decomposition should be, or applying these thresholds to non-UI code where they don't map?** [`methods/deep-modules.md`](https://github.com/Brad-Frost-Web/bfw-process/blob/main/methods/deep-modules.md) is the design method behind this rule: deep modules, seam placement, the deletion test, and how a module's dependencies decide where its tests go.

### 2.7 Migration discipline: rebuild the spirit, not the bugs

When adopting `bfw-process` into an existing codebase, or when rewriting/migrating a subsystem, the existing code is a **requirements document, not a template**.

1. **Read the existing code for intent, not for implementation.** What was the author trying to accomplish? That's what you rebuild. How they accomplished it — especially if it's buggy, fragile, or fighting the framework — is not a blueprint.
2. **Don't port bugs.** If the old auto-save dropped changes, the new auto-save doesn't get to drop changes. If the old implementation exposed API keys in the browser, the new one doesn't get to expose API keys. A migration that faithfully reproduces bugs defeats its own purpose.
3. **Don't port incomplete features.** If a feature was half-implemented, either implement it properly or cut it. Half-working code in a new architecture is worse than no code — it creates the illusion of functionality while hiding the gap.
4. **Don't port patterns that fight the new framework.** A 7,755-line Lit component that handles routing, state, persistence, and rendering is reasonable (if oversized) in vanilla Lit. Porting that structure into Nuxt — which has pages, composables, and server routes — would be architectural malpractice. Let the new framework's idioms guide the decomposition.
5. **Use the old code as a requirements document, not a template.** Read it to understand what features exist, what edge cases are handled, what the data model looks like. Then close the file and build it fresh.

### 2.8 Dependency freshness

Before starting work in any BFW project, check that Eddie packages are current:

```bash
npm outdated @brad-frost-web/eddie-design-tokens @brad-frost-web/eddie-web-components @brad-frost-web/eddie-recipes @brad-frost-web/eddie-icons
```

- All `@brad-frost-web/*` dependencies should be on the latest stable version.
- No pre-release versions (`-pre.0`, `-beta`, `-rc`) in production dependencies unless intentional and documented.
- **npm is the source of truth for "what shipped" — not git tags, not GitHub Releases.** Verify the latest versions are actually published on npm (`npm view <pkg> version`). The two failure modes are symmetric: a release that only exists in git is not available to consumers, and a release published to npm may have no matching tag or Release at all. Eddie 0.43.0 shipped to npm on 2026-08-05 with no `v0.43.0` tag pushed and GitHub Releases still showing v0.32.0 as "Latest" — an agent trusting either signal would have concluded Eddie was three releases behind where it actually was.
- **Read the CHANGELOG before bumping — Eddie is pre-1.0, so breaking changes land in the minor slot.** "Latest" does not mean "drop-in." Check `CHANGELOG.md` in `eddie-design-system` for a `### Changed — BREAKING` heading between your current version and the target, and grep the consumer for every affected tag before upgrading. Eddie 0.43.0 is the reference case: it removed `text`, `date`, `datetime`, `headingTagName`, the `eyebrow` slot, and `category` from `ed-timeline-node`, and renamed `ed-timeline`'s `behavior` to `arrangement`. Removed attributes go **inert rather than erroring**, so a consumer that upgrades without reading renders silently empty nodes — no build failure, no console warning. A breaking bump is its own scoped piece of work, not a housekeeping step folded into unrelated changes.
- If a package is behind, file an issue and update before building on stale foundations. Building features on top of outdated dependencies means porting forward problems that are already fixed upstream.

### 2.8a Run the dependency you pinned — never `npx` it

§2.8 is about depending on the right *version*. This is about actually running it.

**If a package is declared in `package.json`, never invoke it through `npx`.** Call the binary by name:

```jsonc
// ✗ npx resolves at runtime — from the network when node_modules is missing
"build": "npx @11ty/eleventy",

// ✓ resolves the pinned devDependency and nothing else
"build": "eleventy",
```

npm puts `node_modules/.bin` on PATH for every run-script, so a bare binary name finds the pinned dependency. `npx` looks like it does the same thing, and does — right up until `node_modules` isn't there, at which point it **silently downloads a different version from the registry and runs that**. No prompt, no warning, no line in the output saying the build you just ran isn't the build the lockfile describes.

For a declared dependency there is no case where npx wins. With dependencies installed it does exactly what the bare binary does; without them it does something worse than failing.

**Inside a script vs. from a terminal.** The bare-binary form works because npm puts `node_modules/.bin` on PATH — and it does that *for run-scripts only*. Type `eleventy` at a shell prompt and it won't resolve, which is exactly the moment reaching for `npx` feels justified. It isn't: bare `npx <declared-dep>` has the same silent-fetch hole in a terminal that it has in a script. Go through npm instead:

```bash
npm run build                  # best — the script is the interface
npx --no bfw-process sync      # direct: --no refuses to install
npm exec --no -- bfw-process sync   # same thing, spelled out
```

`--no` is what makes the direct form safe. It runs the pinned local copy or fails loudly; it never reaches for the registry.

**Why this is a rule and not a preference:**

- **Fresh `git worktree` checkouts don't get `node_modules`.** That's not a rare broken state — it's the default state of every new worktree, and BFW leans on worktrees heavily. Every one of them is a chance to run the wrong toolchain.
- **The symptom doesn't look like the cause.** It presents as *the build hanging* — minutes of no output while npx populates its cache. Nobody connects a hanging build to a script that has worked for a year. The finding that produced this rule cost 600 seconds of a stalled build before anyone looked at the script.
- **It's the same hole §2.8 and the bfw-process pin already close.** This repo pins itself in consumers precisely so that "every CI run re-resolved to the latest on npm" stops being true. A tool fetched at runtime is that problem wearing a different hat.

**Where `npx` is still right:** tools you deliberately *don't* declare as dependencies — `npx create-*`, one-off scaffolding, a throwaway utility you'll run once. Even there, pin what you fetch (`npx pkg@1.2.3`), or use `npx --no <pkg>`, which refuses to install rather than reaching for the network.

**The one-line test:** is it in `package.json`? Then never let `npx` fetch it — bare binary name inside scripts, `--no` if you're running it directly.

`bfw-process doctor` reports scripts that break this rule. It warns rather than rewriting — the script is yours; the diagnosis is the product.

### 2.9 Evaluate before adding to Eddie

Any proposed addition to the Eddie ecosystem — component, recipe, token, icon, or page — must pass a rigorous evaluation against the existing library before proceeding. This applies whether the work originates from new requirements, refactoring, or migration from another project.

The evaluation, in order:

1. **Search `eddie-brain`** — `eddie_search`, `eddie_get_component`, `eddie_get_token` — for existing components, tokens, and recipes that serve the same or overlapping purpose.
2. **Check for composition** — can the need be met by composing existing Eddie components? A dot with a robot SVG slotted into it is not a new component.
3. **Check for extension** — can an existing component gain a new variant, size, or slot to cover the gap? That's a smaller, better change than a new component.
4. **Only then propose a new addition** — and document why existing components, composition, and extension all fell short.

**The default answer to "should we add this?" is NO.** The burden of proof is on the addition, not on the refusal. Eddie's value comes from a curated, non-redundant library — not from a sprawling collection of overlapping components.

This is especially critical when migrating vibe-coded or legacy software into Eddie. Code written before Eddie existed (or before it was mature) will naturally have hand-rolled components that duplicate Eddie's capabilities. The migration path is to **map those components to Eddie**, not to **import them into Eddie**.

Checklist for any proposed Eddie addition (every box must be checked before the addition proceeds):

- [ ] Searched `eddie_search` for overlapping components — none found
- [ ] Searched `eddie_get_component` for an existing component that could serve this purpose — none found
- [ ] Searched `eddie_get_token` for existing tokens that cover the needed values — none found
- [ ] Evaluated whether composing existing components solves the need — it does not
- [ ] Evaluated whether extending an existing component (new variant, slot, prop) solves the need — it does not
- [ ] The proposed addition serves a genuinely new purpose not covered by the above

### 2.10 Agent skills are versioned artifacts — they live in the repo they document

Agent skills (Claude/Cowork `SKILL.md` packages, slash-command instructions, and any prose that teaches an AI assistant a repo's conventions) are **documentation with a blast radius**: a stale skill doesn't just mislead a reader, it actively generates wrong code at scale. Eddie's `eddie-web-developer` skill proved this — authored as a one-shot export, within three months it was teaching a CSS prefix that never existed, invented component props, deprecated APIs as current, and the wrong Git Flow branches (eddie-design-system#1314).

The rules:

1. **Canonical source lives in the repo it documents**, at `skills/<skill-name>/` (a `SKILL.md` plus optional `references/`), version-controlled and PR-reviewed like any other doc. A skill about Eddie lives in `eddie-design-system`; a skill about a consumer product lives in that product's repo.
2. **Installed copies are symlinks, never exports.** The skill directory installed into an agent harness (Cowork's skills dir, `~/.claude/skills/`, a plugin dir) is a symlink to the checked-out repo. Pulling the repo updates the skill; there is no copy step to forget. Each repo's `skills/README.md` documents the re-link command for fresh machines.

   **2a. Distribution mirrors are permitted; authored copies are not.** Rule 2 assumes the reader has the documenting repo checked out, and the most common team case is that they don't: a teammate who works on consumer products has never cloned `eddie-design-system`, and `bf-brain`, where the generated SOP skills live, is a repo most collaborators shouldn't have at all. Leaving that case with no compliant option is how the drift above starts again. So a team **may** publish read-only mirrors of skills to a shared repo ([`Brad-Frost-Web/bfw-skills`](https://github.com/Brad-Frost-Web/bfw-skills) is BFW's) so people without the documenting repo can install them. The mirror must be (a) machine-generated from the canonical source, never hand-authored; (b) refreshed automatically, failing loudly rather than silently skipping a source it can't read; (c) stamped per-file with the source repo, ref, and commit; and (d) documented from the canonical side, so anyone editing the skill knows the copy exists and anyone finding a bug in the copy is sent upstream. Point (d) is the one experience argues hardest for — a mirror invisible from the canonical side is where the small tweak in the wrong place happens. Rule 2 still governs the last hop: what lands in the agent's skills directory is a symlink into a checkout, never a copy. And a mirror is **not** a licence to relocate a canonical source, because it cannot carry rule 3's CI gate — the generated graph that check walks isn't there.

3. **Generated-artifact claims are CI-gated.** Any count or claim in skill prose that derives from a generated source of truth (component totals, token counts, tool rosters) is enforced by a docs-sync check that fails the build on drift. Reference implementation: `scripts/check-docs-sync.mjs` in `eddie-design-system`, which walks `skills/**/*.md` against the `.eddie-brain/` graph.
4. **Skills are part of definition-of-done.** A PR that changes a convention, slot contract, API naming rule, workflow, or canonical composition updates the affected skills **in the same PR** — the same rule as component documentation. "I'll update the skill later" is the drift mechanism this section exists to kill.
5. **Skills teach a Brain-first posture, not API surface.** Skill prose must direct agents to live catalog lookups (`eddie_get_component`, `eddie_get_token` — §2.5) rather than duplicating props and slots inline. Every API detail a skill hardcodes is a detail that can rot; every lookup it mandates is self-healing. Examples a skill does include must be verified against the live catalog at authoring time.
6. **Skills gate for judgement, not for ceremony.** A skill an agent cannot invoke breaks the chain: when the human has already delegated the decisions, stopping to ask them to type a command buys nothing and costs a round trip. Mark a skill human-invoke-only when the *gate itself* is the point — spending money, publishing, deploying, anything with the §7 owner-bypass shape. Everything else is model-invocable. Decide the flag deliberately when you author or review a skill; don't inherit it as a default and don't discover it mid-run.

When a skill contradicts the live catalog or the repo, **the catalog wins** — and the contradiction is a finding: fix the skill via PR, dual-filing per §9.4.1 if the root cause is upstream.

> **Writing or editing the prose itself?** This section says where agent-facing documents live and how they stay fresh; [`methods/writing-for-agents.md`](https://github.com/Brad-Frost-Web/bfw-process/blob/main/methods/writing-for-agents.md) is how to write them — context pointers and trigger wording, the context/cognitive load trade, progressive disclosure, completion criteria, leading words, and the pruning discipline that keeps rule 3's drift from re-accumulating.

### 2.10a Global agent settings are versioned artifacts too

§2.10 governs artifacts scoped to **a repo**. Some agent-facing configuration is scoped to **a person**: the profile/preferences document a chat surface loads, and the global `CLAUDE.md`/`AGENTS.md` that every session on a machine reads before it reads anything else. Same drift mechanism as a stale skill, wider blast radius — a wrong global rule mis-steers every session in every repo, including this one, and it does it silently because nobody diffs a textarea.

The rules:

1. **Global settings have an upstream repo, and the deployed copy is never the source.** For BFW that repo is [`bradfrost/claude-settings`](https://github.com/bradfrost/claude-settings): `settings.md` deploys to the claude.ai profile box, `claude-code-global.md` deploys to `~/.claude/CLAUDE.md`. What runs in the surface is a *deployment* of what's in the repo.
2. **Deployment is manual, deliberate, and recorded.** These files can't be symlinked the way §2.10 skills can — a preferences textarea has no filesystem. So the paste is a human step, and the deployment gets recorded with a content fingerprint (bf-brain's `deployed-surfaces.json`). Unrecorded means undetectable: without a recorded fingerprint there is no way to tell a current copy from a stale one, so the record is the whole mechanism, not bookkeeping.
3. **A build session never edits global settings in place.** Discovering mid-build that a global rule should change is normal; editing the machine-local file is not. That change is invisible, unversioned, and unreviewable, and it silently diverges every other machine. File it upstream and let the human carry it over the line — the same dual-filing reflex as §9.4.1, pointed at the settings repo instead of at Eddie or here.
4. **Global settings hold stable rules, not project state.** Anything that goes stale when a project finishes belongs in the project tracker or the brain, not in a document every future session pays context for. The narrower the global doc, the longer it stays true.

When a global setting contradicts a repo's `AGENTS.md`, **the repo wins** — global rules are defaults for work that has no repo to speak for it, and a repo that has spoken is more specific.

### 2.11 One component instance per story

**A component story renders one instance of the component it documents.** Variation lives *across* stories, not inside one canvas.

This applies to any BFW repo that ships a component workbench — Storybook or otherwise. A story that stands four sizes side by side under one export reads fine as a spec sheet and is wrong as a story:

- **Testing.** A story is the testable unit: one smoke test, one screenshot, one interaction target. A four-up story gives one assertion covering four things and a visual diff that can't say which one moved. Play functions end up disambiguating targets that shouldn't need disambiguating.
- **Machine readability.** Design-system MCP servers lift canonical usage from the `Default` story and hand it to agents to copy (§2.5). A multi-instance story teaches agents to emit the *scaffolding* — headings, wrapper divs, sibling copies — as if it were part of the component.
- **Addressability.** One story is one URL. "See the large size" should be a link, not "third one down".

Scope by asset kind:

| Kind | Rule |
|---|---|
| **Component** | One instance per story. Variation across stories. |
| **Recipe** | One instance per story. A composition recipe's `Default` story is the composition skeleton — that is still one instance. |
| **Page** | One page instance per story. A page composes many components by definition, and that's the page's business. |

Two sanctioned exceptions:

1. **Variance in the children of one parent instance.** One parent with many differently-configured subcomponents (a single timeline whose nodes each take a different variant) is the clearest way to document a child-level prop. Not a violation.
2. **A composed page-section showpiece.** A story documenting a *page section* rather than a component may stand several instances up. The story's doc comment must say that's what it is.

Splitting a multi-instance story is cheap; the drift it prevents is not. When you find one, split it — and if the root cause is an upstream authoring convention, dual-file per §9.4.1.

### 2.12 Progressive enhancement: new components are HTML Web Components

The §2.3 bullet — core functionality must work without JS — gets its own rule for component authoring because client-rendered web components fail it silently: a component whose content lives in JavaScript renders **nothing** until JS loads. See [Let's talk about web components](https://bradfrost.com/blog/post/lets-talk-about-web-components/).

**New components — especially content primitives (images, figures, media, text) — are authored as [HTML Web Components](https://adactio.com/journal/20618): the real content is plain light-DOM HTML, and the custom element enhances it in place.** The markup must render meaningfully before, and without, JavaScript.

```html
<!-- ✅ The image renders without JS; the component enhances it -->
<ed-image aspectRatio="16/9">
  <img src="/art.jpg" alt="Course artwork" width="800" height="450" />
</ed-image>

<!-- ❌ Renders nothing until JS executes -->
<ed-image imgSrc="/art.jpg" imgAlt="Course artwork"></ed-image>
```

- **Content and semantics stay native.** `src`, `alt`, `href`, `loading`, text content, and semantic structure (`<figure>`/`<figcaption>`, `<ul>`/`<li>`) are authored as real HTML, not mirrored into component props. The component adds only what the platform can't: design-system styling, variants, behavior.
- **Degradation is a design decision.** Without JS the content must be present and readable; enhancement (cropping, chrome, interactivity) may be absent. Document the no-JS experience.
- **Interactive/form components are a different trade-off** — they may legitimately require JS, but their triggering and fallback content should still be light-DOM HTML where feasible.
- **Existing shadow-DOM components migrate opportunistically, not wholesale.** But shipping a *new* content primitive with a props-only, JS-required API is a review blocker.

In Eddie this pattern is implemented via `EdElement`'s enhance mode (`enhanceLightDom()`, issue #813); `ed-image` and `ed-figure` are the reference implementations. Consumer projects inherit the benefit automatically — server-rendered pages show their content even before (or without) the Eddie bundle.

### 2.13 Verify against the real thing at least once

Principle 5 says tests ship with the code. This says what at least one of those tests has to be.

**If a module shells out to an external binary — `git`, `gh`, `npm`, a CLI, a daemon — at least one test must execute that binary for real**, against a throwaway fixture. Fakes are correct and preferred for testing *decisions*; they can never test *the command line*. The rule in one sentence: **a seam that fakes an external process must be accompanied by at least one test that does not.**

Why this earns a rule rather than a preference: `bf-brain` carried ~1,870 tests and **not one had ever executed a git command**. Every git operation was faked by matching the argument array and returning canned output — which asserts *the command we meant to send*, never whether the command works. Both of that lane's worst production failures were the invocation itself being wrong: a branch pushed from a worktree, so publishing depended on the worktree surviving (it didn't, twice, and sound commits were stranded), and a worktree placed where the OS reaped it mid-run. Argv-matching cannot see either failure, because argv-matching is the assumption under test. When a real-git test was finally added it found two bugs in its first two runs, one of them a live hole in a security fence that had been open for weeks.

How to write it so it stays honest:

- **It lives in the default suite.** The reference case is four tests, 1.6 seconds, no network, cleaning up after itself — cheap enough that there is no argument for hiding it. A test behind a flag is a test nobody runs, and an unrun test verifies nothing.
- **It runs against a throwaway fixture, never the working checkout.** Create a temp directory, initialize it, assert, delete it in teardown. A test that touches the repo it's running in is a different kind of hazard (§9.5.10).
- **One is the floor, not the target.** Cover the invocations whose *shape* carries risk — the ones with flags, paths, `--` separators, or an explicit working directory — not every call site.
- **It does not replace the fakes.** Keep faking decisions, branches, and error paths. The real-thing test exists to prove the argument vector is one the binary actually accepts, and that its effect is the effect you meant.

> **Deciding *what* to test rather than how to write the assertion?** [`methods/test-quality.md`](https://github.com/Brad-Frost-Web/bfw-process/blob/main/methods/test-quality.md) is the reference: what makes a test worth keeping, where seams go and when they're agreed, the four anti-patterns (implementation-coupled, tautological, horizontal slicing, argv-matching-as-proof), where mocking stops, and this rule and §2.14's in their full form.

### 2.13a Verification means naming what ran

**Exit code 0 is not evidence.** It says a command finished, not that the checks you believe in executed. A suite can be filtered out, misconfigured, renamed, or silently unavailable and still leave a green summary behind — and the green actively suppresses the scrutiny that would have caught it. An inert gate is worse than an absent one: it doesn't just miss the bug, it manufactures the confidence that stops anyone from looking.

- **When you report checks as passing, name what ran** — which suites or projects, and how many tests. "All tests pass" is not a report. "142 tests across the unit and a11y projects; the storybook project did not run" is.
- **A configured suite that did not run is a finding, not a footnote.** Say so explicitly and file it. It's a red flag about the gate, not a detail about the run.
- **When you run checks locally to predict CI, run what CI runs** — read the workflow, not the job name. If you can't cover part of it, name the gap rather than reporting a clean bill of health.
- **A CI job's name and its comments are claims.** A job named for suites its commands never invoke is a defect worth filing (§9), dual-filed per §9.4.1 when the root cause is upstream. Comparing a job's name against its script is a minute of work, not a project.

This applies in every mode and on every branch. A false green in a prototype is exactly as expensive as one in production — more so, because it ships later with more built on top of it.

**Worked example:** `eddie-design-system`'s CI job `Test (unit + storybook + a11y)` ran `vitest run --project unit`. The storybook and a11y projects had never executed, and the workflow carried a comment asserting that axe-core violations fail the job. They did not. A real WCAG violation sat on `develop` undetected as a result ([eddie-design-system#1432](https://github.com/Brad-Frost-Web/eddie-design-system/issues/1432), [#1433](https://github.com/Brad-Frost-Web/eddie-design-system/issues/1433)).

### 2.14 A safety flag needs a layer to land at

When a flag means *"plan everything, perform nothing"* — `--dry-run`, `--check`, `--no-write`, observe mode — it must be **threaded all the way to the layer that performs the effects**, and a test must assert **zero effects** with the flag set and every grant, credential, and permission live.

`bf-brain`'s `--dry-run` suppressed two filings and nothing else. With the autonomy grant live it still created worktrees, installed dependencies, spawned agent sessions, spent real money, pushed branches, and opened pull requests. The cause was structural rather than an oversight: the flag was never handed to the layer below, and that layer had no field to receive it — **the effects had no off switch to be flipped.**

- **Name the performing layer before adding the flag.** Which function actually spawns, writes, pushes, deletes, or charges? If the flag doesn't reach that function's signature, the flag is decoration.
- **Test the whole run, not the entry point.** With the flag set and permissions granted: no files written, no processes spawned, no network mutations, no money spent. Assert against the effect layer, not against what the CLI printed.
- **A dry run that reports an action it did not take is a second bug.** The same run printed `filed: 3 new court proposal(s)` having filed nothing. Report the plan as a plan — `would file 3 …` — so the output can't be mistaken for a receipt.

### 2.15 Absorbed methods: connected to upstream, never dependent

BFW absorbs good ideas from third-party skill packs and practices — it **never depends on them**. No phase gate, checklist, or rule may require a third-party plugin, marketplace install, or any harness-specific mechanism. Absorbed ideas are rewritten as harness-neutral prose in the canonical repo's [`methods/` directory](https://github.com/Brad-Frost-Web/bfw-process/tree/main/methods) (canonical repo only; not synced to consumers), and reached from this file by pointer.

Absorption without provenance is a silent fork: the upstream keeps moving and nobody notices. So every absorbed item — full method file or a paragraph woven into this document — has an entry in `methods/UPSTREAM.md`, the **authoritative** manifest: source, upstream version, faithfulness (`verbatim | adapted | inspired`), last review date, and — load-bearing — the list of **deliberate divergences**, which is what stops a refresh pass from silently re-adopting an upstream change BFW rejected on purpose. `bfw-process doctor` reports (never fails) when the installed upstream is newer than what the manifest records, falling back to a 180-day review-staleness warning where no upstream is installed. The review pass is `methods/upstream-review.md`.

When an absorbed method conflicts with this document, **this document wins** — the same shape as §2.10's "the catalog wins." The conflict is a finding: fix the method or propose the rule change via PR, never both silently.


### 2.16 Cold start: pull the rules when the harness didn't push them

Every rule in this document assumes you have read it. That assumption holds
when a harness injects `AGENTS.md` into the session automatically, and fails
*silently* when it doesn't — a cloud-started session can begin work having read
neither this file nor `CLAUDE.md`, and nothing in the transcript, the PR, or CI
says so. Everything downstream — the spec gate, §8, the ship gate — assumes an
agent that oriented.

**If you are not certain the rules were loaded for you, fetch them:**

```bash
bfw-process rules          # mode, branch, lane, gates, spec status, the §2 rules
bfw-process rules --json   # same bundle, machine-readable
```

If the rules can only be honoured when a harness happens to inject them, then
any harness that doesn't inject them is outside the process. `rules` is the
pull, and it works on any surface.

It prints the rules; it does not certify that you read them, and nothing else
does either — a marker an unoriented agent can type would certify exactly the
thing it claims to measure (#170). Reading this file in full is still the job.

### 2.17 Sessions end definitively — land it or park it

Every session ends in one of two states: **done** — the requested work is complete and verified — or **parked** — what remains is filed, and the close-out links it. Nothing ends "open".

1. **The task that started the session is the task that ends it.** Close on the work, not on an offer: no unsolicited next steps, no "I could also…", no "want me to…?". A trailing hook isn't helpfulness, it's a variable-reward loop — it keeps a human at the keyboard past the point they meant to stop, and it does that whether or not the suggestion is any good.
2. **Loose ends are filed, not dangled.** Anything surfaced along the way that isn't this task's work becomes an issue in the affected repo (§9, §8.4) — sanitised per §9.1a where the tracker is public, or filed in the private channel that owns it where no public-safe form exists — dual-filed per §9.4.1 when the cause is upstream, then dropped from the conversation. **Filing is the follow-up.** Not worth filing is not worth mentioning.
3. **A blocker is a question, not a loose end.** Don't file around a decision only the human can make: ask, and the answer finishes the task (§1 principle 7, §10).
4. **The close-out stands on its own.** Say what was done and verified, naming what ran (§2.13a); what was filed, and where; and what the human has to do to finish or deploy it. Someone who wasn't in the session should be able to follow it from the links alone.

The rule binds in every mode, on every branch, and in every harness: what a close-out *looks* like is the harness's business, the two states are not. The same contract is the personal-scope default in `claude-settings` (§2.10a) — this file is what binds inside a BFW repo, and on any conflict between the two the repo wins (#164).

---

## 3. Default stack

Start here unless the `SPEC.md` in this repo says otherwise. Deviations must be documented.

| Layer | Default |
|---|---|
| UI components | Eddie Design System (`@brad-frost-web/eddie-web-components`) |
| Product-specific UI | Eddie Recipes (`@brad-frost-web/eddie-recipes`) |
| Design tokens | `@brad-frost-web/eddie-design-tokens` |
| Icons | `@brad-frost-web/eddie-icons` |
| Content / CMS sites | Eleventy (11ty) |
| Apps (auth / state / realtime) | Nuxt |
| Database (when persistence is needed) | Postgres + Prisma (reference implementation: `we-are-here`) |
| Scripts / automation | Vanilla Node.js or Python |
| Hosting | Netlify |
| Languages | Vanilla HTML + CSS + JS; no framework unless justified |
| Version control | GitHub (`Brad-Frost-Web` org) |
| Accessibility target | WCAG 2.1 AA |

### Nuxt escalation signals

Only reach for Nuxt when at least one of these applies:

- Authentication or user sessions
- Heavy client-side state management
- Deep database integration
- Real-time features or complex API orchestration

If **none** of these apply, the answer is **Eleventy + Eddie**. "Future-proofing" is not a Nuxt signal.

### Database default: Postgres + Prisma

When a project's spec indicates durable persistence (usually a Nuxt app), the default stack is **Postgres + Prisma**. Don't re-litigate this per project. The canonical reference implementation is **`we-are-here`**, which has solved the boring parts:

- Schema modeling (`prisma/schema.prisma`)
- Migrations (`prisma/migrations/`)
- Generated client output (`generated/prisma`)
- Seeding (`prisma/seed.ts`)
- Nuxt server integration (`server/`)

New projects that persist data should match this structure rather than inventing their own layout. Anything else (SQLite for a truly local single-user tool, a hosted BaaS, etc.) is a deviation — justify it in the spec and document it in `README.md` per §1.6.

### Project scripts: `npm start` is the front door

Every BFW project with a browsable surface answers to the same muscle-memory command:

```bash
npm start   # → local development server, ready to open
```

- **Content/CMS (Eleventy)** → `start` runs `eleventy --serve`
- **App (Nuxt)** → `start` runs `nuxt dev`
- **Script/automation with a web surface** → `start` runs the project's server CLI (use a `prestart` build step when the project compiles, e.g. TypeScript → `dist/`)
- **Script/automation with no web surface** → no `start` script; `npm start` failing loudly is correct

Rules:

1. **Don't invent alternative front doors.** No bespoke `dev`, `serve`, `court:web`, etc. as the *primary* way in — aliases may exist, but `npm start` must work. A human (or agent) landing in any BFW repo should never have to read `package.json` to find the dev server.
2. **Don't repurpose `start` for a non-server process** (e.g., an MCP stdio server). Give that an explicit name (`mcp:stdio`) and keep `start` for the browsable surface.
3. **Host discipline:** local dev servers bind `127.0.0.1` (never `0.0.0.0`) unless the project documents why.

`bfw-process init` scaffolds the `start` script per project type (only if missing), and `bfw-process doctor` flags browsable projects where it's absent.

---

## 4. The Six Phases

BFW software moves through six phases. Each phase has an output. Phase transitions are **soft gates** (you read the checklist and self-verify) except for **Phase 5 → Phase 6**, which is a **hard gate** enforced by `npm run bfw:ship` (which runs `bfw-process verify-phase ship` via the project's pinned devDependency).

| # | Phase | Output | Gate |
|---|---|---|---|
| 1 | Understand & Scope | Confirmed project type, scope, clarifying decisions | soft |
| 2 | Specification | `FEATURE-SPEC.md` with `status: approved` (when §4.3 applies) | soft (but required) |
| 3 | Architecture & Planning | Ordered task list, component inventory, new recipes list | soft |
| 4 | Build | Working code, tests alongside, two-axis review run (§8.1) | soft |
| 5 | Test & Verify | Checklist passed (`verify-phase ship`) | **HARD** |
| 6 | Ship & Document | Deployed, docs updated, follow-ups captured | soft |

Full details of each phase live in `.bfw-process/phases/` in the consumer project (or `phases/` in this canonical repo). The Phase 5 → 6 hard gate is implemented by `bfw-process verify-phase ship`, exposed in every scaffolded project as `npm run bfw:ship` (pinned via `devDependencies`). See §7 for bypass policy.

### 4.1 Two specs, two jobs

BFW projects carry **two** specification documents. They answer different questions, live for different lengths of time, and must never be mistaken for each other.

| | **`SPEC.md`** — the project spec | **`FEATURE-SPEC.md`** — the feature spec |
|---|---|---|
| Answers | What is this project, and what is it for? Its crux, goals, constraints. | What is this branch doing, and what does done look like? |
| Lives | At the repo root, **permanently**. Survives every merge. | At the repo root, **on one branch only**. Deleted when it merges. |
| Changes | Rarely, and deliberately, via its `amendments` log. | Once per meaningful unit of work. |
| Gates | Nothing per-branch. It's context, not authorisation. | Phase 2 → Phase 3 on its branch (§4.2). |

One document cannot do both jobs. A project spec that gets deleted takes with it the only answer to "what is this thing for." A project spec pressed into service as a work order misleads whoever reads it next into planning against the wrong scope — which is precisely what happened during the eddie-slides extraction, where an agent read a broad project spec and conflated the extraction with a Nuxt rewrite.

Both are hand-owned. **`bfw-process sync` never creates, modifies, or deletes either one.**

### 4.2 The feature-spec gate (Phase 2 → Phase 3)

In **Full mode**, for work meeting the threshold in §4.3, you **must not** begin implementation until `FEATURE-SPEC.md` exists on the branch with `status: approved` in its frontmatter. If it says `draft`, stop and wait for a human. If it's missing, your first job is to write it from `.bfw-process/templates/FEATURE-SPEC.md`.

**An approved project spec does not satisfy this gate.** `SPEC.md` being `approved` says the project is described; it says nothing about whether *this branch's* work has been agreed. Reading it as authorisation is the failure this split exists to prevent.

If the spec is ambiguous on a decision, ask — don't guess. If it changes after Phase 4 has begun, record the change in the `amendments` array.

**Feature-spec lifecycle:**

- **Scoped to one unit of work.** It describes the work on this branch — not the project, and not the whole initiative the branch belongs to.
- **Opens with an Origin section** — one paragraph of breadcrumbs linking the parent initiative, prior specs, or issues, ending with an explicit scope statement. Historical context without carrying stale requirements forward:

  ```markdown
  ## Origin

  This work was initiated as part of [brief description of parent initiative].
  See [links to parent issues, prior specs, or related branches] for historical context.
  The scope of THIS spec is limited to [specific deliverables on this branch].
  ```

- **Carries `issue` and `branch` in its frontmatter.** These are what let a reader — or, later, tooling — tell whether the spec in front of them describes the branch they're standing on.
- **Deleted when the branch merges to the integration branch** (`main` on trunk repos, `develop` on gitflow repos — §9.5), **in the merge commit** — or immediately after it, since a squash or a merge-button merge carries only what the branch already held. **Not earlier.** The spec has to survive to PR time, because it is the yardstick: it is what a reviewer, and any gate grading the work, read the diff against. Delete it in an implementation commit and the reviewer is left comparing the code to the issue body the spec was written to supersede. Once merged it has served its purpose; the merged code, the commit history, and the closed issue are the durable artifacts. **A feature spec that reaches the integration branch is a bug.**
- **When in doubt, delete.** A spec describing shipped or superseded work actively misleads. Flag it; don't plan against it.

**The project spec's lifecycle** is the opposite, and simpler: written once at project setup, amended deliberately when what the project *is* changes, never deleted. Amendments go in the `amendments` array with a date, author, and summary.

### 4.3 When a feature spec is required

The friction is the point for meaningful work — agreeing on shape before code exists is far cheaper than arguing about it afterward. But a rule demanding a spec for a typo fix gets routed around, and a rule that gets routed around takes the rest of the discipline with it.

| Feature spec **required** | **No** feature spec |
|---|---|
| New user-visible capability | Single-cause bug fix |
| Changes an established convention or a public API | Dependency bump |
| Spans more than a couple of subsystems | Documentation correction |
| "What should this do?" has more than one defensible answer | The issue body already fully specifies the work |

**The tell:** *if you'd want to argue about the approach after seeing the diff, it needed a spec first.*

Driven by **size and ambiguity, not by branch prefix**. `fix/*` is not automatically exempt: some fixes are architectural, and some features are trivial. When a change sits on the line, write the spec — it's cheaper than the rework.

This threshold is a starting position and is expected to move as projects live with it. If it's producing specs nobody reads, or waving through work that needed one, that's a finding — file it against `bfw-process`.

---

## 5. Modes and design branches

BFW projects have two operational modes (Full and Quick) plus a special branch type (design branches) that runs under exploration rules regardless of the project mode. The project mode lives in `.bfw-process/config.json` under the `mode` key.

### 5.1 Full mode (`mode: "full"`)

The default. The six-phase gauntlet is in effect. Spec before build. Phase gates respected. Ship-readiness checks enforced. Tests alongside code. Documentation at the end.

### 5.2 Quick mode (`mode: "quick"`)

For teaching, demos, live-coding, podcasts, and prototypes where **speed and immediacy matter more than rigor**. In Quick mode:

- **No phase gates.** Move directly to building.
- **`FEATURE-SPEC.md` is optional.** Don't write one unless explicitly asked. (The project's `SPEC.md` is unaffected by mode — it describes the project, not the work.)
- **No Phase 5 checklist.** No automated a11y audits, no Lighthouse gate, no ship-readiness verification.
- **No documentation phase.** Skip the Phase 6 doc work unless asked.
- **But §2 rules stay on.** Eddie-first, design tokens only, the a11y baseline, and verification honesty (§2.13) are **not** relaxed. The first three are muscle memory and they're cheap — a quick demo in BFW still looks like BFW. The fourth is here precisely *because* Quick mode skips Phase 5: with no gate to lean on, "tests pass" is the only signal anyone gets, so it had better name what ran.

Quick mode is for situations where interrupting the flow to write a spec would destroy the value of the moment (e.g., live on a podcast, answering a student's question in real time, sketching an idea before it evaporates).

### 5.3 Design branches

A **design branch** is a branch type, not a project mode. Where Quick mode is the project-wide "skip the rules" setting for teaching and demos, a design branch is a *branch-local* exploration space inside an otherwise rigorous Full-mode project. It's the first half of the double diamond: divergent, sketch-first, "what could this even be?" Feature branches are the second half: convergent, "let's build it for real."

Design branches are named `design/<N>-<slug>` (where `<N>` is the issue number — see §9.5.2), branched from the integration branch (`main` on trunk repos, `develop` on gitflow repos — §9.5), and **never merge back**. When the exploration matures, the branch is *promoted* into one or more `feature/*` branches via `bfw-process design promote` (see below). The design branch itself is archived as a git tag for historical reference and is not part of the production line.

**On a design branch, regardless of project mode:**

- **No phase gates.** Same as Quick mode — move directly to sketching.
- **`FEATURE-SPEC.md` is not generated until promotion.** Don't write one preemptively. Don't nag.
- **No Phase 5 ship gate.** `npm run bfw:ship` on a design branch must refuse to run, with a clear pointer to `bfw-process design promote`.
- **Eddie-first is still the default.** Reach for `ed-*` components, `--ed-*` tokens, and existing recipes first, just like on any other branch.
- **a11y baseline stays on.** Semantic HTML, keyboard reach, contrast, alt text — always. Non-negotiable on every branch.
- **Eddie discipline can be relaxed *per line of work* when the human invites exploration.** If the human says something that signals exploratory intent — examples: *"don't use Eddie here,"* *"color outside the lines,"* *"dream up a new theme,"* *"sketch this fresh,"* *"create something new and weird,"* *"let me see what's possible"* — the agent confirms with one short question and then operates under the confirmed mode for that line of work. The canonical confirming question is: **"Do you want to use Eddie, or color outside the lines?"** Do not invent multi-step ceremonies; one yes/no question is the entire protocol.
- **The license is conversational, per line of work, and revocable.** It does not extend across sessions silently. If the next session starts and the human hasn't reinvited exploration, the default is back on. If the human later says "okay, let's bring this back to Eddie," tighten back up immediately.
- **"Let 'er rip" is NOT an exploration trigger.** It can mean other things (e.g., "go, stop asking questions"). Only treat phrases that explicitly signal *bypassing Eddie or token discipline* as exploration triggers. When in doubt, ask.

**What a design branch is for, in one sentence: a prototype is throwaway code that answers a question.** Name the question before you start sketching — "does this state model feel right?" and "what should this look like?" produce very different artifacts, and getting it wrong wastes the whole exploration. Then build accordingly: throwaway from day one and marked as such, trivial to run, no persistence unless persistence *is* the question, no tests or error handling beyond what makes it runnable, and the relevant state surfaced after every action so a human can see what changed.

The counterpart is capture. When the question is answered, the **validated decision** folds into the real code via promotion (`bfw-process design promote`), and the sketch itself survives only as the archived design tag — which is exactly what that tag is for. Record the verdict *and the question it settled* on the promoted issue; a prototype whose answer was never written down has to be built again.

**Promotion (`bfw-process design promote`):**

When the exploration is ready to become real work, the agent (or human) runs `bfw-process design promote` on the design branch. The command:

1. Validates that the current branch matches `design/*`.
2. Tags `archive/design-<N>-<slug>` and pushes the tag — the design branch tip becomes a permanent reference artifact.
3. Generates a draft `FEATURE-SPEC.md` from the working tree, pre-filled with what it can infer from the exploration.
4. **Drafts** a cohort of GitHub Issues representing every deviation surfaced during exploration: hand-rolled patterns become `recipe-request.md` issues; hardcoded values become token-gap issues against `eddie-design-system`; missing Eddie components become upstream issues — all dual-filed per §9.4.1, all cross-referenced back to the archive tag.
5. **Shows the human a summary and asks for confirmation before filing anything.** Auto-filing the entire cohort without human review would spam the tracker — the human stays in the loop as the gatekeeper.
6. On confirm: writes the draft `FEATURE-SPEC.md`, pushes the archive tag, files the issue cohort, and records a `SPEC.md` amendment naming the cohort (mirroring §9.4.3).
7. Stops. Waits for the human to approve the draft `FEATURE-SPEC.md` (Phase 2 gate).
8. Once approved, work splits into one or more `feature/<N>-*` branches **built fresh from the integration branch** (`main` on trunk repos, `develop` on gitflow repos — §9.5), using the archived design branch as a requirements doc per §2.7 ("rebuild the spirit, not the bugs"). The design branch is never merged into the integration branch.

**What design branches are NOT:**

- Not a way to ship code that bypassed the ship gate.
- Not a permanent home for prototypes that should have become features (the promotion step is the cleanup boundary — use it).
- Not an excuse to abandon a11y or to write inaccessible markup "just for now."
- Not a way to avoid filing issues — the promotion step is *more* issue-filing than a feature branch, not less.

### 5.4 Promoting Quick → Full ("do it for real now")

If a human says any of the following in a session — **"do it for real now"**, **"let's do this for real"**, **"promote to full"**, **"run the gauntlet"** — or if `.bfw-process/config.json` flips from `quick` to `full`, you enter promotion mode:

1. **Do not delete or rewrite the quick-mode code.** It's the starting point.
2. **Generate a `FEATURE-SPEC.md`** from the current state of the working directory. Treat the existing code as the implicit spec. Fill in the template. Set `status: draft`.
3. **Stop and wait for approval.** Do not proceed to Phase 3 until a human promotes the spec to `status: approved`.
4. **Once approved, run Phase 3 retroactively.** Break the existing code into tasks, identify any Eddie gaps, identify any recipe work that snuck in as one-off code and needs to be extracted, flag any deviations from the default stack for documentation.
5. **Run Phase 4 as refinement.** Fill in missing tests, replace any one-off UI with Eddie components or new recipes, add missing a11y affordances, fix token violations.
6. **Run Phase 5 normally.** The hard gate applies in full force.
7. **Phase 6 as usual.**

The user can also flip modes deterministically via the CLI:

```bash
bfw-process mode full   # promote
bfw-process mode quick  # demote
```

If there is any ambiguity about whether a "do it for real" phrase is an actual mode switch or just a figure of speech, **ask**. This is a consequential decision.

---

## 6. Deciding project type (Phase 1)

Four possible project types. Pick one at the start:

- **Content / CMS site** → Eleventy + Eddie + Netlify. Most BFW projects land here.
- **App with auth, state, or real-time** → Nuxt + Eddie + Netlify. Must match at least one Nuxt escalation signal from §3.
- **Component or recipe** → Eddie monorepo work only. Do not create a consumer project for this.
- **Script or automation** → Vanilla Node.js or Python. No UI framework. Skip most of the UI-centric rules.

If the project type isn't obvious from the brief, **ask**.

> **The brief is thin, or "what should this do?" has more than one defensible answer (§4.3)?** Don't scope it by guessing and don't ask one question at a time. [`methods/grilling.md`](https://github.com/Brad-Frost-Web/bfw-process/blob/main/methods/grilling.md) is the interview method: map the work as a design tree, ask the whole settled frontier in one round with a recommended answer per question, and treat fact-finding as your job rather than the human's. It ends where Phase 2 begins — settled decisions become the `FEATURE-SPEC.md` body, unsettled ones its §10.

### 6.1 Scoping improvement work — read the log before the code

Phase 1 assumes a brief. Sometimes there isn't one: the task is *"improve this codebase"*, *"harden this lane"*, *"pay down some debt here"*. Intuition is a poor way to pick the target, because intuition reaches for the code you remember rather than the code that hurts.

**When the task is improvement rather than a feature, pick the target by walking the commit log for hot spots — before reading any code.**

```bash
# what changes most
git log --since='3 months ago' --name-only --pretty=format: | sort | uniq -c | sort -rn | head -30

# where the fixes land
git log --since='3 months ago' --oneline --grep='^fix' -- <path>
```

Deepening work pays off in proportion to how often the code changes, so recent churn — and fix-commit density in particular — is the signal. The epic that produced this rule chose its target that way and landed on a subsystem with **nine fix commits in the eight days since it shipped**: obviously the right place, and not where intuition had pointed first.

The output is the same as any other Phase 1 output — a named scope, written down — with the churn evidence attached so the next reader can check the reasoning instead of taking it on faith.

---

## 7. Owner bypass and the ship-readiness hard gate

The Phase 5 → Phase 6 transition is enforced by `bfw-process verify-phase ship`. Every project scaffolded by `bfw-process init` exposes this as `npm run bfw:ship`, backed by the version of `@brad-frost-web/bfw-process` pinned in `devDependencies`. **Run the gate via `npm run bfw:ship`** so CI, collaborators, and local runs all resolve to the same pinned version. The gate exits non-zero on any failed check (tests, a11y, responsive spot-check, spec-flow verification). The agent **must not** ship if this command fails.

**What the gate asks for depends on what the project ships.** UI project types (`content-site`, `app`, `recipe`) owe all five `bfw:verify:*` scripts; types with no user-facing surface (`script`, `experiment`) owe `bfw:verify:tests` alone, because a CLI has no built output to run axe against and a stub script that passes by echoing "n/a" is an always-green gate in disguise. An absent or unrecognized type gets the full set. `bfw-process doctor` reads the same table, so the advisory and the enforcement can't drift apart. The table lives in `checklists/phase-5-ship-readiness.md`.

**`init` declares the gate from what the project can actually run (#71).** Nothing scaffolds the `bfw:verify:*` scripts — what each one should do is per-project work — so `bfw-process init` writes `hardGates.shipReadiness: false` when the project doesn't yet define the scripts its type owes, and `true` when it does, saying which way it went and what's still owed. A `false` there means this project has no Phase 5 gate, honestly stated; declaring a gate the repo cannot pass would hand every fresh consumer a permanently-red required check, and a required check that is always red teaches everyone to merge past it. Turning it on is a human's act: write the scripts, then set the key. `bfw-process doctor` says when every required script is present and the gate is ready to declare; `bfw-process sync` never writes `hardGates` in either direction. See `checklists/phase-5-ship-readiness.md`.

**A gate that cannot execute is not enforcing anything.** If `verify-phase` errors out before evaluating a single check — a missing checklist, an unresolvable path — that is a ship-blocker in itself, not a quirk to work around. `bfw-process` shipped its entire release history past its own gate that way (#119).

#### Declaring what your own CI already covers (#199)

A repo whose CI already runs some of the gate's legs can say so, and the gate will skip those **on pull requests only**:

```json
"shipGate": { "ciCovers": ["tests", "a11y", "flows"] }
```

Valid legs: `tests`, `a11y`, `responsive`, `flows`, `perf`. An unknown name is a hard error, not a silent no-op.

This exists because the first fleet consumer's `ci.yml` already ran three of its five legs — two of them sharded ×4 — and the gate re-ran all three serially. One clean pass took 5m32s; two runs wedged, at 32m and 2h06m, both inside the duplicated legs. Re-computing a leg your CI just proved on the same commit adds latency and a wedge surface, not information.

Three things keep this honest:

- **PR context only.** `verify-phase ship` skips nothing unless passed `--context pr`, which the canonical workflow supplies only for `pull_request`. Locally and on the integration branch — where the Phase 5 → 6 verdict is actually made — the full set always runs.
- **A reduced run says so**, naming every skipped leg and the config key that caused it, so a fast green is never mistaken for a full verdict.
- **`required` is unchanged.** A skipped leg is still owed and must still exist as a script; skipping is about where it runs, never whether it is owed.

Declare nothing and behaviour is exactly as before.

### Bypass policy

Co-owners of BFW (currently **Brad Frost** and **Ian Frost** by default, plus anyone explicitly added to the `owners` array in `.bfw-process/config.json`) can bypass the hard gate in emergencies:

```bash
BFW_OWNER_OVERRIDE=1 npm run bfw:ship
```

The bypass succeeds only when:

1. `BFW_OWNER_OVERRIDE=1` is set, **and**
2. The current git `user.email` matches an entry in `owners[].email` in `.bfw-process/config.json`.

Every bypass is logged to `.bfw-process/overrides.log`.

**If you are the agent, do not run `BFW_OWNER_OVERRIDE=1` unilaterally. Only run it if a human who is an owner has explicitly asked you to bypass.** This is non-delegable authority.

Non-owners have no bypass. If they hit the gate, they fix what failed.

---

## 8. Guardrails during build (Phase 4)

Reiterating the rules from §2 because Phase 4 is where they most often get violated:

- No custom presentational CSS. If a style need isn't met by Eddie tokens or components, it's a recipe.
- No hardcoded color, spacing, or type values. Only `--ed-*` tokens.
- No Google Fonts `<link>`. Fonts come from Eddie.
- Accessibility at every step, not as a cleanup task.
- Progressive enhancement: core functionality must work without JS.
- Tests alongside code, not after — including at least one test that runs the real external binary when you fake one (§2.13).
- A `--dry-run`-shaped flag reaches the layer that performs the effects, and a test proves zero effects (§2.14).
- No `npx` for anything declared in `package.json` — call the binary by name so the pinned version is what runs (§2.8a).
- For every new interface or seam, name the caller (§8.2).
- Keep the change to what the task asks for: nearby bugs and unrequested behaviour become follow-ups in the PR body, and tests are sized like their neighbours (§8.4).
- Commit frequently with clear messages.
- Before the commit that closes an issue: run the two-axis review (§8.1).

**Not all of these are enforced, and you should know which.** A minority of the guardrails above fail a command when violated; most do not. Don't infer the split from this paragraph — the per-rule breakdown lives in the ledger below, because an enumeration here would go stale and a half-list reads as a whole one. One example of how fine the line is: tokens-only *is* gated, but the validator scans `.scss` and `.ts` only, so the Google Fonts `<link>` bullet in that same list is not something it can see. That asymmetry is not neutral: in the incident that produced this paragraph (#170), a design system reimplemented its own components in raw HTML inside its own repository, across many sessions and many PRs, and **every executable gate stayed green** — because raw controls styled with `--ed-*` tokens and named in correct BEM pass the token validator and the naming validator cleanly. The gates did not merely miss it; they handed it a green check.

So treat a green run as evidence about the rules that run, and nothing more. [`checklists/guardrail-enforcement.md`](https://github.com/Brad-Frost-Web/bfw-process/blob/main/checklists/guardrail-enforcement.md) is the register: every §2 and §8 guardrail, marked **enforced** (violating it exits non-zero — with the command named) or **advisory** (everything else, including rules a tool merely warns about), plus a column stating what a green result does *not* mean for each. When a guardrail has no executable form, that is a known, sized hole rather than an assumed protection — and the ledger is what keeps it sized. Read the row before you rely on a check.

Where the *decision* is the hard part rather than the rule, a method carries the how: [`test-quality.md`](https://github.com/Brad-Frost-Web/bfw-process/blob/main/methods/test-quality.md) when you're deciding what to test, [`deep-modules.md`](https://github.com/Brad-Frost-Web/bfw-process/blob/main/methods/deep-modules.md) when you're placing a seam, and [`diagnosing-bugs.md`](https://github.com/Brad-Frost-Web/bfw-process/blob/main/methods/diagnosing-bugs.md) when the build stalls on a bug you can't explain. Full index in §12.

### 8.1 The two-axis review (Phase 4 exit condition)

**Before committing work that closes an issue, run two independent reviews of the diff, in parallel, that cannot see each other's output:**

| Axis | The question it answers |
|---|---|
| **Standards** | Does this follow the repo's documented rules (`AGENTS.md`, the phase checklists) plus a fixed code-smell baseline — dead code, duplicated logic, swallowed errors, misleading names? |
| **Spec** | Does this do what the originating issue asked, and *only* that? |

**They stay separate and are reported separately.** Merging or re-ranking the two lists is what lets one mask the other: code can follow every convention while implementing the wrong thing, and it can do exactly the right thing in a way the repo has already ruled out. Two lists, two verdicts.

Three things separate a review that finds defects from one that agrees with you. Write them into the reviewer's brief rather than leaving them to chance:

1. **Tell the Spec reviewer to read the old code and the new code and diff the *semantics*** — not to read the diff. The regression the reference epic caught (a working area that failed to open removed the worktree but stranded the branch, so the next attempt at that issue would die) was invisible in the diff and obvious the moment the two versions were compared.
2. **Tell it what is explicitly out of scope** — the follow-up tickets, the deliberate deferrals. Otherwise it reports work you chose to defer as missing, and that noise buries the real findings.
3. **Point it at the highest-risk claim by name.** *"Be adversarial about the 'no behaviour change' claim"* is what produced the useful findings. *"Review this"* would not have.

**Findings are either fixed or disclosed in the PR body.** The reviewer is advisory — this is a soft gate — but skipping it is a stated choice, not a default.

Why it is worth the minutes: across four uses on the `bf-brain` autonomy epic it found four real defects in work whose **tests were already green**, and three of the four would otherwise have shipped:

| What it caught | Would tests have caught it? |
|---|---|
| A "dry run" marker written to the audit row while the human-facing CLI line still read `shop: live … dispatched 0` — the exact misreading the change claimed to fix | No |
| A previously-fixed bug reintroduced: a working area that failed to open removed the worktree but stranded the branch | No |
| A new seam and its test double with **zero callers**, plus a code comment asserting a reader that did not exist | No |
| A security fence whose revert used `git checkout -- <path>`, which restores from the **index** — so a *staged* forbidden edit survived it | No |

The pattern worth internalizing: every step in that epic which caught something caught it in work that was already green. Green is where the remaining defects live, because everything else is already gone.

### 8.2 Grep for the reader, not the definition

**Before claiming a capability, seam, or feature is wired, verify that a caller exists.** A definition is not a feature.

It is one grep per new interface, and the answer belongs in the PR body: *for each new interface or seam, name the caller.* If the only callers are tests, say so — a seam exercised solely by its own test double is scaffolding, not shipped capability.

This is a recurring shape rather than a one-off. One ticket in the reference epic shipped a new injection point and an in-memory test double with **zero callers**, plus a comment stating that the decision tests ran through it. They did not. Both review axes found it independently; neither the type checker nor 1,800 tests could. The same epic surfaced a second seam that **nothing has ever injected, in production or in tests** — wrapping untested code that opens pull requests unattended.

Type checkers verify that a definition is *consistent*. Only a caller makes it *reached*.

> **Designing the seam rather than checking it?** [`methods/deep-modules.md`](https://github.com/Brad-Frost-Web/bfw-process/blob/main/methods/deep-modules.md) carries the vocabulary — module, interface, depth, seam, adapter, leverage, locality — and the rule this section enforces: one adapter means a hypothetical seam, two means a real one.

### 8.3 Research: primary sources, cited, landed in the repo

When the work needs a fact you don't have — how an API actually behaves, what a spec requires, which version shipped what — the standard is the same one §2.8 already sets for release state: **go to the source that owns the fact.**

- **Primary sources only.** Official docs, the source code itself, the spec, the first-party API, the registry. Not a blog post about them, and not recollection. Follow every claim back to the thing that owns it.
- **Cite each claim.** A finding without its source is a rumour with a footnote-shaped hole, and the next person has to redo the work to trust it.
- **Land what you learned in the repo, not in the conversation.** Write it to a Markdown file where the project already keeps such notes; if there's no convention, put it somewhere sensible and say where. Research that lives only in a transcript is research you will pay for twice.

**"Research notes" and "findings" are different things, and the notes never discharge the filing.** A **finding** — a rule violation, a gap, anything the audit surfaces — becomes a GitHub issue, always, per §9 and §9.4.1. A research note is the *evidence* you gathered, and a Markdown file is the right home for it precisely because an issue is the wrong place for six pages of source excerpts. When research surfaces a finding, the finding gets filed and cites the note. A note in the repo is never tracking (§11).

§2.8's precedent is the canonical example: **npm is the source of truth for what shipped** — not git tags, not GitHub Releases. Eddie 0.43.0 was on npm with no matching tag and Releases still advertising 0.32.0, so both secondary signals were wrong in the same window, in opposite directions. An agent that checked either one would have been confidently three releases out of date.

### 8.4 Keep the change to what the task asks for

§8.1's Spec axis asks, at review time, whether the change did what the issue asked *and only that*. This asks the first half of that at build time, so the extras never get written, and adds two things review does not: how to resolve ambiguity, and how to size tests.

**If, while building or testing, you find a pre-existing bug, a performance concern, or behaviour the task doesn't mention, don't fix, optimise, or extend it in this change** unless the requested behaviour cannot work without it. File it (§9) and name it as a follow-up in the PR body. Where the task is ambiguous, implement the reading its wording and the surrounding code most directly support, state that assumption in the PR, and don't build for the other readings as well. This is about extras only: implement every behaviour the task asks for, completely.

Tests for the requested behaviour ship with it, unconditionally (principle 5; §2.13 when a fake exists). What this rule sizes is the test *files*: match the neighbouring ones — a focused test per stated behaviour as the floor, not a ceiling — and keep scratch scripts and quick checks out of the commit rather than promoting them to permanent test files. Verify however you like; what gets committed is what the neighbours would recognise.

The failure it prevents is the diff that grew a second purpose — a fix nobody asked for riding along with the one they did, reviewed as a unit, reverted as a unit. Anthropic's [Prompting Claude Fable 5.1](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-fable-5-1) guide reports that on open-ended tasks the model fixes nearby code, extends unmentioned behaviour, and commits more test files than the change warrants, and that an explicit leave-it-out instruction reduces those substantially with no measurable change in task success. That is the evidence for writing the rule down rather than trusting review to catch it.

---

## 9. The audit / issue / PR cycle

**GitHub Issues are BFW's canonical paper trail.** Every BFW-rule violation, every bug, every feature idea, every audit finding goes into the issue tracker of the project it affects. Inline punch lists in `SPEC.md`, TODO comments in code, and "we should fix that someday" remarks in chat are all anti-patterns — they hide work from future humans and future agents, and they make it impossible to parallelize or delegate.

### 9.1 The cycle

```
audit / find violation
      ↓
file GitHub Issue   ← use a BFW-provided issue template
      ↓
`gh issue develop <N> --checkout`   ← creates a branch linked to the issue
      ↓
do the work, commit referencing the issue
      ↓
open PR with "Fixes #<N>" in the body
      ↓
review, merge   ← trunk repos: the issue auto-closes here
      ↓
close the issue   ← gitflow repos: by hand, after the develop merge (naming where it landed) or at release (§9.5.5)
```

This cycle applies to **every unit of work** in a BFW project. Humans and agents both work from the same queue, with the same conventions, and the same paper trail. Any agent session can run `gh issue list --label bfw/eddie --state open` and pick up work autonomously.

### 9.1a Public repos: file the sanitised version

Most BFW repos are **public**, so the paper trail is public with them — issue bodies, PR descriptions, commit messages, and every artifact committed beside them (inspection reports, work orders, audit findings, profile files) are readable by anyone, indefinitely, whether or not anything links to them. `gh repo view --json visibility` answers it for the repo you're in; where it can't, treat the repo as public. The cycle above says file everything; this says what the public copy may carry.

**The check before posting: would I be comfortable with anyone on the internet reading this?** If not, the finding is still filed — the sanitised version is.

Keep out of a public repo:

- **Credentials and internal infrastructure** — keys, tokens, internal hostnames and URLs. Anything that grants access rather than describes a problem.
- **Client and partner specifics under NDA** — name the pattern, not the account. "A client design system with two component libraries" carries the finding; the client's name doesn't.
- **Money** — budgets, rates, revenue, project costs, compensation.
- **Personal data** — anyone's contact details, health, household, or circumstances, the repo owners' included.
- **Blame by name** — attribute problems to code and process, never to a person. "The save flow drops input on failure", not "so-and-so shipped a broken save flow."
- **Inside baseball** — half-formed strategy, team dynamics, context that only reads correctly to someone who was in the room.

**When a finding carries detail that can't be public, split it — don't drop it.** The public issue gets the technical shape: what's wrong, where, how to fix it, enough for a stranger to act on. The specifics live in the private channel that owns them (a private task, an internal doc, the brain), and the public issue names that channel without restating what's in it. A finding nobody filed because it was awkward to write publicly is the failure this section exists to prevent — the awkward part gets moved, not the finding.

Scrub before posting rather than after: a public repo has no undo. Deleting an issue, editing a body, or force-pushing a commit leaves the original in forks, caches, notification emails, and the events API. The reporting case was an internal run-of-show document — names, timings, internal context — one `git add` away from a public kit repo. A human noticing is what caught it, and a human noticing is not a mechanism (#80).

### 9.2 Issue templates

Every BFW project's `.github/ISSUE_TEMPLATE/` ships with (installed by `bfw-process init`):

- **`process-finding.md`** — for BFW-rule violations and audit findings (Eddie-first, tokens, a11y, testing, etc.). This is the template you use for every item the audit surfaces.
- **`bug.md`** — standard bug report with severity and category.
- **`feature.md`** — feature request with a BFW-compatibility checklist.
- **`recipe-request.md`** — a new Eddie recipe is needed for a pattern that doesn't exist yet.
- **`spec-amendment.md`** — a `SPEC.md` change after Phase 4 has begun.

> **Filling in `bug.md` for something whose cause isn't obvious?** [`methods/diagnosing-bugs.md`](https://github.com/Brad-Frost-Web/bfw-process/blob/main/methods/diagnosing-bugs.md) is the loop behind the template: build a tight, red-capable feedback loop *before* forming any theory, minimise the repro, rank three to five falsifiable hypotheses, instrument one variable at a time, and write the regression test only where a correct seam exists — a missing seam being a finding in its own right.

#### 9.2.1 How agents write issue bodies: user-story-first

Issues are how the team — humans and agents alike — understands the work. An agent-generated issue must read like a **roadmap to a human, not a stack trace**. Lead with the human goal; use technical detail to *support* the goal, never to replace it. When an agent generates a feature or work issue (this shape doesn't replace `bug.md` or `process-finding.md`, which are finding-shaped), the body follows this structure:

1. **Title** — short, scannable, written for a human. "Tag-targeted newsletters via Buttondown" beats "Implement tagId field on workflow.audience config schema".
2. **What I'm trying to do** — first-person user goal in plain language.
3. **Why it matters** — what changes in the user's life when this ships.
4. **What good looks like** — bulleted list of *user-visible behaviors*, not implementation steps.
5. **Out of scope** — explicit deferrals.
6. **References & UX inspiration** — *suggestive, not prescriptive.* Comparable tools and gallery sites (Mobbin, Page Flows, Land-book, …), each with a one-line note about *what specifically* to look at ("Buffer's per-network customization view — note how it surfaces per-platform limits before publish"). Include anti-patterns to avoid when known. Real URLs only — never invent references. This section exists to prime the implementing agent toward considered design instead of generic AI defaults; for pure-foundation issues with no UI, keep it to the relevant docs and data schemas.
7. **Technical notes** — clearly demarcated sub-section; full implementation detail welcome here. This is where the implementing agent spends most of its time, but it comes *after* the human framing, not instead of it.
8. **Depends on** — explicit issue references.

Worked example tracking this shape end-to-end: [Brad-Frost-Web/content-brain#39](https://github.com/Brad-Frost-Web/content-brain/issues/39).

This format governs new agent-generated issue bodies. It does not apply to human-authored issues (humans write whatever they want), issue comments, or re-templating issues that already exist.

### 9.3 Labels

Standard BFW labels (documented in `.bfw-process/checklists/labels.md`) are:

- **Category:** `bfw/eddie`, `bfw/tokens`, `bfw/a11y`, `bfw/testing`, `bfw/infra`, `bfw/docs`, `bfw/process`, `bfw/security`
- **Severity:** `ship-blocker`, `pre-launch`, `nice-to-have`, `someday-maybe`

Every BFW issue gets at least one category label and exactly one severity label. `ship-blocker` issues block the Phase 5 ship gate.

### 9.4 Retroactive audits, SPEC.md, and cross-ecosystem dual-filing

When you audit an existing project (common during Quick → Full mode promotion), you will find a batch of violations. **Do not write them as an inline list in `SPEC.md`.** Instead:

1. File each finding as its own issue using `process-finding.md`.
2. Add an entry to `SPEC.md`'s `amendments:` frontmatter array: `{date, author, summary: "Retroactive audit filed N findings as issues #X–#Y"}`.
3. Leave a single reference line in `SPEC.md` that points at the filtered issue list, e.g.: `See [open audit findings](https://github.com/org/repo/issues?q=is%3Aissue+label%3Abfw%2Fprocess)`.
4. SPEC.md stays forward-looking (what the project **is**); the issue tracker carries the historical punch list (what's wrong and what's being done about it).

#### 9.4.1 Cross-ecosystem dual-filing

Many audit findings in a BFW consumer project have an **upstream root cause** in a shared BFW package — most commonly `Brad-Frost-Web/eddie-design-system`, but also `bfw-process` itself or any other shared package. When you find one of these:

**File the issue in BOTH places, with cross-references in both bodies.**

- The **consumer-side issue** describes the local symptom, names the specific files/lines, and is the actionable unit for fixing the consumer's code. Its body includes a line like: `Upstream: Brad-Frost-Web/eddie-design-system#472 — blocked on this.` The consumer issue stays open until (a) the upstream is resolved AND (b) the consumer has adopted the fix, OR the consumer explicitly works around it with a documented deviation.
- The **upstream issue** describes the gap or bug at the source — the missing component, the broken parser, the empty recipe corpus, the undefined token. Its body includes an Attribution line: `Surfaced by bfw-process audit pattern during audit of Brad-Frost-Web/<consumer>#<N>.` It may additionally list multiple consumer issues under a "Consumers:" section as more projects hit the same gap.

**Decision rule for dual-filing:**

Ask: *"Is this finding a symptom of something that should exist or work differently in the upstream package?"*

- **Yes** → file both. Example: `tools-dashboard/src/index.njk` hand-rolls a pulsing-dot live indicator. The local symptom is "custom CSS in a consumer project" (consumer-side issue). The upstream cause is "no `live-indicator` recipe exists in `eddie-recipes`" (upstream issue). Both are real; both need tracking; fixing only the consumer side leaves the next project to reinvent the wheel.
- **No** → file locally only. Example: a consumer forgot to run `bfw-process verify-phase ship` before deploying. That's a local process gap; there's no upstream fix.

**When the two sides straddle the public/private line, §9.1a decides what each may carry.** The public issue gets the sanitised, technical half; the specifics stay on the private side, referenced by name.

**Every eddie-brain "not found" / "empty" / "wrong" result falls under dual-filing.** If `eddie_get_component` returns not-found for a component the consumer is actually using, that's both a consumer-side "watch out, this component has no docs" note AND an upstream "indexer missed this component" issue.

#### 9.4.2 Issue body conventions for dual-filed pairs

- **Consumer issue body** MUST include a `Related` or `Upstream` section with the upstream issue URL.
- **Upstream issue body** MUST include an Attribution line naming the consumer repo and issue number, and MUST include the consumer URL under `Related`.
- Use GitHub's `#N` shorthand for same-repo references; use full `owner/repo#N` for cross-repo references.
- **When one side isn't public, the cross-reference is a name, not a URL (§9.1a).** A private tracker, an internal doc, or a task board has no `owner/repo#N`, so the public body names the channel and stops there — the two MUSTs above are satisfied by that name. An Attribution line never identifies an NDA'd consumer either: attribute the pattern (`Surfaced by bfw-process audit pattern during a client design-system audit`) rather than the account.
- When the upstream is resolved and the consumer adopts the fix, comment on the consumer issue with the PR reference and close it.

#### 9.4.3 Audit cohort amendments

When a single audit session files multiple dual-filed pairs, record the cohort in the consumer's `SPEC.md` amendment:

```yaml
amendments:
  - date: 2026-04-11
    author: Brad Frost
    summary: |
      Retroactive audit filed 10 local findings as Brad-Frost-Web/tools-dashboard#2–#10
      and 11 upstream findings as Brad-Frost-Web/eddie-design-system#472–#482.
      Dual-filed pairs: tools-dashboard#3 ↔ eddie-design-system#478/#479;
      tools-dashboard#4 ↔ eddie-design-system#473/#474.
```

The amendment captures both cohorts in one entry, names the dual-filed pairs, and leaves the issue tracker as the live source of truth for everything else.

### 9.5 Branch model — chosen by project type

BFW uses **two branch models**, and the project type picks between them (#106):

- **Trunk** — `feature/* → main`. The default for **sites, apps, scripts, and experiments**: anything where a release is not a versioned event. `main` deploys; the PR that reviews the work is the same event that ships it.
- **Git Flow** — [the classic model](https://nvie.com/posts/a-successful-git-branching-model/), for **libraries**: npm-published packages where versioned, batched releases are real (Eddie packages, bfw-process itself). This is also what BFW recommends to client design-system teams — the internal rule and the client recommendation are now the same rule.

The model lives in `.bfw-process/config.json` as `branchModel: "trunk" | "gitflow"`. When absent, tooling infers `gitflow` if a `develop` branch exists, `trunk` otherwise.

Why the split (measured, 2026-08-10, across the whole org): applying Git Flow everywhere parked blessed site work on `develop` for 50+ days — the `develop → main` hop is a deploy trigger wearing release ceremony, so it gets skipped — and left `develop` silently up to 46 commits *behind* `main` where hotfixes were never back-merged. On a site, the extra hop buys nothing; on a library, batching earns it.

Whichever model applies, branch-first is non-optional. **Every unit of work starts on a new branch** — never on `main` and never on `develop` directly. The branch-first discipline is the cheap insurance policy that lets you recover from mistakes: if the work goes sideways, `git switch main && git branch -D feature/foo` is a full reset with zero consequences beyond the branch. The `CLAUDE.md`-recovery incident that prompted this section is the canonical cautionary tale: working directly on tracked-but-uncommitted state with no branch to abandon is how small mistakes become ugly.

#### 9.5.1 Standing branches

| Branch | Purpose | Who merges to it |
|---|---|---|
| `main` | Production / released code. Every commit on `main` is either a tagged release (libraries) or a deployable state (apps/sites). | Trunk repos: `feature/*` and `fix/*` directly. Gitflow repos: `release/*`, plus `hotfix/*` for emergencies. |
| `develop` | **Gitflow (library) repos only.** Integration branch for the next release. | Merged to from `feature/*`, `fix/*`, and `release/*` (after release prep). **Back-merged from `main` after every hotfix and release — a `develop` behind `main` is a stale base that silently poisons every branch cut from it.** |

`main` is long-lived everywhere; `develop` is long-lived on gitflow repos. Never force-push either. Don't delete `develop` casually — removing it is a deliberate migration to trunk (with any pending work merged first), not housekeeping.

#### 9.5.2 Working branches

The **integration branch** below means `main` on trunk repos and `develop` on gitflow repos.

| Prefix | Branches from | Merges to | Lifetime |
|---|---|---|---|
| `feature/<slug>` | integration branch | integration branch | Short-lived; delete after merge |
| `fix/<slug>` | integration branch | integration branch | Short-lived; delete after merge |
| `design/<slug>` | integration branch | **Never merges** — archived as `archive/design-<N>-<slug>` on promotion; production work splits into fresh `feature/*` branches. See §5.3. | Short-to-medium; archived after promotion |
| `release/<version>` | `develop` | `main` via PR; then back-merge `main` → `develop` (gitflow repos only) | Temporary; delete after release |
| `hotfix/<slug>` | `main` | `main` — AND back into `develop` on gitflow repos | Rare, emergency only |

Branch slugs should reference the issue number and a short description: `feature/42-stat-card-recipe`, `fix/58-typeahead-debounce`, `design/46-gallery-grid-explore`, `release/0.2.0`, `hotfix/71-bluesky-auth-regression`.

#### 9.5.3 Flow by project type

**Sites, apps, scripts, experiments — trunk** (bradfrost.com, course websites, Content Brain, bfw-pulse, dashboards, internal tooling):

```
feature/*  →  main
fix/*      →  main
```

No `develop`, no release branches. `main` is the deploy trigger (Netlify watches it), and merging the reviewed PR *is* crossing the finish line — there is no second hop for blessed work to get stuck in front of. `Fixes #N` in the PR body actually auto-closes here, because the merge hits the default branch.

**Libraries — Git Flow** (Eddie core packages, bfw-process itself):

```
feature/*  →  develop  →  release/<version>  →  main (tagged)
fix/*      →  develop  →  release/<version>  →  main (tagged)
hotfix/*   →  main     →  main + develop
```

Release branches exist to stabilize a version: dep bumps, version-number commit, changelog, final testing. No new features land on a release branch — only release-related fixes. The release reaches `main` through a **PR, not a direct merge** — merging that PR *is* the publish, and the tag (`v0.2.0`) is created by the publish workflow rather than by hand (#110). Afterwards, back-merge **`main` → `develop`** so the release-prep commits aren't lost and nothing cut from `develop` starts behind `main` — that is the same standing obligation `doctor` checks, below.

The operational sequence — how to bump, what the CHANGELOG heading must look like, what to verify after the merge, and what to do when the publish fails — is the release-cutting checklist (`checklists/release-cutting.md` here; `.bfw-process/checklists/release-cutting.md` in consumers). Follow it rather than reconstructing the steps: the 0.17.0 release was cut from memory and shipped a lockfile `npm ci` refused (#148).

**That checklist is trigger-bound, and the trigger is an utterance** — "it's time to cut a new release" and its near-synonyms load it without being asked. See §9.5.13.

**Two standing obligations on gitflow repos, both visible in `bfw-process doctor`:**

1. **Back-merge `main → develop` immediately after every hotfix and every release.** A `develop` behind `main` means everyone branching from it starts behind production — that's how a bug gets fixed twice and how "mystery regressions" turn out to be stale bases.
2. **Hold a release round when unreleased work ages.** Work sitting on `develop` for 30+ days is blessed work that never crossed the finish line; doctor reports it as "release round due."

**Recipes / components in the Eddie monorepo** follow the library flow above.

**Design branches** exist on both models. They branch off the integration branch (`main` on trunk, `develop` on gitflow) and never merge back — promotion is to fresh `feature/*` branches, and the design branch becomes an archive tag (§5.3).

#### 9.5.4 Commit message conventions

Use the conventional-commits style with **`feature`** spelled out (not `feat`), and these allowed types:

- `feature(scope): ...` — new functionality
- `fix(scope): ...` — bug fix
- `chore(scope): ...` — tooling, deps, non-functional housekeeping
- `docs(scope): ...` — documentation only
- `refactor(scope): ...` — code restructure without behavior change
- `test(scope): ...` — test additions or fixes
- `perf(scope): ...` — performance improvement
- `style(scope): ...` — formatting only (rare — prefer auto-formatters)

**Every commit that fixes a tracked issue references it:**

- `feature(recipes): extract stat-card recipe (#42)`
- `fix(init): preserve existing files by default (#67)`
- `chore(deps): bump nuxt to 4.5.1 (#84)`

The final commit on a branch that closes an issue may end with `Closes #42` on its own line. PRs reference issues in the body with `Fixes #42`; whether that closes the issue depends on the branch model (§9.5.5).

#### 9.5.5 PR conventions

- **Base branch:** the integration branch (§9.5) for `feature/*` and `fix/*` — `main` on trunk repos, `develop` on gitflow repos. On a gitflow repo, never `main`.
- **PR title:** matches the commit convention (e.g., `feature(process): encode Git Flow branch discipline`).
- **PR body** includes:
  - `Fixes #<N>` (or `Closes #<N>`, or `Related: #<N>` if it's partial progress). On a trunk repo the merge closes the issue. On a gitflow repo it does not — the PR lands on `develop`, not the default branch (§9.6) — so close the issue by hand, after the `develop` merge (naming where it landed) or at release. After the merge, that is `gh issue close <N> --comment "Merged to develop via #<PR>; ships in the next release."`
  - A summary of what changed and why
  - Test plan / verification notes
  - **Two-axis review findings** (§8.1) — fixed, or disclosed here with the reasoning. "Not run" is an acceptable answer; silence is not
  - **The caller for each new interface or seam** (§8.2) — one line each; "tests only" is a valid answer and a useful signal
  - **Deltas, when the change claims to be behaviour-preserving** — see below
- **A refactor presented as behaviour-preserving enumerates its deltas.** List every accepted difference and why each is acceptable. **"No behaviour change" without a list means "I did not look."** The reference refactor moved a 502-line function behind an interface and genuinely did preserve behaviour — but it carried four real deltas (an added `--` guard, an extra read whose result is discarded, a failure that became a return instead of a throw, a reordered `rev-parse`). None of them mattered; all of them were worth stating. The one that *would* have mattered — a durable append-only record silently gaining two fields — was caught precisely because the claim was being checked rather than assumed.
- **Review** is required before merge for any work that touches:
  - Rules files (`AGENTS.md`, `CLAUDE.md`)
  - Either spec (`SPEC.md`, `FEATURE-SPEC.md`)
  - `bfw-process` itself
  - Anything flagged `ship-blocker` in the issue
- **Team work:** reviewer must be someone other than the author. Explicit GitHub approval required before merge.
- **Solo work:** no approval comment required. The branch-first + open-PR ceremony already provides the deliberate pause between authoring and merging. Re-read the diff one last time before clicking merge, then ship.

#### 9.5.6 The branch-first ceremony

Before starting work on any issue, in any BFW repo — where `<base>` is the integration branch (`main` on trunk repos, `develop` on gitflow repos, §9.5):

```bash
git switch <base>
git pull
gh issue develop <N> --checkout --base <base>   # OR manually:
git switch -c feature/<N>-short-slug <base>
```

Then, **if the work meets the §4.3 threshold**, write `FEATURE-SPEC.md` from the template with `status: draft`, and stop until a human approves it. That pause is the point — it's cheaper to disagree about shape now than about a diff later. For work below the threshold, the issue body is the spec; carry straight on.

Then do the work. Commit as you go with the conventions above. Push the branch. Open the PR against the integration branch. Review. Merge — **deleting `FEATURE-SPEC.md` as part of that merge** (§4.2). On a trunk repo that merge deploys; that's the design, not a hazard — the review already happened.

**Design branches use the same ceremony with one difference.** Open a `design-exploration` issue first (template in `.github/ISSUE_TEMPLATE/`), then `gh issue develop <N> --checkout --name design/<N>-<slug>` (or the manual `git switch -c` equivalent). Push as you sketch. **Don't open a PR.** The end state is `bfw-process design promote`, not a merge to the integration branch. See §5.3.

**No exceptions for "small" changes.** The five-second branch creation has saved more work than any other single discipline in BFW's history. A "one-line fix" committed directly to `develop` or `main` is a one-line fix that bypassed CI, bypassed review, and has no rollback path short of another commit. Branch it.

**When the branch name is not yours to choose.** There is one condition where the ceremony above is unreachable rather than skipped: a hosted agent harness (Claude Code on the web, and any harness that provisions a working branch as part of session setup) fixes the branch name before the agent's first tool call — which is before it can read this file — and its contract forbids pushing anywhere else. That is the whole carve-out, and it is about the *branch*, never the issue. Wherever you can cut the branch, you cut the branch: "the harness made one for me" is not true of a local checkout, and a non-conforming name is never grounds to skip the rest. The issue is the part that carries the value; the slug is the part that carries the convenience.

On a harness-assigned branch, follow this recovery rather than inventing one:

1. **File the issue** as soon as the work is understood well enough to describe it. Retroactive is fine; absent is not.
2. **Reference it from every commit after that point** (`(#N)`, §9.5.4). Earlier commits keep what they said — don't rewrite history to hide the gap.
3. **Squash-merge**, so the integration branch gets one conforming message carrying the reference.
4. **Put `Fixes #N` and the deviation in the PR body** — name the harness, name the branch it assigned, and say the issue was filed retroactively. On a gitflow repo the keyword won't fire, so close the issue by hand after the merge (§9.5.5). A disclosed deviation is a known one; an undisclosed one is drift, and drift on a rule stated as absolute is what erodes the rule.

#### 9.5.7 Push at milestones, branch for surgery

**Push early and often.** Local commits that never reach the remote are invisible to the team, to CI, and to future agents. Push the branch after every meaningful milestone — a phase gate, a batch of issue fixes, a passing test suite, a completed audit. If you wouldn't want to redo the work, push it.

**Create a new branch for major surgical work.** When a body of work is stable and the next step is a large rewrite, migration, or architectural change — cut a new branch from the current one before starting. This isolates the surgery from the stable foundation so that:

- The stable work can be reviewed, merged, or shipped independently.
- The surgical branch has a clean diff against a known-good base.
- If the surgery goes sideways, the stable branch is untouched.
- Parallel work can continue on the stable branch without conflict.

**When to cut a new branch:**

- Transitioning between process phases (e.g., Phase A remediation is done, Phase B is a Nuxt migration).
- Starting a rewrite of a major component or subsystem.
- Beginning work that will touch >50% of the codebase.
- Any change where "revert to before we started this" is a scenario you want to keep cheap.

The pattern: finish the current work, push, then `git switch -c feature/<N>-next-phase` from the current branch tip. The parent branch becomes the rollback point.

#### 9.5.8 Single-package patches in mixed-version monorepos

The library flow in §9.5.3 assumes coordinated releases: every package version-bumps in lockstep, one `release/<version>` branch, one tag. But a **packaging-only bug or trivial fix in one package** of a multi-package monorepo (e.g., a stale peer-dep manifest in `eddie-recipes` while the other three Eddie packages are fine) doesn't warrant that ceremony. The convention:

1. Branch `fix/<N>-package-<pkgname>-<vX.Y.Z>` off `develop` (e.g., `fix/653-package-eddie-recipes-v0.27.1`).
2. Bump **only that package's** `package.json` version (patch bump).
3. PR to `develop` as usual.
4. Publish **that package alone** — no release branch, no full-repo tag.
5. Reference the fix in the next coordinated minor's release notes so the patch isn't invisible in the repo's release history.

Don't over-process (a full release branch for a one-line manifest fix) and don't under-process (shipping without a PR). If the monorepo has lockstep version scripts (`update:version:minor`), consider scaffolding per-package patch scripts (`update:version:patch:<pkgname>`) so single-package patches don't require hand-editing `package.json`.

#### 9.5.9 Publish hygiene: never trust a pre-existing dist

Any package that publishes from a `dist/` (or other build-output) directory **must rebuild from source immediately before `npm publish`**. A dist directory on disk is not evidence of anything — it can be stale relative to source by days or weeks, and publishing it ships already-fixed bugs back to consumers.

- **Mandatory step:** fresh `npm run build` (or the package-specific build) immediately before every `npm publish`.
- **Enforce it mechanically where possible:** wire the build into a `prepublishOnly` script in each publishable package's `package.json` — npm runs it automatically before uploading, so the human can't forget.
- Packages that publish straight from source aren't affected, but the dist-publishing pattern is the failure mode to watch for when auditing a library project's release setup.

The failure that prompted this rule (eddie-recipes@0.27.0) published a dist that was 8 days stale relative to a fix already committed to source.

This rule is one step inside the wider ceremony: `checklists/release-cutting.md` (§9.5.13) is where rebuilding-after-the-bump sits in sequence with everything else a release needs.

#### 9.5.10 Don't reach for `git stash` in a working checkout

Splitting a commit is a staging problem, and staging commands solve it with no shared mutable state. `git stash` has plenty: **one stack, shared by every branch, every worktree, and every background process in the repo.**

The failure that produced this rule: `git stash push --keep-index -- <paths>` silently failed to stash the named files, so the following `git stash pop` restored an **unrelated months-old stash from another branch** and left conflict markers in three files the work had never touched. Nothing was lost, but the recovery was luck rather than skill.

- **Splitting a commit?** `git add <paths>` (or `git add -p`), commit, repeat. That is the whole job, and it never touches shared state.
- **Need to move work to another branch?** Commit it where you are and cherry-pick, or branch from here. A WIP commit you amend later is addressable and recoverable; a stash entry is a needle in a stack you don't own.
- **This matters most where BFW actually works** — repos with background writers: daemons appending logs, agents committing state, watchers regenerating files, a second worktree on the same repo. Stashing there is racing writers you didn't know about.

If you use it anyway, name the entry (`git stash push -m "<what>"`), verify with `git stash list` before popping, and never `pop` blind.

#### 9.5.11 Resolving a conflict means reading why both sides changed

A merge conflict is two intents disagreeing, and the diff shows neither of them. Before resolving a hunk, **find the primary sources for both sides** — the commit messages, the PRs, the issues that motivated each change. A resolution written from the conflicted text alone is a guess dressed as a decision.

- **Preserve both intents where they're compatible.** Most conflicts are two edits that never actually disagreed, and the merge tool simply couldn't tell.
- **Where they're genuinely incompatible,** pick the one matching the merge's stated goal and note the trade-off in the commit body. The next person needs to know a choice was made.
- **Never invent new behaviour in a conflict resolution.** A merge is not the place to improve either side; if the right answer is a third thing, land it as its own commit afterward.
- **Always resolve. Never `--abort` to escape a hard hunk** — aborting discards the reading you just did and leaves the same conflict for the next attempt. (Aborting because the *merge itself* was a mistake is a different decision, and a fine one.)
- **Run the project's checks before finishing** — typecheck, tests, format — and fix whatever the merge broke. A conflict resolved to a compiling state is not the same as one resolved correctly.

#### 9.5.12 Fleet syncs: scripted ceremony, tiered by project type

When a new bfw-process release propagates to consumers (a **fleet sync**), the resulting commits are canonical-tool output — `bfw-process sync` rewriting files it owns — not authored work. Demanding the full §9.5.6 ceremony for every one of 40+ repos makes the sync so expensive it stops happening, which is how the fleet drifted six versions apart in the first place. So the ceremony is tiered, by the same project-type table the freshness sensor uses:

- **Blocker-tier repos** (`app`, `content-site`, `recipe`, `script`): the sync lands via a real PR per §9.5.5/§9.5.6, reviewed and merged by a human.
- **Advisory-tier repos** (`experiment`): a scripted `bfw-process sync` commit may land directly on the default branch.
- **The carve-out covers sync-generated output only** — `AGENTS.md`, `.microagents/`, `.bfw-process/phases|checklists|templates`, the `.github/` templates and workflows sync refreshes, and the config markers sync owns (`lastSyncedVersion`, schema `version`). Hand-owned files (`CLAUDE.md`, `SPEC.md`, the rest of `config.json`) never ride a direct commit.
- **Never for the canonical repo itself** — bfw-process's own files change only through its normal PR flow.

Two invariants make this safe rather than sloppy: **a synced `AGENTS.md` is never hand-edited** (the stamp under its H1 says so — local deltas belong in the repo's own `CLAUDE.md`, and rule changes go upstream to the canonical repo), and every synced copy carries its producing version in both the stamp and `config.lastSyncedVersion`, so `doctor` can always tell a current copy from a stale one.

#### 9.5.13 The release ceremony

**When a human says "it's time to cut a new release" — or any near-synonym — load `checklists/release-cutting.md` in full before the first command** (`.bfw-process/checklists/release-cutting.md` in consumers). The canonical list of trigger phrases lives at the top of that file; this section deliberately doesn't keep a second copy.

It is trigger-bound the way §2.5's mandatory `eddie-brain` calls are, and for the same reason: memory-based guidance demonstrably did not prevent the regressions. No phase gate has to be open first — a release is neither phase-bound nor topic-bound. **Every step lives in the checklist and nowhere else** (#93). Restating any of it here would give an agent two versions to choose between, and the half it happens to read becomes the half it follows.

Two steps in that ceremony are **not** an agent's to take: a human merges the release PR — on the automated model that merge *is* the publish — and `BFW_OWNER_OVERRIDE=1` is never run unilaterally (§7).

### 9.6 Commit and PR cheat sheet

Distilling §9.5 into a reference card:

- Branches: `feature/<N>-slug`, `fix/<N>-slug`, `design/<N>-slug` (no merge — promote via `bfw-process design promote`), `release/<version>`, `hotfix/<N>-slug`
- Base branch for daily work: the **integration branch** — `main` on trunk repos (sites/apps/scripts), `develop` on gitflow repos (libraries). Check `branchModel` in `.bfw-process/config.json`
- Commit prefix: `feature:` (NOT `feat:`), `fix:`, `chore:`, `docs:`, `refactor:`, `test:`, `perf:`
- Commit body references issues: `(#42)` inline, `Closes #42` on its own line for the final commit
- PR body: `Fixes #42` — auto-closes on trunk repos; on gitflow repos it does NOT fire on the `develop` merge (GitHub only honours closing keywords into the default branch), so close the issue manually or at release
- Gitflow only: `develop` → `release/*` → `main` with tag, then back-merge `main → develop`
- Never force-push `main` or `develop`
- Delete feature/fix/release branches after merge
- Public repo? File the sanitised version — issues, PR bodies, commits and committed artifacts alike (§9.1a)

### 9.7 What NOT to do

- Do not work on `main` or `develop` directly. Cut a branch first. Every time.
- Do not write inline "punch list" sections in `SPEC.md` as a permanent artifact. Audit scratchpads are fine during Phase 2, but they must be drained into issues before Phase 3 begins.
- Do not bury TODOs in code as the only record of a known issue. Either file it as an issue immediately or don't mention it.
- Do not close issues without a referencing PR merge (or an explicit "won't fix" + amendment).
- Do not bypass the ship gate because an open issue "isn't a real blocker" — if it's `ship-blocker` labeled, it's a blocker. Re-label it if the assessment was wrong, but do it consciously and in writing.
- Do not use `feat:` as a commit prefix. Use `feature:` spelled out.
- Do not open feature or fix PRs against the wrong base. The base is the integration branch (§9.5): `main` on trunk repos, `develop` on gitflow repos. On a gitflow repo, never `main`.
- Do not force-push or rewrite history on `main` or `develop`. Feature/fix branches can be rewritten pre-merge if needed.
- Do not skip the PR ceremony for "small" changes, even solo. The PR provides a deliberate pause between work and merge — that pause is the discipline.
- Do not write Eddie markup, use an Eddie token, or hand-roll an Eddie-adjacent pattern without first querying `eddie-brain` (§2.5). Memory is not a source of truth for the Eddie catalog.
- Do not file a consumer-side issue for a problem that has an upstream cause in Eddie (or any other BFW shared package) without ALSO filing the upstream issue with cross-references. Dual-filing is non-optional when the root cause is upstream (§9.4.1).
- Do not treat an eddie-brain "not found" / "empty result" as a dead end. It's always a finding to file upstream.
- Do not commit the change that closes an issue without the two-axis review, or without saying in the PR that you skipped it (§8.1).
- Do not claim "no behaviour change" without a list of the deltas you accepted (§9.5.5).
- Do not ship a new seam, hook, or injection point without naming its caller (§8.2).
- Do not fake an external binary in every test. At least one must run the real thing (§2.13).
- Do not `git stash` in a checkout with background writers. `git add` does the same job without a shared stack (§9.5.10).
- Do not put credentials, NDA'd client names, financials, personal data, or blame by name into a public tracker — or commit an artifact that carries them. File the sanitised version and keep the specifics private (§9.1a).
- Do not end a session with a trailing "want me to also…?". Land it or park it: finish the task, file what's left, and close on the work (§2.17).

---

## 10. When in doubt

- **Unclear spec?** Stop and ask.
- **Considering a non-default dependency?** Stop, flag it, and ask.
- **Tempted to write a one-off component?** Don't. It's a recipe.
- **Unsure which recipe libraries to include?** Check §2.1.1. Start with core recipes, add category libraries only when the spec demands them, and default to project-local for anything speculative.
- **Need a capability Eddie doesn't cover?** Check §2.1a. Evaluate candidates against the criteria table, document the decision, and surface any Eddie gaps the integration reveals.
- **Tempted to hardcode a color because the token is "slightly off"?** Don't. It's a token gap — file an issue.
- **Tempted to add a new component, recipe, or token to Eddie?** The default answer is no. Run the §2.9 evaluation: search eddie-brain, try composition, try extension — a new addition only proceeds when all three fall short, with the reasoning documented.
- **Tempted to skip a test "just this once"?** Don't. It's a task, not a bonus.
- **About to report "all tests pass" or "CI is green"?** Name what ran — which suites or projects, and how many tests. Exit 0 is not evidence, and a configured suite that didn't run is a finding to file, not a detail to leave out (§2.13).
- **About to add a margin, or wrap something in another container, to fix how a page sits?** Don't. Spacing and width are settled doctrine — put the content in a rhythm owner, and keep exactly one `ed-layout-container` per path. See §2.5a.
- **Component file getting long?** Check §2.6. Over 500 lines → review. Over 1,000 → stop and plan decomposition before adding more.
- **Want to show three sizes of a component at once?** That's three stories, not one. See §2.11 — variation lives across stories, and the two exceptions are narrow.
- **About to start a big rewrite?** Push your current branch first, then cut a new one. See §9.5.7.
- **Migrating an existing codebase?** Read the old code for intent, build fresh with current best practices. Don't port bugs. See §2.7.
- **Eddie packages outdated?** Check with `npm outdated`. Update before building on stale foundations. See §2.8.
- **Finished shipping?** Run the process retrospective. What did bfw-process get right, what was missing, what should change? File upstream issues. See Phase 6 step 8.
- **Tempted to bypass the ship gate?** You can't. Only an owner can, and only with the environment flag.
- **Ship gate erroring out before it checks anything?** That's a ship-blocker, not an inconvenience. Fix the execution — and if it's asking for checks your project type can't have, that's §7's type-aware table, not a reason to stub them green.
- **Spec underspecifies something mid-build?** File an issue using `spec-amendment.md`, add to `SPEC.md` amendments, proceed. Never silently build around it.
- **About to commit the change that closes the issue?** Run the two-axis review first — Standards and Spec, in parallel, not seeing each other. Four for four against already-green work (§8.1).
- **Just wrote an interface, a seam, or an injection point?** Grep for the caller before you call it wired. A definition is not a feature (§8.2).
- **Faking `git` / `gh` / `npm` / a daemon in your tests?** At least one test has to run the real binary against a throwaway fixture. Argv-matching asserts the command you *meant* to send (§2.13).
- **Adding a `--dry-run` or `--check` flag?** Name the layer that performs the effects and make sure the flag reaches it — then test for zero effects with the grant live (§2.14).
- **Task is "improve this codebase" with no brief?** Walk the commit log for hot spots before reading code. Churn and fix density are the signal; intuition isn't (§6.1).
- **Calling a refactor behaviour-preserving?** Then list the deltas. No list means you didn't look (§9.5.5).
- **Human said "it's time to cut a new release"?** Load `checklists/release-cutting.md` in full before the first command — every release re-derived from memory has cost more than reading it would have (§9.5.13).
- **Reaching for `git stash`?** Don't. `git add <paths>` splits a commit with no shared mutable state, and the stash stack is shared with every background writer in the repo (§9.5.10).
- **Found a bug — next to the one you're fixing, or anywhere?** File the issue; don't carry it in your head. Name it as a follow-up in the PR body, and fix it in this change only if the requested behaviour can't work without it (§8.4). Filing is free; fixing happens on someone else's clock if it has to.
- **About to post an issue, a PR body, a commit message, or an artifact beside them?** Ask whether you'd be comfortable with anyone on the internet reading it — most BFW repos are public, and there is no undo. If the answer is no, the finding is still filed: the sanitised version is, naming the private channel that holds the specifics (§9.1a).
- **Wrapping up?** Land it or park it. Finish the task and say what ran, or file what's left and link it in the close-out. No "I could also…", no "want me to…?" — the task that started the session is the task that ends it (§2.17).

---

## 11. Common failure modes

| Failure | Why it happens | Prevention |
|---|---|---|
| Building before speccing | Feels faster, is slower | `FEATURE-SPEC.md` is gated — no Phase 3+ without approval (§4.2) |
| Custom UI components instead of Eddie | Unfamiliarity with Eddie | Always check Eddie docs first; escalate to a recipe |
| Hardcoded design values | Habit | Only `--ed-*` tokens, zero exceptions |
| Skipping tests | Time pressure | Tests are part of the task, not a bonus |
| Nuxt when Eleventy was right | "Future-proofing" | Check escalation signals strictly |
| Scope creep mid-build | Spec gaps | Surface gaps as issues or amendments |
| No docs after shipping | "Will do it later" | Docs are Phase 6, not optional |
| Agent unilaterally bypassing ship gate | Over-eagerness | Owners only, human-initiated only |
| A release that merges but never publishes | The version bump re-resolved the lockfile (`npm install --package-lock-only`), and the pipeline's `npm ci` runs only *after* the merge to `main` | Bump with `npm version <v> --no-git-tag-version`; the release PR runs `npm ci` so it fails where it's recoverable (§9.5.3, #148) |
| Inline punch lists in `SPEC.md` instead of issues | "I'll file them later" | Every finding becomes an issue before Phase 3 begins |
| Reading the project spec as authorisation for this branch's work | Only one document existed, so `SPEC.md` had to be both the project's charter and the current work order | Two documents (§4.1). `SPEC.md` says what the project is; `FEATURE-SPEC.md` says what this branch does and is what §4.2 gates. An approved project spec authorises nothing |
| A `FEATURE-SPEC.md` sitting on the integration branch | Nobody deleted it in the merge | Feature specs are deleted as part of the merge (§4.2). One on `main`/`develop` describes shipped work and will mislead the next reader — delete it |
| Planning against a stale or over-broad spec | Spec left over from a prior initiative or written project-wide | Feature specs are branch-scoped, carry an Origin section, and are removed after merge (§4.2). Check spec scope before planning against it |
| TODO comments as the only record of known issues | Speed / laziness | File an issue; a TODO in code is not tracking |
| Writing Eddie markup from memory | Confidence / muscle memory | Query `eddie-brain` before every new component use (§2.5) |
| Adding a margin or an extra wrapper to make a page "sit right" | Spacing looks like a local styling problem, so it gets re-decided per page | It isn't local — it's doctrine. Rhythm belongs to containers, not components; exactly one `ed-layout-container` per path (§2.5a). `eddie_validate_file` hard-errors on component root margins |
| Fixing a consumer symptom without filing the upstream Eddie cause | "That's the Eddie team's problem" | Dual-file. Consumer and upstream get issues linked in both directions (§9.4.1) |
| Including every recipe library in every project | "Might need it later" | Only include category recipe libraries the spec actually requires (§2.1.1). Start project-local; promote when reuse is proven |
| Keeping a recipe project-local when ≥2 projects need it | Copy-paste feels faster | Upstream to `eddie-recipes` when the second project appears. Duplication across projects is a maintenance tax (§2.1.2) |
| Proposing new Eddie components/recipes/tokens that duplicate existing ones | Migration momentum / "not invented here" | Run the §2.9 evaluation first: search eddie-brain, try composition, try extension. The default answer to "should we add this?" is NO |
| Adopting a React-only (or Vue-only, etc.) library | "We can make it work" | Eddie is Web Components. The library must be vanilla JS, WC-native, or wrappable. Framework-coupled libraries are disqualifying (§2.1a) unless they clear all six gates of the shadow-contained exemption (§2.1a.1) |
| Adopting a library without evaluating it against the criteria | Time pressure / familiarity | Run it through the §2.1a criteria table. A popular library that fails on a11y or theming creates more work than it saves |
| Not surfacing Eddie gaps found during library integration | "That's a library problem, not Eddie's" | Every missing token, recipe, or component variant the integration reveals is an Eddie gap. Dual-file it (§9.4.1) |
| Letting a component grow past 1,000 lines | One feature at a time, nobody notices | §2.6 thresholds: 500 = review, 1,000 = stop and decompose before adding more |
| Releasing a library without publishing to npm | "We tagged it, we're done" | npm is the source of truth for what shipped (§2.8). Verify on the registry — `npm view <pkg> version` — never on the tag or the Release page |
| Publishing a stale `dist/` | "The dist is already built" | Always rebuild from source immediately before `npm publish`; wire it into `prepublishOnly` so npm enforces it (§9.5.9) |
| Inventing a workflow for a single-package patch under time pressure | §9.5.3 only covers coordinated releases | Follow §9.5.8: `fix/<N>-package-<pkgname>-<vX.Y.Z>` off develop, bump only that package, PR, publish it alone |
| Accumulating local commits without pushing | "I'll push when it's done" | Push at every milestone. Unpushed work is invisible and unrecoverable if the machine dies (§9.5.7) |
| Starting a major rewrite on the same branch as stable work | "It's all one feature" | Cut a new branch before surgery. The stable branch is your rollback point (§9.5.7) |
| Faithfully porting bugs during a migration | "That's how the old code worked" | Read for intent, rebuild fresh. A migration that reproduces bugs defeats its purpose (§2.7) |
| Blessed work parked on `develop` for weeks | On a site, `develop → main` is a deploy step that buys nothing, so it gets skipped | Sites/apps/scripts use trunk: `feature/* → main` (§9.5.3). The reviewed PR is the finish line |
| `develop` silently behind `main` | Hotfix or direct-to-main work never back-merged | On gitflow repos, back-merge `main → develop` after every hotfix/release; `doctor` reports drift both directions (§9.5.3) |
| Trusting `Fixes #N` to close issues on a gitflow repo | GitHub only honours closing keywords into the default branch | On gitflow repos close manually or at release; trunk repos get auto-close for free (§9.6) |
| Building on stale Eddie dependencies | "It works, why update?" | Stale deps mean building on top of already-fixed problems. Check `npm outdated` first (§2.8) |
| A build that "hangs" in a fresh worktree, or silently runs the wrong tool version | A script invokes a declared dependency via `npx`, which works for years until `node_modules` is missing — then it downloads a different version and runs that, with no warning | Call the binary by name; npm puts `node_modules/.bin` on PATH. If it's in `package.json`, don't `npx` it. `bfw-process doctor` reports offenders (§2.8a) |
| Shipping without a process retrospective | "We're done, move on" | The retrospective is how bfw-process improves. Every project that ships teaches the process something (Phase 6 step 8) |
| Using Western-centric example data or assuming user identity | Default habits / training data bias | Run the Charter §3 self-review checklist. Diverse names, culturally neutral contexts, no assumptions about abilities, gender, race, religion, class, or circumstances (§0, principle 9) |
| Merging a design branch into `develop` | Muscle memory / treating it like a feature branch | Design branches never merge. Promotion via `bfw-process design promote` produces fresh `feature/*` branches off the integration branch (§9.5); the design branch becomes an archive tag (§5.3) |
| Letting design-branch prototypes ship without promotion | "It's basically done already" | Promotion is the cleanup boundary — the place where deviations become issues, the spec gets drafted, and a11y/Eddie/test discipline gets reapplied. Bypassing promotion bypasses the entire point of the split (§5.3) |
| Treating "let 'er rip" as an Eddie-discipline bypass on a design branch | Phrase overload | "Let 'er rip" can mean "go faster" / "stop asking questions" — it is NOT a license to bypass Eddie. Only treat phrases that explicitly signal *bypassing Eddie or tokens* as exploration triggers ("color outside the lines", "dream up a new theme", "sketch this fresh", "don't use Eddie"). When in doubt, ask (§5.3) |
| Relaxing the a11y baseline on a design branch | "It's just a sketch" | a11y is never relaxable on any branch in any mode. Semantic HTML, keyboard reach, contrast — always on. Retrofitting a11y is an order of magnitude more expensive than getting it right the first time (§2.3, §5.3) |
| Promotion auto-files the entire deviation cohort without human review | Optimizing for fewer keystrokes | The promotion command must show the human a summary and wait for confirmation before filing. Auto-filing turns the tracker into noise; human-in-the-loop keeps it signal (§5.3) |
| Promotion produces only a local report file, not real GitHub Issues | "I'll file them later" | §9 is clear: GitHub Issues are BFW's canonical paper trail. The promotion command files actual issues with cross-references and labels — a markdown file in the repo is not tracking (§5.3, §9) |
| Exporting an agent skill as a one-shot copy | Feels quick; the drift is invisible until the skill generates wrong code | Skills live in `skills/` in the repo they document, installs are symlinks, graph-derived counts are CI-gated, and convention-changing PRs update affected skills in the same PR (§2.10) |
| Editing `~/.claude/CLAUDE.md` or a profile settings box mid-build | The fix is one line and the file is right there | A machine-local edit is invisible, unversioned, and diverges every other machine. Global settings have an upstream repo; file the change there and let the human deploy it (§2.10a) |
| Standing N instances of a component up in one story | Reads like a spec sheet; feels efficient | One instance per story, variation across stories. A multi-instance story breaks per-story testing, teaches agents to copy the scaffolding, and can't be linked to (§2.11) |
| A tool's remediation hint names a command that doesn't remediate | The hint was written from intent, never run from the state that prints it | Every "run X" a diagnostic prints must resolve the finding from the context it printed in — and be covered by a test that runs X and re-checks. A hint that no-ops trains people to ignore the whole diagnostic (§7, #117, #119) |
| A gate that errors out instead of evaluating | An always-broken gate looks like a broken command, not a missing safety net | A gate that can't execute is enforcing nothing. Fix the execution before trusting any green. Ask what the gate should require for *this* project type rather than stubbing checks that don't apply (§7, #119) |
| Shipping a defect that a green suite never had a chance to catch | Tests answer "did the code do what I wrote"; they can't answer "did I write the right thing" or "does this still read correctly to a human" | The two-axis review before the closing commit: Standards and Spec, independent, reported separately. Four for four against already-green work (§8.1) |
| Merging the standards review and the spec review into one ranked list | Fewer reports feels tidier | One masks the other — conventional code can implement the wrong thing, and the right thing can be built a way the repo rules out. Two lists, two verdicts (§8.1) |
| A "review the diff" prompt that finds nothing | The reviewer wasn't told what to be adversarial about, or what's deliberately out of scope | Name the highest-risk claim, hand over the out-of-scope list, and tell the spec reviewer to diff the *semantics* of old vs new rather than reading the diff (§8.1) |
| A seam, hook, or injection point that nothing ever calls | The type checker is happy and the test double makes it look exercised | Grep for the caller before claiming it's wired. A definition is not a feature; "tests only" is a valid answer and a useful signal (§8.2) |
| A wrong command line that 1,800 passing tests never noticed | Every external-process test faked argv, which asserts the command you *meant* to send | At least one test executes the real binary against a throwaway fixture, in the default suite. A test behind a flag is a test nobody runs (§2.13) |
| `--dry-run` that still spends money, pushes branches, and opens PRs | The flag was never threaded to the layer that performs the effects — there was no off switch to flip | Name the performing layer, thread the flag to it, and test for zero effects with the grant live. A dry run that *reports* an action it didn't take is a second bug (§2.14) |
| "No behaviour change" that quietly changed behaviour | The claim was assumed rather than checked | Enumerate every accepted delta in the PR body. A refactor with no delta list is a refactor nobody diffed (§9.5.5) |
| Improvement work aimed at the code you happen to remember | "Improve this codebase" has no brief, so intuition fills the gap | Walk the commit log for hot spots first. Churn and fix density point at the code that actually hurts (§6.1) |
| `git stash pop` restoring someone else's months-old stash | The stash stack is shared by every branch, worktree, and background writer in the repo | Split commits with `git add <paths>` / `git add -p`. If you must stash, name it, list before popping, never pop blind (§9.5.10) |
| A fully green process over a design system that reimplemented its own components in raw HTML | Every guardrail with a gate was satisfied, and the violated guardrail had no gate — so the green checks were *accurate* and told you nothing | Read the enforcement ledger before treating green as compliance. A rule with no executable form has an unknowable compliance rate, and this case suggests it trends to zero even among people who know the standard (§8, #170) |
| A workflow that stalls waiting for a human to type a command | A skill was marked human-invoke-only for ceremony rather than for judgement | Gate what needs judgement (money, publishing, deploys); make the rest model-invocable. Decide the flag when authoring, not mid-run (§2.10) |
| Reporting green without checking what ran | Exit 0 reads as proof, and a suite that was filtered out or silently unavailable prints nothing saying so — the absence of a failure looks identical to the absence of a check | Name the suites, projects, and counts that actually executed. A configured suite that didn't run is a finding to surface and file, not an omission (§2.13a) |
| Unrequested fixes, extensions, or extra test files riding along with the change | Something nearby looked wrong and fixing it "while here" felt efficient; scratch checks got committed as tests | Follow-ups are filed (§9) and named in the PR body, not fixed in the diff; tests sized like the neighbouring files, a focused test per stated behaviour as the floor (§8.4) |
| A CI job named for checks it never runs | The name was written from intent and never re-read against the commands beneath it; comments asserting what fails the job age the same way | A job's name and its comments are claims. Compare the name to the script — it's a minute of work — and file the mismatch (§2.13a, eddie-design-system#1432) |
| A session that closes on "want me to also…?" | The next thing is always visible from here, and offering it reads as helpfulness | Two states, no third: done, or parked with the remainder filed and linked. Filing *is* the follow-up; a trailing hook is a variable-reward loop that keeps a human at the keyboard past the point they meant to stop (§2.17) |
| Private context posted to a public tracker | The finding reads as internal while you're writing it, and most BFW repos are public | File the sanitised version — technical shape in the public issue, specifics in the private channel it names. Scrub before posting: deleting an issue or force-pushing a commit leaves the original in forks, caches, notification emails and the events API (§9.1a) |

---

## 12. References

- `SPEC.md` — the **project** spec: what this project is and what it's for (read it after this file)
- `FEATURE-SPEC.md` — the **feature** spec, when present: what the current branch is doing (§4.1–§4.3)
- `.bfw-process/config.json` — mode, owners, project type for this project
- `.bfw-process/foundations/design-system-community-charter.md` — snapshot of the Design System Community Charter (canonical: [gist](https://gist.github.com/hereinthehive/bf4053e3721e3395a1b30e30b98a196c))
- `.bfw-process/phases/` — expanded guidance for each of the six phases
- `.bfw-process/checklists/` — the checklists used by `verify-phase`
- [`checklists/guardrail-enforcement.md`](https://github.com/Brad-Frost-Web/bfw-process/blob/main/checklists/guardrail-enforcement.md) — the enforcement ledger: which §2/§8 guardrails fail a command and which are advisory, with what a green result does *not* mean for each (§8, #170)
- [`methods/`](https://github.com/Brad-Frost-Web/bfw-process/tree/main/methods) — absorbed how-to prose and its provenance manifest, canonical repo only (§2.15). Each is reached from the rule that creates the need for it; the full set:

  | Method | Read it when |
  |---|---|
  | [`writing-for-agents.md`](https://github.com/Brad-Frost-Web/bfw-process/blob/main/methods/writing-for-agents.md) | Writing or editing anything an agent reads — `AGENTS.md`, a skill, a microagent, a checklist (§2.10) |
  | [`test-quality.md`](https://github.com/Brad-Frost-Web/bfw-process/blob/main/methods/test-quality.md) | Deciding *what* to test, or whether a test is worth keeping (§2.13, §8) |
  | [`deep-modules.md`](https://github.com/Brad-Frost-Web/bfw-process/blob/main/methods/deep-modules.md) | Designing a module's interface, placing a seam, or asking why something is hard to test (§2.6, §8.2) |
  | [`grilling.md`](https://github.com/Brad-Frost-Web/bfw-process/blob/main/methods/grilling.md) | Scoping ambiguous work before it has a spec (Phase 1, §6) |
  | [`diagnosing-bugs.md`](https://github.com/Brad-Frost-Web/bfw-process/blob/main/methods/diagnosing-bugs.md) | A bug whose cause isn't obvious, or a performance regression (§9.2) |
- Eddie Design System: https://ds.bradfrost.com
- Eddie monorepo: https://github.com/Brad-Frost-Web/eddie-design-system
- Process canonical repo: https://github.com/Brad-Frost-Web/bfw-process

---

*This file is generated and maintained by `@brad-frost-web/bfw-process`. To update the rules in your project, run `bfw-process sync`. To update the rules for all BFW projects, contribute to the canonical repo and cut a new version.*
