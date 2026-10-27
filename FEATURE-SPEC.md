---
status: approved
issue: 26
related_issues: [13, 25, 28, 30, 32]
branch: feature/26-a2ui-promotion
owners:
  - Brad Frost
  - Ian Frost
last_updated: 2026-10-27
amendments:
  - date: 2026-10-27
    author: Brad Frost
    summary: Approved in chat — go build Claude and on-device paths; Jev credential is JEV_API_KEY.
---

# FEATURE-SPEC.md — A working generative resources interface

## 0. Origin

Resume the adaptive resources exploration in [#13](https://github.com/Brad-Frost-Web/ai-design-systems-resources/issues/13), whose recorded version is preserved at `archive/design-13-chameleon-resources`. Promotion was already chosen in [#25](https://github.com/Brad-Frost-Web/ai-design-systems-resources/issues/25); the existing promotion branch currently matches main at `ebf43e1`. [#26](https://github.com/Brad-Frost-Web/ai-design-systems-resources/issues/26) supplies the current Eddie catalog and message contract, and [#30](https://github.com/Brad-Frost-Web/ai-design-systems-resources/issues/30) supplies the Jev decision layer. Brad requested a real, demonstrable generative UI on October 27. The scope of THIS spec is the resources homepage and its local, live-model demonstration. Rails remains on `feature/33-rails-visual-sibling` at `bc49195` and is excluded.

## 1. What it is

The resources interface adapts its content and presentation to a visitor's question. A request for recent material produces a timeline; a comparison produces a table; a learning journey produces grouped lessons; a definition produces a glossary entry; a question about collection counts produces a chart. These are working views over real content, assembled through a constrained Eddie catalog.

The demo makes the mechanism inspectable: on-device rules, Jev decisions, and Claude composition all lead to the same validated rendering contract. A visitor can see what actually ran, how long it took, and why that presentation was selected. No simulated response is labeled as a live model result.

## 2. Who it's for

Practitioners looking for useful resources and students finding relevant lessons. Brad can demonstrate the same interface live while teaching generative UI. Tone: playful, clear, visibly responsive, with the site's existing course identity.

## 3. Goals

- Natural-language questions visibly change the presentation, beyond filtering identical cards.
- Freeform prompts work; sample prompts are convenient starting points, not hidden triggers.
- Every linked item comes from the actual resource, glossary, or lesson corpus.
- The same prompt can be compared across engines without changing the rendering rules.
- The collection remains usable when a model is unavailable or JavaScript is disabled.

## 4. Non-goals

- Changes to either Rails demo or the recorded exploration branch.
- A new app, framework, database, account system, or second resources destination.
- Recreating the entire exploration: constellation, pixel/canvas experiments, and theme choreography are deferred.
- Resource ingestion changes or Jev tagging suggestions during Notion sync.
- Production activation of paid model endpoints, quota infrastructure, or deployment in this first local-demo milestone. Public activation remains subject to #25 and #32.
- Claiming full A2UI interoperability merely because Eddie uses A2UI-shaped messages.

## 5. User flows

### Flow A — Ask and explore

1. The visitor opens the homepage, sees the collection and a labeled question field with visible, keyboard-accessible examples.
2. They ask a question. An immediate on-device result appears; if a live engine is selected, its pending state is explicit.
3. The selected engine returns a validated presentation using real corpus records. Newest-first requests use dates; comparisons expose actual known fields; charts count records in code.
4. They open a resource or lesson, refine their question, change their lens, or reset to browsing. Rapid subsequent submissions cannot be overwritten by an older response.

### Flow B — Demonstrate the engines

1. Brad enables demo details and chooses On-device, Jev, Claude, or Auto.
2. On-device uses deterministic ranking. Jev selects typed intent/topic/lens/presentation options. Claude can compose a richer arrangement within the same catalog. Auto uses Jev first and falls through to Claude only when confidence is insufficient; the local result remains available throughout.
3. The details panel shows the actual engine, selected shape, elapsed time, model confidence where supplied, retrieval confidence separately, fallback reason, catalog version, and emitted messages.
4. Re-running the same prompt with another engine retains the prompt and lens. Details show which path really answered; unavailable credentials disable the relevant path with a clear explanation.

### Flow C — Recover without losing the task

1. Missing credentials, provider errors, timeouts, invalid model output, or unsupported requests leave a usable local result and an honest status.
2. An unsupported topic says the collection has no good match; it does not invent links or supporting facts.
3. Reset clears generated state. With JavaScript disabled, the server-rendered collection and links remain readable and operable.

## 6. Data model

Reuse the exploration's corpus model: resources, glossary terms, lesson pointers, tags, dates, essential flags, and stable record IDs. Preserve current-main content when adapting the old loaders. Lesson pointers contain metadata and links, never course transcripts.

Use the served `chameleon` catalog as the vocabulary. One normalized turn carries the query, explicit lens, engine provenance, decisions, timing, and validated Eddie messages. User-selected lenses take precedence over inferred ones. Charts, date windows, result counts, and record hydration are deterministic code. Models choose records and allowed presentations; they cannot inject HTML, executable code, arbitrary URLs, or unsupported props.

## 7. Deployment model

| Environment | Hosting | Persistence | Notes |
|---|---|---|---|
| Local demo | Eleventy plus a small Node development server, loopback only | Existing committed corpus; optional browser preferences | Real model requests use server-only environment credentials; engine status is visible. |
| Production | Existing Netlify site | Existing content pipeline | This milestone does not deploy or enable paid endpoints publicly. |

Local inspection on October 27 found `ANTHROPIC_API_KEY` present and `JEV_API_KEY` present. Presence is not a successful API test. Never expose credential values in bundles, logs, screenshots, or committed files.

## 8. Tech decisions

- **Project type / stack:** content-site; existing Eleventy, vanilla JavaScript, Eddie; Node loopback demo server.
- **Current contract:** `a2ui-eddie/1.0`, with `version: v1.0` messages, `createSurface`, `updateComponents`, and `updateDataModel`; metadata uses Eddie extensions. Follow the upstream contract, not a rename-only approximation.
- **Rendering:** use the published `@brad-frost-web/eddie-render` API and served catalog profile. Verify its current Chameleon expansion support before implementation; do not silently retain or fork the old renderer if that support is missing.
- **Jev:** use narrow typed decisions with explicit unknown/unsupported outcomes. Reviewable thresholds and questions live together. A probability and model confidence are different signals; neither replaces corpus relevance checks. Do not promise issue #30's historical latency target before measuring current service behavior.
- **Dependency freshness:** check npm and changelogs before implementation. The live Brain catalog reported Eddie 0.72.1; this branch currently declares Eddie ^0.70.0 and BFW 0.25.0.
- **Delivery sequence:** P3.1–P3.4 implement the shared contract and resource views, then Jev/Claude routing and demo details; P4.1 reviews standards and behavior independently. P4.2–P4.3 production shipping is outside this milestone; #32 currently tracks the disabled ship gate. P5.1–P5.2 document the runnable state and record the run.

### Strengthen before adding

What exists now: an archived working prototype with nine shapes, corpus hydration, local ranking, Claude composition, and lesson pointers. What needs strengthening: the current catalog contract, rendering validation, typed decisions, request lifecycle, and visible demo controls. What can shrink: retire the local catalog inventory and old node-to-tag renderer; omit unrelated experiments. A new destination is unnecessary; Jev is the one new engine needed for the requested comparison.

| Proposed | Already exists? | Decision |
|---|---|---|
| Dynamic resources homepage | Archived prototype | Adapt onto current main; preserve current content. |
| Catalog and renderer | Upstream profile and eddie-render | Replace duplicated local definitions and rendering. |
| Jev choices | Tracked in #30; no implementation found | Add one bounded adapter behind the shared contract. |
| Engine explanation | Prototype disclosures | Strengthen with timing, confidence, actual fallback path, accessible controls. |
| Separate demo site | Not needed | Keep the demo inside the resources interface. |

### Source evidence

- [Recorded prototype](https://github.com/Brad-Frost-Web/ai-design-systems-resources/tree/archive/design-13-chameleon-resources): `DESIGN-NOTES.md`, `js/intent-engine.js`, `js/recipes/concierge.js`, and `netlify/functions/compose.mjs` inspected; the engine uses `a2ui-eddie/0.2` and the concierge offers local/Claude paths.
- [Eddie wire contract](https://github.com/Brad-Frost-Web/eddie-design-system/blob/develop/docs/A2UI-EDDIE.md) and [renderer](https://github.com/Brad-Frost-Web/eddie-design-system/tree/develop/packages/eddie-render): inspected local source; verify published runtime during P3.2. Live `eddie_get_catalog(profile: chameleon)` returned 28 nodes and `contractComplete: false` on October 27; this does not establish complete validation coverage.
- [TypeSafe documentation index](https://docs.typesafe.ai/llms.txt): typed Choice/Noul questions, confidence-aware routing, and intent routing are documented. Exact request/response contracts and available model must be verified against current API documentation during implementation.

## 9. Accessibility requirements

WCAG 2.1 AA. Keyboard-operable prompt, examples, engine selector, disclosures, reset, and generated views. Announce pending/completed/error states politely without moving focus. Logical heading order, tables with headers, chart data available as a table, explicit link names, no horizontal page overflow at 375px. Respect reduced motion. Use Eddie components/tokens and preserve the static collection when scripts fail.

## 10. Approval and outstanding setup

Approved scope: a real local-demo milestone on the resources homepage, with on-device/Jev/Claude paths, the modern Eddie contract, and production activation deferred. Approved by Brad in chat on October 27.

Live Jev acceptance requires `JEV_API_KEY` supplied through local environment configuration. Mock responses can verify failure handling but cannot satisfy live-demo acceptance. Do not request the secret in chat.

## 11. Success criteria

- Recent material, comparisons, learning paths, definitions, and counts yield distinctly appropriate presentations over real records.
- Paraphrased prompts work, not just the suggested examples.
- Jev and Claude each complete at least one actual provider round trip; provenance is visible. Any unavailable path is reported as blocked, never passed.
- Each path uses the same validated message contract; malformed nodes, unknown records, unsafe links, and off-catalog props are refused.
- Low confidence, missing credentials, provider timeout/error, empty results, and overlapping submissions preserve useful behavior.
- Tests cover those behaviors, not just snapshots of implementation. Browser checks exercise typed input and keyboard paths at 375px and 1440px, reduced motion, and no-JS content.
- README documents the exact local start command, required environment variable names, demo prompts, observed latency, and limitations.
- The original Rails branch and recorded design branch remain preserved; no merge or deployment is claimed for this milestone.

### P3.2 implementation decisions

The published Chameleon profile contains placeholder expansions for its high-level nodes. Its shape names remain the bounded decision vocabulary. A consumer compiler binds real record IDs into the served default catalog’s official Eddie primitives; `eddie-render` performs all validation and DOM rendering. Catalog snapshots are pinned to 0.72.1 with the matching npm packages. This replaces the archived DOM renderer without forking upstream recipes.

A loopback-only Node server shares the provider adapter with tests. It serves the Eleventy output and keeps keys server-side. No Netlify Function is added, so a static deploy cannot activate paid generation accidentally.
