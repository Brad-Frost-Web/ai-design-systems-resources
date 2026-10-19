# Glossary gap analysis — October 2026

Research note behind the glossary expansion (see `FEATURE-SPEC.md` on the
feature branch and its GitHub issue). Gathered 2026-10-19.

The glossary shipped in June 2026 with 115 terms, all extracted from early
course transcripts (Chapters 0–2 and part of 3). Since then the course added
Chapters 3–6, the community ran ~17 jam sessions, and the field's vocabulary
moved — most visibly to **harness**, which every source below uses and the
glossary doesn't define.

This note is public (the repo is public). It names sources by type and date
only: no private Slack permalinks, no community-member names, no client or
workshop names. The private evidence trail lives with the maintainers.

## Sources swept

| Slice | What was read | Coverage gaps |
|---|---|---|
| **Course transcripts** (Notion transcripts DB) | Records for every Ch3–7 lesson (~155); full transcripts of 4.bf.06, 5.01–5.04, 6.01, 7.00; term searches across all | Ch0–2 not re-read in full. Most Ch4 core lessons (4.04–4.21) and Ch5–7 lessons have **no lesson URL on record yet** |
| **Jam sessions** (Descript transcripts) | 9 of ~17 sessions: Feb 26, ~Mar 26, Apr 9, Jun 18, Jul 16, Jul 30, Aug 13, Aug 27, Oct 8 | No transcript found for Mar 12, May 21, Jul 2, Sep 10, Sep 24 |
| **Course Slack** (main course channel) | Every top-level message Jun 1 – Oct 19 (~260) plus thread searches per term | Link-sharing and general channels not read |
| **Internal working sessions** (meeting notes) | 12 sessions Aug 5 – Oct 19 | Nothing before Jul 21; one notes source returned no data |
| **Industry** | *State of AI in Design Systems* survey (21 systems, Jul 2026 snapshot); term frequency across the ~348 curated resources in `_data/resources/`; vendor/spec primary sources | Some primary URLs taken from memory — **every URL must be re-verified before an entry ships** |

## Ranked candidates — new terms

"Sources" counts the five slices where the term carries real weight
(T transcripts · J jam sessions · S Slack · M working sessions · I industry).

### Tier 1 — multi-source, ship in this round

| Term | Aliases | Sources | Notes |
|---|---|---|---|
| **Harness** | agent harness, design system harness, harness engineering | T J S M I | Strongest gap. ×20 in the Oct 8 "Contracts, Harnesses & Workflows" jam; rising in Slack since June; industry: "the model is one component." |
| **Evals** | evaluations, LLM as a judge, eval tiers | T J S M I | Course lesson 3.testing.01; TJ's three tiers (deterministic → adherence → taste). Only 8 of 21 surveyed systems mention evals. |
| **Component Contract** | DS contract, contracts, components as data | J S M | Two jam sessions devoted to it (Jul 16, Oct 13). Machine-readable per-component definition agents check against. |
| **Vibe Coding** | vibe-coded | T J S M I | Course 4.08/4.01/6.01 framing: fast, liberating, "looks done." Karpathy origin. |
| **Drift** | design–code drift, parity | T J S M | Station 6 (Orchestration). Main motivation for contracts and parity checks. |
| **Guardrails** | keeping AI on the rails, on/off the rails | T J M I | Lesson 4.bf.05; public demo `/demos/keep-ai-on-the-rails/`. |
| **AGENTS.md / CLAUDE.md** | context files, rules files, instruction files, .cursorrules | T J S I | 16 of 21 surveyed systems ship one. Slack shows a misconception that a canonical file exists. |
| **Machine-Readable Documentation** | AI-facing docs, agent-ready docs | T J S M | Station 9. |
| **Hook** | hooks, validation gate | T J S I | Lesson 4.bf.06: validation hook → self-correcting loop. |
| **A2UI** | Agent-to-User Interface | T J S M I | Google's declarative-UI protocol; the design system *is* the catalog. Extends Generative UI. |
| **Token Budget** | token spend, token maxing, usage limits | T J S M | Lesson 6.01 ("token maxing"). Distinct from design tokens and from Token (LLM). |
| **Self-Healing Loop** | validation loop, self-correcting loop | T J I | Lesson 3.testing.02. Largest technique category in the survey. |
| **Spec** | SPEC.md, spec-driven development | T S I | Lessons 4.bf.01–02. |
| **Context Window** | context limit, context rot | J S I | Why subagents and just-in-time hooks help. |
| **Knowledge Graph** | — | T J S | Lessons 3.s6/3.s10 Eddie demos. |
| **Hyperpersonalization** | hyper-personalization | T J M | Lesson 5.04. Currently folded into Generative UI. |
| **Deterministic Generation** | deterministic testing, "use AI to need less AI" | T J M | Lesson 4.bf.06 (CI gates). Pairs with existing Non-Determinism. |
| **DESIGN.md** | design.md | J S I | Popularized by Google Stitch; Atlassian ships one. |
| **Code Connect** | — | J S I | Figma's design→code mapping; usage fading as MCPs improve. |

### Tier 2 — strong single-context or industry must-have, ship in this round

| Term | Sources | Notes |
|---|---|---|
| **Context Engineering** | I (+T "context engineer" role) | Industry successor to prompt engineering. |
| **llms.txt** | I (+S thin) | 15 of 21 surveyed systems publish one. |
| **Tool-Gating** | I | Survey finding: tool-gating beats prohibition. Core anti-hallucination pattern. |
| **Design System Extraction** | T M | Lesson 4.extract.00. |
| **Agent Access** | T | Station 10. |
| **Agents as Users** | T S | Lesson 5.01. |
| **Prototyping Playground** | M S | Aliases: sandbox, design sandbox. |
| **Design Branch** | M | BFW-process concept; designers in real code, can't push to main. |
| **Slots** | S | Native in Figma now; belongs in contracts. |
| **Agentic Design System** | J S | Contested term; define it honestly. |
| **Steel Curtain** | T | Course coinage (lesson 4.14). **Needs owner sign-off** — flagged as internal naming. |
| **Multi-Point Inspection** | T M | Likely an alias on existing *Check Engine Light* + Station entries rather than a new term. |

### Tier 3 — deferred (listed, not shipped this round)

Over-generation, plan mode, prompt injection, RAG, MCP Apps, AG-UI,
progressive disclosure, registry, git worktree, headless agents, tool use,
agent memory, lossy round-trip, brownfield/greenfield, pilot/pods, layer cake,
product entries (Claude Design, Google Stitch, Storybook MCP, Figma Make).

## Existing entries that need updating

| Entry | Change |
|---|---|
| **Generative UI** | Separate out hyperpersonalization; add the three flavors from 5.02 (composed from system / bespoke code / straight to pixels); name A2UI, MCP Apps. |
| **Skill** | Now a cross-vendor open standard (agentskills.io); progressive disclosure. |
| **Figma MCP** | Remote server at mcp.figma.com; output shaped by Code Connect. |
| **Model Context Protocol** | Table stakes (18 of 21 surveyed systems); remote vs stdio. |
| **Hallucination** | Full countermeasure stack from 4.bf.06; cross-link tool-gating, validation loop. |
| **Feedback Loop** | Add Ch4/6 evolution loop and self-healing loops. |
| **AI Readiness** | Broaden beyond FigmaLint scores to Stations 9–10. |
| **Context-Based Design System** | Lesson 4.00 URL appears superseded (old id 74285339 vs 76755568); cite 3.context.00. |
| **Governance** | Lesson 7.00 link may be dead; cite Ch3 governance lessons. |
| **Token (LLM)** | Cross-link Token Budget. |
| **Check Engine Light** | Add multi-point inspection alias. |
| **Non-Determinism / Subagent / Prompt** | Cross-links to Deterministic Generation / Harness, Context Engineering. |

## Keep out of the public glossary

Client engagements and client names, partner-program details, unreleased model
names, workshop attendees, internal infrastructure names, and any tool whose
public status isn't confirmed.
